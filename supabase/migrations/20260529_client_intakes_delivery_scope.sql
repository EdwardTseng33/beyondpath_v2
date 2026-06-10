-- BeyondPath POC · client_intakes 交付邊界欄位 (2026-05-29 calcifer)
-- Spec: Edward 5/29 17:07 拍板「B」· 軟體開發類交付邊界先支援 A/B 兩種讓客戶選
--   A = 交付成果（檔案/程式，客戶自己後續處理）
--   B = 交付 + 協助上線（確認能用）
--   C（保固維運）/ D（全託管）暫不做 (PMF 後再評估)
-- 配合 doc 29 霍爾交付物設計 + doc 30 蕪菁頭交付邊界調研
--
-- 改動:
--   . 加 delivery_scope text · 預設 'A' · check 限 'A'/'B' (PMF 只開這兩種)
--   . intake_data JSONB 內也含 expect.deliveryScope (前端 source) · 此欄是 flatten 出來方便查詢
--
-- Backward compatible:
--   . 新欄 default 'A' + nullable · 既有 row 自動填 'A' · 不破壞
--   . check constraint 只認 A/B · 未來開 C/D 時 alter check
--
-- Manual deploy: Edward / 蘇菲 在 Supabase Studio SQL Editor 跑

alter table public.client_intakes
  add column if not exists delivery_scope text default 'A';

-- 限定目前 PMF 開放的兩種 (A/B) · 未來開 C/D 改這個 check
do $$
begin
  if not exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'client_intakes' and constraint_name = 'client_intakes_delivery_scope_check'
  ) then
    alter table public.client_intakes
      add constraint client_intakes_delivery_scope_check
      check (delivery_scope is null or delivery_scope in ('A', 'B'));
  end if;
end;
$$;

comment on column public.client_intakes.delivery_scope is
  '交付邊界 · A=交付成果 / B=交付+協助上線 · Edward 5/29 拍板 · PMF 只開 A/B · 來源 intake_data.expect.deliveryScope';

-- Verify:
--   select column_name, data_type, column_default, is_nullable
--     from information_schema.columns
--     where table_name = 'client_intakes' and column_name = 'delivery_scope';
