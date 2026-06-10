-- BeyondPath POC . milestone_deliverables + deliverable_external_links (Phase 3+ 交付檔案管理 . 2026-05-28 calcifer)
-- Spec: Edward 5/28 21:40 拍板「交付檔案 + 退件 3 次仲裁」P0 補完 PMF
--
-- milestone_deliverables: 接案者 / 客戶上傳檔案 . 含 SHA-256 . 版本管理 . Storage URL
-- deliverable_external_links: 純外部連結 (Figma / GDrive / GitHub / 其他) . 不存檔案本體
--
-- RLS: admin + 雙方 (透過 contract-jwt verify 之後 service_role 寫入)
--
-- 檔案規格 (application layer enforce):
--   . 單檔上限 100 MB
--   . 整個 milestone 包上限 500 MB
--   . 結案後 30 天可下載 (Edge Function 算 . 之後封存)

create table if not exists public.milestone_deliverables (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.contract_milestones(id) on delete cascade,

  -- Storage 路徑與檔案 metadata
  file_url text not null,
  file_name text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 104857600), -- 100 MB
  mime_type text not null,
  sha256 text not null, -- hex 64 char

  -- 誰上傳 (worker / client . 雙方都能傳)
  uploaded_by_role text not null check (uploaded_by_role in ('worker', 'client')),
  uploaded_by_ip text,

  -- 版本管理 (v1 / v2 / v3 ...)
  version_number int not null default 1 check (version_number >= 1),

  -- 上傳者填的說明 (此版改了什麼)
  description text,

  -- timestamps
  uploaded_at timestamptz default now(),

  -- 同 milestone + 同 version 不能重 . (允許同 version 多個檔案 . 不加 unique)
  -- 配合 application layer 控制版本遞增
  created_at timestamptz default now()
);

create index if not exists milestone_deliverables_milestone_id_idx on public.milestone_deliverables(milestone_id);
create index if not exists milestone_deliverables_version_idx on public.milestone_deliverables(milestone_id, version_number desc);
create index if not exists milestone_deliverables_uploaded_at_idx on public.milestone_deliverables(uploaded_at desc);

comment on table public.milestone_deliverables is
  'BeyondPath Phase 3+ . 交付檔案 . SHA-256 + 版本管理 . 2026-05-28';
comment on column public.milestone_deliverables.version_number is
  'v1 = 首次交付 . client reject 後接案者上傳 v2 . dispute_count 對應的版本';

-- ============================================================
-- deliverable_external_links table
-- ============================================================
create table if not exists public.deliverable_external_links (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.contract_milestones(id) on delete cascade,

  link_type text not null check (link_type in ('figma', 'gdrive', 'github', 'notion', 'dropbox', 'other')),
  url text not null check (url ~* '^https?://'),
  description text,

  uploaded_by_role text not null check (uploaded_by_role in ('worker', 'client')),
  uploaded_by_ip text,

  uploaded_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists deliverable_external_links_milestone_id_idx on public.deliverable_external_links(milestone_id);
create index if not exists deliverable_external_links_uploaded_at_idx on public.deliverable_external_links(uploaded_at desc);

comment on table public.deliverable_external_links is
  'BeyondPath Phase 3+ . 外部連結 (Figma / GDrive / GitHub 等) . 超過 100 MB 強制走此 . 2026-05-28';

-- ============================================================
-- deliverable_download_log . audit log (誰何時下載哪個檔)
-- ============================================================
create table if not exists public.deliverable_download_log (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid references public.milestone_deliverables(id) on delete cascade,
  downloaded_by_role text not null check (downloaded_by_role in ('worker', 'client', 'admin')),
  downloaded_by_ip text,
  user_agent text,
  signed_url_expires_at timestamptz,
  downloaded_at timestamptz default now()
);

create index if not exists deliverable_download_log_deliverable_id_idx on public.deliverable_download_log(deliverable_id);
create index if not exists deliverable_download_log_downloaded_at_idx on public.deliverable_download_log(downloaded_at desc);

comment on table public.deliverable_download_log is
  'BeyondPath Phase 3+ . 下載 audit log . GDPR + 反爭議證據 . 2026-05-28';

-- ============================================================
-- contract_milestones 加 archived_at (結案 30 天後封存標記)
-- ============================================================
alter table public.contract_milestones
  add column if not exists archived_at timestamptz;

comment on column public.contract_milestones.archived_at is
  '結案 (status=approved) 後 30 天標記 archived . cron 設 . 之後 deliverables 不可下載';

-- ============================================================
-- RLS . admin only (Edge Function service_role 路徑寫入 . anon 不可直 select)
-- ============================================================
alter table public.milestone_deliverables enable row level security;
alter table public.deliverable_external_links enable row level security;
alter table public.deliverable_download_log enable row level security;

drop policy if exists "milestone_deliverables: admin sees all" on public.milestone_deliverables;
create policy "milestone_deliverables: admin sees all" on public.milestone_deliverables
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "milestone_deliverables: admin insert" on public.milestone_deliverables;
create policy "milestone_deliverables: admin insert" on public.milestone_deliverables
  for insert
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "deliverable_external_links: admin sees all" on public.deliverable_external_links;
create policy "deliverable_external_links: admin sees all" on public.deliverable_external_links
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "deliverable_external_links: admin insert" on public.deliverable_external_links;
create policy "deliverable_external_links: admin insert" on public.deliverable_external_links
  for insert
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "deliverable_download_log: admin sees all" on public.deliverable_download_log;
create policy "deliverable_download_log: admin sees all" on public.deliverable_download_log
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "deliverable_download_log: admin insert" on public.deliverable_download_log;
create policy "deliverable_download_log: admin insert" on public.deliverable_download_log
  for insert
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

comment on policy "milestone_deliverables: admin sees all" on public.milestone_deliverables is
  'Phase 3+: admin-only via RLS . worker/client 透過 contract-jwt verify + Edge Function service_role 寫入';
