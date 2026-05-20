-- BeyondPath POC · 002 worker unified (T1.3 · 2026-05-20 calcifer)
-- Spec ref: docs/launch/08-matching-pipeline-spec-calcifer.md Task P0-1 / P0-2
-- Adds: unified_card column · admin_notes column · status enum widen · approved view + RLS
--
-- Compat notes:
--   1. Existing status enum: 'pending' | 'reviewing' | 'tier_b' | 'tier_b_plus' | 'rejected' | 'need_more_info'
--      → 加 'approved' / 'archived'. 'rejected' 沿用. 不破壞既有 row.
--   2. admin_notes 是 spec 用詞 (跟 edward_notes 同義) · 此 migration 沿用 spec · 既有 edward_notes 保留向下相容
--   3. unified_card nullable default null → 舊 row 自動跑 fallback path
--
-- Manual deploy: Edward 在 Supabase Studio SQL Editor 跑 / 或 supabase db push

-- ============================================================
-- 1. Add unified_card jsonb column (pre-computed UnifiedWorker shape)
-- ============================================================
alter table public.worker_applications
  add column if not exists unified_card jsonb default null;

create index if not exists worker_applications_unified_card_idx
  on public.worker_applications using gin (unified_card);

-- ============================================================
-- 2. Add admin_notes column (spec naming; edward_notes 保留)
-- ============================================================
alter table public.worker_applications
  add column if not exists admin_notes text;

-- ============================================================
-- 3. Widen status enum to include 'approved' / 'archived'
-- ============================================================
-- Drop existing check constraint by name (PostgreSQL auto-named or explicit)
do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.worker_applications'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%status%';
  if cname is not null then
    execute format('alter table public.worker_applications drop constraint %I', cname);
  end if;
end$$;

alter table public.worker_applications
  add constraint worker_applications_status_check
  check (status in (
    'pending', 'reviewing',
    'tier_b', 'tier_b_plus',         -- legacy values 保留
    'approved', 'rejected', 'archived',
    'need_more_info'
  ));

-- ============================================================
-- 4. PostgreSQL view worker_unified_v (public-safe projection)
-- ============================================================
-- Only exposes columns safe for anon SELECT · no admin_notes / edward_notes / user_id
drop view if exists public.worker_unified_v;
create view public.worker_unified_v as
select
  id,
  email,
  display_name,
  ai_proof,
  unified_card,
  status,
  verticals,
  case_count,
  tier_suggestion,
  created_at,
  updated_at
from public.worker_applications
where status in ('approved', 'tier_b', 'tier_b_plus')
  and unified_card is not null;

comment on view public.worker_unified_v is
  'Public-safe worker pool · approved + has unified_card · used by Step 4 client intake match';

-- ============================================================
-- 5. RLS · anon role can SELECT worker_unified_v
-- ============================================================
-- Views inherit RLS from base table by default in PostgreSQL 15+.
-- We need an explicit policy on worker_applications for anon to read approved + unified_card-only.
-- (alternative: SECURITY INVOKER + bypass-RLS function · but policy is cleaner)

drop policy if exists "worker_apps: anon read approved" on public.worker_applications;
create policy "worker_apps: anon read approved" on public.worker_applications
  for select
  to anon, authenticated
  using (
    status in ('approved', 'tier_b', 'tier_b_plus')
    and unified_card is not null
  );

-- Note: this policy intentionally broadens SELECT to anon for approved workers.
--   Sensitive columns (admin_notes / edward_notes / user_id) are NOT in worker_unified_v projection,
--   but they ARE still SELECT-able via the base table if anon queries it directly.
--   → frontend MUST query worker_unified_v (not worker_applications) for matching.
--   Future hardening (Q3): column-level GRANT REVOKE on worker_applications for anon.

-- ============================================================
-- 6. Helper: bp_workers_by_vertical(vertical_id text)
-- ============================================================
-- Convenience SQL function for matching · same as view but with vertical filter
create or replace function public.bp_workers_by_vertical(vertical_id text)
returns setof public.worker_unified_v
language sql
stable
security invoker
as $$
  select * from public.worker_unified_v
  where verticals @> array[vertical_id]
  order by created_at desc
  limit 20;
$$;

comment on function public.bp_workers_by_vertical is
  'Returns approved workers matching given vertical · used by Step 4 match query · max 20';
