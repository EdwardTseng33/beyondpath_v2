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

    // 2026-05-29 calcifer · doc 28 Part A · email magic link (passwordless)
    // 用戶填 email → 收信點連結 → 自動登入回站。不存密碼、不做忘記密碼流程。
    // Supabase Auth 原生 signInWithOtp({ email }) = magic link (Email provider 須 enabled)。
    async signInWithEmail(email, redirectTo) {
      const fallback = window.location.origin + (window.location.pathname.endsWith('/') ? window.location.pathname + 'app.html' : window.location.pathname);
      const { data, error } = await client.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectTo || fallback,
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
    async submit({ email, displayName, aiProof, unifiedCard, country }) {
      // aiProof = parsed JSON from worker AI interview (worker-ai-interview Edge Function or paste-back)
      // unifiedCard = optional pre-computed UnifiedWorker shape from Edge Function response (T1.4 · P0-1)
      //   · 若 server 端 pre-compute 過 → unifiedCard 帶過來
      //   · 若沒有 → 留 null, DB 端後續可以 retro-compute 或 Admin re-sync
      // 2026-05-21 Phase 0 #1+#4 fix · 確保 unified_card.handle 用真實 email/displayName 算、不是 server stub 的 @anon
      // 2026-05-28 calcifer · B-2 · accept country (TW / SG / MY / HK / OTHER) · Y1 only TW signs · intl can apply
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
        country: country || null, // 2026-05-28 calcifer · B-2 · nullable · null = legacy/未指定 (視為 TW)
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
        job_title: intakeData?.jobTitle || null,
        phone: intakeData?.phone || null,
        intake_data: intakeData,
        vertical: intakeData?.vertical || null,
        budget_range: intakeData?.budgetRange || intakeData?.budget_range || null,
        timeline: intakeData?.timeline || intakeData?.timelineRange || null,
        // 2026-05-29 calcifer · 交付邊界 A/B (A=交付成果, B=交付+協助上線) · Edward 5/29 拍板 B
        delivery_scope: intakeData?.expect?.deliveryScope || 'A',
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

    /**
     * Trigger generate-contract-pdf Edge Function (C-1 Phase 1 . 2026-05-28 calcifer)
     * Edward 5/28 D-plan online sign · self-host PDF + platform store + manual sign photo upload
     * Returns { ok, contract_id, pdf_url, emails: {client_sent, worker_sent} }
     */
    async createContract({ clientIntakeId, workerApplicationId, projectBudget, projectBudgetNtd, contractType }) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/generate-contract-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            client_intake_id: clientIntakeId,
            worker_application_id: workerApplicationId,
            project_budget: projectBudget || null,
            project_budget_ntd: typeof projectBudgetNtd === 'number' && projectBudgetNtd > 0 ? projectBudgetNtd : null,
            contract_type: contractType === 'retainer' ? 'retainer' : 'one_off',
          }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error || data.message || ('HTTP ' + res.status), detail: data.detail } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Resend completion certificate email to both parties (admin only, complete status only)
     * C-1 Phase 2 . 2026-05-28 calcifer
     */
    async resendContractCertificate(contractId) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/resend-contract-certificate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ contract_id: contractId }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error || ('HTTP ' + res.status) } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * List contracts (admin tab: 合約管理)
     */
    async listContracts(limit) {
      const cap = typeof limit === 'number' && limit > 0 ? limit : 50;
      try {
        const { data, error } = await client
          .from('contracts')
          .select('id, client_intake_id, worker_application_id, pdf_url, pdf_hash, contract_snapshot, status, notified_at, client_signed_at, worker_signed_at, client_signature_url, worker_signature_url, signature_hash, milestones_total, nps_invited_at, created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(cap);
        if (error) return { data: [], error };
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3 . List milestones for a contract (admin)
     */
    async listMilestones(contractId) {
      try {
        const { data, error } = await client
          .from('contract_milestones')
          .select('id, contract_id, milestone_number, title, amount_pct, due_date, status, deliverable_text, dispute_reason, dispute_count, delivered_at, approved_at, disputed_at, created_at, updated_at')
          .eq('contract_id', contractId)
          .order('milestone_number', { ascending: true });
        if (error) return { data: [], error };
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3 . Update milestone status via Edge Function (admin)
     */
    async updateMilestone({ milestoneId, newStatus, deliverableText, disputeReason }) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/update-milestone-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            milestone_id: milestoneId,
            new_status: newStatus,
            deliverable_text: deliverableText || null,
            dispute_reason: disputeReason || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error || ('HTTP ' + res.status), detail: data.detail } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3 . Auto-create 3 default milestones (30/30/40) for a contract (admin direct insert)
     * 2026-05-29 calcifer . 輕量串里程碑 (doc 29 半自動 B · Edward 5/29 拍板)
     *   opts.deliverables = 成果語言陣列 (人話) · 順序均分到 M1/M2/M3 的 deliverable_text
     *   opts.deliveryScope = 'A' | 'B' · B (含上線) → M3 自動加「上線確認」交付項
     *   不傳 opts = 退回原 30/30/40 純標題行為 (向後相容)
     */
    async seedDefaultMilestones(contractId, opts) {
      try {
        const deliverables = (opts && Array.isArray(opts.deliverables)) ? opts.deliverables.slice() : [];
        const scope = (opts && opts.deliveryScope) || 'A';

        // 半自動 B · 把交付物順序均分到 3 個里程碑 (doc 29 §3.3)
        const buckets = [[], [], []];
        for (let i = 0; i < deliverables.length; i++) {
          const idx = Math.min(2, Math.floor(i * 3 / Math.max(1, deliverables.length)));
          buckets[idx].push(deliverables[i]);
        }

        // B 邊界 (含上線) → M3 自動加「上線確認」(折進 M3 · DB constraint milestone 1-3、不開第 4 個)
        let m3Title = '里程碑 3 . 完成交付';
        if (scope === 'B') {
          buckets[2].push('上線確認 · 協助上線並確認可正常使用');
          m3Title = '里程碑 3 . 完成交付 + 上線確認';
        }

        const toText = (arr) => arr.length ? arr.map((x) => '· ' + x).join('\n') : null;

        const rows = [
          { contract_id: contractId, milestone_number: 1, title: '里程碑 1 . 啟動交付', amount_pct: 30, deliverable_text: toText(buckets[0]) },
          { contract_id: contractId, milestone_number: 2, title: '里程碑 2 . 中段交付', amount_pct: 30, deliverable_text: toText(buckets[1]) },
          { contract_id: contractId, milestone_number: 3, title: m3Title, amount_pct: 40, deliverable_text: toText(buckets[2]) },
        ];
        const { data, error } = await client
          .from('contract_milestones')
          .upsert(rows, { onConflict: 'contract_id,milestone_number', ignoreDuplicates: true })
          .select();
        if (error) return { data: [], error };
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3 . List all NPS responses for admin NPS Reviews tab
     */
    async listNpsResponses(limit) {
      const cap = typeof limit === 'number' && limit > 0 ? limit : 100;
      try {
        const { data, error } = await client
          .from('nps_responses')
          .select('id, contract_id, role, score, comment, is_anonymous, created_at')
          .order('created_at', { ascending: false })
          .limit(cap);
        if (error) return { data: [], error };
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3 . Recalc worker tier (admin)
     */
    async recalcWorkerTier(workerAppId) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/recalc-worker-tier', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ worker_application_id: workerAppId }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error || ('HTTP ' + res.status) } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * 2026-05-28 calcifer . List commission_records for a contract (admin)
     */
    async listCommissionRecords(contractId) {
      try {
        const { data, error } = await client
          .from('commission_records')
          .select('id, contract_id, milestone_id, event_type, amount_ntd, payment_method, reference_number, notes, paid_at, created_at')
          .eq('contract_id', contractId)
          .order('paid_at', { ascending: false });
        if (error) return { data: [], error };
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },

    /**
     * 2026-05-28 calcifer . Mark commission event (admin) via Edge Function
     */
    async markCommissionEvent({ contract_id, milestone_id, event_type, amount_ntd, payment_method, reference_number, notes, paid_at }) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/mark-commission-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            contract_id,
            milestone_id: milestone_id || null,
            event_type,
            amount_ntd,
            payment_method: payment_method || null,
            reference_number: reference_number || null,
            notes: notes || null,
            paid_at: paid_at || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error || ('HTTP ' + res.status), detail: data.detail } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * 2026-05-28 calcifer . Send commission invoice email + PDF (admin) via Edge Function
     */
    async sendCommissionInvoice(contractId) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/send-commission-invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ contract_id: contractId }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error || ('HTTP ' + res.status), detail: data.detail } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3+ 2026-05-28 . List deliverables for a milestone (admin)
     */
    async listMilestoneDeliverables(milestoneId) {
      try {
        const { data: files, error: e1 } = await client
          .from('milestone_deliverables')
          .select('id, milestone_id, file_url, file_name, file_size, mime_type, sha256, uploaded_by_role, version_number, description, uploaded_at')
          .eq('milestone_id', milestoneId)
          .order('version_number', { ascending: false })
          .order('uploaded_at', { ascending: false });
        if (e1) return { data: null, error: e1 };
        const { data: links, error: e2 } = await client
          .from('deliverable_external_links')
          .select('id, milestone_id, link_type, url, description, uploaded_by_role, uploaded_at')
          .eq('milestone_id', milestoneId)
          .order('uploaded_at', { ascending: false });
        if (e2) return { data: null, error: e2 };
        let maxVersion = 0;
        (files || []).forEach((f) => { if (f.version_number > maxVersion) maxVersion = f.version_number; });
        return { data: { files: files || [], links: links || [], maxVersion }, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3+ 2026-05-28 . List arbitration cases (admin)
     */
    async listArbitrationCases(limit) {
      const cap = typeof limit === 'number' && limit > 0 ? limit : 100;
      try {
        const { data, error } = await client
          .from('arbitration_cases')
          .select('*')
          .order('triggered_at', { ascending: false })
          .limit(cap);
        if (error) return { data: [], error };
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3+ 2026-05-28 . Decide arbitration (admin only)
     */
    async decideArbitration({ caseId, verdictDecision, verdictText, verdictPercent, verdictBreachMultiplier, finalPaymentAmountNtd, finalBreachAmountNtd }) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/decide-arbitration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            case_id: caseId,
            verdict_decision: verdictDecision,
            verdict_text: verdictText,
            verdict_percent: verdictPercent,
            verdict_breach_multiplier: verdictBreachMultiplier,
            final_payment_amount_ntd: finalPaymentAmountNtd,
            final_breach_amount_ntd: finalBreachAmountNtd,
          }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error || ('HTTP ' + res.status), detail: data.detail } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3+ 2026-05-28 . Manually trigger arbitration (admin only)
     */
    /**
     * Phase 3+ 2026-05-28 calcifer . ECPay 自動付款 . create payment intent
     * Body: { contractId, milestoneId?, amountNtd, paymentType?, customerEmail }
     */
    async createEcpayPayment({ contractId, milestoneId, amountNtd, paymentType, customerEmail }) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const body = {
          contract_id: contractId,
          amount_ntd: amountNtd,
          customer_email: customerEmail,
        };
        if (milestoneId) body.milestone_id = milestoneId;
        if (paymentType) body.payment_type = paymentType;
        const res = await fetch(SUPABASE_URL + '/functions/v1/create-ecpay-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error || ('HTTP ' + res.status), detail: data.detail } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3+ 2026-05-28 calcifer . List payment_intents for a contract
     */
    async listPaymentIntents({ contractId }) {
      try {
        const { data, error } = await client
          .from('payment_intents')
          .select('id, contract_id, milestone_id, ecpay_merchant_trade_no, amount_ntd, payment_type, payment_url, status, created_at, paid_at, expired_at, payment_method_detail, customer_email')
          .eq('contract_id', contractId)
          .order('created_at', { ascending: false });
        if (error) return { data: [], error };
        return { data: data || [], error: null };
      } catch (e) {
        return { data: [], error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3+ 2026-05-28 calcifer . Poll status of a payment_intent (auth admin)
     */
    async getPaymentStatus({ paymentIntentId }) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/get-payment-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ payment_intent_id: paymentIntentId }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error || ('HTTP ' + res.status) } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    /**
     * Phase 3+ 2026-05-28 calcifer . Cancel a pending payment intent (admin override)
     */
    async cancelPaymentIntent({ paymentIntentId, reason }) {
      try {
        const patch = { status: 'cancelled', updated_at: new Date().toISOString() };
        if (reason) patch.webhook_payload = { cancelled_reason: reason, cancelled_at: new Date().toISOString() };
        const { data, error } = await client
          .from('payment_intents')
          .update(patch)
          .eq('id', paymentIntentId)
          .eq('status', 'pending')
          .select()
          .single();
        if (error) return { data: null, error };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    async triggerArbitration({ milestoneId, triggerReason }) {
      try {
        const { data: { session } } = await client.auth.getSession();
        const jwt = session?.access_token || SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(SUPABASE_URL + '/functions/v1/trigger-arbitration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt,
            'apikey': SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ milestone_id: milestoneId, trigger_reason: triggerReason }),
        });
        const data = await res.json();
        if (!res.ok) return { data: null, error: { message: data.error || ('HTTP ' + res.status) } };
        return { data, error: null };
      } catch (e) {
        return { data: null, error: { message: e?.message || String(e) } };
      }
    },

    // ============================================================
    // 2026-06-01 calcifer . 數據總覽 Dashboard (營運健康度匯總一頁)
    // 北極星 = 雙邊 60 天回購率 (doc 36 §一) + doc 36 §四商業指標 + §三雙邊健康
    // 只讀不寫 . 沿用既有 client 端 .select() 撈法 . 不建 view/RPC . 不動 DB 結構
    // 每個查詢獨立 try/catch . 單表撈不到只回 partial 不拖垮整頁 (graceful)
    // 完成案 = 0 時北極星/平均案額回 null . 前端顯示「尚無數據」
    // ============================================================
    async loadDashboardMetrics() {
      // 平行撈所有需要的原始資料 . 每個查詢自帶 fallback (撈不到回 {rows:[], err})
      // 注意: 為了「全部案件 / 全部 worker」總覽 . 這裡刻意不帶 status filter (跟 listWorkers/listClientIntakes 的 pending-only filter 不同)
      const safeSelect = async (table, columns) => {
        try {
          const { data, error } = await client.from(table).select(columns);
          if (error) return { rows: [], err: error.message || String(error) };
          return { rows: data || [], err: null };
        } catch (e) {
          return { rows: [], err: (e && e.message) ? e.message : String(e) };
        }
      };

      // 並行 5 個表 (Promise.all . safeSelect 已包 try/catch 不會 reject)
      const [contractsRes, workersRes, intakesRes, npsRes, arbRes] = await Promise.all([
        // 案件 / GMV / 抽佣 / 階段分布 . 全部 contracts (不帶 status filter)
        safeSelect('contracts', 'id, status, project_budget_ntd, commission_amount_ntd, client_paid_total_ntd, commission_collected_total_ntd, client_intake_id, worker_application_id, created_at'),
        // worker pool . 全部 worker_applications (前端算 approved 系列數量)
        safeSelect('worker_applications', 'id, status, verticals, created_at'),
        // 發案數 (本週 / 全部) . 全部 client_intakes
        safeSelect('client_intakes', 'id, status, vertical, created_at'),
        // 雙邊 NPS
        safeSelect('nps_responses', 'id, role, score, created_at'),
        // 仲裁中案件數 (案件階段分布的「仲裁」格)
        safeSelect('arbitration_cases', 'id, status, created_at'),
      ]);

      return {
        contracts: contractsRes,
        workers: workersRes,
        intakes: intakesRes,
        nps: npsRes,
        arbitration: arbRes,
      };
    },
  };

  // ============================================================
  // PROFILE · 完整資料 (doc 28 Part A · 2026-05-29 calcifer)
  // 發案/接案前的「補完整資料」gate · 姓名 + 電話(必填) + 身分類型
  // profile_complete 由 DB generated column 決定 (三項齊才 true)、前端讀這欄判斷是否放行
  // ============================================================

  window.bpProfile = {
    async get() {
      const { user } = await window.bpAuth.getUser();
      if (!user) return { data: null, error: { message: 'not-signed-in' } };
      const { data, error } = await client.from('profiles')
        .select('id, email, full_name, phone, identity_type, role, profile_complete')
        .eq('id', user.id)
        .single();
      return { data, error };
    },
    async updateRequiredFields(opts) {
      const fullName = opts && opts.fullName;
      const phone = opts && opts.phone;
      const identityType = opts && opts.identityType;
      const { user } = await window.bpAuth.getUser();
      if (!user) return { data: null, error: { message: 'not-signed-in' } };
      // profile_complete 由 DB generated column 兜底 (見 20260529_profiles_required_fields.sql)
      const patch = {
        full_name: fullName || null,
        phone: phone || null,
        identity_type: identityType || null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await client.from('profiles')
        .update(patch)
        .eq('id', user.id)
        .select()
        .single();
      return { data, error };
    },
  };

  // ============================================================
  // VERTICALS · 動態查池子有 approved worker 的領域 (馬魯克 P0-3 · 2026-05-29 calcifer)
  // 發案領域不該開出沒有 worker 的選項 → 客戶白走流程配對空。
  // 查 worker_unified_v distinct verticals → 前端 Step1 據此 enable/disable 領域 chip。
  // 池子加人 → 自動開更多領域、不必改 code (Edward 5/29 拍板 Option A 動態)。
  // ============================================================

  window.bpVerticals = {
    // 回傳池子裡有 approved worker 的 vertical id 陣列 (e.g. ['agent','strategy','software'])
    // 走 bp_available_verticals() RPC (見 20260529_bp_available_verticals.sql)。
    // RPC 不存在 / 失敗時回 error、前端 fallback 開放全部 (寧可多開不卡早期試用)。
    async getAvailableVerticals() {
      try {
        const { data, error } = await client.rpc('bp_available_verticals');
        if (error) return { data: null, error: error };
        // data shape: text[] · 正規化成乾淨陣列
        const arr = Array.isArray(data) ? data.filter(function (x) { return !!x; }) : [];
        return { data: arr, error: null };
      } catch (e) {
        return { data: null, error: { message: (e && e.message) ? e.message : String(e) } };
      }
    },
  };

  console.log('[BeyondPath] Supabase client ready · ' + SUPABASE_URL);
})();
