-- BeyondPath POC . 005 worker_applications column-level REVOKE
-- Spec ref: brief #3 (calcifer G3 / sulima C2 . 2026-05-20)
-- Date: 2026-05-21
--
-- Rationale:
--   worker_unified_v view exposes a safe projection (no admin_notes / edward_notes / user_id / email / l_score etc).
--   But base table worker_applications still has anon SELECT policy "worker_apps: anon read approved" (migration 002).
--   Anon could bypass the view and SELECT sensitive columns directly. This migration locks the base table at column level.
--
-- Strategy: REVOKE SELECT on specific columns from anon role.
--   PostgreSQL column-level GRANT/REVOKE acts as a hard column filter even when RLS allows the row.
--
-- Verify after apply:
--   SELECT column_name, privilege_type
--   FROM information_schema.column_privileges
--   WHERE table_schema = 'public'
--     AND table_name = 'worker_applications'
--     AND grantee = 'anon'
--   ORDER BY column_name;
--   -- expected: only safe columns (id, display_name, ai_proof, unified_card, status, verticals, case_count, tier_suggestion, created_at, updated_at)
--
-- Roll back (if needed):
--   GRANT SELECT (admin_notes, edward_notes, user_id, email, l_score, ai_proof) ON public.worker_applications TO anon;

-- ============================================================
-- 1. REVOKE sensitive columns from anon
-- ============================================================
-- These columns are NEVER exposed by worker_unified_v projection.
-- Service role + admin (RLS bypass) still see everything.

REVOKE SELECT (admin_notes)     ON public.worker_applications FROM anon;
REVOKE SELECT (edward_notes)    ON public.worker_applications FROM anon;
REVOKE SELECT (user_id)         ON public.worker_applications FROM anon;
REVOKE SELECT (email)           ON public.worker_applications FROM anon;
REVOKE SELECT (l_score)         ON public.worker_applications FROM anon;
REVOKE SELECT (case_count)      ON public.worker_applications FROM anon;
REVOKE SELECT (tier_suggestion) ON public.worker_applications FROM anon;
REVOKE SELECT (ai_proof)        ON public.worker_applications FROM anon;

-- Note: We KEEP anon SELECT on these columns:
--   id, display_name, unified_card, status, verticals, created_at, updated_at
-- (worker_unified_v view + Step 4 client demo need them)

-- ============================================================
-- 2. Also REVOKE same columns from authenticated (for safety)
-- ============================================================
-- authenticated users without admin RLS still go through column ACL.
-- worker_applications RLS policy "worker_apps: own rows" allows authenticated to read their own rows.
-- For now we keep column ACL aligned with anon (authenticated users only see own row via RLS, but no email/notes leak).
-- If self-service profile editing is needed later, grant back specific columns to authenticated.

REVOKE SELECT (admin_notes)     ON public.worker_applications FROM authenticated;
REVOKE SELECT (edward_notes)    ON public.worker_applications FROM authenticated;

-- We keep email/user_id readable for authenticated (they need to see their own row email).
-- Important: authenticated can only see rows where user_id = auth.uid() (existing RLS policy).

-- ============================================================
-- 3. Verify (SELECT-only . safe to run)
-- ============================================================
DO $$
DECLARE
  leaked_count integer;
BEGIN
  SELECT COUNT(*) INTO leaked_count
  FROM information_schema.column_privileges
  WHERE table_schema = 'public'
    AND table_name = 'worker_applications'
    AND grantee = 'anon'
    AND column_name IN ('admin_notes', 'edward_notes');
  IF leaked_count > 0 THEN
    RAISE EXCEPTION 'REVOKE failed . anon still has SELECT on admin_notes/edward_notes (% privs remaining)', leaked_count;
  ELSE
    RAISE NOTICE 'REVOKE verified . anon no longer reads admin_notes/edward_notes';
  END IF;
END$$;

-- ============================================================
-- 4. Comments
-- ============================================================
COMMENT ON COLUMN public.worker_applications.admin_notes IS
  'Sensitive: admin-only review notes . anon SELECT revoked 2026-05-21 (brief #3)';
COMMENT ON COLUMN public.worker_applications.edward_notes IS
  'Sensitive: legacy admin notes . anon SELECT revoked 2026-05-21 (brief #3)';
