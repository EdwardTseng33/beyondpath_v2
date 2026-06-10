-- 發案領域鎖池子 RPC (馬魯克 P0-3 · Edward 5/29 拍板動態查 · 卡西法 ship 2026-05-29)
-- 回傳池子裡有 approved worker 的 vertical id 陣列 (distinct)。
-- 前端 bpVerticals.getAvailableVerticals() 呼叫此 RPC、Step1 據此 enable/disable 領域 chip。
-- 池子加人 (worker approved) → 自動多一個領域開放、不必改 code。
-- worker_unified_v 已是 RLS-safe view (status in approved/tier_b/tier_b_plus AND unified_card not null)。

create or replace function public.bp_available_verticals()
returns text[]
language sql
stable
security invoker
as $$
  select coalesce(array_agg(distinct v), array[]::text[])
  from (
    select unnest(verticals) as v
    from public.worker_unified_v
    where (country = 'TW' or country is null)
  ) sub
  where v is not null and v <> '';
$$;

-- anon + authenticated 都能查 (發案表單在登入前就要顯示可選領域)
grant execute on function public.bp_available_verticals() to anon, authenticated;

comment on function public.bp_available_verticals() is
  '發案領域鎖 · distinct verticals of approved workers (TW/null country) · 前端 Step1 動態 enable/disable 領域';
