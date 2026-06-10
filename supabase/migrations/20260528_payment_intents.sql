-- BeyondPath POC . payment_intents (綠界 API 自動付款 + webhook 對帳 . 2026-05-28 calcifer)
-- Spec: Edward 5/28 22:26 拍板「金流要自動化、不能手動」
--
-- 流程 (取代 commission_records 手動標記 client_paid):
--   [1] admin 在 Contracts 按「+ 產綠界付款連結」-> create-ecpay-payment Edge Function
--       . 生 MerchantTradeNo (BP + timestamp + 4 隨機)
--       . call 綠界 AIO V5 CreatePayment
--       . INSERT payment_intents (status='pending', payment_url 存綠界 hosted page)
--       . 寄 email 給客戶 (含付款連結 + 7 天有效)
--   [2] 客戶點 email 進綠界 hosted page 付款
--   [3] 綠界 server-to-server callback ReturnURL = ecpay-webhook Edge Function
--       . verify CheckMacValue (HMAC-SHA256)
--       . UPDATE payment_intents status='paid' + paid_at + webhook_payload
--       . 寄 email 給客戶 (付款成功 . 收據)
--       . 寄 email 給 worker (客戶已付款 . 可開工)
--   [4] 蘇菲整合段: payment_intents.status='paid' -> INSERT commission_records event_type='client_paid'
--       (不在此 migration . 屬 instance 2 commission_records 表領地)
--
-- 個人戶 NT$ 20 萬月上限: 前端不擋、依綠界返回錯誤碼處理

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),

  -- contract + milestone reference
  contract_id uuid not null references public.contracts(id) on delete cascade,
  milestone_id uuid references public.contract_milestones(id) on delete set null,

  -- 綠界 unique trade number (BP{timestamp}{4 random}, max 20 chars per 綠界規範)
  ecpay_merchant_trade_no text not null unique,

  -- 金額 (NT$ integer)
  amount_ntd int not null check (amount_ntd > 0),

  -- 付款方式 (對應綠界 PaymentType)
  payment_type text not null check (payment_type in (
    'credit_card',   -- Credit
    'atm',           -- ATM
    'cvs',           -- CVS 超商代碼
    'all'            -- ALL (綠界 hosted 自選頁)
  )) default 'all',

  -- 綠界 hosted page URL (return from CreatePayment)
  payment_url text,

  -- 狀態 (lifecycle)
  status text not null check (status in (
    'pending',    -- 已生連結 . 客戶尚未付款
    'paid',       -- webhook 確認 RtnCode=1 . 已付款
    'failed',     -- webhook RtnCode != 1 . 付款失敗 (退卡 / ATM 逾期 / 等)
    'expired',    -- 超過 expired_at . 客戶沒付款
    'cancelled'   -- admin 手動取消
  )) default 'pending',

  -- 時間戳
  created_at timestamptz default now(),
  paid_at timestamptz,                 -- webhook 標時間 (從綠界 PaymentDate 解析)
  expired_at timestamptz default (now() + interval '7 days'),
  updated_at timestamptz default now(),

  -- webhook 完整 payload (jsonb . 對帳用)
  webhook_payload jsonb,

  -- 付款方式明細 (webhook 後填 . e.g. 'Credit_CreditCard' / 'ATM_TAISHIN')
  payment_method_detail text,

  -- 客戶 email (寄付款連結用)
  customer_email text not null
);

create index if not exists payment_intents_contract_id_idx on public.payment_intents(contract_id);
create index if not exists payment_intents_milestone_id_idx on public.payment_intents(milestone_id);
create index if not exists payment_intents_status_idx on public.payment_intents(status);
create index if not exists payment_intents_created_at_idx on public.payment_intents(created_at desc);
create index if not exists payment_intents_trade_no_idx on public.payment_intents(ecpay_merchant_trade_no);

comment on table public.payment_intents is
  'BeyondPath 綠界 API 自動付款意圖 . admin 產連結 + 客戶付款 + webhook 對帳 . 2026-05-28';
comment on column public.payment_intents.ecpay_merchant_trade_no is
  'Unique trade number (BP + timestamp + 4 random, max 20 chars) . 對應綠界 MerchantTradeNo';
comment on column public.payment_intents.webhook_payload is
  '綠界 webhook 完整 payload jsonb . 含 RtnCode / RtnMsg / PaymentDate / PaymentType / TradeAmt / TradeNo etc.';

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.handle_payment_intents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payment_intents_updated_at on public.payment_intents;
create trigger payment_intents_updated_at
  before update on public.payment_intents
  for each row execute function public.handle_payment_intents_updated_at();

-- ============================================================
-- RLS . admin only (service_role bypasses . 同 contracts pattern)
-- webhook 函式用 service_role (bypass) . 公開 endpoint 用 CheckMacValue 驗
-- ============================================================
alter table public.payment_intents enable row level security;

drop policy if exists "payment_intents: admin sees all" on public.payment_intents;
create policy "payment_intents: admin sees all" on public.payment_intents
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "payment_intents: admin insert" on public.payment_intents;
create policy "payment_intents: admin insert" on public.payment_intents
  for insert
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "payment_intents: admin update" on public.payment_intents;
create policy "payment_intents: admin update" on public.payment_intents
  for update
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "payment_intents: admin delete" on public.payment_intents;
create policy "payment_intents: admin delete" on public.payment_intents
  for delete
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

comment on policy "payment_intents: admin sees all" on public.payment_intents is
  'admin-only . webhook 函式用 service_role bypass RLS . 公開 endpoint 走 CheckMacValue 驗';
