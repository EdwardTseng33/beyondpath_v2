-- BeyondPath POC . arbitration_cases (Phase 3+ 仲裁機制 . 2026-05-28 calcifer)
-- Spec: Edward 5/28 21:40 拍板「退件 3 次自動進仲裁」P0
--
-- Trigger: client 第 3 次 reject milestone -> 系統自動觸發 -> arbitration_cases insert
-- Flow:
--   1. arbitration_cases 開立 (triggered_at + 5 工作日 deadline)
--   2. 雙方各自進 arbitration.html?case_id=X&role=Y&token=Z 提立場 (text + files jsonb)
--   3. admin 後台檢視雙方立場 + 平台判定
--      verdict_decision: worker_redo | partial_pay | contract_terminate
--   4. 寄存證副本 (含 verdict + 釋款 / 違約金 / 接案者 retry 通知)

create table if not exists public.arbitration_cases (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  milestone_id uuid not null references public.contract_milestones(id) on delete cascade,

  -- 觸發
  triggered_at timestamptz not null default now(),
  triggered_reason text, -- 'auto: 3rd_reject' . admin 可手動觸發時填其他原因
  trigger_dispute_count int, -- snapshot 當時的 dispute_count

  -- 5 工作日 deadline (application layer 算 . 5 + 週末)
  position_deadline timestamptz not null,

  -- 雙方立場 (deadline 前提交)
  client_position_text text,
  client_position_files jsonb, -- [{file_url, file_name, size, sha256, uploaded_at}]
  client_position_submitted_at timestamptz,
  client_position_submitted_ip text,

  worker_position_text text,
  worker_position_files jsonb,
  worker_position_submitted_at timestamptz,
  worker_position_submitted_ip text,

  -- 平台判定 (admin)
  verdict_text text,
  verdict_decision text check (verdict_decision in ('worker_redo', 'partial_pay', 'contract_terminate', 'pending')),
  verdict_percent int check (verdict_percent is null or (verdict_percent >= 0 and verdict_percent <= 100)), -- partial_pay 時的 % (worker 拿多少)
  verdict_breach_multiplier numeric(3,1) check (verdict_breach_multiplier is null or (verdict_breach_multiplier >= 0 and verdict_breach_multiplier <= 3.0)), -- 違約金倍率 (沿用既有 1.5/2/3)
  verdict_by uuid, -- admin user id (auth.users.id)
  verdict_at timestamptz,

  -- 最終釋款 (NT$)
  final_payment_amount_ntd int,
  final_breach_amount_ntd int, -- 違約金金額

  -- 寄存證副本給雙方
  certificate_sent_at timestamptz,

  -- 狀態
  status text not null default 'pending' check (status in (
    'pending',           -- 已觸發 . 等雙方提立場
    'positions_complete',-- 雙方都已提 . 等 admin 判定
    'deadline_expired',  -- 超過 5 工作日 . 缺一方立場 . 自動判 worker_redo
    'resolved'           -- 已判定 + 存證副本寄出
  )),

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- 同一 milestone 不可多開 (3 次 reject 才觸發 . 一次仲裁定生死)
  constraint arbitration_cases_milestone_unique unique (milestone_id)
);

create index if not exists arbitration_cases_contract_id_idx on public.arbitration_cases(contract_id);
create index if not exists arbitration_cases_status_idx on public.arbitration_cases(status);
create index if not exists arbitration_cases_triggered_at_idx on public.arbitration_cases(triggered_at desc);
create index if not exists arbitration_cases_pending_idx on public.arbitration_cases(status) where status in ('pending', 'positions_complete', 'deadline_expired');

comment on table public.arbitration_cases is
  'BeyondPath Phase 3+ . 仲裁案件 . 退件 3 次自動觸發 . admin 判 worker_redo / partial_pay / contract_terminate . 2026-05-28';
comment on column public.arbitration_cases.position_deadline is
  '雙方提立場 deadline . triggered_at + 5 工作日 (Edge Function 算 . 跳週末)';
comment on column public.arbitration_cases.verdict_decision is
  'worker_redo = 接案者再做一次 (attempts 不再加) . partial_pay = 部分釋款 + 終止 . contract_terminate = 全退款 + 違約金';
comment on column public.arbitration_cases.verdict_breach_multiplier is
  '違約金倍率 (沿用既有 1.5x / 2x / 3x 等級)';

-- ============================================================
-- contract_milestones 加 arbitration_case_id (反向 reference 加速查)
-- ============================================================
alter table public.contract_milestones
  add column if not exists arbitration_case_id uuid references public.arbitration_cases(id) on delete set null;

comment on column public.contract_milestones.arbitration_case_id is
  'reference 到 arbitration_cases.id . 仲裁觸發後寫入 . admin tab 加速查';

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.handle_arbitration_cases_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists arbitration_cases_updated_at on public.arbitration_cases;
create trigger arbitration_cases_updated_at
  before update on public.arbitration_cases
  for each row execute function public.handle_arbitration_cases_updated_at();

-- ============================================================
-- RLS . admin only (anon 雙方透過 contract-jwt 走 Edge Function service_role 寫入)
-- ============================================================
alter table public.arbitration_cases enable row level security;

drop policy if exists "arbitration_cases: admin sees all" on public.arbitration_cases;
create policy "arbitration_cases: admin sees all" on public.arbitration_cases
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "arbitration_cases: admin insert" on public.arbitration_cases;
create policy "arbitration_cases: admin insert" on public.arbitration_cases
  for insert
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "arbitration_cases: admin update" on public.arbitration_cases;
create policy "arbitration_cases: admin update" on public.arbitration_cases
  for update
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

comment on policy "arbitration_cases: admin sees all" on public.arbitration_cases is
  'Phase 3+: admin-only via RLS . worker/client 透過 arbitration.html + contract-jwt + Edge Function service_role 寫立場';
