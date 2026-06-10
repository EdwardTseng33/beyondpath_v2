// BeyondPath v1.0 . Shared . Decision invitation email template
// Used by send-decision-email Edge Function
// 2026-05-20 . Q3 Task 4 . calcifer
// 2026-05-28 . v1.1 . suliman . Added PLATFORM_DISCLAIMER for legal compliance (terms.html §7 / privacy.html §10)
//
// Style aligned with notify-lead-slack/buildClientMatchEmail (dark theme · monospace accents · #c7e84a accent)

// ============================================================
// PLATFORM_DISCLAIMER · 平台角色聲明（對齊 terms.html §3.4 / §7 代收代付）
// 套用於所有對外 outbound email · 呼應 terms.html §7 + privacy.html §10
// Edward 5/28 拍板：PMF 階段不外送律師 · 城堡自治 · 自審 GO
// 2026-06-01 · v1.2 · calcifer · 去 Beta POC + 金流措辭對齊代收代付（terms §3.4）· Gate 5 待 suliman
// ============================================================

const PLATFORM_DISCLAIMER_TEXT = [
  "",
  "─── 平台聲明 ───",
  "BeyondPath 僅提供 (a) 配對媒合 (b) 通知傳遞 (c) Tier 認證初審 (d) 服務費代收代付。",
  "案款由平台透過綠界第三方支付代收、扣抵服務費後撥付接案者（代收代付、不長期託管、非 escrow . 見條款 §3.4）。",
  "平台不擔保交付品質、不擔保案款追償、不提供合約仲裁、不擔任稅務代理。配對成功後雙方獨立合約、平台不介入履約。",
  "完整條款：https://beyondpath.tw/legal/terms.html",
  "隱私政策：https://beyondpath.tw/legal/privacy.html",
].join("\n");

const PLATFORM_DISCLAIMER_HTML = (
  "<div style=\"margin-top:24px;padding:14px 18px;background:rgba(199,232,74,0.03);border-left:2px solid rgba(199,232,74,0.4);font-size:11px;line-height:1.7;color:#9a9aa3;\">" +
    "<div style=\"font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#c7e84a;text-transform:uppercase;margin-bottom:6px;\">▍ 平台聲明</div>" +
    "BeyondPath 僅提供 (a) 配對媒合 (b) 通知傳遞 (c) Tier 認證初審 (d) 服務費代收代付（透過綠界第三方支付代收案款、扣抵服務費後撥付接案者、不長期託管、非 escrow . 見條款 §3.4）。" +
    "平台不擔保交付品質、不擔保案款追償、不提供合約仲裁、不擔任稅務代理。配對成功後雙方獨立合約、平台不介入履約。" +
    "<br/><br/>" +
    "完整條款：<a href=\"https://beyondpath.tw/legal/terms.html\" style=\"color:#c7e84a;text-decoration:none;\">terms.html</a>" +
    " · " +
    "隱私政策：<a href=\"https://beyondpath.tw/legal/privacy.html\" style=\"color:#c7e84a;text-decoration:none;\">privacy.html</a>" +
  "</div>"
);

export interface DecisionEmailInput {
  worker_name: string;
  worker_handle: string;
  client_company: string;
  client_vertical: string;
  client_brief: string;
  budget_range: string;
  timeline: string;
  why_recommend: string;          // 1-line · why this worker was picked
  match_score: number;            // 0-100
  accept_url: string;
  decline_url: string;
  expires_in_days: number;
  custom_message?: string;        // Edward's optional 1-2 sentence pitch
  public_homepage?: string;
}

export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}

export function buildDecisionEmail(input: DecisionEmailInput): BuiltEmail {
  const homepage = input.public_homepage || "https://beyondpath.tw";
  const briefSnippet = (input.client_brief || "").slice(0, 280);

  const subject = "BeyondPath 配對通知 · " + (input.client_company || "新案件") + " · " + (input.client_vertical || "");

  const textLines = [
    input.worker_name + " 你好，",
    "",
    "BeyondPath 為你媒合到一個 " + input.client_vertical + " 領域的新案件，",
    "配對分數 " + input.match_score + "/100。",
    "",
    "▍為什麼推薦你",
    "  " + (input.why_recommend || "綜合領域 / Tier / L-score 評估"),
    "",
    "▍案件摘要",
    "  公司：" + (input.client_company || "(待揭露)"),
    "  領域：" + (input.client_vertical || ""),
    "  預算：" + (input.budget_range || "(面議)"),
    "  時程：" + (input.timeline || "(彈性)"),
    "  Brief：" + briefSnippet,
  ];
  if (input.custom_message) {
    textLines.push("", "▍Edward 想說的話", "  " + input.custom_message);
  }
  textLines.push(
    "",
    "▍下一步 · 請於 " + input.expires_in_days + " 天內點選",
    "  [接受配對] " + input.accept_url,
    "  [婉拒此次] " + input.decline_url,
    "",
    "接受後 BeyondPath 會 wire 你跟 client 直接 email、雙方獨立溝通、平台不介入。",
    "婉拒不影響你未來配對機會、可選擇性說明原因。",
    PLATFORM_DISCLAIMER_TEXT,
    "",
    "— BeyondPath",
    homepage,
  );

  const text = textLines.join("\n");

  const customBlock = input.custom_message ? (
    "<div style=\"background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;margin:16px 0;color:#c8c6c0;line-height:1.65;font-size:13px;\">" +
      "<div style=\"font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:6px;\">▍ Edward 想說</div>" +
      escapeHtml(input.custom_message) +
    "</div>"
  ) : "";

  const html = (
    "<!doctype html><html><body style=\"margin:0;background:#0c0c0e;color:#c8c6c0;font-family:Georgia,'Noto Serif TC',serif;\">" +
    "<div style=\"max-width:620px;margin:0 auto;padding:32px 24px;\">" +
      "<div style=\"font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.18em;color:#c7e84a;margin-bottom:24px;text-transform:uppercase;\">● BEYONDPATH · 配對通知</div>" +
      "<div style=\"font-size:22px;color:#f0eee8;margin-bottom:16px;\">" + escapeHtml(input.worker_name) + " 你好</div>" +
      "<div style=\"color:#c8c6c0;line-height:1.75;font-size:15px;margin-bottom:24px;\">" +
        "BeyondPath 為你媒合到一個 <b style=\"color:#c7e84a;\">" + escapeHtml(input.client_vertical) + "</b> 領域的新案件、配對分數 <b style=\"color:#c7e84a;\">" + input.match_score + "/100</b>。" +
      "</div>" +
      "<div style=\"border:1px solid #2a2a2e;padding:20px;margin-bottom:16px;background:rgba(255,255,255,0.02);\">" +
        "<div style=\"font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:8px;\">▍ 為什麼推薦你</div>" +
        "<div style=\"font-size:14px;color:#c8c6c0;line-height:1.7;\">" + escapeHtml(input.why_recommend) + "</div>" +
      "</div>" +
      "<div style=\"border:1px solid #2a2a2e;padding:20px;margin-bottom:16px;background:rgba(255,255,255,0.02);\">" +
        "<div style=\"font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:8px;\">▍ 案件摘要</div>" +
        "<div style=\"font-size:13px;color:#c8c6c0;line-height:1.85;\">" +
          "公司：<b style=\"color:#f0eee8;\">" + escapeHtml(input.client_company || "(待揭露)") + "</b><br/>" +
          "領域：" + escapeHtml(input.client_vertical || "") + "<br/>" +
          "預算：<b style=\"color:#c7e84a;\">" + escapeHtml(input.budget_range || "(面議)") + "</b><br/>" +
          "時程：" + escapeHtml(input.timeline || "(彈性)") + "<br/>" +
          "Brief：" + escapeHtml(briefSnippet) +
        "</div>" +
      "</div>" +
      customBlock +
      "<div style=\"margin:32px 0 16px;display:flex;gap:12px;flex-wrap:wrap;\">" +
        "<a href=\"" + input.accept_url + "\" style=\"display:inline-block;padding:12px 24px;background:#c7e84a;color:#0c0c0e;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;font-weight:700;\">接受配對</a>" +
        "<a href=\"" + input.decline_url + "\" style=\"display:inline-block;padding:12px 24px;background:transparent;border:1px solid #2a2a2e;color:#c8c6c0;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;\">婉拒此次</a>" +
      "</div>" +
      "<div style=\"color:#9a9aa3;font-size:12px;line-height:1.65;margin-top:24px;\">" +
        "請於 <b style=\"color:#c7e84a;\">" + input.expires_in_days + " 天</b>內點選。接受後 BeyondPath 會 wire 你跟 client 直接 email、雙方獨立溝通、平台不介入。婉拒不影響未來配對機會。" +
      "</div>" +
      PLATFORM_DISCLAIMER_HTML +
      "<div style=\"margin-top:32px;padding-top:16px;border-top:1px solid #2a2a2e;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;\">" +
        "— BEYONDPATH · <a href=\"" + homepage + "\" style=\"color:#c7e84a;text-decoration:none;\">" + homepage + "</a>" +
      "</div>" +
    "</div>" +
    "</body></html>"
  );

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
