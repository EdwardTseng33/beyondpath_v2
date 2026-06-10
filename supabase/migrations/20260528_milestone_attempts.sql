-- BeyondPath POC . contract_milestones attempts + disputed metadata (Phase 3+ 退件 3 次仲裁 . 2026-05-28 calcifer)
-- Spec: Edward 5/28 21:40 拍板「退件 3 次自動仲裁」P0 補完 PMF
--
-- contract_milestones 加:
--   . attempts int default 1 (每次接案者交付 + 1 . v1 / v2 / v3 對應)
--   . disputed_reason text (最新一次退件原因 . 跟 dispute_reason 並存 . 後者保留歷史)
--   . disputed_at timestamptz (最新退件時間)
--
-- 註: 既有 schema 已有 dispute_count + dispute_reason . 本次補:
--   . attempts (跟 version_number 對齊 . 客戶從 worker 視角看「第幾次嘗試」)
--   . disputed_reason (新欄 . 跟既有 dispute_reason 區隔: dispute_reason 是 admin 視角 . disputed_reason 是 client 自填)
--   . 邏輯: client reject -> attempts +1 . 接案者重交 -> attempts 不變 (因為 attempts = 已交付次數 = version_number)

alter table public.contract_milestones
  add column if not exists attempts int not null default 1 check (attempts >= 1 and attempts <= 10);

alter table public.contract_milestones
  add column if not exists disputed_reason_client text;

-- (既有 disputed_at 已存在於 schema . 不重複加)

comment on column public.contract_milestones.attempts is
  '此 milestone 被接案者交付的次數 . 跟 milestone_deliverables.version_number 對齊 . 第 1 次 = 首次交付';
comment on column public.contract_milestones.disputed_reason_client is
  '客戶從 milestone-detail.html 自填的退件原因 (跟 admin 後台 dispute_reason 區隔)';

-- 加 index 加速「dispute_count >= 3」查詢 (admin 仲裁 tab)
create index if not exists contract_milestones_dispute_count_idx on public.contract_milestones(dispute_count) where dispute_count >= 2;

-- ============================================================
-- contract_milestones_history . 每次狀態變化的 audit (deliver / dispute / approve)
-- ============================================================
create table if not exists public.contract_milestones_history (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.contract_milestones(id) on delete cascade,
  action text not null check (action in ('deliver', 'dispute', 'approve', 'arbitration_open', 'arbitration_resolve', 'redo')),
  action_by_role text not null check (action_by_role in ('worker', 'client', 'admin', 'system')),
  action_by_ip text,
  attempt_number int,
  notes text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists contract_milestones_history_milestone_id_idx on public.contract_milestones_history(milestone_id);
create index if not exists contract_milestones_history_created_at_idx on public.contract_milestones_history(created_at desc);

comment on table public.contract_milestones_history is
  'BeyondPath Phase 3+ . milestone 全狀態變化 audit . 仲裁時引用 . 2026-05-28';

alter table public.contract_milestones_history enable row level security;

drop policy if exists "contract_milestones_history: admin sees all" on public.contract_milestones_history;
create policy "contract_milestones_history: admin sees all" on public.contract_milestones_history
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "contract_milestones_history: admin insert" on public.contract_milestones_history;
create policy "contract_milestones_history: admin insert" on public.contract_milestones_history
  for insert
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');
