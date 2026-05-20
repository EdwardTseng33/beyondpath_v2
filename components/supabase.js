// BeyondPath · Supabase client + helpers
// Loaded via <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> in HTML
// then this file initializes and exposes window.bpSupabase + helpers.

(function () {
  const SUPABASE_URL = 'https://iacwmkcloxjffghrweie.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Ke3oOlMiYwQ4_XGhYofF3w_TdBtoQEY';

  if (!window.supabase) {
    console.error('[BeyondPath] @supabase/supabase-js not loaded. Add <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> before this file.');
    return;
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  window.bpSupabase = client;

  // ============================================================
  // AUTH HELPERS
  // ============================================================

  window.bpAuth = {
    async signInWithGoogle(redirectTo) {
      const fallback = window.location.origin + (window.location.pathname.endsWith('/') ? window.location.pathname + 'app.html' : window.location.pathname);
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || fallback,
        },
      });
      return { data, error };
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      return { error };
    },

    async getUser() {
      const { data: { user }, error } = await client.auth.getUser();
      return { user, error };
    },

    async getSession() {
      const { data: { session }, error } = await client.auth.getSession();
      return { session, error };
    },

    onAuthStateChange(cb) {
      return client.auth.onAuthStateChange((event, session) => cb(event, session));
    },
  };

  // ============================================================
  // WORKER APPLICATIONS
  // ============================================================

  // ----- shared: handle derivation (mirrors supabase/functions/_shared/worker-schema.ts deriveHandle) -----
  // 2026-05-21 Phase 0 #1+#4 (霍爾 CPO 規劃) · Edge Function 算 unified_card 時 email 是 stub ""
  //   → handle 落成 @anon · 入庫 client 端必須用真實 email override
  function deriveHandleFromEmail(email, displayName) {
    if (displayName) {
      return '@' + String(displayName).replace(/\s+/g, '').toLowerCase();
    }
    const local = (email || '').split('@')[0];
    return '@' + (local || 'anon');
  }

  window.bpWorkerApply = {
    async submit({ email, displayName, aiProof, unifiedCard }) {
      // aiProof = parsed JSON from worker AI interview (worker-ai-interview Edge Function or paste-back)
      // unifiedCard = optional pre-computed UnifiedWorker shape from Edge Function response (T1.4 · P0-1)
      //   · 若 server 端 pre-compute 過 → unifiedCard 帶過來
      //   · 若沒有 → 留 null, DB 端後續可以 retro-compute 或 Admin re-sync
      // 2026-05-21 Phase 0 #1+#4 fix · 確保 unified_card.handle 用真實 email/displayName 算、不是 server stub 的 @anon
      const verticals = Array.isArray(aiProof?.verticals) ? aiProof.verticals : [];
      const lScore = typeof aiProof?.L_score === 'number' ? aiProof.L_score : null;
      const caseCount = aiProof?.case_count || null;
      const tierSuggestion = aiProof?.tier_suggestion || null;

      const { user } = await window.bpAuth.getUser();

      // Patch unified_card with real email-derived handle (override server stub)
      let fixedCard = null;
      if (unifiedCard && typeof unifiedCard === 'object') {
        const realHandle = deriveHandleFromEmail(email, displayName || aiProof?.name || null);
        fixedCard = { ...unifiedCard, handle: realHandle };
      }

      const payload = {
        user_id: user?.id || null,
        email,
        display_name: displayName || aiProof?.name || null,
        ai_proof: aiProof,
        unified_card: fixedCard,
        l_score: lScore,
        verticals: verticals.length ? verticals : null,
        case_count: caseCount,
        tier_suggestion: tierSuggestion,
        status: 'pending',
      };

      const { data, error } = await client.from('worker_applications').insert(payload).select().single();
      return { data, error };
    },
  };

  // ============================================================
  // WORKER ACK EMAIL (brief #2 . 2026-05-20 calcifer)
  // ============================================================
  // Triggered by worker.jsx after bpWorkerApply.submit success.
  // Sends refined acknowledgement email (Stage 1 ~28% framing . Tier B/B+ outcomes . 72h fallback mailto).
  // Best-effort: failures do NOT block submit flow (worker already INSERTed OK).

  window.bpWorkerAck = {
    async send({ worker_application_id, email, displayName }) {
      if (!worker_application_id) {
        return { data: null, error: { message: 'missing-worker_application_id' } };
      }
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/worker-ack-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ worker_application_id, email, display_name: displayName }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { data, error: { message: data.error || ('HTTP ' + res.status) } };
        return { data, error: null };
      } catch (e) {
        // best-effort . do not surface error
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },
  };

  // ============================================================
  // WORKER POOL QUERY (P0-2 · T1.5)
  // ============================================================
  // 給 Step 4 抓真實 approved worker pool, fallback to demo if empty.
  // Uses worker_unified_v view (RLS-safe, only approved + has unified_card).

  window.bpWorkers = {
    /**
     * Query approved workers matching a vertical (e.g. 'dtc' / 'software').
     * Returns up to `limit` workers ordered by created_at desc.
     * @returns {Promise<{ data: Array<{id, email, display_name, unified_card, verticals, tier_suggestion}>, error }>}
     */
    async queryByVertical(verticalId, limit) {
      const cap = typeof limit === 'number' && limit > 0 ? limit : 5;
      if (!verticalId || typeof verticalId !== 'string') {
        return { data: [], error: { message: 'vertical-id-required' } };
      }
      try {
        const { data, error } = await client
          .from('worker_unified_v')
          .select('id, email, display_name, unified_card, verticals, tier_suggestion, created_at')
          .contains('verticals', [verticalId])
          .not('unified_card', 'is', null)
          .order('created_at', { ascending: false })
          .limit(cap);
        if (error) {
          return { data: [], error };
        }
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },
  };

  // ============================================================
  // MATCH (brief #6 . 2026-05-20 calcifer)
  // ============================================================
  // Calls match-workers Edge Function with an inline client payload (no client_intake_id needed).
  // Returns real 5-dim algorithm scoring per worker for Step 4 display.
  // Used by Step 4 useEffect to replace the placeholder 75 + L_score*2 formula.

  window.bpMatch = {
    async runForVertical({ vertical, parsedBrief, topN }) {
      if (!vertical || typeof vertical !== 'string') {
        return { data: null, error: { message: 'vertical-required' } };
      }
      const tasks = Array.isArray(parsedBrief?.tasks) ? parsedBrief.tasks : [];
      const requiredTier = parsedBrief?.required_tier || parsedBrief?.requiredTier;
      const payload = {
        client: {
          vertical: vertical,
          tasks: tasks,
          budget_range: parsedBrief?.budget_range || parsedBrief?.budgetRange,
          timeline: parsedBrief?.timeline,
          required_tier: requiredTier,
        },
        top_n: typeof topN === 'number' && topN > 0 ? topN : 5,
        persist: false,
      };
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/match-workers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return { data: null, error: { message: data.error || ('HTTP ' + res.status) } };
        return { data: data.results || [], error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },
  };

  // ============================================================
  // CLIENT INTAKES
  // ============================================================

  window.bpClientIntake = {
    async submit({ email, companyName, intakeData }) {
      // intakeData = full intake form blob (vertical / brief / budget / acceptance / etc.)
      const { user } = await window.bpAuth.getUser();

      const payload = {
        user_id: user?.id || null,
        email,
        company_name: companyName || null,
        intake_data: intakeData,
        vertical: intakeData?.vertical || null,
        budget_range: intakeData?.budgetRange || intakeData?.budget_range || null,
        timeline: intakeData?.timeline || null,
        status: 'new',
      };

      const { data, error } = await client.from('client_intakes').insert(payload).select().single();
      return { data, error };
    },
  };

  // ============================================================
  // AI PARSE · 真接 Anthropic Claude API (Edge Function client-brief-parse)
  // 2026-05-15 立 · 取代 app2.jsx Step2 原 fake animation
  // ============================================================

  window.bpAiParse = {
    async parseBrief({ brief, budget_range, timeline, vertical, company_name }) {
      const body = { brief };
      if (budget_range) body.budget_range = budget_range;
      if (timeline) body.timeline = timeline;
      if (vertical) body.vertical = vertical;
      if (company_name) body.company_name = company_name;

      // Note: supabase-js v2 client.functions.invoke() 跟新版 sb_publishable_ key 兼容性 issue
      // → 改 raw fetch 帶 apikey + Bearer header (用 session JWT 或 publishable key fallback)
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;

        const res = await fetch(SUPABASE_URL + '/functions/v1/client-brief-parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!res.ok) {
          return {
            data: null,
            error: { message: data.message || data.error || ('HTTP ' + res.status), status: res.status, details: data },
          };
        }
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },
  };

  // ============================================================
  // AI INTERVIEW · server-side worker 入會訪談 (Edge Function worker-ai-interview)
  // 2026-05-15 立 · 取代 worker.jsx Step 2 外部 ChatGPT/Claude paste-back flow
  // 用法: messages=[] → 第一段問題 / 累積 messages 帶回追問 / status:complete 結尾附 ai_proof
  // ============================================================

  window.bpAiInterview = {
    async sendMessage(messages) {
      // messages: [{ role: 'user' | 'assistant', content: string }, ...] · 空陣列 = 第一次 call (seed [INTERVIEW_START])
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;

        const res = await fetch(SUPABASE_URL + '/functions/v1/worker-ai-interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ messages: Array.isArray(messages) ? messages : [] }),
        });

        const data = await res.json();
        if (!res.ok) {
          return {
            data: null,
            error: { message: data.message || data.error || ('HTTP ' + res.status), status: res.status, details: data },
          };
        }
        // data shape: { ok: true, status: 'asking'|'complete', step, message, progress_hint?, ai_proof?, usage, model }
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },
  };

  // ============================================================
  // ADMIN · 後台配對介面 (Q3 Task 5 · 2026-05-19)
  // POC 階段、無 auth gate · 不要在 robots.txt 揭露 admin.html
  // ============================================================

  // 5 維權重 closure 常數 + helpers (2026-05-21 A3 · bpAdmin 內 reference)
  const BP_DEFAULT_MATCH_WEIGHTS = { tier: 25, capacity: 20, domain: 30, L_score: 15, mercy: 10 };
  const BP_LS_KEY_WEIGHTS = 'bp-admin-match-weights';
  function bpGetMatchWeights() {
    try {
      const raw = localStorage.getItem(BP_LS_KEY_WEIGHTS);
      if (!raw) return { ...BP_DEFAULT_MATCH_WEIGHTS };
      const parsed = JSON.parse(raw);
      return {
        tier: typeof parsed.tier === 'number' ? parsed.tier : BP_DEFAULT_MATCH_WEIGHTS.tier,
        capacity: typeof parsed.capacity === 'number' ? parsed.capacity : BP_DEFAULT_MATCH_WEIGHTS.capacity,
        domain: typeof parsed.domain === 'number' ? parsed.domain : BP_DEFAULT_MATCH_WEIGHTS.domain,
        L_score: typeof parsed.L_score === 'number' ? parsed.L_score : BP_DEFAULT_MATCH_WEIGHTS.L_score,
        mercy: typeof parsed.mercy === 'number' ? parsed.mercy : BP_DEFAULT_MATCH_WEIGHTS.mercy,
      };
    } catch (e) {
      return { ...BP_DEFAULT_MATCH_WEIGHTS };
    }
  }
  function bpSetMatchWeights(w) {
    try {
      localStorage.setItem(BP_LS_KEY_WEIGHTS, JSON.stringify(w));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: { message: e?.message || String(e) } };
    }
  }
  function bpResetMatchWeights() {
    try {
      localStorage.removeItem(BP_LS_KEY_WEIGHTS);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: { message: e?.message || String(e) } };
    }
  }

  window.bpAdmin = {
    /**
     * List worker_applications by status (default: pending + tier_b + tier_b_plus)
     * @param {string[]} statuses - array of status values
     * @param {number} limit - default 50
     */
    async listWorkers(statuses, limit) {
      const cap = typeof limit === 'number' && limit > 0 ? limit : 50;
      const wantedStatuses = Array.isArray(statuses) && statuses.length ? statuses : ['pending', 'tier_b', 'tier_b_plus'];
      try {
        const { data, error } = await client
          .from('worker_applications')
          .select('id, email, display_name, ai_proof, unified_card, verticals, tier_suggestion, l_score, case_count, status, admin_notes, created_at, updated_at')
          .in('status', wantedStatuses)
          .order('created_at', { ascending: false })
          .limit(cap);
        if (error) return { data: [], error };
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Update worker_applications.status (approve / reject / archive)
     * @param {string} workerId - uuid
     * @param {string} newStatus - 'approved' | 'rejected' | 'archived' | 'tier_b' | 'tier_b_plus'
     * @param {string} adminNotes - optional reason
     *
     * 2026-05-21 Phase 0 #4 guard · approved 系列 status 必須 row 有 unified_card、否則 reject 升級
     *   - 防止 admin 不小心把沒 unified_card 的 row approve → 配對池會 break
     *   - reject / archive 不擋（沒卡也能封存）
     */
    async updateWorkerStatus(workerId, newStatus, adminNotes) {
      try {
        const APPROVED_STATUSES = ['approved', 'tier_b', 'tier_b_plus'];
        if (APPROVED_STATUSES.indexOf(newStatus) !== -1) {
          const { data: row, error: readErr } = await client
            .from('worker_applications')
            .select('id, unified_card, display_name, email')
            .eq('id', workerId)
            .single();
          if (readErr) return { data: null, error: readErr };
          if (!row || !row.unified_card) {
            return {
              data: null,
              error: {
                message: '此工作者 row 還沒有 unified_card 能力卡、不能直接 approve。' +
                        '請先在 Admin Console 跑「retro-compute unified_card」（或回去 worker 重跑 AI 訪談）再 approve。' +
                        ' worker: ' + (row?.display_name || row?.email || workerId),
                code: 'missing_unified_card',
              },
            };
          }
        }
        const patch = { status: newStatus, updated_at: new Date().toISOString() };
        if (adminNotes != null) patch.admin_notes = adminNotes;
        const { data, error } = await client
          .from('worker_applications')
          .update(patch)
          .eq('id', workerId)
          .select()
          .single();
        return { data, error };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * List client_intakes by status
     * @param {string[]} statuses - default ['new', 'reviewing']
     * @param {number} limit - default 50
     */
    async listClientIntakes(statuses, limit) {
      const cap = typeof limit === 'number' && limit > 0 ? limit : 50;
      const wantedStatuses = Array.isArray(statuses) && statuses.length ? statuses : ['new', 'reviewing'];
      try {
        const { data, error } = await client
          .from('client_intakes')
          .select('id, email, company_name, intake_data, vertical, budget_range, timeline, status, created_at')
          .in('status', wantedStatuses)
          .order('created_at', { ascending: false })
          .limit(cap);
        if (error) return { data: [], error };
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },

    /**
     * 5 維權重 helpers · 2026-05-21 A3
     * Per-admin localStorage · 跨 session 持久 · 不入 DB（單 admin POC 階段 OK · v2 升 DB-backed）
     */
    DEFAULT_MATCH_WEIGHTS: BP_DEFAULT_MATCH_WEIGHTS,
    getMatchWeights: bpGetMatchWeights,
    setMatchWeights: bpSetMatchWeights,
    resetMatchWeights: bpResetMatchWeights,

    /**
     * Trigger match-workers Edge Function for a client_intake (P1-3 · calcifer Q3 backend)
     * Returns Top 5 worker recommendations with score + breakdown.
     * 2026-05-21 A3 · 自動帶 admin localStorage weights override（與 default 不同時）
     */
    async runMatch(clientIntakeId, weightsOverride) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        // Build body · 若 caller 沒明顯 pass weights、用 localStorage 版本 override
        const body = { client_intake_id: clientIntakeId };
        const weights = weightsOverride || bpGetMatchWeights();
        const d = BP_DEFAULT_MATCH_WEIGHTS;
        // 只在 weights 跟 default 不一致時加 weights param（減少 payload）
        const isDefault = weights.tier === d.tier &&
                          weights.capacity === d.capacity &&
                          weights.domain === d.domain &&
                          weights.L_score === d.L_score &&
                          weights.mercy === d.mercy;
        if (!isDefault) body.weights = weights;
        const res = await fetch(SUPABASE_URL + '/functions/v1/match-workers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.message || data.error || ('HTTP ' + res.status) } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Trigger send-decision-email for invited workers (Q3 Task 4 · calcifer Q3 backend)
     */
    async sendDecisionEmail({ clientIntakeId, workerApplicationIds, decision, message }) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/send-decision-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            client_intake_id: clientIntakeId,
            worker_application_ids: workerApplicationIds,
            decision: decision || 'invite',
            message: message || '',
          }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.message || data.error || ('HTTP ' + res.status) } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * List worker_decisions audit log (Q3 Task 4 · 配對歷史)
     */
    async listDecisions(limit) {
      const cap = typeof limit === 'number' && limit > 0 ? limit : 50;
      try {
        const { data, error } = await client
          .from('worker_decisions')
          .select('id, client_intake_id, worker_application_id, decision, created_at, decided_at')
          .order('created_at', { ascending: false })
          .limit(cap);
        if (error) return { data: [], error };
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },
  };

  console.log('[BeyondPath] Supabase client ready · ' + SUPABASE_URL);
})();
