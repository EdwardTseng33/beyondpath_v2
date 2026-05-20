// BeyondPath POC . Shared . Decision invitation email template
// Used by send-decision-email Edge Function
// 2026-05-20 . Q3 Task 4 . calcifer
//
// Style aligned with notify-lead-slack/buildClientMatchEmail (dark theme · monospace accents · #c7e84a accent)

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
