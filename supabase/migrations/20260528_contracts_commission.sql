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
