// BeyondPath v1.0 . Edge Function . upload-deliverable
// Phase 3+ . 2026-05-28 calcifer . 件 A 交付檔案管理
//
// Spec:
//   POST { milestone_id, role, file_base64, file_name, mime_type, description?, token }
//   verify contract-jwt . IP rate limit . file <= 100MB . milestone pack <= 500MB
//   upload to Storage deliverables/<contract_id>/<milestone_id>/v<N>/<file_name>
//   SHA-256 + insert milestone_deliverables + notify the other side

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyContractToken, sha256Hex, signContractToken } from "../_shared/contract-jwt.ts";
import { notifyEdward } from "../_shared/notify-edward.ts";  // 2026-05-31 calcifer . doc 37 gap 2 . worker delivers -> Edward confirm

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";
const STORAGE_BUCKET = "deliverables";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, apikey",
};

const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_MILESTONE_TOTAL_BYTES = 500 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MIN = 15;
const RATE_LIMIT_MAX_FAILS = 10;

const ALLOWED_MIME_PREFIX = ["image/", "video/", "text/"];
const ALLOWED_MIME_EXACT = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/zip",
  "application/x-zip-compressed",
  "application/json",
  "application/x-tar",
  "application/gzip",
];

function isMimeAllowed(mime: string): boolean {
  for (const p of ALLOWED_MIME_PREFIX) if (mime.startsWith(p)) return true;
  return ALLOWED_MIME_EXACT.indexOf(mime) >= 0;
}

function authHeaders(): Record<string, string> {
  return {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}

function jsonRes(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function getClientIp(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function decodeBase64(b64: string): Uint8Array | null {
  let s = b64;
  const comma = s.indexOf(",");
  if (s.startsWith("data:") && comma > 0) s = s.slice(comma + 1);
  try {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch { return null; }
}

function safeName(name: string): string {
  let n = name.replace(/[\/\:]/g, "_").replace(/\.\./g, "_");
  if (n.length > 180) n = n.slice(0, 180);
  return n || "file";
}

async function recordAttempt(ip: string, ok: boolean, reason: string | null, ua: string): Promise<void> {
  try {
    await fetch(SUPABASE_URL + "/rest/v1/signature_attempts", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ ip, ok, fail_reason: reason ? "upload-deliverable: " + reason : null, ua: ua.slice(0, 200) }),
    });
  } catch (e) { console.warn("recordAttempt failed", e); }
}

async function checkRateLimit(ip: string): Promise<{ blocked: boolean; fails: number }> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60 * 1000).toISOString();
  const url = SUPABASE_URL + "/rest/v1/signature_attempts?ip=eq." + encodeURIComponent(ip) + "&ok=eq.false&created_at=gte." + encodeURIComponent(since) + "&select=id";
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return { blocked: false, fails: 0 };
    const rows = await res.json();
    const fails = Array.isArray(rows) ? rows.length : 0;
    return { blocked: fails >= RATE_LIMIT_MAX_FAILS, fails };
  } catch { return { blocked: false, fails: 0 }; }
}

async function getMilestoneAndContract(milestoneId: string): Promise<{ milestone: any; contract: any } | null> {
  const mRes = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + milestoneId + "&select=*", { headers: authHeaders() });
  const mRows = await mRes.json();
  if (!Array.isArray(mRows) || mRows.length === 0) return null;
  const m = mRows[0];
  const cRes = await fetch(SUPABASE_URL + "/rest/v1/contracts?id=eq." + m.contract_id + "&select=*", { headers: authHeaders() });
  const cRows = await cRes.json();
  if (!Array.isArray(cRows) || cRows.length === 0) return null;
  return { milestone: m, contract: cRows[0] };
}

async function getMilestoneTotalSize(milestoneId: string): Promise<number> {
  const url = SUPABASE_URL + "/rest/v1/milestone_deliverables?milestone_id=eq." + milestoneId + "&select=file_size";
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return 0;
    const rows = await res.json();
    if (!Array.isArray(rows)) return 0;
    let total = 0;
    for (const r of rows) total += Number(r.file_size) || 0;
    return total;
  } catch { return 0; }
}

async function getLatestVersion(milestoneId: string): Promise<number> {
  const url = SUPABASE_URL + "/rest/v1/milestone_deliverables?milestone_id=eq." + milestoneId + "&select=version_number&order=version_number.desc&limit=1";
  try {
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) return 0;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return 0;
    return Number(rows[0].version_number) || 0;
  } catch { return 0; }
}

async function uploadToStorage(contractId: string, milestoneId: string, versionNum: number, fileName: string, bytes: Uint8Array, mime: string): Promise<string | null> {
  const path = contractId + "/" + milestoneId + "/v" + versionNum + "/" + fileName;
  const uploadUrl = SUPABASE_URL + "/storage/v1/object/" + STORAGE_BUCKET + "/" + path;
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": mime,
      "x-upsert": "true",
    },
    body: bytes,
  });
  if (!res.ok) {
    console.error("storage upload failed", res.status, await res.text());
    return null;
  }
  return path;
}

async function sendNotificationEmail(contract: any, milestone: any, uploadRole: string, fileName: string, versionNum: number): Promise<void> {
  if (!RESEND_API_KEY) return;
  const snap = contract.contract_snapshot || {};
  const recipient = uploadRole === "worker"
    ? { email: snap.client_email, name: snap.client_name || "Client", role: "client" as const }
    : { email: snap.worker_email, name: snap.worker_name || "Worker", role: "worker" as const };
  if (!recipient.email) return;

  const tok = await signContractToken({ contract_id: contract.id, role: recipient.role }, JWT_SECRET, 14 * 24 * 3600);
  const url = PUBLIC_SITE_BASE + "/milestone-detail.html?contract_id=" + contract.id + "&milestone_id=" + milestone.id + "&token=" + tok;

  const css = "font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px";
  const btnCss = "display:inline-block;padding:12px 24px;background:#4ade80;color:#fff;text-decoration:none;border-radius:6px;font-weight:600";
  const ucName = uploadRole === "worker" ? (snap.worker_name || "Worker") : (snap.client_name || "Client");
  const subject = "BeyondPath . Deliverable uploaded . " + (milestone.title || "Milestone " + milestone.milestone_number);
  const html =
    "<!doctype html><html><body style=\"" + css + "\">" +
    "<h2 style=\"border-bottom:2px solid #4ade80;padding-bottom:8px\">BeyondPath . Other side uploaded a deliverable</h2>" +
    "<p>" + recipient.name + ",</p>" +
    "<p><strong>" + ucName + "</strong> uploaded " + (versionNum > 1 ? ("v" + versionNum + " ") : "") + "deliverable:</p>" +
    "<ul>" +
    "<li>Contract: <code>" + contract.id.slice(0, 8) + "</code></li>" +
    "<li>Milestone: " + (milestone.title || "Milestone " + milestone.milestone_number) + "</li>" +
    "<li>File: <code>" + fileName + "</code></li>" +
    "<li>Version: v" + versionNum + "</li>" +
    "</ul>" +
    "<p style=\"margin:20px 0\"><a href=\"" + url + "\" style=\"" + btnCss + "\">View deliverable + download (14 days)</a></p>" +
    "<hr><p style=\"font-size:11px;color:#999\">BeyondPath v1.0 . Phase 3+ deliverable management</p>" +
    "</body></html>";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: RESEND_FROM, to: [recipient.email], subject, html }),
    });
  } catch (e) { console.warn("notification email failed", e); }
}

interface ReqBody {
  milestone_id: string;
  role: "worker" | "client";
  file_base64: string;
  file_name: string;
  mime_type: string;
  description?: string;
  token: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") || "";

  const rl = await checkRateLimit(ip);
  if (rl.blocked) return jsonRes({ ok: false, error: "rate limit: too many failed attempts from this IP" }, 429);

  if (!JWT_SECRET) return jsonRes({ ok: false, error: "JWT_SECRET not configured" }, 500);

  let body: ReqBody;
  try { body = await req.json(); } catch {
    await recordAttempt(ip, false, "bad body", ua);
    return jsonRes({ ok: false, error: "bad body" }, 400);
  }

  if (!body.milestone_id || !body.role || !body.file_base64 || !body.file_name || !body.mime_type || !body.token) {
    await recordAttempt(ip, false, "missing fields", ua);
    return jsonRes({ ok: false, error: "milestone_id + role + file_base64 + file_name + mime_type + token required" }, 400);
  }
  if (body.role !== "worker" && body.role !== "client") {
    await recordAttempt(ip, false, "bad role", ua);
    return jsonRes({ ok: false, error: "role must be worker or client" }, 400);
  }
  if (!isMimeAllowed(body.mime_type)) {
    await recordAttempt(ip, false, "mime not allowed: " + body.mime_type, ua);
    return jsonRes({ ok: false, error: "mime type not allowed (use external link instead)", mime: body.mime_type }, 415);
  }

  const payload = await verifyContractToken(body.token, JWT_SECRET);
  if (!payload) {
    await recordAttempt(ip, false, "invalid token", ua);
    return jsonRes({ ok: false, error: "invalid or expired token" }, 401);
  }
  if (payload.role !== body.role) {
    await recordAttempt(ip, false, "token role mismatch", ua);
    return jsonRes({ ok: false, error: "token role does not match request role" }, 403);
  }

  const mc = await getMilestoneAndContract(body.milestone_id);
  if (!mc) {
    await recordAttempt(ip, false, "milestone not found", ua);
    return jsonRes({ ok: false, error: "milestone not found" }, 404);
  }
  if (mc.milestone.contract_id !== payload.contract_id) {
    await recordAttempt(ip, false, "milestone not in token contract", ua);
    return jsonRes({ ok: false, error: "milestone does not belong to token contract" }, 403);
  }

  if (mc.milestone.archived_at) {
    await recordAttempt(ip, false, "milestone archived", ua);
    return jsonRes({ ok: false, error: "milestone archived (30d after approval)" }, 410);
  }

  const bytes = decodeBase64(body.file_base64);
  if (!bytes) {
    await recordAttempt(ip, false, "bad base64", ua);
    return jsonRes({ ok: false, error: "invalid base64" }, 400);
  }
  if (bytes.length > MAX_FILE_BYTES) {
    await recordAttempt(ip, false, "file too large", ua);
    return jsonRes({ ok: false, error: "file too large (max 100 MB, use external link for larger)" }, 413);
  }

  const existingTotal = await getMilestoneTotalSize(body.milestone_id);
  if (existingTotal + bytes.length > MAX_MILESTONE_TOTAL_BYTES) {
    await recordAttempt(ip, false, "milestone total size exceeded", ua);
    return jsonRes({ ok: false, error: "milestone total exceeds 500 MB cap (current: " + Math.round(existingTotal / 1024 / 1024) + " MB)" }, 413);
  }

  const fileName = safeName(body.file_name);
  const sha = await sha256Hex(bytes);

  let versionNum = 1;
  if (body.role === "worker") {
    const latest = await getLatestVersion(body.milestone_id);
    if (mc.milestone.status === "disputed") {
      versionNum = latest + 1;
    } else {
      versionNum = latest > 0 ? latest : 1;
    }
  } else {
    const latest = await getLatestVersion(body.milestone_id);
    versionNum = latest > 0 ? latest : 1;
  }

  const storagePath = await uploadToStorage(payload.contract_id, body.milestone_id, versionNum, fileName, bytes, body.mime_type);
  if (!storagePath) {
    await recordAttempt(ip, false, "storage upload failed", ua);
    return jsonRes({ ok: false, error: "storage upload failed" }, 500);
  }

  const signRes = await fetch(SUPABASE_URL + "/storage/v1/object/sign/" + STORAGE_BUCKET + "/" + storagePath, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ expiresIn: 7 * 24 * 3600 }),
  });
  if (!signRes.ok) {
    await recordAttempt(ip, false, "sign url failed", ua);
    return jsonRes({ ok: false, error: "sign url failed" }, 500);
  }
  const signed = await signRes.json();
  const signedPath = signed.signedURL || signed.signedUrl;
  const fileUrl = SUPABASE_URL + "/storage/v1" + signedPath;

  const insertRes = await fetch(SUPABASE_URL + "/rest/v1/milestone_deliverables", {
    method: "POST",
    headers: { ...authHeaders(), "Prefer": "return=representation" },
    body: JSON.stringify({
      milestone_id: body.milestone_id,
      file_url: fileUrl,
      file_name: fileName,
      file_size: bytes.length,
      mime_type: body.mime_type,
      sha256: sha,
      uploaded_by_role: body.role,
      uploaded_by_ip: ip,
      version_number: versionNum,
      description: body.description || null,
    }),
  });
  if (!insertRes.ok) {
    const errTxt = await insertRes.text();
    console.error("deliverable insert failed", errTxt);
    await recordAttempt(ip, false, "db insert failed", ua);
    return jsonRes({ ok: false, error: "db insert failed", detail: errTxt.slice(0, 200) }, 500);
  }
  const insertRows = await insertRes.json();
  const deliverable = Array.isArray(insertRows) ? insertRows[0] : null;

  fetch(SUPABASE_URL + "/rest/v1/contract_milestones_history", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      milestone_id: body.milestone_id,
      action: "deliver",
      action_by_role: body.role,
      action_by_ip: ip,
      attempt_number: versionNum,
      notes: body.description || null,
      metadata: { file_name: fileName, sha256: sha, size: bytes.length },
    }),
  }).catch((e) => console.warn("history insert failed", e));

  if (body.role === "worker" && (mc.milestone.status === "pending" || mc.milestone.status === "in_progress" || mc.milestone.status === "disputed")) {
    fetch(SUPABASE_URL + "/rest/v1/contract_milestones?id=eq." + body.milestone_id, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status: "delivered", delivered_at: new Date().toISOString(), attempts: versionNum }),
    }).catch((e) => console.warn("milestone status update failed", e));
    // 2026-05-31 calcifer . doc 37 gap 2 . worker 上傳交付物 -> 里程碑進 delivered -> 通知 Edward 確認驗收
    //   (此處才是 worker-driven 交付事件 . update-milestone-status 是 admin-only Edward 自己標 . 不在那通知)
    const _snap = mc.contract.contract_snapshot || {};
    notifyEdward("milestone_delivered", {
      title: (mc.milestone.title || ("Milestone " + mc.milestone.milestone_number)) + " . " + (_snap.worker_name || "worker"),
      milestoneTitle: mc.milestone.title || ("Milestone " + mc.milestone.milestone_number),
      workerName: _snap.worker_name || null,
      clientName: _snap.client_name || null,
      contractId: mc.contract.id || null,
    }).catch(function () {});
  }

  sendNotificationEmail(mc.contract, mc.milestone, body.role, fileName, versionNum).catch((e) => console.warn("notify email failed", e));

  await recordAttempt(ip, true, null, ua);

  return jsonRes({
    ok: true,
    deliverable_id: deliverable?.id,
    version_number: versionNum,
    sha256: sha,
    file_size: bytes.length,
    total_size_bytes: existingTotal + bytes.length,
    file_url: fileUrl,
  });
});
