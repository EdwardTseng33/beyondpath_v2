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
