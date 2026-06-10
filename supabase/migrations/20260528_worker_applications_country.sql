-- BeyondPath POC · worker_applications.country (B-2 · 2026-05-28 calcifer · Edward 拍板「國際接案者投件入口」)
-- Spec: 國際接案者可投件進池子（Y1 簽約仍只台灣、國際版上線後開放）
--
-- 改動:
--   1. worker_applications 加 country text (nullable · 既有 row 默認 null = 視為台灣)
--   2. worker_unified_v 加 country 欄
--   3. admin 可篩居住地
--
-- Compat: nullable + default null → 不破壞既有 row · 既有 RLS / policy 不動

-- ============================================================
-- 1. Add country column to worker_applications
-- ============================================================
alter table public.worker_applications
  add column if not exists country text default null;

comment on column public.worker_applications.country is
  'Worker country of residence · Y1 only TW signs · international can apply to pool · 2026-05-28';

-- 常用 country code 建議值 (frontend select):
--   'TW' 台灣 / 'SG' 新加坡 / 'MY' 馬來西亞 / 'HK' 香港 / 'OTHER' 其他
-- 不加 check constraint · 保留彈性 · admin 可看 raw value

create index if not exists worker_applications_country_idx
  on public.worker_applications(country);

-- ============================================================
-- 2. Rebuild worker_unified_v with country column
-- ============================================================
drop view if exists public.worker_unified_v cascade;  -- cascade 連帶清依賴 function（順序修正 2026-05-29）· 下方重建
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
  country,
  created_at,
  updated_at
from public.worker_applications
where status in ('approved', 'tier_b', 'tier_b_plus')
  and unified_card is not null;

comment on view public.worker_unified_v is
  'Public-safe worker pool · approved + has unified_card · 2026-05-28 added country (Y1 match should filter TW only)';

-- ============================================================
-- 3. Helper: bp_workers_by_vertical re-create (view changed)
-- ============================================================
-- Function signature 不變 · 內部 select 走新 view · 自動帶 country
drop function if exists public.bp_workers_by_vertical(text);
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
  'Returns approved workers matching given vertical · max 20 · 2026-05-28 includes country column';

-- ============================================================
-- 4. Optional: TW-only helper for Y1 matching (calcifer/sophie 後續用)
-- ============================================================
create or replace function public.bp_workers_by_vertical_tw_only(vertical_id text)
returns setof public.worker_unified_v
language sql
stable
security invoker
as $$
  select * from public.worker_unified_v
  where verticals @> array[vertical_id]
    and (country = 'TW' or country is null)  -- legacy null rows assumed TW
  order by created_at desc
  limit 20;
$$;

comment on function public.bp_workers_by_vertical_tw_only is
  'Y1 TW-only worker pool · for production matching · international workers excluded · 2026-05-28';
