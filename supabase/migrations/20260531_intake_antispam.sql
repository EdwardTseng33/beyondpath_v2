-- BeyondPath POC . client_intakes + worker_applications anti-spam (2026-05-31 calcifer)
-- suliman doc 38 must-fix 1 . pre-launch ops defense
--
-- Problem (doc 38): client_intakes / worker_applications insert RLS = with check (true) .
--   client bpClientIntake.submit inserts directly . bypasses Edge Function . a script can flood 100x fake briefs .
-- Why DB-layer trigger: client-side limit bypassable . Edge Function limit useless for direct insert .
--   only un-bypassable point = DB BEFORE INSERT trigger (runs after RLS with check) .
-- Two guards: (1) per-email frequency cap . (2) identical-content dedupe (md5 fingerprint) .
-- IP scope note (honest . suliman Gate 5): DB layer has no trustworthy client IP .
--   so this uses email + content fingerprint . IP defense lives in Edge Functions (doc 28 C) . PMF tradeoff .
-- Thresholds: same email max 5 / 60 min . identical content 2nd within 10 min blocked . Edward email exempt .
-- Reversible (v5.4.23 B-grade): rollback block at end . no column / RLS change .
-- Manual deploy: Edward runs in Supabase Studio SQL Editor (or supabase db push) .

-- ============================================================
-- client_intakes anti-spam trigger function
-- ============================================================
create or replace function public.guard_client_intake_spam()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_admin_email constant text := 'edwardt0303@gmail.com';
  v_freq_window interval := interval '60 minutes';
  v_freq_max int := 5;
  v_dup_window interval := interval '10 minutes';
  v_recent_count int;
  v_dup_count int;
  v_brief text;
  v_fingerprint text;
begin
  -- admin bypass
  if new.email is not distinct from v_admin_email then
    return new;
  end if;

  -- (1) per-email frequency cap
  if new.email is not null then
    select count(*) into v_recent_count
      from public.client_intakes
      where email = new.email
        and created_at > (now() - v_freq_window);
    if v_recent_count >= v_freq_max then
      raise exception 'rate-limit: too many submissions from this email in the last hour (max %)', v_freq_max
        using errcode = 'P0001', hint = 'client_intakes email frequency cap';
    end if;
  end if;

  -- (2) identical-content dedupe (short window)
  v_brief := coalesce(new.intake_data->>'brief',
                      new.intake_data->>'description',
                      new.intake_data->>'project_brief', '');
  v_fingerprint := md5(coalesce(lower(new.email), '') || '|' ||
                       lower(regexp_replace(v_brief, '\s+', '', 'g')));
  if length(v_brief) > 10 then
    select count(*) into v_dup_count
      from public.client_intakes
      where email = new.email
        and created_at > (now() - v_dup_window)
        and md5(coalesce(lower(email), '') || '|' ||
                lower(regexp_replace(
                  coalesce(intake_data->>'brief',
                           intake_data->>'description',
                           intake_data->>'project_brief', ''), '\s+', '', 'g'))) = v_fingerprint;
    if v_dup_count >= 1 then
      raise exception 'duplicate: identical brief already submitted moments ago'
        using errcode = 'P0001', hint = 'client_intakes content dedupe';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_client_intake_spam on public.client_intakes;
create trigger trg_guard_client_intake_spam
  before insert on public.client_intakes
  for each row execute function public.guard_client_intake_spam();

-- ============================================================
-- worker_applications anti-spam trigger function
-- ============================================================
create or replace function public.guard_worker_application_spam()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_admin_email constant text := 'edwardt0303@gmail.com';
  v_freq_window interval := interval '60 minutes';
  v_freq_max int := 5;
  v_dup_window interval := interval '10 minutes';
  v_recent_count int;
  v_dup_count int;
  v_fingerprint text;
begin
  if new.email is not distinct from v_admin_email then
    return new;
  end if;

  -- (1) per-email frequency cap
  if new.email is not null then
    select count(*) into v_recent_count
      from public.worker_applications
      where email = new.email
        and created_at > (now() - v_freq_window);
    if v_recent_count >= v_freq_max then
      raise exception 'rate-limit: too many applications from this email in the last hour (max %)', v_freq_max
        using errcode = 'P0001', hint = 'worker_applications email frequency cap';
    end if;
  end if;

  -- (2) identical ai_proof dedupe (short window)
  v_fingerprint := md5(coalesce(lower(new.email), '') || '|' || coalesce(new.ai_proof::text, ''));
  if new.ai_proof is not null then
    select count(*) into v_dup_count
      from public.worker_applications
      where email = new.email
        and created_at > (now() - v_dup_window)
        and md5(coalesce(lower(email), '') || '|' || coalesce(ai_proof::text, '')) = v_fingerprint;
    if v_dup_count >= 1 then
      raise exception 'duplicate: identical application already submitted moments ago'
        using errcode = 'P0001', hint = 'worker_applications content dedupe';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_guard_worker_application_spam on public.worker_applications;
create trigger trg_guard_worker_application_spam
  before insert on public.worker_applications
  for each row execute function public.guard_worker_application_spam();

-- ============================================================
-- indexes (frequency queries: email + created_at)
-- ============================================================
create index if not exists client_intakes_email_created_idx
  on public.client_intakes(email, created_at desc);
create index if not exists worker_applications_email_created_idx
  on public.worker_applications(email, created_at desc);

-- ============================================================
-- Verify (run after deploy):
--   select tgname from pg_trigger where tgname like 'trg_guard_%';
--   normal single insert (non-admin email) succeeds . 6th same-email within 1h blocked (P0001) .
--   identical brief 2nd within 10 min blocked (P0001 duplicate) .
-- ============================================================
-- ROLLBACK (v5.4.23 B-grade reversible):
--   drop trigger if exists trg_guard_client_intake_spam on public.client_intakes;
--   drop trigger if exists trg_guard_worker_application_spam on public.worker_applications;
--   drop function if exists public.guard_client_intake_spam();
--   drop function if exists public.guard_worker_application_spam();
--   drop index if exists client_intakes_email_created_idx;
--   drop index if exists worker_applications_email_created_idx;
-- ============================================================
