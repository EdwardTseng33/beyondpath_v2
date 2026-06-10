-- profiles 完整資料欄位擴充 (PMF 帳號系統 · doc 28 Part A · 沙利曼 spec · 卡西法 ship 2026-05-29)
-- 全部 nullable + 向後相容、既有 row 自動 NULL、不破壞。
-- 前端 bpProfile.get() 讀 profile_complete 判斷是否放行發案/接案。

alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists identity_type text
    check (identity_type in ('individual', 'company'));

-- Tier 0.5 預留欄位 (手機 OTP 排下一階 · 先建欄位 · 暫不啟用)
alter table public.profiles
  add column if not exists phone_verified_at timestamptz;

-- profile_complete: generated column · 姓名 + 電話 + 身分類型 三項齊才 true
-- 前端 gate 讀這欄、DB 端也擋 (雙保險)
alter table public.profiles
  add column if not exists profile_complete boolean
    generated always as (
      full_name is not null and full_name <> ''
      and phone is not null and phone <> ''
      and identity_type is not null
    ) stored;

comment on column public.profiles.phone is
  'PMF 必填 · Edward 覆核時人工確認 · 第一版不自動驗 · Tier 0.5 接 OTP';
comment on column public.profiles.identity_type is
  'individual / company · 發案/接案前必填';
comment on column public.profiles.phone_verified_at is
  'Tier 0.5 預留 · 手機 OTP 通過時間 · 第一版恆 NULL';

-- RLS 不用改: 既有 profiles own-row select/update + admin sees all 已涵蓋新欄位。
