-- BeyondPath POC · contract_milestones table (Phase 3 履約看板 · 2026-05-28 calcifer)
-- Spec: Edward 5/28 20:32 拍板「補後段 30% → 70% · 商業閉環跑通」
--
-- 履約看板資料層：每筆 contract 預設 3 個 milestone（30/30/40 釋款）
--   . admin 可改 amount_pct（總和必須 = 100）
--   . status: pending → in_progress → delivered → approved（釋款）/ disputed（退件）
--   . 退件 3 次 → 自動標 'arbitration'（next sprint 真做仲裁邏輯）
--
-- RLS: admin only（service_role bypasses · 同 contracts pattern）

create table if not exists public.contract_milestones (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,

  milestone_number int not null check (milestone_number between 1 and 3),
  title text not null,

  -- 釋款百分比（總和 = 100 由 application layer enforce · DB 不硬綁、admin 改起來才順）
  amount_pct numeric(5,2) not null check (amount_pct > 0 and amount_pct <= 100),

  -- due date · 可選
  due_date date,

  -- 狀態機
  status text not null check (status in (
    'pending',         -- 預設 · 還沒開始
    'in_progress',     -- worker 標「正在做」
    'delivered',       -- worker 標「已交付」
    'approved',        -- client 驗收通過 → 對應 30/30/40 釋款給 worker
    'disputed',        -- client 退件
    'arbitration'      -- 退件 ≥ 3 次 → 仲裁
  )) default 'pending',

  -- 交付物 + 退件原因
  deliverable_text text,
  dispute_reason text,
  dispute_count int not null default 0,

  -- 時間戳
  delivered_at timestamptz,
  approved_at timestamptz,
  disputed_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- 同 contract 內 milestone_number 唯一（每 contract 只有 3 個 milestone）
  constraint contract_milestones_unique unique (contract_id, milestone_number)
);

create index if not exists contract_milestones_contract_id_idx on public.contract_milestones(contract_id);
create index if not exists contract_milestones_status_idx on public.contract_milestones(status);

comment on table public.contract_milestones is
  'BeyondPath Phase 3 履約看板 · 每筆 contract 3 個 milestone · 30/30/40 釋款 · 2026-05-28';

-- ============================================================
-- contracts table 加 milestones_total（計算欄 · 三個 milestone 釋款累積 %）
-- ============================================================
alter table public.contracts
  add column if not exists milestones_total numeric(5,2) default 0;

comment on column public.contracts.milestones_total is
  '累積已 approved milestone 釋款 % · trigger 自動更新 · Phase 3 履約看板';

-- ============================================================
-- updated_at trigger · 沿用 handle_contracts_updated_at pattern
-- ============================================================
create or replace function public.handle_contract_milestones_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contract_milestones_updated_at on public.contract_milestones;
create trigger contract_milestones_updated_at
  before update on public.contract_milestones
  for each row execute function public.handle_contract_milestones_updated_at();

-- ============================================================
-- 自動更新 contracts.milestones_total（approved milestone 累積釋款 %）
-- ============================================================
create or replace function public.recalc_contract_milestones_total()
returns trigger
language plpgsql
as $$
declare
  v_contract_id uuid;
  v_total numeric(5,2);
begin
  v_contract_id := coalesce(new.contract_id, old.contract_id);
  select coalesce(sum(amount_pct), 0)
    into v_total
    from public.contract_milestones
    where contract_id = v_contract_id and status = 'approved';
  update public.contracts
    set milestones_total = v_total,
        updated_at = now()
    where id = v_contract_id;
  return null;
end;
$$;

drop trigger if exists contract_milestones_recalc_total on public.contract_milestones;
create trigger contract_milestones_recalc_total
  after insert or update of status or delete on public.contract_milestones
  for each row execute function public.recalc_contract_milestones_total();

-- ============================================================
-- RLS · admin only
-- ============================================================
alter table public.contract_milestones enable row level security;

drop policy if exists "contract_milestones: admin sees all" on public.contract_milestones;
create policy "contract_milestones: admin sees all" on public.contract_milestones
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "contract_milestones: admin insert" on public.contract_milestones;
create policy "contract_milestones: admin insert" on public.contract_milestones
  for insert
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "contract_milestones: admin update" on public.contract_milestones;
create policy "contract_milestones: admin update" on public.contract_milestones
  for update
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- ============================================================
-- Seed: 自動為現有 'complete' contracts 建 3 個預設 milestone
-- （30/30/40 split · service_role 路徑 · 之後 contract 建立時要 application layer 自動 insert）
-- ============================================================
do $$
declare
  c record;
begin
  for c in select id from public.contracts where status = 'complete' loop
    insert into public.contract_milestones (contract_id, milestone_number, title, amount_pct)
    values
      (c.id, 1, '里程碑 1 . 啟動交付', 30),
      (c.id, 2, '里程碑 2 . 中段交付', 30),
      (c.id, 3, '里程碑 3 . 完成交付', 40)
    on conflict (contract_id, milestone_number) do nothing;
  end loop;
end;
$$;

comment on policy "contract_milestones: admin sees all" on public.contract_milestones is
  'Phase 3: admin-only · next sprint will add anon-with-JWT for worker/client self-update via signed token';
