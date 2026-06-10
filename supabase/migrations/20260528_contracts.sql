-- BeyondPath POC · contracts table (C-1 Phase 1 · 2026-05-28 calcifer)
-- Spec: Edward 拍板「自家 PDF + 平台儲存 + 雙方手寫簽拍照上傳 + 時間戳」(D 方案)
--
-- Phase 1 (此 migration · ship today):
--   . contracts table
--   . contract_pdf_url . admin 按「產合約」呼叫 Edge Function 動態生成
--   . status: 'pending' (PDF 已產生 · 雙方未簽) | 'partial' (一方已簽) | 'complete' (雙方已簽)
--
-- Phase 2 (下次 sprint):
--   . client_signature_url + worker_signature_url 上傳完整接入 (Storage signed URL + JWT verify)
--   . SHA-256 hash 計算與驗證頁
--
-- Storage: 私有 bucket 'contracts' (Edward 在 Supabase Studio 手動建 + RLS)
--
-- Indexes: id (PK) . client_intake_id . worker_application_id . created_at
-- RLS: anon insert disabled . admin sees all . service_role 全權

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  client_intake_id uuid references public.client_intakes(id) on delete set null,
  worker_application_id uuid references public.worker_applications(id) on delete set null,

  -- 合約 PDF (Edge Function 產生 · 存 Storage 私有 bucket 'contracts')
  pdf_url text,
  pdf_hash text, -- SHA-256 hash of PDF bytes (calcifer Phase 1: optional · Phase 2: enforced)

  -- 簽署照片 (Phase 2 · 雙方上傳)
  client_signature_url text,
  worker_signature_url text,
  client_signed_at timestamptz,
  worker_signed_at timestamptz,

  -- 合約內容 snapshot (避免 client_intakes / worker_applications 後續改動破壞合約對應)
  contract_snapshot jsonb, -- {client_name, client_email, worker_name, worker_email, project_budget, tier, vertical, timeline, payment_split, beta_version}

  -- 狀態
  status text check (status in ('pending', 'partial', 'complete', 'cancelled')) default 'pending',

  -- 通知記錄
  notified_at timestamptz, -- 寄 email 給雙方時間戳

  -- timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- 防 double-create same intake-worker pair
  constraint contracts_intake_worker_unique unique (client_intake_id, worker_application_id)
);

create index if not exists contracts_client_intake_id_idx on public.contracts(client_intake_id);
create index if not exists contracts_worker_application_id_idx on public.contracts(worker_application_id);
create index if not exists contracts_status_idx on public.contracts(status);
create index if not exists contracts_created_at_idx on public.contracts(created_at desc);

comment on table public.contracts is
  'BeyondPath Beta POC · 線上簽約 (D 方案) · 平台自產 PDF + 雙方簽署照片 + 時間戳 · 2026-05-28';
comment on column public.contracts.contract_snapshot is
  'jsonb snapshot of client+worker+terms at contract-creation time · immutable copy for legal audit';
comment on column public.contracts.pdf_hash is
  'SHA-256 hash of generated PDF · Phase 2 enforced · Phase 1 optional';

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.handle_contracts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contracts_updated_at on public.contracts;
create trigger contracts_updated_at
  before update on public.contracts
  for each row execute function public.handle_contracts_updated_at();

-- ============================================================
-- RLS · admin only (service_role bypasses)
-- ============================================================
alter table public.contracts enable row level security;

-- admin (edwardt0303@gmail.com) sees all
drop policy if exists "contracts: admin sees all" on public.contracts;
create policy "contracts: admin sees all" on public.contracts
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "contracts: admin insert" on public.contracts;
create policy "contracts: admin insert" on public.contracts
  for insert
  with check (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

drop policy if exists "contracts: admin update" on public.contracts;
create policy "contracts: admin update" on public.contracts
  for update
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- Phase 2 future: anon can SELECT their own contract via signed JWT token (contract.html)
-- (deferred · not in Phase 1)

comment on policy "contracts: admin sees all" on public.contracts is
  'Phase 1: admin-only access · Phase 2 will add anon-with-JWT-token for contract.html sign page';
