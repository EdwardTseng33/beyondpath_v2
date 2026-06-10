-- BeyondPath . commission_records 擴充 refund_issued event (沙利曼 doc 32 §4 退費機制 . 2026-05-29 calcifer)
-- Spec: Edward 5/29 拍板正式收費 B 代收代付 . 退費 5 情境現行生效
--   . event_type check 加 'refund_issued' (退已收服務費)
--   . payment_method check 加 'ecpay_refund' (綠界退刷)
-- 配合: mark-commission-event VALID_EVENTS / VALID_METHODS 已擴充
--
-- 可逆: 此 migration 只放寬 check constraint . 不改既有 row . drop-and-recreate constraint 安全

-- 1. event_type check: 4 -> 5 種
alter table public.commission_records
  drop constraint if exists commission_records_event_type_check;

alter table public.commission_records
  add constraint commission_records_event_type_check
  check (event_type in (
    'client_paid',           -- 客戶刷卡 / ATM 已入平台代收戶 (含階段釋款)
    'worker_paid_out',       -- 平台已從代收戶轉淨額給 worker
    'commission_collected',  -- (代收代付下通常自動 . 保留向後相容)
    'invoice_issued',        -- 平台寄抽佣 invoice 給 worker
    'refund_issued'          -- 退費: 退已收服務費 (沙利曼 doc 32 §4 退費 5 情境)
  ));

-- 2. payment_method check: 加 ecpay_refund
alter table public.commission_records
  drop constraint if exists commission_records_payment_method_check;

alter table public.commission_records
  add constraint commission_records_payment_method_check
  check (payment_method in (
    'ecpay_credit',      -- 綠界刷卡
    'atm_transfer',      -- ATM 銀行轉帳
    'manual',            -- 手動 (現金 / 其他)
    'ecpay_refund'       -- 綠界退刷 (退費用)
  ));

comment on constraint commission_records_event_type_check on public.commission_records is
  '5 種 event_type . 含 refund_issued (退費) . 2026-05-29 擴充 . 沙利曼 doc 32 §4';
