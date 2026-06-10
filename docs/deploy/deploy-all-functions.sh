#!/bin/bash
# BeyondPath 2026-05-28 批次部署所有雲端函式（21 個）
# Edward 在 prototype-v0.2 目錄跑：bash docs/deploy/deploy-all-functions.sh
# 蘇菲整合 5/28 marathon 所有 Edge Function

set -e
cd "$(dirname "$0")/../.."

echo "==== [1/2] Deploy 18 個一般雲端函式 ===="
npx -y supabase functions deploy \
  generate-contract-pdf \
  resend-contract-certificate \
  update-milestone-status \
  submit-nps \
  recalc-worker-tier \
  upload-deliverable \
  download-deliverable \
  add-external-link \
  get-milestone-detail \
  client-acceptance \
  trigger-arbitration \
  submit-arbitration-position \
  decide-arbitration \
  get-arbitration-detail \
  mark-commission-event \
  send-commission-invoice \
  create-ecpay-payment \
  get-payment-status \
  notify-lead-slack \
  daily-ops-digest \
  send-decision-email

echo ""
echo "==== [2/2] Deploy 3 個公開雲端函式（--no-verify-jwt 給 webhook + 中介頁用）===="
npx -y supabase functions deploy submit-signature --no-verify-jwt
npx -y supabase functions deploy ecpay-redirect --no-verify-jwt
npx -y supabase functions deploy ecpay-webhook --no-verify-jwt

echo ""
echo "==== ✓ 21 個雲端函式全部部署完成 ===="
echo ""
echo "下一步："
echo "  1. 綠界後台設 ReturnURL = https://iacwmkcloxjffghrweie.supabase.co/functions/v1/ecpay-webhook"
echo "  2. git push 觸發 Vercel 上線"
echo "  3. 用 test card 4311-9522-2222-2222 跑 sandbox 一輪"
