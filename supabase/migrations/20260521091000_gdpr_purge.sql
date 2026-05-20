-- BeyondPath POC . 006 GDPR / 個資法定時刪除機制
-- Spec ref: brief #7 (sulima H3 . 2026-05-20)
-- Date: 2026-05-21
--
-- Retention policy:
--   client_intakes:      12 months (since created_at)
--   worker_applications: 12 months, only rejected/archived (active applications kept indefinitely)
--   worker_decisions:    12 months (audit trail . then purged)
--
-- Schedule: pg_cron monthly . day 1 . 03:00 TST (= 19:00 UTC prev day)
--
-- Manual deploy: Edward in Supabase Studio SQL Editor + verify pg_cron extension enabled.
--
-- ============================================================
-- 1. Enable pg_cron extension (Supabase pre-installed but not always enabled)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
GRANT USAGE ON SCHEMA cron TO postgres;

-- ============================================================
-- 2. Audit log table for purge runs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bp_purge_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at timestamptz NOT NULL DEFAULT now(),
  table_name text NOT NULL,
  rows_deleted int NOT NULL DEFAULT 0,
  details jsonb,
  error_message text
);

ALTER TABLE public.bp_purge_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bp_purge_log: admin sees all" ON public.bp_purge_log
  FOR SELECT USING (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- Only service role writes (RLS bypass)
-- No anon/authenticated write policy intentional.

COMMENT ON TABLE public.bp_purge_log IS
  'Audit log for bp_purge_old_data() pg_cron runs . row per table per run';

-- ============================================================
-- 3. Purge function
-- ============================================================
CREATE OR REPLACE FUNCTION public.bp_purge_old_data()
RETURNS TABLE(table_name text, rows_deleted int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  retention_intake     interval := interval '12 months';
  retention_worker     interval := interval '12 months';
  retention_decisions  interval := interval '12 months';
  deleted_count int;
BEGIN
  -- 3a. client_intakes
  BEGIN
    DELETE FROM public.client_intakes
      WHERE created_at < (now() - retention_intake);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    INSERT INTO public.bp_purge_log (table_name, rows_deleted, details)
      VALUES ('client_intakes', deleted_count, jsonb_build_object('retention', '12 months', 'cutoff', (now() - retention_intake)::text));
    table_name := 'client_intakes';
    rows_deleted := deleted_count;
    RETURN NEXT;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.bp_purge_log (table_name, rows_deleted, error_message)
      VALUES ('client_intakes', 0, SQLERRM);
  END;

  -- 3b. worker_applications (only rejected/archived)
  BEGIN
    DELETE FROM public.worker_applications
      WHERE created_at < (now() - retention_worker)
        AND status IN ('rejected', 'archived');
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    INSERT INTO public.bp_purge_log (table_name, rows_deleted, details)
      VALUES ('worker_applications', deleted_count,
        jsonb_build_object('retention', '12 months', 'status_filter', 'rejected/archived', 'cutoff', (now() - retention_worker)::text));
    table_name := 'worker_applications';
    rows_deleted := deleted_count;
    RETURN NEXT;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.bp_purge_log (table_name, rows_deleted, error_message)
      VALUES ('worker_applications', 0, SQLERRM);
  END;

  -- 3c. worker_decisions (audit trail . then purge)
  BEGIN
    DELETE FROM public.worker_decisions
      WHERE created_at < (now() - retention_decisions);
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    INSERT INTO public.bp_purge_log (table_name, rows_deleted, details)
      VALUES ('worker_decisions', deleted_count, jsonb_build_object('retention', '12 months', 'cutoff', (now() - retention_decisions)::text));
    table_name := 'worker_decisions';
    rows_deleted := deleted_count;
    RETURN NEXT;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.bp_purge_log (table_name, rows_deleted, error_message)
      VALUES ('worker_decisions', 0, SQLERRM);
  END;

  RETURN;
END;
$$;

COMMENT ON FUNCTION public.bp_purge_old_data IS
  'GDPR / individual data law compliance . delete records older than 12 months . runs monthly via pg_cron';

-- Grant execute to postgres (cron runs as postgres by default)
GRANT EXECUTE ON FUNCTION public.bp_purge_old_data() TO postgres;

-- ============================================================
-- 4. Schedule monthly cron job
-- ============================================================
-- Removes any existing schedule first (idempotent)
SELECT cron.unschedule('bp-monthly-purge') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'bp-monthly-purge'
);

-- Schedule: day 1 of each month at 03:00 TST (= 19:00 UTC prev day on UTC)
-- pg_cron uses cron's UTC by default in Supabase. 03:00 TST (UTC+8) = 19:00 UTC.
-- For day-1 boundary alignment we run at 19:00 UTC on day 31/30 = effectively early on day 1 TST.
-- Simpler: 03:00 server time . Supabase docs note pg_cron uses UTC unless otherwise configured.
-- We pick 19:00 UTC on day 1 (= 03:00 day 2 TST) . close enough for monthly maintenance.
SELECT cron.schedule(
  'bp-monthly-purge',
  '0 19 1 * *',
  'SELECT public.bp_purge_old_data();'
);

-- ============================================================
-- 5. Verify
-- ============================================================
DO $$
DECLARE
  job_count int;
BEGIN
  SELECT COUNT(*) INTO job_count FROM cron.job WHERE jobname = 'bp-monthly-purge';
  IF job_count = 0 THEN
    RAISE EXCEPTION 'pg_cron schedule failed . bp-monthly-purge job not registered';
  ELSE
    RAISE NOTICE 'pg_cron verified . bp-monthly-purge scheduled (% jobs)', job_count;
  END IF;
END$$;
