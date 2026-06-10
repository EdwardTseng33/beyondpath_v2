// BeyondPath . Edge Function . ecpay-redirect
// 2026-05-28 . calcifer
//
// 公開 GET endpoint . 客戶從 email 點 payment_url 來到這裡
// 我們從 DB 讀 payment_intents.webhook_payload.preflight (含 ecpay AIO params + CheckMacValue)
// 生 auto-submit HTML form POST 到綠界 hosted page
//
// URL: /functions/v1/ecpay-redirect?trade_no=BP260528...
//
// 不需 auth (公開) . trade_no 作為 lookup key . 已 unique

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ECPAY_ENV = Deno.env.get("ECPAY_ENV") ?? "production";

const ECPAY_AIO_URL =
  ECPAY_ENV === "sandbox"
    ? "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5"
    : "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5";

function htmlEscape(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function errorPage(msg: string): Response {
  const body =
    "<!DOCTYPE html><html lang=\"zh-Hant\"><head><meta charset=\"utf-8\"><title>付款連結錯誤</title>" +
    "<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:60px auto;padding:24px;background:#fafafa;line-height:1.7}" +
    "h1{color:#c53030;font-size:20px}.box{background:#fff;border-left:3px solid #c53030;padding:16px;margin:16px 0;font-size:14px;color:#666}" +
    "</style></head><body><h1>付款連結錯誤</h1><div class=\"box\">" + htmlEscape(msg) + "</div>" +
    "<p style=\"font-size:13px;color:#888\">請聯絡 BeyondPath 客服 . hello@beyondpath.tw</p></body></html>";
  return new Response(body, { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

serve(async (req) => {
  const url = new URL(req.url);
  const tradeNo = url.searchParams.get("trade_no");
  if (!tradeNo) return errorPage("缺少 trade_no 參數");

  // 從 DB 讀 payment_intent
  const r = await fetch(
    SUPABASE_URL +
      "/rest/v1/payment_intents?ecpay_merchant_trade_no=eq." +
      tradeNo +
      "&select=id,status,expired_at,webhook_payload,amount_ntd,customer_email",
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
      },
    }
  );
  if (!r.ok) return errorPage("DB lookup 失敗");
  const rows = await r.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return errorPage("找不到此付款訂單 . 訂單號可能已過期或無效");
  }
  const row = rows[0];

  // 狀態檢查
  if (row.status === "paid") {
    return new Response(
      "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>已付款</title></head>" +
        "<body style=\"font-family:system-ui;max-width:480px;margin:60px auto;padding:24px;text-align:center\">" +
        "<h1 style=\"color:#16a34a\">付款已完成</h1>" +
        "<p>此訂單已成功付款、感謝您。</p>" +
        "<p style=\"font-size:13px;color:#888\">訂單號: " + htmlEscape(tradeNo) + "</p></body></html>",
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  if (row.status === "cancelled") return errorPage("此訂單已取消");
  if (row.status === "failed") return errorPage("此訂單已失敗 . 請聯絡客服重發連結");
  if (row.status === "expired" || (row.expired_at && new Date(row.expired_at) < new Date())) {
    // mark expired
    await fetch(SUPABASE_URL + "/rest/v1/payment_intents?id=eq." + row.id, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "expired" }),
    });
    return errorPage("此付款連結已逾期 (7 天有效) . 請聯絡 BeyondPath 重發");
  }

  const preflight = row.webhook_payload && row.webhook_payload.preflight;
  if (!preflight || typeof preflight !== "object") {
    return errorPage("付款參數異常 (preflight missing) . 請聯絡客服");
  }

  // 生 auto-submit form
  const fields: string[] = [];
  for (const k of Object.keys(preflight)) {
    fields.push(
      "<input type=\"hidden\" name=\"" +
        htmlEscape(k) +
        "\" value=\"" +
        htmlEscape(String(preflight[k])) +
        "\" />"
    );
  }

  const formHtml =
    "<!DOCTYPE html><html lang=\"zh-Hant\"><head><meta charset=\"utf-8\"><title>BeyondPath . 轉向綠界付款</title>" +
    "<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;padding:24px;text-align:center;background:#fafafa;line-height:1.7}" +
    ".spinner{display:inline-block;width:32px;height:32px;border:3px solid #e5e5e5;border-top-color:#c7e84a;border-radius:50%;animation:s 0.8s linear infinite;margin:20px 0}" +
    "@keyframes s{to{transform:rotate(360deg)}}" +
    "</style></head><body>" +
    "<h1 style=\"font-size:18px;color:#333\">BeyondPath . 正在轉向綠界安全付款頁</h1>" +
    "<div class=\"spinner\"></div>" +
    "<p style=\"color:#666;font-size:14px\">訂單號: " + htmlEscape(tradeNo) + "</p>" +
    "<p style=\"color:#666;font-size:14px\">金額: NT$ " + (row.amount_ntd || 0).toLocaleString() + "</p>" +
    "<p style=\"color:#888;font-size:12px\">若 5 秒內未自動轉向、請按下方按鈕</p>" +
    "<form id=\"ecpay-form\" method=\"POST\" action=\"" + ECPAY_AIO_URL + "\">" +
    fields.join("") +
    "<button type=\"submit\" style=\"margin-top:12px;background:#c7e84a;color:#0a0a0b;border:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer\">前往綠界付款</button>" +
    "</form>" +
    "<script>setTimeout(function(){document.getElementById(\"ecpay-form\").submit();},800);</script>" +
    "</body></html>";

  return new Response(formHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
});
