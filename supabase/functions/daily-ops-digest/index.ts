// BeyondPath POC . Edge Function . daily-ops-digest
// 2026-06-01 calcifer . howl doc 40 Phase 0 . Edward vision: AI ops assistant + remind human action
//
// Daily 09:00 TST (= UTC 01:00) cron . scan 6 platform signals -> 1 LLM call -> email Edward
//
// Scan 6 categories:
//   1. pending match (client_intakes status new/reviewing)
//   2. pending workers (worker_applications pending/reviewing/need_more_info)
//   3. stuck cases (milestone stuck >72h . arbitration pending)
//   4. commission reconcile (commission_records . Edward correction: 金流走代收代付 . client_paid not worker ack)
//   5. anomaly (last-24h intake/worker spike)
//   6. supply-demand imbalance (approved worker pool vs pending demand verticals)
//
// Digest 5 sections (howl doc 40): 1 AI summary . 2 action items <=5 + links . 3 status snapshot . 4 alerts . 5 quiet signal
//
// Reuse: notify-edward visual style (own digest template) + ANTHROPIC_API_KEY + commission_records
// One new file . touches nothing existing
//
// Trigger (pick one . for Sophie): A pg_cron+pg_net (see tail SQL) . B external cron GET ?secret=<CRON_SECRET> . C functions invoke
// Security: non-cron call must carry CRON_SECRET . fail-soft: no ANTHROPIC_API_KEY -> send raw digest . no RESEND -> silent log

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_DIGEST_MODEL") ?? Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-6";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const EDWARD_EMAIL = Deno.env.get("EDWARD_NOTIFY_EMAIL") ?? Deno.env.get("ADMIN_EMAIL") ?? "edwardt0303@gmail.com";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";
const ADMIN_URL = PUBLIC_SITE_BASE + "/admin.html";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

function authHeaders(): Record<string, string> {
  return {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

// PostgREST GET helper . fail -> [] (scan tolerance . one query fail wont break others)
async function q(path: string): Promise<any[]> {
  try {
    const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, { headers: authHeaders() });
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? rows : [];
  } catch (_e) {
    return [];
  }
}

function hoursSince(s: string | null | undefined): number | null {
  if (!s) return null;
  const t = new Date(s).getTime();
  if (isNaN(t)) return null;
  return (Date.now() - t) / 36e5;
}

// ============================================================
// Scan layer . return structured snapshot for LLM + email
// ============================================================
interface OpsSnapshot {
  pendingMatch: { count: number; overdue: number; items: Array<{ company: string; vertical: string; hours: number }> };
  pendingWorkers: { count: number; overdue: number; items: Array<{ name: string; tier: string; hours: number }> };
  stuck: { milestonesStuck: number; arbitrationPending: number; items: Array<{ type: string; label: string; hours: number | null }> };
  commission: { clientPaidCount: number; clientPaidTotal: number; awaitingPayout: number; awaitingCommission: number; items: Array<{ contract: string; event: string; amount: number; days: number }> };
  anomaly: { intakes24h: number; workers24h: number; flags: string[] };
  supplyDemand: { approvedWorkers: number; demandVerticals: string[]; supplyVerticals: string[]; gaps: string[] };
  generatedAt: string;
}

async function scanPlatform(): Promise<OpsSnapshot> {
  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 36e5).toISOString();

  // 1. pending match
  const intakesPending = await q("client_intakes?status=in.(new,reviewing)&select=id,company_name,vertical,created_at,matched_at,status&order=created_at.asc&limit=50");
  const pmItems = intakesPending.map(function (r) {
    return { company: r.company_name || "(no company)", vertical: r.vertical || "-", hours: hoursSince(r.created_at) || 0 };
  });
  const pmOverdue = pmItems.filter(function (x) { return x.hours > 24; }).length;

  // 2. pending workers
  const workersPending = await q("worker_applications?status=in.(pending,reviewing,need_more_info)&select=id,display_name,email,tier_suggestion,created_at,status&order=created_at.asc&limit=50");
  const pwItems = workersPending.map(function (r) {
    return { name: r.display_name || r.email || "(unnamed)", tier: r.tier_suggestion || "?", hours: hoursSince(r.created_at) || 0 };
  });
  const pwOverdue = pwItems.filter(function (x) { return x.hours > 7 * 24; }).length;

  // 3. stuck . milestone stuck >72h + arbitration pending
  const milestonesStuck = await q("contract_milestones?status=in.(submitted,in_review,disputed)&select=id,title,milestone_number,status,updated_at&order=updated_at.asc&limit=30");
  const arbitrationPending = await q("arbitration_cases?status=eq.pending&select=id,milestone_id,position_deadline,triggered_at&order=triggered_at.asc&limit=30");
  const stuckItems: Array<{ type: string; label: string; hours: number | null }> = [];
  for (const m of milestonesStuck) {
    const h = hoursSince(m.updated_at);
    if (h != null && h > 72) stuckItems.push({ type: "milestone", label: (m.title || ("Milestone " + m.milestone_number)) + " (" + m.status + ")", hours: h });
  }
  for (const a of arbitrationPending) {
    stuckItems.push({ type: "arbitration", label: "arbitration " + String(a.id).slice(0, 8) + " pending", hours: hoursSince(a.triggered_at) });
  }

  // 4. commission reconcile (Edward correction: read commission_records . 代收代付)
  const commRecords = await q("commission_records?select=id,contract_id,event_type,amount_ntd,paid_at,created_at&order=paid_at.desc&limit=200");
  const clientPaid = commRecords.filter(function (r) { return r.event_type === "client_paid"; });
  const workerPaidOut = commRecords.filter(function (r) { return r.event_type === "worker_paid_out"; });
  const commCollected = commRecords.filter(function (r) { return r.event_type === "commission_collected"; });
  const clientPaidTotal = clientPaid.reduce(function (sum, r) { return sum + (r.amount_ntd || 0); }, 0);
  const paidContracts = new Set(clientPaid.map(function (r) { return r.contract_id; }));
  const paidOutContracts = new Set(workerPaidOut.map(function (r) { return r.contract_id; }));
  const collectedContracts = new Set(commCollected.map(function (r) { return r.contract_id; }));
  let awaitingPayout = 0;
  let awaitingCommission = 0;
  const commItems: Array<{ contract: string; event: string; amount: number; days: number }> = [];
  for (const cid of paidContracts) {
    if (!paidOutContracts.has(cid)) {
      awaitingPayout++;
      const rec = clientPaid.find(function (r) { return r.contract_id === cid; });
      const days = rec ? Math.floor((hoursSince(rec.paid_at || rec.created_at) || 0) / 24) : 0;
      commItems.push({ contract: String(cid).slice(0, 8), event: "client_paid then awaiting payout to worker", amount: rec ? (rec.amount_ntd || 0) : 0, days: days });
    }
  }
  for (const cid of paidOutContracts) {
    if (!collectedContracts.has(cid)) {
      awaitingCommission++;
      const rec = workerPaidOut.find(function (r) { return r.contract_id === cid; });
      const days = rec ? Math.floor((hoursSince(rec.paid_at || rec.created_at) || 0) / 24) : 0;
      commItems.push({ contract: String(cid).slice(0, 8), event: "worker_paid_out then awaiting commission back", amount: 0, days: days });
    }
  }

  // 5. anomaly . last-24h spike
  const intakes24h = (await q("client_intakes?created_at=gte." + since24h + "&select=id")).length;
  const workers24h = (await q("worker_applications?created_at=gte." + since24h + "&select=id")).length;
  const anomalyFlags: string[] = [];
  if (intakes24h >= 20) anomalyFlags.push("last 24h " + intakes24h + " intakes (abnormally high . possible spam)");
  if (workers24h >= 20) anomalyFlags.push("last 24h " + workers24h + " worker applications (abnormally high . possible spam)");

  // 6. supply-demand imbalance
  const approvedWorkers = await q("worker_applications?status=in.(approved,tier_b,tier_b_plus)&select=id,verticals&limit=200");
  const supplySet = new Set<string>();
  for (const w of approvedWorkers) {
    const vs = Array.isArray(w.verticals) ? w.verticals : [];
    for (const v of vs) if (v) supplySet.add(String(v));
  }
  const demandSet = new Set<string>();
  for (const r of intakesPending) if (r.vertical) demandSet.add(String(r.vertical));
  const gaps: string[] = [];
  for (const d of demandSet) {
    if (!supplySet.has(d)) gaps.push("vertical [" + d + "] has client demand but no approved worker in pool");
  }

  return {
    pendingMatch: { count: intakesPending.length, overdue: pmOverdue, items: pmItems.slice(0, 10) },
    pendingWorkers: { count: workersPending.length, overdue: pwOverdue, items: pwItems.slice(0, 10) },
    stuck: { milestonesStuck: stuckItems.filter(function (x) { return x.type === "milestone"; }).length, arbitrationPending: arbitrationPending.length, items: stuckItems.slice(0, 10) },
    commission: { clientPaidCount: clientPaid.length, clientPaidTotal: clientPaidTotal, awaitingPayout: awaitingPayout, awaitingCommission: awaitingCommission, items: commItems.slice(0, 10) },
    anomaly: { intakes24h: intakes24h, workers24h: workers24h, flags: anomalyFlags },
    supplyDemand: { approvedWorkers: approvedWorkers.length, demandVerticals: Array.from(demandSet), supplyVerticals: Array.from(supplySet), gaps: gaps },
    generatedAt: now.toISOString(),
  };
}

// ============================================================
// LLM layer . one Anthropic call . snapshot to human-readable 5-section digest
// Prompt in English (avoids encoding issues) . instructs model to OUTPUT in Traditional Chinese
// ============================================================
interface ClaudeResp { content?: Array<{ text?: string }>; error?: { message?: string }; }

const DIGEST_SYSTEM = [
  "You are the operations assistant for BeyondPath, a curated AI-talent marketplace.",
  "Every morning you read the platform backend data and write a daily ops briefing for the founder Edward.",
  "Edward is a non-technical solo founder running the whole platform alone.",
  "He needs: what to do today, what is about to break, is the platform healthy.",
  "",
  "MONEY FLOW (important): the platform uses personal-account escrow.",
  "client_paid = client paid money into Edward account.",
  "awaitingPayout = client paid but Edward has NOT yet transferred the net amount to the worker (Edward should pay the worker).",
  "awaitingCommission = Edward paid the worker but the commission has not been collected back yet.",
  "",
  "OUTPUT FORMAT (strict . JSON only . NO markdown wrapper . all human-facing strings MUST be in Traditional Chinese):",
  "{",
  "  \"summary\": \"one-line summary of platform state today, <=40 chars, natural like a colleague saying good morning\",",
  "  \"actions\": [ { \"priority\": 1, \"text\": \"concrete action, verb-first, <=30 chars\", \"why\": \"why urgent, <=20 chars\" } ],",
  "  \"snapshot\": \"platform status snapshot, 2-3 sentences: pending match X / pending review Y / money Z / supply-demand\",",
  "  \"alerts\": [ \"anomaly alerts, empty array if none\" ],",
  "  \"quiet\": \"if nothing urgent today, one reassuring sentence for Edward. If there ARE urgent items, empty string\"",
  "}",
  "",
  "RULES:",
  "- actions max 5 items, sorted by urgency (overdue first), empty array if nothing to do",
  "- any overdue item MUST appear in actions, state how many days it has been waiting",
  "- if money awaitingPayout > 0, remind Edward to pay the worker (worker is waiting)",
  "- if supply-demand gaps is non-empty, remind to recruit workers in that vertical (mid-term, low priority)",
  "- tone: a reliable ops colleague, no fluff, no exclamation-mark spam, only tense when it should be",
].join("\n");

async function callClaude(snapshot: OpsSnapshot): Promise<any | null> {
  if (!ANTHROPIC_API_KEY) return null;
  const userMsg = "Today platform backend data (JSON):\n\n" + JSON.stringify(snapshot, null, 2) + "\n\nProduce today ops briefing per the format. All human-facing strings in Traditional Chinese.";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 1500, system: DIGEST_SYSTEM, messages: [{ role: "user", content: userMsg }] }),
    });
    if (!res.ok) { console.warn("anthropic http", res.status); return null; }
    const data = (await res.json()) as ClaudeResp;
    if (data.error) { console.warn("anthropic err", data.error.message); return null; }
    const text = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : "";
    try {
      const cleaned = text.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
      return JSON.parse(cleaned);
    } catch (_pe) {
      console.warn("digest non-json", text.slice(0, 160));
      return null;
    }
  } catch (e) {
    console.warn("anthropic fetch fail", String(e));
    return null;
  }
}

// Email layer . digest HTML (dark theme) + raw fallback . labels English . LLM content Chinese (runtime)
function esc(s: unknown): string {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildDigestHtml(brief: any, snap: OpsSnapshot): string {
  const summary = (brief && brief.summary) ? String(brief.summary) : "BeyondPath daily ops";
  const actions = (brief && Array.isArray(brief.actions)) ? brief.actions : [];
  const snapshot = (brief && brief.snapshot) ? String(brief.snapshot) : "";
  const alerts = (brief && Array.isArray(brief.alerts)) ? brief.alerts : [];
  const quiet = (brief && brief.quiet) ? String(brief.quiet) : "";

  const actionsHtml = actions.length ? actions.map(function (a: any, i: number) {
    const p = a.priority != null ? a.priority : (i + 1);
    const why = a.why ? ("<span style=\"color:#9a9aa3;font-size:12px;\"> . " + esc(a.why) + "</span>") : "";
    return "<tr><td style=\"padding:8px 0;border-bottom:1px dashed #2a2a2e;vertical-align:top;\">" +
      "<span style=\"display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#d4712a;color:#0a0a0b;font-weight:700;font-size:12px;border-radius:4px;margin-right:10px;\">" + esc(p) + "</span>" +
      "<span style=\"color:#f0eee8;font-size:14px;\">" + esc(a.text || "") + "</span>" + why + "</td></tr>";
  }).join("") : "<tr><td style=\"padding:8px 0;color:#9a9aa3;font-size:14px;\">No action items today.</td></tr>";

  const alertsHtml = alerts.length ? ("<div style=\"margin:18px 0;padding:12px 16px;background:rgba(217,74,74,0.08);border-left:2px solid #d94a4a;\">" +
    "<div style=\"color:#d94a4a;font-weight:700;font-size:12px;letter-spacing:0.1em;margin-bottom:6px;\">ALERTS</div>" +
    alerts.map(function (x: any) { return "<div style=\"color:#f0eee8;font-size:13px;line-height:1.6;\">. " + esc(x) + "</div>"; }).join("") + "</div>") : "";

  const quietHtml = quiet ? ("<div style=\"margin:16px 0;padding:12px 16px;background:rgba(199,232,74,0.05);border-left:2px solid #c7e84a;color:#c8c6c0;font-size:13px;line-height:1.7;font-style:italic;\">" + esc(quiet) + "</div>") : "";

  const statRow = function (label: string, value: string) {
    return "<tr><td style=\"padding:5px 0;color:#9a9aa3;font-size:12px;width:160px;\">" + esc(label) + "</td><td style=\"padding:5px 0;color:#f0eee8;font-size:13px;\">" + esc(value) + "</td></tr>";
  };
  const moneyLine = "paid NT$" + snap.commission.clientPaidTotal + " . awaiting payout " + snap.commission.awaitingPayout + " . awaiting commission " + snap.commission.awaitingCommission;
  const statsHtml = "<table style=\"width:100%;border-collapse:collapse;\">" +
    statRow("pending match", snap.pendingMatch.count + " (overdue " + snap.pendingMatch.overdue + ")") +
    statRow("pending worker", snap.pendingWorkers.count + " (overdue " + snap.pendingWorkers.overdue + ")") +
    statRow("stuck / arbitration", snap.stuck.milestonesStuck + " milestone . " + snap.stuck.arbitrationPending + " arbitration") +
    statRow("money", moneyLine) +
    statRow("approved worker", String(snap.supplyDemand.approvedWorkers)) +
    "</table>";

  return "<!DOCTYPE html><html lang=\"zh-Hant\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>BeyondPath daily ops</title></head>" +
    "<body style=\"font-family:system-ui,sans-serif;background:#0a0a0b;color:#f0eee8;margin:0;padding:32px 20px;\">" +
    "<div style=\"max-width:560px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:32px 28px;\">" +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.16em;color:#c7e84a;margin-bottom:14px;\">BEYONDPATH . DAILY OPS BRIEFING</div>" +
    "<div style=\"font-size:19px;font-weight:700;color:#f0eee8;line-height:1.45;margin-bottom:18px;font-family:Georgia,serif;\">" + esc(summary) + "</div>" +
    quietHtml +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.12em;color:#d4712a;margin:22px 0 8px;\">TODO</div>" +
    "<table style=\"width:100%;border-collapse:collapse;\">" + actionsHtml + "</table>" +
    alertsHtml +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.12em;color:#9a9aa3;margin:22px 0 8px;\">STATUS</div>" +
    (snapshot ? "<div style=\"color:#c8c6c0;font-size:13px;line-height:1.7;margin-bottom:10px;\">" + esc(snapshot) + "</div>" : "") +
    statsHtml +
    "<div style=\"margin-top:24px;\"><a href=\"" + esc(ADMIN_URL) + "\" style=\"display:inline-block;background:#c7e84a;color:#0a0a0b;padding:10px 24px;font-family:monospace;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;\">open admin console</a></div>" +
    "<hr style=\"border:none;border-top:1px solid #2a2a2e;margin:24px 0 14px;\"/>" +
    "<p style=\"color:#6a6a72;font-size:10px;font-family:monospace;letter-spacing:0.04em;margin:0;\">BeyondPath AI ops assistant . generated " + esc(snap.generatedAt) + " . admin-only</p>" +
    "</div></body></html>";
}


// Raw fallback . LLM unavailable -> plain digest from snapshot (no narrative, just numbers)
function buildRawDigestHtml(snap: OpsSnapshot): string {
  const pm = snap.pendingMatch, pw = snap.pendingWorkers, st = snap.stuck, cm = snap.commission, an = snap.anomaly, sd = snap.supplyDemand;
  const lines: string[] = [];
  lines.push("pending match: " + pm.count + " (overdue " + pm.overdue + ")");
  lines.push("pending worker review: " + pw.count + " (overdue " + pw.overdue + ")");
  lines.push("stuck milestone: " + st.milestonesStuck + " . arbitration pending: " + st.arbitrationPending);
  lines.push("money: client_paid " + cm.clientPaidCount + " (NT$" + cm.clientPaidTotal + ") . awaiting payout " + cm.awaitingPayout + " . awaiting commission " + cm.awaitingCommission);
  lines.push("approved worker: " + sd.approvedWorkers);
  if (an.flags.length) for (const f of an.flags) lines.push("ALERT: " + f);
  if (sd.gaps.length) for (const g of sd.gaps) lines.push("SUPPLY GAP: " + g);
  const rows = lines.map(function (l) { return "<div style=\"color:#f0eee8;font-size:13px;line-height:1.8;font-family:monospace;\">. " + esc(l) + "</div>"; }).join("");
  return "<!DOCTYPE html><html lang=\"zh-Hant\"><head><meta charset=\"utf-8\"></head>" +
    "<body style=\"font-family:system-ui,sans-serif;background:#0a0a0b;color:#f0eee8;margin:0;padding:32px 20px;\">" +
    "<div style=\"max-width:560px;margin:0 auto;background:#141416;border:1px solid #2a2a2e;padding:32px 28px;\">" +
    "<div style=\"font-family:monospace;font-size:10px;letter-spacing:0.16em;color:#c7e84a;margin-bottom:14px;\">BEYONDPATH . DAILY OPS (RAW . NO AI)</div>" +
    "<div style=\"font-size:15px;font-weight:700;color:#f0eee8;margin-bottom:18px;font-family:Georgia,serif;\">AI summary unavailable . showing raw numbers</div>" +
    rows +
    "<div style=\"margin-top:24px;\"><a href=\"" + esc(ADMIN_URL) + "\" style=\"display:inline-block;background:#c7e84a;color:#0a0a0b;padding:10px 24px;font-family:monospace;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;\">open admin console</a></div>" +
    "<hr style=\"border:none;border-top:1px solid #2a2a2e;margin:24px 0 14px;\"/>" +
    "<p style=\"color:#6a6a72;font-size:10px;font-family:monospace;margin:0;\">BeyondPath AI ops assistant . generated " + esc(snap.generatedAt) + " . admin-only</p>" +
    "</div></body></html>";
}

// Email layer . send via Resend . fail-soft: no RESEND_API_KEY -> silent log (return false)
async function sendDigestEmail(html: string, subject: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log("[digest] no RESEND_API_KEY . skipping email send (silent log fallback)");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to: [EDWARD_EMAIL], subject: subject, html: html }),
    });
    if (!res.ok) {
      console.error("[digest] resend send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[digest] resend fetch error:", String(e));
    return false;
  }
}

function subjectLine(brief: any, snap: OpsSnapshot): string {
  const urgent = snap.pendingMatch.overdue + snap.pendingWorkers.overdue + snap.stuck.arbitrationPending + snap.commission.awaitingPayout;
  const tag = urgent > 0 ? ("[" + urgent + " need action] ") : "[all clear] ";
  const s = (brief && brief.summary) ? String(brief.summary).slice(0, 40) : "daily ops";
  return "BeyondPath ops . " + tag + s;
}

// HTTP handler . cron-only . CRON_SECRET gate (fail-closed on auth, fail-soft on data)
function authorized(req: Request, url: URL): boolean {
  const auth = req.headers.get("Authorization") || "";
  if (SUPABASE_SERVICE_ROLE_KEY && auth === ("Bearer " + SUPABASE_SERVICE_ROLE_KEY)) return true;
  if (CRON_SECRET) {
    const qs = url.searchParams.get("secret") || "";
    const hd = req.headers.get("x-cron-secret") || "";
    if (qs === CRON_SECRET || hd === CRON_SECRET) return true;
    return false;
  }
  return false;
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization, x-cron-secret, apikey" } });
  }
  if (!authorized(req, url)) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized . daily-ops-digest is cron-only" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const dryRun = url.searchParams.get("dry") === "1";
  try {
    const snapshot = await scanPlatform();
    const brief = await callClaude(snapshot);
    const html = brief ? buildDigestHtml(brief, snapshot) : buildRawDigestHtml(snapshot);
    const subject = subjectLine(brief, snapshot);
    if (dryRun) {
      return new Response(JSON.stringify({ ok: true, dryRun: true, hasBrief: !!brief, subject: subject, snapshot: snapshot }, null, 2), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    const sent = await sendDigestEmail(html, subject);
    return new Response(JSON.stringify({ ok: true, sent: sent, hasBrief: !!brief, subject: subject, generatedAt: snapshot.generatedAt }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[digest] fatal:", String(e));
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});

/* ============================================================
   CRON SETUP (for Sophie . pick ONE) . 09:00 TST = 01:00 UTC

   --- Option A . pg_cron + pg_net (Supabase SQL editor) ---
   create extension if not exists pg_cron;
   create extension if not exists pg_net;
   select cron.schedule(
     'daily-ops-digest',
     '0 1 * * *',
     $CRON$
     select net.http_post(
       url    := 'https://<PROJECT_REF>.supabase.co/functions/v1/daily-ops-digest',
       headers:= jsonb_build_object('Authorization','Bearer ' || '<SERVICE_ROLE_KEY>','Content-Type','application/json'),
       body   := '{}'::jsonb
     );
     $CRON$
   );
   -- remove: select cron.unschedule('daily-ops-digest');

   --- Option B . external cron (cron-job.org / GitHub Actions) ---
   -- set CRON_SECRET secret, then GET daily:
   --   GET https://<PROJECT_REF>.supabase.co/functions/v1/daily-ops-digest?secret=<CRON_SECRET>

   --- Edge Function secrets ---
   --   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto)
   --   ANTHROPIC_API_KEY      (optional . absent -> raw digest)
   --   ANTHROPIC_DIGEST_MODEL (optional . default claude-sonnet-4-6)
   --   RESEND_API_KEY         (optional . absent -> silent log)
   --   RESEND_FROM            (optional . default BeyondPath <hello@beyondpath.tw>)
   --   EDWARD_NOTIFY_EMAIL    (optional . default edwardt0303@gmail.com)
   --   CRON_SECRET            (required only for Option B)
   ============================================================ */
