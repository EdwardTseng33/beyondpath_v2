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
    async submit({ email, displayName, aiProof }) {
      // aiProof = parsed JSON from worker's AI (Step 2 paste-back)
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

      const { data, error } = await client.functions.invoke('client-brief-parse', { body });
      return { data, error };
    },
  };

  console.log('[BeyondPath] Supabase client ready · ' + SUPABASE_URL);
})();
