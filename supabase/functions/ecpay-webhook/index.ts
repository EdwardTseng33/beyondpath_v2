// BeyondPath . Edge Function . ecpay-webhook
// 2026-05-28 . calcifer . 綠界 ReturnURL callback (server-to-server)
//
// 公開 POST endpoint . 綠界 server-side callback 時呼叫
// Content-Type: application/x-www-form-urlencoded
// 必須回覆字串 "1|OK" (純文字 . 綠界規範)
//
// Verify:
//   1. parse form-urlencoded body
//   2. 抽 CheckMacValue . 餘下參數重新算 CMV . 比對
//   3. 找 payment_intents row by MerchantTradeNo
//   4. update status + paid_at + webhook_payload
//   5. RtnCode == 1 -> status="paid" . 寄 email 給雙方
//   6. RtnCode != 1 -> status="failed" . log 不寄信
//
// 綠界 ReturnURL 設定: https://<project>.supabase.co/functions/v1/ecpay-webhook

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyEcpayCheckMacValue, parseFormUrlencoded } from "../_shared/ecpay-helpers.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";

const ECPAY_HASH_KEY = Deno.env.get("ECPAY_HASH_KEY") ?? "";
const ECPAY_HASH_IV = Deno.env.get("ECPAY_HASH_IV") ?? "";

function authHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

// 綠界規範 . 收到 callback 必回 "1|OK" (文字 . 非 JSON)
function ecpayOk(): Response {
  return new Response("1|OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// 失敗也回 "0|<reason>" 讓綠界知道我們處理失敗 . 綠界會 retry 最多 5 次
function ecpayFail(reason: string): Response {
  return new Response("0|" + reason, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

// 解析綠界 PaymentDate "YYYY/MM/DD HH:mm:ss" -> ISO
function parseEcpayDate(s: string): string | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (!m) return null;
  return m[1] + "-" + m[2] + "-" + m[3] + "T" + m[4] + ":" + m[5] + ":" + m[6] + "+08:00";
}

// =============================================================
// 金流閉環 (馬魯克 doc 33 P0 #1) . payment_intents paid -> 自動寫 commission_records
// Edward 5/29 拍板 B 代收代付: 客戶刷卡 -> 平台收全額 (client_paid) -> 抽佣後分接案者
// 冪等保護: 查同 contract + reference_number 的 client_paid 是否已存在 . webhook 重送不重複記帳
// (webhook 主體已有 status==paid -> 1|OK 的 guard . 這裡是双保險)
// =============================================================
async function insertClientPaidCommission(
  contractId: string,
  amountNtd: number,
  referenceNumber: string,
  paidAtIso: string | null
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  // 1. 冪等檢查: 同 contract + reference_number (經界 MerchantTradeNo) 的 client_paid 是否已寫
  try {
    const dupR = await fetch(
      SUPABASE_URL +
        "/rest/v1/commission_records?contract_id=eq." +
        contractId +
        "&event_type=eq.client_paid&reference_number=eq." +
        encodeURIComponent(referenceNumber) +
        "&select=id",
      { headers: authHeaders() }
    );
    if (dupR.ok) {
      const dupRows = await dupR.json();
      if (Array.isArray(dupRows) && dupRows.length > 0) {
        console.log("commission client_paid already exists, skip", referenceNumber);
        return { ok: true, skipped: true };
      }
    }
  } catch (e) {
    // 冪等查詢失敗不阻斷主流程 . 繼續 insert (DB 層無 unique 約束 . 極端情況可能雙寫 . admin 端可人工刪)
    console.warn("commission dup check failed, proceed insert", String(e));
  }

  // 2. INSERT commission_records (event_type='client_paid', payment_method='ecpay_credit')
  const row: Record<string, unknown> = {
    contract_id: contractId,
    event_type: "client_paid",
    amount_ntd: Math.floor(amountNtd),
    payment_method: "ecpay_credit",
    reference_number: referenceNumber,
    notes: "Auto-inserted by ecpay-webhook on RtnCode=1 (B 代收代付 . 平台代收全額)",
  };
  if (paidAtIso) row.paid_at = paidAtIso;

  const insR = await fetch(SUPABASE_URL + "/rest/v1/commission_records", {
    method: "POST",
    headers: Object.assign({}, authHeaders(), { Prefer: "return=minimal" }),
    body: JSON.stringify(row),
  });
  if (!insR.ok) {
    const errTxt = await insR.text();
    console.error("commission client_paid insert fail", insR.status, errTxt);
    return { ok: false, error: errTxt };
  }
  // recalc_contract_commission_totals trigger 會自動更新 contracts.client_paid_total_ntd
  console.log("commission client_paid inserted", contractId, amountNtd, referenceNumber);
  return { ok: true };
}

// 寄客戶收據
async function sendCustomerReceiptEmail(
  email: string,
  amountNtd: number,
  merchantTradeNo: string,
  paidAt: string,
  paymentMethodDetail: string,
  contractSummary: string
): Promise<boolean> {
  if (!RESEND_API_KEY || !email) return false;
  const subj = "BeyondPath 付款成功 . 收據 . " + merchantTradeNo;
  const txt = [
    "您好,",
    "",
    "BeyondPath 案件 " + contractSummary + " 已成功付款。",
    "",
    "金額: NT$ " + amountNtd.toLocaleString(),
    "訂單號: " + merchantTradeNo,
    "付款方式: " + paymentMethodDetail,
    "付款時間: " + paidAt,
    "",
    "接案者已收到開工通知 . 將依合約 milestone 推進。",
    "",
    "案款由 BeyondPath 透過綠界第三方支付代收、扣抵服務費後撥付接案者（代收代付、非 escrow . 見條款 §3.4）。",
    "平台統編資訊將於正式發票寄出時補上。",
    "",
    "BeyondPath",
  ].join("\n");
  const styleBox = "background:#fff;border-left:3px solid #16a34a;padding:16px;margin:16px 0";
  const html =
    "<div style=\"font-family:system-ui,sans-serif;font-size:14px;line-height:1.7;max-width:560px;margin:0 auto;padding:24px;background:#fafafa\">" +
    "<h2 style=\"margin:0 0 16px;color:#16a34a\">✓ 付款成功 . 收據</h2>" +
    "<p>BeyondPath 案件 <strong>" + contractSummary + "</strong> 已成功付款、感謝您。</p>" +
    "<div style=\"" + styleBox + "\">" +
    "<div>金額: <strong>NT$ " + amountNtd.toLocaleString() + "</strong></div>" +
    "<div>訂單號: <code style=\"font-family:monospace\">" + merchantTradeNo + "</code></div>" +
    "<div>付款方式: " + paymentMethodDetail + "</div>" +
    "<div>付款時間: " + paidAt + "</div>" +
    "</div>" +
    "<p style=\"font-size:13px\">接案者已收到開工通知、將依合約 milestone 推進、可在 BeyondPath 後台查詢進度。</p>" +
    "<p style=\"font-size:11px;color:#999;margin-top:24px;border-top:1px solid #eee;padding-top:12px\">案款由 BeyondPath 透過綠界第三方支付代收代付（非 escrow . 見條款 §3.4）. 平台統編資訊將於正式發票寄出時補上 . BeyondPath v1.0</p>" +
    "</div>";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: [email], subject: subj, text: txt, html }),
  });
  if (!r.ok) {
    console.error("customer receipt email fail", r.status, await r.text());
    return false;
  }
  return true;
}

// 寄接案者開工通知
async function sendWorkerStartNoticeEmail(
  workerEmail: string,
  workerName: string,
  amountNtd: number,
  contractId: string,
  contractSummary: string,
  paidAt: string
): Promise<boolean> {
  if (!RESEND_API_KEY || !workerEmail) return false;
  const subj = "BeyondPath 客戶已付款 . 可開工 . " + contractSummary.slice(0, 30);
  const txt = [
    "Hi " + workerName + ",",
    "",
    "BeyondPath 案件 " + contractSummary + " 的客戶已成功付款。",
    "",
    "金額: NT$ " + amountNtd.toLocaleString() + " (含您的服務費 . 平台扣抽佣後淨額將另行通知)",
    "付款時間: " + paidAt,
    "",
    "您可以開始進行 milestone 1 的工作。",
    "milestone 看板: " + PUBLIC_SITE_BASE + "/worker-payout.html?contract_id=" + contractId,
    "",
    "BeyondPath",
  ].join("\n");
  const styleBox = "background:#fff;border-left:3px solid #c7e84a;padding:16px;margin:16px 0";
  const html =
    "<div style=\"font-family:system-ui,sans-serif;font-size:14px;line-height:1.7;max-width:560px;margin:0 auto;padding:24px;background:#fafafa\">" +
    "<h2 style=\"margin:0 0 16px;color:#0a0a0b\">客戶已付款 . 可開工</h2>" +
    "<p>Hi " + workerName + ", BeyondPath 案件 <strong>" + contractSummary + "</strong> 的客戶已成功付款。</p>" +
    "<div style=\"" + styleBox + "\">" +
    "<div>客戶付款金額: <strong>NT$ " + amountNtd.toLocaleString() + "</strong></div>" +
    "<div style=\"font-size:12px;color:#666;margin-top:4px\">(含您的服務費 . 平台扣抽佣後淨額將另行通知)</div>" +
    "<div style=\"margin-top:8px\">付款時間: " + paidAt + "</div>" +
    "</div>" +
    "<p style=\"text-align:center;margin:24px 0\">" +
    "<a href=\"" + PUBLIC_SITE_BASE + "/worker-payout.html?contract_id=" + contractId + "\" style=\"display:inline-block;background:#c7e84a;color:#0a0a0b;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600\">查看 milestone 看板</a>" +
    "</p>" +
    "<p style=\"font-size:11px;color:#999;margin-top:24px;border-top:1px solid #eee;padding-top:12px\">BeyondPath v1.0</p>" +
    "</div>";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: RESEND_FROM, to: [workerEmail], subject: subj, text: txt, html }),
  });
  if (!r.ok) {
    console.error("worker start notice email fail", r.status, await r.text());
    return false;
  }
  return true;
}

serve(async (req) => {
  if (req.method !== "POST") return ecpayFail("method not allowed");

  if (!ECPAY_HASH_KEY || !ECPAY_HASH_IV) {
    console.error("ECPay secrets missing");
    return ecpayFail("secrets_missing");
  }

  // 1. 讀 form-urlencoded body
  let bodyText = "";
  try {
    bodyText = await req.text();
  } catch {
    return ecpayFail("read_body_failed");
  }
  const payload = parseFormUrlencoded(bodyText);

  const tradeNo = payload.MerchantTradeNo;
  const rtnCode = payload.RtnCode;
  const cmv = payload.CheckMacValue || "";
  if (!tradeNo) return ecpayFail("missing_trade_no");
  if (!cmv) return ecpayFail("missing_cmv");

  // 2. verify CheckMacValue (除 CheckMacValue 外其他欄位重算)
  const paramsForCmv: Record<string, string> = {};
  for (const k of Object.keys(payload)) {
    if (k !== "CheckMacValue") paramsForCmv[k] = payload[k];
  }
  const cmvOk = await verifyEcpayCheckMacValue(
    paramsForCmv,
    cmv,
    ECPAY_HASH_KEY,
    ECPAY_HASH_IV
  );
  if (!cmvOk) {
    console.error("CMV verify failed", { tradeNo, payloadKeys: Object.keys(payload) });
    return ecpayFail("cmv_invalid");
  }

  // 3. 找 payment_intents row
  const lookupR = await fetch(
    SUPABASE_URL +
      "/rest/v1/payment_intents?ecpay_merchant_trade_no=eq." +
      tradeNo +
      "&select=id,contract_id,status,amount_ntd,customer_email,webhook_payload",
    { headers: authHeaders() }
  );
  const rows = await lookupR.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    console.error("payment_intent not found", tradeNo);
    return ecpayFail("intent_not_found");
  }
  const row = rows[0];

  // 4. 已 paid 情況 (重複 callback) -> 回 1|OK 但不重複處理
  if (row.status === "paid") {
    console.log("duplicate callback, already paid", tradeNo);
    return ecpayOk();
  }

  // 5. 判斷成功 / 失敗
  const success = rtnCode === "1";
  const paidAtIso = success
    ? parseEcpayDate(payload.PaymentDate || "") || new Date().toISOString()
    : null;
  const paymentMethodDetail = payload.PaymentType || ""; // e.g. Credit_CreditCard / ATM_TAISHIN

  // 把 webhook payload merge 進現有 webhook_payload (保留 preflight)
  const mergedPayload: Record<string, unknown> = Object.assign(
    {},
    row.webhook_payload || {},
    { callback: payload, callback_at: new Date().toISOString() }
  );

  const newStatus = success ? "paid" : "failed";

  const updateBody: Record<string, unknown> = {
    status: newStatus,
    webhook_payload: mergedPayload,
    payment_method_detail: paymentMethodDetail,
  };
  if (paidAtIso) updateBody.paid_at = paidAtIso;

  const upR = await fetch(SUPABASE_URL + "/rest/v1/payment_intents?id=eq." + row.id, {
    method: "PATCH",
    headers: Object.assign({}, authHeaders(), { Prefer: "return=minimal" }),
    body: JSON.stringify(updateBody),
  });
  if (!upR.ok) {
    console.error("update payment_intent fail", upR.status, await upR.text());
    return ecpayFail("update_failed");
  }

  // 6. 失敗 -> log + return ok (不寄信)
  if (!success) {
    console.warn("payment failed", { tradeNo, rtnCode, rtnMsg: payload.RtnMsg });
    return ecpayOk();
  }

  // 6.5 金流閉環 (馬魯克 doc 33 P0 #1) . 成功付款 -> 自動寫 commission_records client_paid
  //     B 代收代付: 平台代收客戶全額 (amount_ntd) . trigger 自動更新 contracts.client_paid_total_ntd
  //     記帳優先於寄信 . 即使後續寄信失敗 . 帳已落地 (admin 看板正確)
  const commissionResult = await insertClientPaidCommission(
    row.contract_id,
    row.amount_ntd,
    tradeNo,
    paidAtIso
  );
  if (!commissionResult.ok) {
    // 記帳失敗 . log 但不回 0|fail 給綠界 (避免綠界重送造成 payment_intents 已 paid 但 webhook 5 次 retry)
    // payment_intents.status 已 paid . admin 可走 mark-commission-event 手動補登 client_paid
    console.error("CRITICAL commission client_paid insert failed", {
      tradeNo,
      contractId: row.contract_id,
      error: commissionResult.error,
    });
    // Slack 急報 admin 手動補帳
    const slackUrlErr = Deno.env.get("SLACK_WEBHOOK_URL") || "";
    if (slackUrlErr) {
      try {
        await fetch(slackUrlErr, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text:
              "🔴 金流閉環斷裂 . payment_intents 已 paid 但 commission_records 寫入失敗 . " +
              "請 admin 手動 mark-commission-event client_paid . MerchantTradeNo=" +
              tradeNo +
              " contract=" +
              row.contract_id.slice(0, 8) +
              " NT$" +
              row.amount_ntd,
          }),
        });
      } catch (_e) {
        /* ignore */
      }
    }
  }

  // 7. 成功 -> 寄雙方 email
  // 讀 contract 取 snapshot (worker email/name)
  let workerEmail = "";
  let workerName = "";
  let contractSummary = "";
  try {
    const cR = await fetch(
      SUPABASE_URL +
        "/rest/v1/contracts?id=eq." +
        row.contract_id +
        "&select=contract_snapshot",
      { headers: authHeaders() }
    );
    const cRows = await cR.json();
    if (Array.isArray(cRows) && cRows.length > 0) {
      const snap = cRows[0].contract_snapshot || {};
      workerEmail = snap.worker_email || "";
      workerName = snap.worker_name || "(接案者)";
      contractSummary =
        (snap.vertical || "案件") +
        " . " +
        (snap.client_name || "(client)") +
        " >< " +
        (snap.worker_name || "(worker)");
    }
  } catch (e) {
    console.error("contract snapshot lookup fail", e);
  }

  const paidAtDisplay = paidAtIso
    ? new Date(paidAtIso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
    : "(unknown)";

  // 寄客戶收據
  if (row.customer_email) {
    await sendCustomerReceiptEmail(
      row.customer_email,
      row.amount_ntd,
      tradeNo,
      paidAtDisplay,
      paymentMethodDetail,
      contractSummary
    );
  }

  // 寄接案者開工通知
  if (workerEmail) {
    await sendWorkerStartNoticeEmail(
      workerEmail,
      workerName,
      row.amount_ntd,
      row.contract_id,
      contractSummary,
      paidAtDisplay
    );
  }

  // Slack ping admin (best effort)
  const slackUrl = Deno.env.get("SLACK_WEBHOOK_URL") || "";
  if (slackUrl) {
    try {
      await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text:
            "綠界付款入帳 . " +
            tradeNo +
            " . NT$ " +
            row.amount_ntd.toLocaleString() +
            " . " +
            paymentMethodDetail +
            " . contract " +
            row.contract_id.slice(0, 8),
        }),
      });
    } catch (_e) {
      /* ignore */
    }
  }

  return ecpayOk();
});
