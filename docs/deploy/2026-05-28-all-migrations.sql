-- BeyondPath 2026-05-28 合併版搬遷 SQL · v3（修 view cascade）


-- ====== 20260528_client_intakes_required_fields.sql ======

-- BeyondPath POC . client_intakes 必填欄位擴充 (2026-05-28 calcifer)
-- 配合 Step 01 表單必填強化 (蘇菲 5/28 拍板)
--
-- 改動:
--   . 加 job_title text (clientType='company' 時建議填 . 其他選填)
--   . 加 phone text (全選填 . helper: 方便配對後快速聯絡)
--   . company_name 已既有 (001_initial_schema.sql) . 不重複加
--   . budget_range / timeline 已既有 . 不重複加
--
-- Backward compatible:
--   . 兩個新欄都 nullable . 既有 row 自動 NULL . 不破壞
--
-- Manual deploy: Edward 在 Supabase Studio SQL Editor 跑

alter table public.client_intakes
  add column if not exists job_title text;

alter table public.client_intakes
  add column if not exists phone text;

comment on column public.client_intakes.job_title is
  'Step 01 input . clientType=company 時建議填 . 其他選填';

comment on column public.client_intakes.phone is
  'Step 01 input . 全選填 . 方便配對後快速聯絡';

-- Verify:
--   select column_name, data_type, is_nullable
--     from information_schema.columns
--     where table_name = 'client_intakes' and column_name in ('job_title', 'phone');


-- ====== 20260528_seed_edward_profile.sql ======

-- BeyondPath POC . seed_edward_profile (2026-05-28 calcifer)
-- 把 Edward 自己接案者檔案寫進 worker_applications . status='approved' . 進 worker_unified_v 池
--
-- 依據:
--   . 蘇菲 5/28 12:24 draft + Edward 12:54 默許「自治推進」
--   . worker_applications schema (001_initial_schema.sql + 20260520125059_worker_unified.sql)
--   . unified_card 結構 ref: supabase/functions/_shared/worker-schema.ts (aiProofToUnifiedWorker)
--
-- Idempotent:
--   . 用 email 為 dedupe key . 若已存在 update . 否則 insert
--   . 重跑安全 . Edward 可在 Supabase Studio SQL Editor 反覆執行
--
-- Manual deploy: Edward 在 Supabase Studio SQL Editor 跑

-- ============================================================
-- 0. 確保 email unique constraint 存在（ON CONFLICT 前置 · 順序修正 2026-05-29）
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'worker_applications_email_key'
  ) then
    alter table public.worker_applications
      add constraint worker_applications_email_key unique (email);
  end if;
exception when others then
  raise notice 'email unique constraint skipped: %', sqlerrm;
end $$;

-- ============================================================
-- 1. INSERT or UPDATE worker_applications row for Edward
-- ============================================================
insert into public.worker_applications (
  email,
  display_name,
  ai_proof,
  l_score,
  verticals,
  case_count,
  tier_suggestion,
  status,
  unified_card,
  admin_notes
)
values (
  'edwardt0303@gmail.com',
  'Edward Tseng',
  jsonb_build_object(
    'name', 'Edward Tseng',
    'L_score', 9,
    'L_confidence', 'high',
    'tier_suggestion', 'Bplus',
    'evidence_quality', 'high',
    'verticals', jsonb_build_array('agent', 'strategy', 'software'),
    'case_count', '5-10',
    'skill_matrix', jsonb_build_object(
      'workflow_design', 10,
      'tool_orchestration', 10,
      'judgment', 9,
      'domain_depth', 9,
      'client_communication', 8,
      'delivery_reliability', 9
    ),
    'strengths', jsonb_build_array(
      '多 agent 協作系統設計（城堡 7 人 + Cowork 模式）',
      'AI workflow 從零到上線完整交付',
      '產品策略 + PM 視角貫穿、不只技術'
    ),
    'growth', jsonb_build_array(
      '前端視覺實作（深度視覺仰賴卡西法/女巫）',
      '深度資安/合規審查（仰賴沙利曼）'
    ),
    'portfolio', jsonb_build_array(
      jsonb_build_object(
        'client', 'BeyondPath (self)',
        'desc', 'AI native 雙邊接案配對平台、5 維配對演算法 + 邀請信閉環 + Admin Console v0.1、8 週 0 → live',
        'metric', '12 步流程 5 步 live + 整套配對閉環'
      ),
      jsonb_build_object(
        'client', 'Castle AI System',
        'desc', '7 agent 協作架構（蘇菲/霍爾/卡西法/女巫/蕪菁頭/馬魯克/沙利曼）+ 跨裝置記憶 + 24/7 監聽小程式 + L6 自治',
        'metric', '7 agent + 3 主程式庫'
      ),
      jsonb_build_object(
        'client', '多產品分管框架',
        'desc', 'Voice Path / CAREON / BeyondPath 並行、產品護照制 + 燒錢/架構懷疑 Gate 治理',
        'metric', '多產品 portfolio 並行 SOP'
      )
    )
  ),
  9,
  array['agent', 'strategy', 'software'],
  '5-10',
  'Bplus',
  'approved',
  -- ============================================================
  -- unified_card . 照 aiProofToUnifiedWorker 規格手寫 (frontend 不必跑 derive)
  -- ref: supabase/functions/_shared/worker-schema.ts
  -- ============================================================
  jsonb_build_object(
    'id', 'edward-tseng',
    'handle', '@edwardtseng',
    'name', 'Edward Tseng',
    'role', 'Agent + Workflow Expert',
    'tier', 'Bplus',
    'L_score', 9,
    'L_confidence', 'high',
    'skill_matrix', jsonb_build_object(
      'workflow_design', 10,
      'tool_orchestration', 10,
      'judgment', 9,
      'domain_depth', 9,
      'client_communication', 8,
      'delivery_reliability', 9
    ),
    'verticals', jsonb_build_array('agent', 'strategy', 'software'),
    -- badges: vertical 0 (Agent) + skills >=8 (Workflow / Tools / Judgment / Domain / Delivery) + Tier Bplus
    'badges', jsonb_build_array('Agent', 'Workflow', 'Tools', 'Judgment', 'Tier Bplus'),
    'strengths', jsonb_build_array(
      '多 agent 協作系統設計（城堡 7 人 + Cowork 模式）',
      'AI workflow 從零到上線完整交付',
      '產品策略 + PM 視角貫穿、不只技術'
    ),
    'growth', jsonb_build_array(
      '前端視覺實作（深度視覺仰賴卡西法/女巫）',
      '深度資安/合規審查（仰賴沙利曼）'
    ),
    'capacity', 3,
    'rate_range', jsonb_build_object('lo', 0, 'hi', 0),
    'last_active', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'nps', null,
    'cases_completed', 0,
    'case_count_bucket', '5-10',
    'evidence_quality', 'high',
    'portfolio', jsonb_build_array(
      jsonb_build_object(
        'client', 'BeyondPath (self)',
        'desc', 'AI native 雙邊接案配對平台、5 維配對演算法 + 邀請信閉環 + Admin Console v0.1、8 週 0 → live',
        'metric', '12 步流程 5 步 live + 整套配對閉環'
      ),
      jsonb_build_object(
        'client', 'Castle AI System',
        'desc', '7 agent 協作架構（蘇菲/霍爾/卡西法/女巫/蕪菁頭/馬魯克/沙利曼）+ 跨裝置記憶 + 24/7 監聽小程式 + L6 自治',
        'metric', '7 agent + 3 主程式庫'
      ),
      jsonb_build_object(
        'client', '多產品分管框架',
        'desc', 'Voice Path / CAREON / BeyondPath 並行、產品護照制 + 燒錢/架構懷疑 Gate 治理',
        'metric', '多產品 portfolio 並行 SOP'
      )
    ),
    -- blurb: strengths slice(0,2).join(' / ') + '.'
    'blurb', '多 agent 協作系統設計（城堡 7 人 + Cowork 模式） / AI workflow 從零到上線完整交付.',
    -- works: portfolio[0..2].client
    'works', jsonb_build_array('BeyondPath (self)', 'Castle AI System', '多產品分管框架')
  ),
  'seed via 20260528_seed_edward_profile.sql . 自治推進 . 蘇菲 5/28 12:24 draft + Edward 默許'
)
on conflict (email) do update set
  display_name = excluded.display_name,
  ai_proof = excluded.ai_proof,
  l_score = excluded.l_score,
  verticals = excluded.verticals,
  case_count = excluded.case_count,
  tier_suggestion = excluded.tier_suggestion,
  status = excluded.status,
  unified_card = excluded.unified_card,
  admin_notes = excluded.admin_notes,
  updated_at = now();

-- ============================================================
-- Verify: SELECT after seed
-- ============================================================
-- 跑完此 migration 後在 Supabase Studio 跑:
--   select email, status, tier_suggestion, l_score, verticals, unified_card->>'role'
--     from worker_unified_v
--     where email = 'edwardt0303@gmail.com';
-- 應回一筆 row . status=approved . role=Agent + Workflow Expert


-- ====== 20260528_worker_applications_country.sql ======

-- BeyondPath POC · worker_applications.country (B-2 · 2026-05-28 calcifer · Edward 拍板「國際接案者投件入口」)
-- Spec: 國際接案者可投件進池子（Y1 簽約仍只台灣、國際版上線後開放）
--
-- 改動:
--   1. worker_applications 加 country text (nullable · 既有 row 默認 null = 視為台灣)
--   2. worker_unified_v 加 country 欄
--   3. admin 可篩居住地
--
-- Compat: nullable + default null → 不破壞既有 row · 既有 RLS / policy 不動

-- ============================================================
-- 1. Add country column to worker_applications
-- ============================================================
alter table public.worker_applications
  add column if not exists country text default null;

comment on column public.worker_applications.country is
  'Worker country of residence · Y1 only TW signs · international can apply to pool · 2026-05-28';

-- 常用 country code 建議值 (frontend select):
--   'TW' 台灣 / 'SG' 新加坡 / 'MY' 馬來西亞 / 'HK' 香港 / 'OTHER' 其他
-- 不加 check constraint · 保留彈性 · admin 可看 raw value

create index if not exists worker_applications_country_idx
  on public.worker_applications(country);

-- ============================================================
-- 2. Rebuild worker_unified_v with country column
-- ============================================================
drop view if exists public.worker_unified_v cascade;  -- cascade 連帶清依賴 function（順序修正 2026-05-29）· 下方重建
create view public.worker_unified_v as
select
  id,
  email,
  display_name,
  ai_proof,
  unified_card,
  status,
  verticals,
  case_count,
  tier_suggestion,
  country,
  created_at,
  updated_at
from public.worker_applications
where status in ('approved', 'tier_b', 'tier_b_plus')
  and unified_card is not null;

comment on view public.worker_unified_v is
  'Public-safe worker pool · approved + has unified_card · 2026-05-28 added country (Y1 match should filter TW only)';

-- ============================================================
-- 3. Helper: bp_workers_by_vertical re-create (view changed)
-- ============================================================
-- Function signature 不變 · 內部 select 走新 view · 自動帶 country
drop function if exists public.bp_workers_by_vertical(text);
create or replace function public.bp_workers_by_vertical(vertical_id text)
returns setof public.worker_unified_v
language sql
stable
security invoker
as $$
  select * from public.worker_unified_v
  where verticals @> array[vertical_id]
  order by created_at desc
  limit 20;
$$;

comment on function public.bp_workers_by_vertical is
  'Returns approved workers matching given vertical · max 20 · 2026-05-28 includes country column';

-- ============================================================
-- 4. Optional: TW-only helper for Y1 matching (calcifer/sophie 後續用)
-- ============================================================
create or replace function public.bp_workers_by_vertical_tw_only(vertical_id text)
returns setof public.worker_unified_v
language sql
stable
security invoker
as $$
  select * from public.worker_unified_v
  where verticals @> array[vertical_id]
    and (country = 'TW' or country is null)  -- legacy null rows assumed TW
  order by created_at desc
  limit 20;
$$;

comment on function public.bp_workers_by_vertical_tw_only is
  'Y1 TW-only worker pool · for production matching · international workers excluded · 2026-05-28';


-- ====== 20260528_contracts.sql ======

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


-- ====== 20260528_contracts_signatures.sql ======

-- BeyondPath POC . contracts table . Phase 2 signatures (C-1 Phase 2 . 2026-05-28 calcifer)
-- Spec: Edward 拍板「接續開發」. Phase 2 加雙方簽署照片 + SHA-256 hash + 14d JWT tokens
--
-- Phase 2 adds:
--   . client_sign_token / worker_sign_token (14d JWT, signed with JWT_SECRET, payload {contract_id, role, exp})
--   . signature_hash (final hash after both signed: SHA-256 of pdf_hash + client_sig_hash + worker_sig_hash + timestamps)
--   . final_certificate_url (Phase 2 sends a cert PDF + both signature photos via email when complete)
--
-- Note: client_signature_url / worker_signature_url / client_signed_at / worker_signed_at columns
-- were created in 20260528_contracts.sql Phase 1 already. We only add the 3 new cols + RLS for anon-with-token.

alter table public.contracts
  add column if not exists client_sign_token text,
  add column if not exists worker_sign_token text,
  add column if not exists signature_hash text,
  add column if not exists final_certificate_url text,
  add column if not exists client_signature_uploaded_ip text,
  add column if not exists worker_signature_uploaded_ip text;

comment on column public.contracts.client_sign_token is
  '14d JWT signed with JWT_SECRET . payload {contract_id, role:client, kind:contract_sign, exp} . used by contract.html';
comment on column public.contracts.worker_sign_token is
  '14d JWT signed with JWT_SECRET . payload {contract_id, role:worker, kind:contract_sign, exp} . used by contract.html';
comment on column public.contracts.signature_hash is
  'SHA-256(pdf_hash + client_sig_hash + worker_sig_hash + client_signed_at + worker_signed_at) . computed on complete';
comment on column public.contracts.final_certificate_url is
  'Phase 2 . signed URL (30d) to final certificate PDF containing both signatures + timestamps + hash';
comment on column public.contracts.client_signature_uploaded_ip is
  'IP of client signature upload . audit trail (sulima H+ approved sparse logging)';
comment on column public.contracts.worker_signature_uploaded_ip is
  'IP of worker signature upload . audit trail (sulima H+ approved sparse logging)';

-- ============================================================
-- IP rate limit table for submit-signature (sulima 5/28 14:45 must-have)
-- Same IP fail 5 times / 15 min . block
-- ============================================================
create table if not exists public.signature_attempts (
  id bigserial primary key,
  ip text not null,
  contract_id uuid,
  ok boolean not null default false,
  fail_reason text,
  ua text,
  created_at timestamptz not null default now()
);

create index if not exists signature_attempts_ip_time_idx on public.signature_attempts(ip, created_at desc);
create index if not exists signature_attempts_contract_idx on public.signature_attempts(contract_id);

comment on table public.signature_attempts is
  'IP rate limit audit . submit-signature 5/15min cap (sulima 5/28 14:45 H+)';

alter table public.signature_attempts enable row level security;

drop policy if exists "signature_attempts: admin sees all" on public.signature_attempts;
create policy "signature_attempts: admin sees all" on public.signature_attempts
  for select
  using (auth.jwt() ->> 'email' = 'edwardt0303@gmail.com');

-- service_role bypass RLS . no anon select

-- ============================================================
-- contracts RLS . anon SELECT via valid contract token (contract.html)
-- ============================================================
-- Note: actual JWT verification happens in submit-signature Edge Function (service_role).
-- contract.html uses anon key + Edge Function for read+write, NOT direct PostgREST.
-- So we keep RLS strict here (admin-only) . the Edge Function handles token verify.

-- ============================================================
-- contract-verify public read . metadata only (NOT pdf_url, NOT emails)
-- Done via a SECURITY DEFINER function that returns sanitized rows.
-- ============================================================
create or replace function public.contract_verify_lookup(p_contract_id uuid)
returns table (
  id uuid,
  status text,
  pdf_hash text,
  signature_hash text,
  client_handle text,
  worker_handle text,
  client_signed_at timestamptz,
  worker_signed_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    c.id,
    c.status,
    c.pdf_hash,
    c.signature_hash,
    -- Anonymize: only first 2 chars + *** (no full names, no emails)
    case
      when c.contract_snapshot ->> 'client_name' is not null
        then substring(c.contract_snapshot ->> 'client_name' from 1 for 2) || '***'
      else null
    end as client_handle,
    case
      when c.contract_snapshot ->> 'worker_name' is not null
        then substring(c.contract_snapshot ->> 'worker_name' from 1 for 2) || '***'
      else null
    end as worker_handle,
    c.client_signed_at,
    c.worker_signed_at,
    c.created_at
  from public.contracts c
  where c.id = p_contract_id;
end;
$$;

comment on function public.contract_verify_lookup(uuid) is
  'Public contract verify . returns sanitized metadata only . no PDF URL, no emails, anonymized handles';

-- anon can call this function
grant execute on function public.contract_verify_lookup(uuid) to anon, authenticated;


-- ====== 20260528_contract_milestones.sql ======

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


-- ====== 20260528_nps.sql ======

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


-- ====== 20260528_milestone_deliverables.sql ======

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


-- ====== 20260528_milestone_attempts.sql ======

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


-- ====== 20260528_arbitration_cases.sql ======

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


-- ====== 20260528_contracts_commission.sql ======

-- BeyondPath POC . contracts 加抽佣欄位 (C-1 商業閉環 . 2026-05-28 calcifer)
-- Spec: Edward 5/28 22:02 拍板「補商業閉環抽佣 + 金流對帳機制」
--
-- 抽佣費率規則:
--   one_off:  B 20% / B+ 19% / A 18% / A+ 17% / S 17%
--   retainer: 各 Tier +3%
--
-- 此 migration:
--   . contracts 加 commission_rate / commission_amount_ntd / worker_net_amount_ntd
--   . contracts 加 client_paid_total_ntd / commission_collected_total_ntd (累計欄)
--   . contracts 加 project_budget_ntd / contract_type (從 snapshot 解出來 + admin 改起來方便)
--
-- 既有 row: 預設 NULL . admin Contracts 頁籤會顯示 "—" . 不破壞既有 contract

alter table public.contracts
  add column if not exists project_budget_ntd int,           -- 客戶總付 NT$ (= commission_amount + worker_net)
  add column if not exists contract_type text check (contract_type in ('one_off', 'retainer')) default 'one_off',
  add column if not exists commission_rate numeric(5,2),     -- 0-100 (e.g. 18.00 for 18%)
  add column if not exists commission_amount_ntd int,        -- 抽佣 NT$ (= budget * rate / 100)
  add column if not exists worker_net_amount_ntd int,        -- 接案者實收 NT$ (= budget - commission)
  add column if not exists client_paid_total_ntd int default 0,         -- 客戶已付累計 NT$
  add column if not exists commission_collected_total_ntd int default 0; -- 平台已收抽佣累計 NT$

comment on column public.contracts.project_budget_ntd is
  '客戶付總額 NT$ . admin 可在建合約時填 . 之後 commission 自動算';
comment on column public.contracts.contract_type is
  'one_off (一次性專案) / retainer (月聘) . retainer 抽佣 +3%';
comment on column public.contracts.commission_rate is
  '抽佣費率 (%) . 0-100 . by Tier x contract_type . 合約建立時 commission-calc.ts 自動算';
comment on column public.contracts.commission_amount_ntd is
  '抽佣金額 NT$ . = project_budget_ntd * commission_rate / 100 . 整數四捨五入';
comment on column public.contracts.worker_net_amount_ntd is
  '接案者實收 NT$ . = project_budget_ntd - commission_amount_ntd';
comment on column public.contracts.client_paid_total_ntd is
  '客戶已付累計 NT$ . admin 標記每次入款後累積 . 滿 project_budget_ntd 即客戶結清';
comment on column public.contracts.commission_collected_total_ntd is
  '平台已收抽佣累計 NT$ . admin 標記接案者每次匯回抽佣後累積 . 滿 commission_amount_ntd 即抽佣結清';

create index if not exists contracts_commission_rate_idx on public.contracts(commission_rate);
create index if not exists contracts_contract_type_idx on public.contracts(contract_type);


-- ====== 20260528_commission_records.sql ======

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


-- ====== 20260528_payment_intents.sql ======

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

