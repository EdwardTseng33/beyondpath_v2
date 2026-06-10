// BeyondPath POC . Edge Function shared . Edward ops event notify
// 2026-05-31 calcifer . markl doc 37 gap 2 . pre-launch ops defense
// 2026-06-01 calcifer . doc 42 M-1 + 爭議 . 加 worker_accepted / worker_declined / arbitration_opened
//   . worker 接受/婉拒原本 0 通知 . Edward 空等 (doc 42 最關鍵缺口) . 仲裁發起也沒推 Edward
//
// Problem (doc 37): Edward must manually open admin.html to know new events . over 3 parallel cases = misses
// Fix: ops events fire-and-forget email to Edward himself
//   Slack channel exists but Edward may not watch it . email is the backstop push
//
// Design:
//   - fire-and-forget . caller does catch . never blocks main flow response
//   - fail-soft . RESEND_API_KEY unset means silent return . no error
//   - centralized template . 4 events share one wrapper
//   - recipient = ADMIN_EMAIL shared with admin.ts default edwardt0303@gmail.com
//     override via EDWARD_NOTIFY_EMAIL
//
// Usage after event confirmed success . do NOT await on main flow:
//   import { notifyEdward } from "../_shared/notify-edward.ts";
//   notifyEdward("worker_apply", { title: name, email, tier, lScore }).catch(function () {});

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const EDWARD_EMAIL = Deno.env.get("EDWARD_NOTIFY_EMAIL") ?? Deno.env.get("ADMIN_EMAIL") ?? "edwardt0303@gmail.com";
const ADMIN_CONSOLE_URL = (Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw") + "/admin.html";

export type EdwardEventType =
  | "worker_apply"
  | "client_intake"
  | "milestone_delivered"
  | "contract_signed"
  | "worker_accepted"
  | "worker_declined"
  | "arbitration_opened";

export interface EdwardEventData {
  title?: string;
  email?: string;
  tier?: string | null;
  lScore?: number | string | null;
  verticals?: string[] | null;
  vertical?: string | null;
  budget?: string | null;
  timeline?: string | null;
  briefSnippet?: string | null;
  enterpriseFlags?: string[] | null;
  contractId?: string | null;
  milestoneTitle?: string | null;
  workerName?: string | null;
  clientName?: string | null;
  amount?: string | null;
  caseId?: string | null;        // arbitration case id
  projectTitle?: string | null;  // 案件 / brief 標題 (worker accept/decline 顯示用)
  deadlineStr?: string | null;   // arbitration position deadline (human readable)
}

const EVENT_META: Record<EdwardEventType, { glyph: string; label: string; action: string; tab: string }> = {
  worker_apply:        { glyph: "[W]", label: "new worker application", action: "review (approve / hold / reject)", tab: "Pending Workers" },
  client_intake:       { glyph: "[C]", label: "new client brief", action: "match (run AI match -> send invite)", tab: "Client Intakes" },
  milestone_delivered: { glyph: "[M]", label: "milestone delivered", action: "confirm (approved / disputed)", tab: "Contracts milestones" },
  contract_signed:     { glyph: "[S]", label: "contract both-signed", action: "follow up (kick off delivery)", tab: "Contracts" },
  worker_accepted:     { glyph: "[+]", label: "worker accepted invite", action: "next: 產合約 (◆ 在 Client Intakes 該案 worker 列)", tab: "Client Intakes" },
  worker_declined:     { glyph: "[-]", label: "worker declined invite", action: "next: 邀下一位 worker (重跑配對 / 換人)", tab: "Client Intakes" },
  arbitration_opened:  { glyph: "[!]", label: "arbitration case opened", action: "review (看雙方 position . 5 工作日內裁決)", tab: "Arbitration" },
};

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildRows(eventType: EdwardEventType, d: EdwardEventData): Array<[string, string]> {
  const rows: Array<[string, string]> = [];
  if (d.email) rows.push(["Email", d.email]);
  if (eventType === "worker_apply") {
    if (d.tier) rows.push(["Tier", String(d.tier)]);
    if (d.lScore != null && d.lScore !== "") rows.push(["L-Score", String(d.lScore) + " / 10"]);
    if (d.verticals && d.verticals.length) rows.push(["Verticals", d.verticals.join(" . ")]);
  } else if (eventType === "client_intake") {
    if (d.vertical) rows.push(["Vertical", d.vertical]);
    if (d.budget) rows.push(["Budget", d.budget]);
    if (d.timeline) rows.push(["Timeline", d.timeline]);
    if (d.enterpriseFlags && d.enterpriseFlags.length) rows.push(["Enterprise", d.enterpriseFlags.join(" . ")]);
  } else if (eventType === "milestone_delivered") {
    if (d.milestoneTitle) rows.push(["Milestone", d.milestoneTitle]);
    if (d.workerName) rows.push(["Worker", d.workerName]);
    if (d.clientName) rows.push(["Client", d.clientName]);
    if (d.contractId) rows.push(["Contract", String(d.contractId).slice(0, 8)]);
  } else if (eventType === "contract_signed") {
    if (d.workerName) rows.push(["Worker", d.workerName]);
    if (d.clientName) rows.push(["Client", d.clientName]);
    if (d.amount) rows.push(["Amount", d.amount]);
    if (d.contractId) rows.push(["Contract", String(d.contractId).slice(0, 8)]);
  } else if (eventType === "worker_accepted" || eventType === "worker_declined") {
    if (d.workerName) rows.push(["Worker", d.workerName]);
    if (d.clientName) rows.push(["Client", d.clientName]);
    if (d.projectTitle) rows.push(["Project", d.projectTitle]);
    if (d.vertical) rows.push(["Vertical", d.vertical]);
  } else if (eventType === "arbitration_opened") {
    if (d.workerName) rows.push(["Worker", d.workerName]);
    if (d.clientName) rows.push(["Client", d.clientName]);
    if (d.milestoneTitle) rows.push(["Milestone", d.milestoneTitle]);
    if (d.deadlineStr) rows.push(["Deadline", d.deadlineStr]);
    if (d.caseId) rows.push(["Case", String(d.caseId).slice(0, 8)]);
    if (d.contractId) rows.push(["Contract", String(d.contractId).slice(0, 8)]);
  }
  return rows;
}

function buildHtml(et: EdwardEventType, d: EdwardEventData): string {
  const meta = EVENT_META[et];
  const title = d.title || "(unnamed)";
  const rows = buildRows(et, d);
  const rowsHtml = rows.map(function (pair) {
    return "<tr><td style=\"padding:6px 0;color:#9a9aa3;border-bottom:1px dashed #2a2a2e;width:110px;font-size:13px;\">" + esc(pair[0]) + "</td>" +
      "<td style=\"padding:6px 0;color:#f0eee8;border-bottom:1px dashed #2a2a2e;font-size:13px;\">" + esc(pair[1]) + "</td></tr>";
  }).join("");
  const briefHtml = d.briefSnippet
    ? "<div style=\"margin:14px 0;padding:12px 16px;background:rgba(199,232,74,0.04);border-left:2px solid #c7e84a;color:#c8c6c0;font-size:13px;line-height:1.7;\">" + esc(d.briefSnippet) + "</div>"
    : "";

  return "<!DOCTYPE html><html lang=\"zh-Hant\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>BeyondPath ops</title></head><body style=\"font-family:system-ui,sans-serif;background:#0a0a0b;color:#f0eee8;margin:0;padding:32px 20px;\">" +
    "<div style=\"max-width:520px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:32px 28px;\">" +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.16em;color:#c7e84a;margin-bottom:16px;\">BEYONDPATH OPS . ADMIN ALERT</div>" +
    "<div style=\"font-size:22px;font-weight:700;color:#f0eee8;margin-bottom:4px;\">" + esc(meta.glyph) + " " + esc(meta.label) + "</div>" +
    "<div style=\"font-size:16px;color:#c8c6c0;margin-bottom:20px;font-family:Georgia,serif;font-style:italic;\">" + esc(title) + "</div>" +
    (rowsHtml ? "<table style=\"width:100%;border-collapse:collapse;margin-bottom:8px;\">" + rowsHtml + "</table>" : "") +
    briefHtml +
    "<div style=\"margin:20px 0 16px;padding:12px 16px;background:rgba(212,113,42,0.08);border-left:2px solid #d4712a;color:#f0eee8;font-size:14px;line-height:1.6;\">" +
    "<b style=\"color:#d4712a;\">Next</b> . " + esc(meta.action) + "</div>" +
    "<a href=\"" + esc(ADMIN_CONSOLE_URL) + "\" style=\"display:inline-block;background:#c7e84a;color:#0a0a0b;padding:10px 24px;font-family:monospace;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;\">open admin (" + esc(meta.tab) + ")</a>" +
    "<hr style=\"border:none;border-top:1px solid #2a2a2e;margin:24px 0 14px;\"/>" +
    "<p style=\"color:#6a6a72;font-size:10px;font-family:monospace;letter-spacing:0.04em;margin:0;\">BeyondPath POC ops alert . admin-only . not public</p>" +
    "</div></body></html>";
}

function buildText(eventType: EdwardEventType, d: EdwardEventData): string {
  const meta = EVENT_META[eventType];
  const rows = buildRows(eventType, d);
  const lines = [
    "BeyondPath OPS . " + meta.label,
    "",
    (d.title || "(unnamed)"),
    "",
  ];
  for (const pair of rows) lines.push("  " + pair[0] + ": " + pair[1]);
  if (d.briefSnippet) lines.push("\n  Brief: " + d.briefSnippet);
  lines.push("");
  lines.push("Next: " + meta.action);
  lines.push("Admin: " + ADMIN_CONSOLE_URL);
  return lines.join("\n");
}

export async function notifyEdward(
  eventType: EdwardEventType,
  data: EdwardEventData,
): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: "resend-not-configured" };
  if (!EVENT_META[eventType]) return { ok: false, error: "unknown-event-type" };

  const meta = EVENT_META[eventType];
  const subject = "[BeyondPath] " + meta.glyph + " " + meta.label + " . " + (data.title || "(unnamed)");
  const html = buildHtml(eventType, data);
  const text = buildText(eventType, data);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to: [EDWARD_EMAIL], subject, html, text }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(function () { return ""; });
      return { ok: false, error: "resend-" + res.status + ":" + detail.slice(0, 160) };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
