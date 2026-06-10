-- ============================================================
-- BeyondPath PMF 正式上線 · 2026-05-29 搬遷合併檔
-- 在 Supabase Studio SQL Editor 一次貼上跑完（4 段、全 idempotent、重跑安全）
-- 全部向後相容：新欄位 nullable / check constraint 放寬 / 新 RPC，既有資料不動
-- ============================================================

-- ============================================================
-- 段 1 / 4 · commission_records 加退費 event（沙利曼 doc 32 §4）
-- ============================================================
alter table public.commission_records
  drop constraint if exists commission_records_event_type_check;

alter table public.commission_records
  add constraint commission_records_event_type_check
  check (event_type in (
    'client_paid',
    'worker_paid_out',
    'commission_collected',
    'invoice_issued',
    'refund_issued'
  ));

alter table public.commission_records
  drop constraint if exists commission_records_payment_method_check;

alter table public.commission_records
  add constraint commission_records_payment_method_check
  check (payment_method in (
    'ecpay_credit',
    'atm_transfer',
    'manual',
    'ecpay_refund'
  ));

comment on constraint commission_records_event_type_check on public.commission_records is
  '5 種 event_type . 含 refund_issued (退費) . 2026-05-29 擴充 . 沙利曼 doc 32 §4';

-- ============================================================
-- 段 2 / 4 · profiles 完整資料欄位（doc 28 帳號系統）
-- ============================================================
alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists identity_type text
    check (identity_type in ('individual', 'company'));

alter table public.profiles
  add column if not exists phone_verified_at timestamptz;

alter table public.profiles
  add column if not exists profile_complete boolean
    generated always as (
      full_name is not null and full_name <> ''
      and phone is not null and phone <> ''
      and identity_type is not null
    ) stored;

comment on column public.profiles.phone is
  'PMF 必填 · Edward 覆核時人工確認 · 第一版不自動驗 · Tier 0.5 接 OTP';
comment on column public.profiles.identity_type is
  'individual / company · 發案/接案前必填';
comment on column public.profiles.phone_verified_at is
  'Tier 0.5 預留 · 手機 OTP 通過時間 · 第一版恆 NULL';

-- ============================================================
-- 段 3 / 4 · 發案領域鎖池子 RPC（馬魯克 P0-3 · Edward 點名）
-- ============================================================
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

grant execute on function public.bp_available_verticals() to anon, authenticated;

comment on function public.bp_available_verticals() is
  '發案領域鎖 · distinct verticals of approved workers (TW/null country) · 前端 Step1 動態 enable/disable 領域';

-- ============================================================
-- 段 4 / 4 · client_intakes 交付邊界欄位 A/B（Edward 5/29 拍板 B）
-- ============================================================
alter table public.client_intakes
  add column if not exists delivery_scope text default 'A';

do $$
begin
  if not exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'client_intakes' and constraint_name = 'client_intakes_delivery_scope_check'
  ) then
    alter table public.client_intakes
      add constraint client_intakes_delivery_scope_check
      check (delivery_scope is null or delivery_scope in ('A', 'B'));
  end if;
end;
$$;

comment on column public.client_intakes.delivery_scope is
  '交付邊界 · A=交付成果 / B=交付+協助上線 · Edward 5/29 拍板 · PMF 只開 A/B · 來源 intake_data.expect.deliveryScope';

-- ============================================================
-- 驗證（跑完可選跑這幾條確認）
-- ============================================================
-- select event_type from (select unnest(enum_range(null)) ) ; -- (check constraint 不是 enum、看 constraint def 即可)
-- select column_name from information_schema.columns where table_name='profiles' and column_name in ('phone','identity_type','profile_complete');
-- select public.bp_available_verticals();
-- select column_name from information_schema.columns where table_name='client_intakes' and column_name='delivery_scope';
