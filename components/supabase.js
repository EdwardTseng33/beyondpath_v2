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

  window.bpWorkerApply = {
    async submit({ email, displayName, aiProof, unifiedCard }) {
      // aiProof = parsed JSON from worker AI interview (worker-ai-interview Edge Function or paste-back)
      // unifiedCard = optional pre-computed UnifiedWorker shape from Edge Function response (T1.4 · P0-1)
      //   · 若 server 端 pre-compute 過 → unifiedCard 帶過來
      //   · 若沒有 → 留 null, DB 端後續可以 retro-compute 或 Admin re-sync
      const verticals = Array.isArray(aiProof?.verticals) ? aiProof.verticals : [];
      const lScore = typeof aiProof?.L_score === 'number' ? aiProof.L_score : null;
      const caseCount = aiProof?.case_count || null;
      const tierSuggestion = aiProof?.tier_suggestion || null;

      const { user } = await window.bpAuth.getUser();

      const payload = {
        user_id: user?.id || null,
        email,
        display_name: displayName || aiProof?.name || null,
        ai_proof: aiProof,
        unified_card: unifiedCard || null,
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

  console.log('[BeyondPath] Supabase client ready · ' + SUPABASE_URL);
})();
