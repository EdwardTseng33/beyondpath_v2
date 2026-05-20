// BeyondPath POC . Shared . Submission acknowledgement email templates
// Used by: notify-lead-slack (client_intakes INSERT) + worker-ack-email (worker_applications INSERT)
// 2026-05-20 . brief #1 / #2 . calcifer
//
// Aligned with brief expectations:
//   - BeyondPath collected need / 24h response (client)
//   - BeyondPath collected Tier B application (worker)
//   - Stage 1 ~28% / Tier A < 10% expectation framing
//   - AI 拆解 + 人工覆核並行 framing
//   - Early Beta / 不代收付款 / 失敗 fallback mailto
// Style aligned with _shared/decision-email-template.ts
// Note: font-family uses serif/monospace generic names only (avoid quoted custom font names)

export interface ClientAckInput {
  company_name: string;
  vertical?: string;
  budget_range?: string;
  timeline?: string;
  enterprise_flags?: string[];
  public_homepage?: string;
}

export interface WorkerAckInput {
  display_name: string;
  l_score?: number | null;
  tier_suggestion?: string | null;
  verticals?: string[];
  case_count?: string | null;
  public_homepage?: string;
}

export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}

const SUPPORT_EMAIL = "hello@beyondpath.tw";

function escapeHtml(s: string): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailShell(opts: { eyebrow: string; title: string; body: string; homepage: string; }): string {
  return (
    "<!doctype html><html lang=\"zh-Hant\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>BeyondPath</title></head>" +
    "<body style=\"margin:0;background:#0a0a0b;color:#c8c6c0;font-family:system-ui,sans-serif;padding:40px 20px;\">" +
    "<div style=\"max-width:580px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:40px 36px;\">" +
      "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.18em;color:#c7e84a;margin-bottom:20px;text-transform:uppercase;\">" + opts.eyebrow + "</div>" +
      "<h1 style=\"font-family:Georgia,serif;font-style:italic;font-size:30px;font-weight:400;line-height:1.25;margin:0 0 24px;color:#f0eee8;\">" + escapeHtml(opts.title) + "</h1>" +
      opts.body +
      "<hr style=\"border:none;border-top:1px solid #2a2a2e;margin:24px 0;\"/>" +
      "<p style=\"color:#9a9aa3;font-size:12px;margin:0 0 8px;\">- BeyondPath . <a href=\"" + opts.homepage + "\" style=\"color:#c7e84a;text-decoration:none;\">" + opts.homepage + "</a></p>" +
      "<p style=\"color:#6a6a72;font-size:10px;font-family:monospace;letter-spacing:0.04em;margin:8px 0 0;\">Early Beta . 不代收付款 . 互動 demo . 正式服務於 2026 Q3 啟動</p>" +
    "</div></body></html>"
  );
}

// ============================================================
// CLIENT . brief 送出後 ack
// ============================================================

export function buildClientAckEmail(input: ClientAckInput): BuiltEmail {
  const homepage = input.public_homepage || "https://beyondpath.tw";
  const company = input.company_name || "你好";
  const budget = input.budget_range || "(未填預算)";
  const vertical = input.vertical || "";
  const timeline = input.timeline || "";
  const enterpriseFlags = input.enterprise_flags || [];

  const subject = "BeyondPath 收到你的需求 . 24h 內回覆配對方案 . " + company;

  const textLines: Array<string | null> = [
    company + " 你好，",
    "",
    "BeyondPath 已收到你的 brief、配對流程啟動中。",
    "",
    "我們會做什麼：",
    "  1. AI 拆解你的需求 (vertical / 預算 / 時程 / deliverable)",
    "  2. 演算法配對 Tier B+ 以上 worker (5 維 scoring)",
    "  3. 人工覆核並行 (Edward 親自看候選名單、確認合適)",
    "  4. 24h 內 email 寄完整配對方案 (1-3 位候選 worker + 報價 + 試做案建議)",
    "",
    "我們收到的 brief：",
    vertical ? "  領域：" + vertical : null,
    "  預算：" + budget,
    timeline ? "  時程：" + timeline : null,
    enterpriseFlags.length > 0 ? "  Enterprise：" + enterpriseFlags.join(" . ") : null,
    "",
    "Early Beta 須知：",
    "  . Early Beta . 不代收專案款、worker 跟你直接結算",
    "  . 試做案 NT$30-100k 起、做完才決定要不要 retainer",
    "  . 不簽長約、不綁定",
    "",
    "24h 內沒收到回覆？寄信到 " + SUPPORT_EMAIL + " 我們會手動跟進。",
    "",
    "- BeyondPath",
    homepage,
  ];

  const text = textLines.filter(function (l) { return l !== null; }).join("\n");

  const briefRows = [
    vertical ? "<tr><td style=\"padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;width:100px;\">領域</td><td style=\"padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;\">" + escapeHtml(vertical) + "</td></tr>" : "",
    "<tr><td style=\"padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;width:100px;\">預算</td><td style=\"padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:monospace;font-weight:700;\">" + escapeHtml(budget) + "</td></tr>",
    timeline ? "<tr><td style=\"padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;\">時程</td><td style=\"padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;\">" + escapeHtml(timeline) + "</td></tr>" : "",
    enterpriseFlags.length > 0 ? "<tr><td style=\"padding:8px 0;color:#9a9aa3;\">Enterprise</td><td style=\"padding:8px 0;color:#d4712a;font-family:monospace;font-size:13px;\">" + escapeHtml(enterpriseFlags.join(" . ")) + "</td></tr>" : "",
  ].filter(function (s) { return s !== ""; }).join("");

  const body = (
    "<div style=\"color:#c8c6c0;line-height:1.75;font-size:15px;margin-bottom:24px;\">" +
      "BeyondPath 已收到你的 brief、<b style=\"color:#c7e84a;\">配對流程啟動中</b>。" +
    "</div>" +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;\">▍ 我們會做什麼 / WHAT NEXT</div>" +
    "<ol style=\"color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;\">" +
      "<li><b style=\"color:#f0eee8;\">AI 拆解</b>你的需求 (vertical / 預算 / 時程 / deliverable)</li>" +
      "<li><b style=\"color:#f0eee8;\">演算法配對</b> Tier B+ 以上 worker (5 維 scoring)</li>" +
      "<li><b style=\"color:#f0eee8;\">人工覆核並行</b> (確認合適、不交差)</li>" +
      "<li><b style=\"color:#c7e84a;\">24h 內 email 寄配對方案</b> (候選名單 + 報價 + 試做案建議)</li>" +
    "</ol>" +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;\">▍ 我們收到的 brief / BRIEF SUMMARY</div>" +
    "<table style=\"width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px;\">" + briefRows + "</table>" +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;\">▍ Early Beta 須知 / FYI</div>" +
    "<ul style=\"color:#c8c6c0;line-height:1.75;font-size:13px;margin:0 0 24px;padding-left:20px;\">" +
      "<li>Early Beta . <b style=\"color:#c7e84a;\">不代收專案款</b>、worker 跟你直接結算</li>" +
      "<li>試做案 NT$30-100k 起、做完才決定要不要 retainer</li>" +
      "<li>不簽長約、不綁定</li>" +
    "</ul>" +
    "<div style=\"background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;color:#c8c6c0;line-height:1.65;font-size:13px;\">" +
      "<b style=\"color:#f0eee8;\">24h 內沒收到配對方案？</b><br/>" +
      "寄信到 <b style=\"color:#c7e84a;\">" + SUPPORT_EMAIL + "</b>、我們會手動跟進。" +
    "</div>"
  );

  const html = emailShell({
    eyebrow: "BEYONDPATH . 配對流程啟動",
    title: escapeHtml(company) + "，",
    body: body,
    homepage: homepage,
  });

  return { subject: subject, html: html, text: text };
}

// ============================================================
// WORKER . application 送出後 ack
// ============================================================

export function buildWorkerAckEmail(input: WorkerAckInput): BuiltEmail {
  const homepage = input.public_homepage || "https://beyondpath.tw";
  const name = input.display_name || "創作者";
  const lScore = (input.l_score === null || input.l_score === undefined) ? "?" : String(input.l_score);
  const tierSuggestion = input.tier_suggestion || "B / B+";
  const verticals = Array.isArray(input.verticals) ? input.verticals.join(" . ") : "";
  const caseCount = input.case_count || "";

  const subject = "BeyondPath 收到你的 Tier B 認證申請 . " + name;

  const textLines: Array<string | null> = [
    name + " 你好，",
    "",
    "BeyondPath 已收到你的 Tier B 認證申請、評估流程啟動中。",
    "",
    "系統初評：",
    "  AI L-Score: " + lScore + " / 10",
    "  建議 Tier: " + tierSuggestion,
    verticals ? "  領域: " + verticals : null,
    caseCount ? "  案件數量: " + caseCount : null,
    "",
    "接下來 24-72h：",
    "  1. AI 拆解你的訪談 (workflow / 案件證據 / skill matrix)",
    "  2. 人工覆核並行 (Edward 親自看每位申請者、不靠純 AI 判斷)",
    "  3. 24-72h 內 email 通知結果",
    "",
    "三種可能結果：",
    "  通過 Tier B / B+ . 加入首案池、有 brief 進來時系統配對你",
    "  需補資料 . 具體告訴你補哪幾項 (case 截圖 / testimonial)",
    "  暫不通過 . 具體告訴你 gap、6 個月可重申",
    "",
    "通過率參考：",
    "  . Stage 1 (Tier B/B+) ~28% 通過率",
    "  . Tier A < 10% (走平台旗艦媒合、需明顯證據)",
    "",
    "Tier 不是門檻、是匹配精度：Tier B 對應 NT$30-100k 試做案、Tier A 對應 NT$200k+ 大案。",
    "",
    "72h 內沒收到通知？寄信到 " + SUPPORT_EMAIL + " 我們會手動跟進。",
    "",
    "- BeyondPath",
    homepage,
  ];

  const text = textLines.filter(function (l) { return l !== null; }).join("\n");

  const evalRows = [
    "<tr><td style=\"padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;width:120px;\">AI L-Score</td><td style=\"padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:monospace;font-weight:700;\">" + escapeHtml(lScore) + " / 10</td></tr>",
    "<tr><td style=\"padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;\">建議 Tier</td><td style=\"padding:8px 0;color:#c7e84a;border-bottom:1px dashed #2a2a2e;font-family:monospace;font-weight:700;\">" + escapeHtml(tierSuggestion) + "</td></tr>",
    verticals ? "<tr><td style=\"padding:8px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;\">領域</td><td style=\"padding:8px 0;color:#c8c6c0;border-bottom:1px dashed #2a2a2e;\">" + escapeHtml(verticals) + "</td></tr>" : "",
    caseCount ? "<tr><td style=\"padding:8px 0;color:#9a9aa3;\">案件數量</td><td style=\"padding:8px 0;color:#c8c6c0;\">" + escapeHtml(caseCount) + "</td></tr>" : "",
  ].filter(function (s) { return s !== ""; }).join("");

  const body = (
    "<div style=\"color:#c8c6c0;line-height:1.75;font-size:15px;margin-bottom:24px;\">" +
      "BeyondPath 已收到你的 Tier B 認證申請、<b style=\"color:#c7e84a;\">評估流程啟動中</b>。" +
    "</div>" +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;\">▍ 系統初評 / INITIAL READ</div>" +
    "<table style=\"width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px;\">" + evalRows + "</table>" +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;\">▍ 接下來 24-72h / NEXT 24-72H</div>" +
    "<ol style=\"color:#c8c6c0;line-height:1.85;font-size:14px;margin:0 0 24px;padding-left:20px;\">" +
      "<li><b style=\"color:#f0eee8;\">AI 拆解</b>你的訪談 (workflow / 案件證據 / skill matrix)</li>" +
      "<li><b style=\"color:#f0eee8;\">人工覆核並行</b> (Edward 親自看、不靠純 AI 判斷)</li>" +
      "<li><b style=\"color:#c7e84a;\">24-72h 內 email 通知結果</b></li>" +
    "</ol>" +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;\">▍ 三種可能結果 / OUTCOMES</div>" +
    "<div style=\"background:rgba(199,232,74,0.04);border-left:2px solid #c7e84a;padding:14px 20px;margin:0 0 16px;color:#c8c6c0;line-height:1.85;font-size:14px;\">" +
      "<div style=\"margin-bottom:6px;\"><b style=\"color:#c7e84a;\">通過 Tier B / B+</b> . 加入首案池、有 brief 進來時系統配對你</div>" +
      "<div style=\"margin-bottom:6px;\"><b style=\"color:#d4712a;\">需補資料</b> . 具體告訴你補哪幾項</div>" +
      "<div><b style=\"color:#9a9aa3;\">暫不通過</b> . 具體告訴你 gap、6 個月可重申</div>" +
    "</div>" +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;text-transform:uppercase;margin-bottom:12px;\">▍ 通過率參考 / ACCEPTANCE RATE</div>" +
    "<ul style=\"color:#c8c6c0;line-height:1.75;font-size:13px;margin:0 0 24px;padding-left:20px;\">" +
      "<li>Stage 1 (Tier B/B+) <b style=\"color:#c7e84a;\">~28%</b> 通過率</li>" +
      "<li>Tier A <b style=\"color:#c7e84a;\">&lt; 10%</b> (平台旗艦媒合、需明顯證據)</li>" +
    "</ul>" +
    "<p style=\"color:#9a9aa3;line-height:1.65;font-size:13px;font-style:italic;margin:0 0 24px;\">Tier 不是門檻、是匹配精度：Tier B 對應 NT$30-100k 試做案、Tier A 對應 NT$200k+ 大案。</p>" +
    "<div style=\"background:rgba(255,255,255,0.02);border:1px dashed #2a2a2e;padding:14px 18px;color:#c8c6c0;line-height:1.65;font-size:13px;\">" +
      "<b style=\"color:#f0eee8;\">72h 內沒收到通知？</b><br/>" +
      "寄信到 <b style=\"color:#c7e84a;\">" + SUPPORT_EMAIL + "</b>、我們會手動跟進。" +
    "</div>"
  );

  const html = emailShell({
    eyebrow: "BEYONDPATH . 認證申請已收到",
    title: escapeHtml(name) + "，",
    body: body,
    homepage: homepage,
  });

  return { subject: subject, html: html, text: text };
}
