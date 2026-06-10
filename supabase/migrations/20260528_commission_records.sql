-- BeyondPath POC . commission_records (個人戶代收代付對帳機制 . 2026-05-28 calcifer)
-- Spec: Edward 5/28 22:02 拍板「金流對帳機制 . PMF 1-3 案個人戶代收代付」
--
-- PMF 階段實際金流:
--   [1] 客戶刷卡入 Edward 個人綠界戶 (全額 NT$ Y)
--   [2] 7-14 天綠界放款 -> Edward 銀行帳
--   [3] Edward admin 按「客戶已付」-> commission_records.event_type = 'client_paid'
--   [4] Edward 銀行轉接案者 (淨額 = Y - 抽佣 Z)
--   [5] Edward admin 按「接案者已轉」-> commission_records.event_type = 'worker_paid_out'
--   [6] 系統自動寄發票給接案者 (平台收 Z 服務費的證明) -> 'invoice_issued'
--   [7] 接案者匯回抽佣 Z -> Edward admin 標 'commission_collected'
--   [8] admin 點「對帳完成」-> contract 進 completed 狀態

create table if not exists public.commission_records (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  milestone_id uuid references public.contract_milestones(id) on delete set null,

  -- 4 個 event type . admin 按按鈕觸發
  event_type text not null check (event_type in (
    'client_paid',           -- 客戶刷卡 / ATM 已入 Edward 個人戶 (含階段釋款)
    'worker_paid_out',       -- Edward 已從個人戶轉淨額給 worker
    'commission_collected',  -- worker 已匯回抽佣給 Edward (對應 invoice)
    'invoice_issued'         -- 平台寄抽佣 invoice 給 worker
  )),

  -- 金額 . 一律 integer NT$
  amount_ntd int not null,

  -- 付款方式 (event_type = client_paid / worker_paid_out 才填)
  payment_method text check (payment_method in (
    'ecpay_credit',      -- 綠界刷卡
    'atm_transfer',      -- ATM 銀行轉帳
    'manual'             -- 手動 (現金 / 其他)
  )),

  -- 對帳參考號 (綠界訂單號 / ATM 後 5 碼 / invoice 號)
  reference_number text,

  -- 備註 (admin 補充)
  notes text,

  -- 時間戳
  paid_at timestamptz default now(),       -- 實際入款 / 出款日 (admin 可改成過去日)
  created_at timestamptz default now(),    -- 紀錄建立日
  updated_at timestamptz default now()
);

create index if not exists commission_records_contract_id_idx on public.commission_records(contract_id);
create index if not exists commission_records_event_type_idx on public.commission_records(event_type);
create index if not exists commission_records_paid_at_idx on public.commission_records(paid_at desc);

comment on table public.commission_records is
  'BeyondPath PMF 個人戶代收代付對帳紀錄 . 4 種 event_type . admin 手動標記 . 2026-05-28';

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.handle_commission_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists commission_records_updated_at on public.commission_records;
create trigger commission_records_updated_at
  before update on public.commission_records
  for each row execute function public.handle_commission_records_updated_at();

-- ============================================================
-- 自動更新 contracts 累計欄 (client_paid_total / commission_collected_total)
-- ============================================================
create or replace function public.recalc_contract_commission_totals()
returns trigger
language plpgsql
as $$
declare
  v_contract_id uuid;
  v_paid_total int;
  v_collected_total int;
begin
  v_contract_id := coalesce(new.contract_id, old.contract_id);

  select coalesce(sum(amount_ntd), 0)
    into v_paid_total
    from public.commission_records
    where contract_id = v_contract_id and event_type = 'client_paid';

  select coalesce(sum(amount_ntd), 0)
    into v_collected_total
    from public.commission_records
    where contract_id = v_contract_id and event_type = 'commission_collected';

  update public.contracts
    set client_paid_total_ntd = v_paid_total,
        commission_collected_total_ntd = v_collected_total,
        updated_at = now()
    where id = v_contract_id;

  return null;
end;
$$;

drop trigger if exists commission_records_recalc_totals on public.commission_records;
create trigger commission_records_recalc_totals
  after insert or update of amount_ntd, event_type or delete on public.commission_records
  for each row execute function public.recalc_contract_commission_totals();

-- ============================================================
-- RLS . admin only (service_role bypasses . 同 contracts pattern)
-- ============================================================
alter table public.commission_records enable row level security;

drop policy if exists "commission_records: admin sees all" on public.commission_records;
create policy "commission_records: admin sees all" on public.commission_records
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "commission_records: admin insert" on public.commission_records;
create policy "commission_records: admin insert" on public.commission_records
  for insert
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "commission_records: admin update" on public.commission_records;
create policy "commission_records: admin update" on public.commission_records
  for update
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "commission_records: admin delete" on public.commission_records;
create policy "commission_records: admin delete" on public.commission_records
  for delete
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

comment on policy "commission_records: admin sees all" on public.commission_records is
  'PMF Phase: admin-only . worker 看自己抽佣明細透過 worker-payout.html?token=<jwt> 走 service_role';
