// BeyondPath . Edge Function . create-ecpay-payment
// 2026-05-28 . calcifer . 綠界 AIO V5 自動付款
//
// admin 在 admin Contracts > 金流 > 「+ 產綠界付款連結」按鈕觸發
// Body: { contract_id, milestone_id?, amount_ntd, payment_type?, customer_email }
// Return: { ok, payment_intent_id, payment_url, expires_at, merchant_trade_no }
//
// auth: admin only (edwardt0303@gmail.com via JWT)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  calcEcpayCheckMacValue,
  generateMerchantTradeNo,
  ecpayDateString,
  mapPaymentType,
} from "../_shared/ecpay-helpers.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";

const ECPAY_MERCHANT_ID = Deno.env.get("ECPAY_MERCHANT_ID") ?? "";
const ECPAY_HASH_KEY = Deno.env.get("ECPAY_HASH_KEY") ?? "";
const ECPAY_HASH_IV = Deno.env.get("ECPAY_HASH_IV") ?? "";
const ECPAY_ENV = Deno.env.get("ECPAY_ENV") ?? "production";

const ECPAY_AIO_URL =
  ECPAY_ENV === "sandbox"
    ? "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"
    : "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function authHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

function J(b: unknown, s = 200): Response {
  return new Response(JSON.stringify(b), {
    status: s,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

const VALID_PAYMENT_TYPES = ["credit_card", "atm", "cvs", "all"];

interface ReqBody {
  contract_id: string;
  milestone_id?: string;
  amount_ntd: number;
  payment_type?: string;
  customer_email: string;
}

async function sendCustomerPaymentEmail(
  customerEmail: string,
  paymentUrl: string,
  amountNtd: number,
  contractSummary: string,
  expiredAt: string,
  merchantTradeNo: string
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing, skip customer email");
    return false;
  }
  const subj =
    "BeyondPath 付款連結 . NT$ " +
    amountNtd.toLocaleString() +
    " . " +
    merchantTradeNo;
  const txt = [
    "您好,",
    "",
    "BeyondPath 案件 " + contractSummary + " 的付款連結已開立。",
    "",
    "金額: NT$ " + amountNtd.toLocaleString(),
    "訂單號: " + merchantTradeNo,
    "有效期: " + expiredAt + " 前",
    "",
    "請點以下連結進入綠界安全付款頁:",
    paymentUrl,
    "",
    "支援信用卡 / ATM / 超商代碼 / Apple Pay 等。",
    "付款完成後您將收到收據 email、接案者也會收到開工通知。",
    "",
    "BeyondPath",
  ].join("\n");

  const styleBox = "background:#fff;border-left:3px solid #c7e84a;padding:16px;margin:16px 0";
  const styleBtn = "display:inline-block;background:#c7e84a;color:#0a0a0b;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600";
  const styleWrap = "font-family:system-ui,sans-serif;font-size:14px;line-height:1.7;max-width:560px;margin:0 auto;padding:24px;background:#fafafa";

  const html =
    "<div style=\"" + styleWrap + "\">" +
    "<h2 style=\"margin:0 0 16px;color:#0a0a0b\">BeyondPath 付款連結</h2>" +
    "<p>BeyondPath 案件 <strong>" + contractSummary + "</strong> 的付款連結已開立。</p>" +
    "<div style=\"" + styleBox + "\">" +
    "<div>金額: <strong>NT$ " + amountNtd.toLocaleString() + "</strong></div>" +
    "<div>訂單號: <code style=\"font-family:monospace\">" + merchantTradeNo + "</code></div>" +
    "<div>有效期: " + expiredAt + " 前</div>" +
    "</div>" +
    "<p style=\"text-align:center;margin:24px 0\">" +
    "<a href=\"" + paymentUrl + "\" style=\"" + styleBtn + "\">進入綠界付款</a>" +
    "</p>" +
    "<p style=\"font-size:12px;color:#777\">支援信用卡 / ATM / 超商代碼 / Apple Pay 等。付款完成後您將收到收據 email、接案者也會收到開工通知。</p>" +
    "<p style=\"font-size:11px;color:#999;margin-top:24px;border-top:1px solid #eee;padding-top:12px\">BeyondPath . 此 email 由系統自動寄出</p>" +
    "</div>";

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + RESEND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [customerEmail],
      subject: subj,
      text: txt,
      html,
    }),
  });
  if (!r.ok) {
    console.error("customer payment email fail", r.status, await r.text());
    return false;
  }
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return J({ ok: false, error: "method not allowed" }, 405);

  if (!ECPAY_MERCHANT_ID || !ECPAY_HASH_KEY || !ECPAY_HASH_IV) {
    return J(
      {
        ok: false,
        error: "ECPay secrets missing (set ECPAY_MERCHANT_ID / ECPAY_HASH_KEY / ECPAY_HASH_IV in Supabase secrets)",
      },
      500
    );
  }

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return J({ ok: false, error: "missing auth" }, 401);
  const userJwt = auth.slice(7);
  const userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: "Bearer " + userJwt,
    },
  });
  if (!userRes.ok) return J({ ok: false, error: "invalid auth" }, 401);
  const user = await userRes.json();
  if (user.email !== "edwardt0303@gmail.com") return J({ ok: false, error: "admin only" }, 403);

  let body: ReqBody;
  try {
    body = await req.json();
  } catch {
    return J({ ok: false, error: "bad body" }, 400);
  }
  if (!body.contract_id || typeof body.contract_id !== "string") {
    return J({ ok: false, error: "contract_id required" }, 400);
  }
  if (typeof body.amount_ntd !== "number" || body.amount_ntd <= 0 || body.amount_ntd > 200000) {
    return J(
      {
        ok: false,
        error: "amount_ntd must be positive integer (<= 200000 個人戶月上限提示 . 累積限額由綠界端把關)",
      },
      400
    );
  }
  if (!body.customer_email || typeof body.customer_email !== "string") {
    return J({ ok: false, error: "customer_email required" }, 400);
  }
  const paymentType = body.payment_type || "all";
  if (VALID_PAYMENT_TYPES.indexOf(paymentType) < 0) {
    return J({ ok: false, error: "payment_type invalid" }, 400);
  }

  const cR = await fetch(
    SUPABASE_URL +
      "/rest/v1/contracts?id=eq." +
      body.contract_id +
      "&select=id,contract_snapshot,project_budget_ntd",
    { headers: authHeaders() }
  );
  const contracts = await cR.json();
  if (!Array.isArray(contracts) || contracts.length === 0) {
    return J({ ok: false, error: "contract not found" }, 404);
  }
  const contract = contracts[0];
  const snap = contract.contract_snapshot || {};

  let merchantTradeNo = generateMerchantTradeNo();
  for (let attempt = 0; attempt < 3; attempt++) {
    const dupR = await fetch(
      SUPABASE_URL +
        "/rest/v1/payment_intents?ecpay_merchant_trade_no=eq." +
        merchantTradeNo +
        "&select=id",
      { headers: authHeaders() }
    );
    const dup = await dupR.json();
    if (!Array.isArray(dup) || dup.length === 0) break;
    merchantTradeNo = generateMerchantTradeNo();
  }

  const amount = Math.floor(body.amount_ntd);
  const now = new Date();
  const itemName =
    "BeyondPath . " +
    (snap.vertical || "案件") +
    " . " +
    (snap.client_name || "client") +
    " >< " +
    (snap.worker_name || "worker");
  const tradeDesc = "BeyondPath POC 付款 " + merchantTradeNo;
  const returnUrl = SUPABASE_URL + "/functions/v1/ecpay-webhook";
  const clientBackUrl = PUBLIC_SITE_BASE + "/payment-thanks.html?o=" + merchantTradeNo;

  const ecpayParams: Record<string, string> = {
    MerchantID: ECPAY_MERCHANT_ID,
    MerchantTradeNo: merchantTradeNo,
    MerchantTradeDate: ecpayDateString(now),
    PaymentType: "aio",
    TotalAmount: String(amount),
    TradeDesc: tradeDesc.slice(0, 200),
    ItemName: itemName.slice(0, 200),
    ReturnURL: returnUrl,
    ClientBackURL: clientBackUrl,
    ChoosePayment: mapPaymentType(paymentType),
    EncryptType: "1",
  };

  const cmv = await calcEcpayCheckMacValue(
    ecpayParams,
    ECPAY_HASH_KEY,
    ECPAY_HASH_IV
  );
  ecpayParams.CheckMacValue = cmv;

  const paymentUrl =
    SUPABASE_URL + "/functions/v1/ecpay-redirect?trade_no=" + merchantTradeNo;
  const expiredAtIso = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();

  const insertRow: Record<string, unknown> = {
    contract_id: body.contract_id,
    ecpay_merchant_trade_no: merchantTradeNo,
    amount_ntd: amount,
    payment_type: paymentType,
    payment_url: paymentUrl,
    status: "pending",
    customer_email: body.customer_email,
    expired_at: expiredAtIso,
    webhook_payload: { preflight: ecpayParams, aio_url: ECPAY_AIO_URL },
  };
  if (body.milestone_id) insertRow.milestone_id = body.milestone_id;

  const insertRes = await fetch(SUPABASE_URL + "/rest/v1/payment_intents", {
    method: "POST",
    headers: Object.assign({}, authHeaders(), {
      Prefer: "return=representation",
    }),
    body: JSON.stringify(insertRow),
  });
  if (!insertRes.ok) {
    const err = await insertRes.text();
    return J({ ok: false, error: "insert failed", detail: err }, 500);
  }
  const inserted = await insertRes.json();
  const row = Array.isArray(inserted) ? inserted[0] : inserted;

  const contractSummary =
    (snap.vertical || "案件") +
    " . " +
    (snap.client_name || "(client)") +
    " >< " +
    (snap.worker_name || "(worker)");
  const expiredDisplay = new Date(expiredAtIso).toLocaleDateString("zh-TW");
  const emailSent = await sendCustomerPaymentEmail(
    body.customer_email,
    paymentUrl,
    amount,
    contractSummary,
    expiredDisplay,
    merchantTradeNo
  );

  return J({
    ok: true,
    payment_intent_id: row.id,
    payment_url: paymentUrl,
    merchant_trade_no: merchantTradeNo,
    amount_ntd: amount,
    expires_at: expiredAtIso,
    email_sent: emailSent,
    ecpay_env: ECPAY_ENV,
  });
});
