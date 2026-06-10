-- BeyondPath POC · nps_responses table (Phase 3 結案 NPS · 2026-05-28 calcifer)
-- Spec: Edward 5/28 20:32 拍板「補後段 30% → 70%」
--
-- 結案 NPS · 雙方都簽完 + 所有 milestone approved → 自動寄 NPS 邀請信
--   . JWT-token 進入 nps.html?id=<contract_id>&role=<client|worker>&token=<jwt>
--   . 0-10 score + 評論
--   . 接案者可選匿名（client 不可匿名 · admin 必須知道誰評誰）
--   . submit-nps Edge Function 收到 → 寫進 nps_responses → 觸發 recalc-worker-tier
--
-- RLS: admin only（接案者 / 客戶經 Edge Function service_role 寫入）

create table if not exists public.nps_responses (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,

  -- 誰評
  role text not null check (role in ('client', 'worker')),

  -- 0-10 NPS
  score int not null check (score between 0 and 10),

  -- 評論
  comment text,

  -- 接案者可匿名（client 不可 · 邏輯在 Edge Function enforce）
  is_anonymous boolean default false,

  -- 寫入時 IP（限流 + 反 fraud）
  submitted_ip text,
  submitted_user_agent text,

  created_at timestamptz default now(),

  -- 每方只能評一次
  constraint nps_responses_unique unique (contract_id, role)
);

create index if not exists nps_responses_contract_id_idx on public.nps_responses(contract_id);
create index if not exists nps_responses_role_idx on public.nps_responses(role);
create index if not exists nps_responses_score_idx on public.nps_responses(score);
create index if not exists nps_responses_created_at_idx on public.nps_responses(created_at desc);

comment on table public.nps_responses is
  'BeyondPath Phase 3 結案 NPS · 雙方 0-10 評分 · 觸發 Tier 升降 · 2026-05-28';
comment on column public.nps_responses.is_anonymous is
  '接案者可匿名 · client 不可 · Edge Function enforce';

-- ============================================================
-- contracts table 加 nps_invited_at（記錄寄 NPS 邀請信時間）
-- ============================================================
alter table public.contracts
  add column if not exists nps_invited_at timestamptz;

comment on column public.contracts.nps_invited_at is
  '寄 NPS 邀請信給雙方時間戳 · Phase 3 結案流程';

-- ============================================================
-- RLS · admin only
-- ============================================================
alter table public.nps_responses enable row level security;

drop policy if exists "nps_responses: admin sees all" on public.nps_responses;
create policy "nps_responses: admin sees all" on public.nps_responses
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "nps_responses: admin insert" on public.nps_responses;
create policy "nps_responses: admin insert" on public.nps_responses
  for insert
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- ============================================================
-- worker_applications 加 tier_history（jsonb · Tier 升降歷史紀錄）
-- ============================================================
alter table public.worker_applications
  add column if not exists tier_history jsonb default '[]'::jsonb;

comment on column public.worker_applications.tier_history is
  'Tier 升降歷史 · [{ts, from_tier, to_tier, reasoning, avg_nps, case_count}, ...] · Phase 3';

-- ============================================================
-- worker_applications 加 nps_avg / nps_count（cache · 加速 admin 顯示）
-- ============================================================
alter table public.worker_applications
  add column if not exists nps_avg numeric(4,2);

alter table public.worker_applications
  add column if not exists nps_count int default 0;

alter table public.worker_applications
  add column if not exists completed_case_count int default 0;

comment on column public.worker_applications.nps_avg is '此 worker 收到的 NPS 平均分 · recalc-worker-tier 更新';
comment on column public.worker_applications.nps_count is '此 worker 累積 NPS 筆數';
comment on column public.worker_applications.completed_case_count is '此 worker 累積完成案件數（所有 milestone approved）';
