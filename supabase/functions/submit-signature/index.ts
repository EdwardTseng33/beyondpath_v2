// BeyondPath POC . Edge Function . submit-signature
// C-1 Phase 2 . 2026-05-28 calcifer . Edward continue-dev wave
//
// Spec:
//   POST { contract_id, role, signature_base64, token }
//   verify JWT (contract-jwt . kind:contract_sign . role match)
//   IP rate limit: same IP fail 5 / 15min . block (sulima 5/28 14:45 must-have)
//   upload signature image to Storage contracts/<contract_id>/<role>-signature.<ext>
//   SHA-256 hash (image bytes + system timestamp)
//   update contracts row: ${role}_signature_url + ${role}_signed_at + ip + signature_hash if complete
//   if both signed -> status=complete + final signature_hash + email both
//   return { ok, contract_status, signed_at, contract_id }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { verifyContractToken, sha256Hex } from "../_shared/contract-jwt.ts";
import { notifyEdward } from "../_shared/notify-edward.ts";  // 2026-05-31 calcifer . doc 37 gap 2 . contract both-signed -> Edward email
import { timestampSha256Hex } from "../_shared/rfc3161-tsa.ts";  // 2026-06-01 calcifer . sulima doc 45 . RFC3161 第三方時間戳 (freeTSA 零成本)

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";
const STORAGE_BUCKET = "contracts";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, apikey",
};

const RATE_LIMIT_WINDOW_MIN = 15;
const RATE_LIMIT_MAX_FAILS = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

function detectImageMime(bytes: Uint8Array): string | null {
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return "image/png";
  if (bytes.length > 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return "image/jpeg";
  if (bytes.length > 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  if (bytes.length > 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  if (bytes.length > 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return "image/heic";
  return null;
}

function decodeBase64Image(b64: string): Uint8Array | null {
  let s = b64;
  const comma = s.indexOf(",");
  if (s.startsWith("data:") && comma > 0) s = s.slice(comma + 1);
  try {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

// 2026-06-01 calcifer . sulima doc 45 . 雙方簽完 -> 對 final signature_hash 取 RFC3161 時間戳 -> best-effort 存回
// 獨立 PATCH . 欄位不存在 / TSA 不可用 都不擋簽約 (fail-soft) . 需要 DB 先有 tsa_token/tsa_url/tsa_at 欄位
async function stampAndStore(contractId: string, finalHash: string): Promise<void> {
  try {
    const r = await timestampSha256Hex(finalHash);
    if (!r.ok || !r.token_b64) { console.warn("[tsa] timestamp skipped:", r.error || "unknown"); return; }
    const upd = await fetch(SUPABASE_URL + "/rest/v1/contracts?id=eq." + contractId, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ tsa_token: r.token_b64, tsa_url: r.tsa_url, tsa_at: r.tsa_at }),
    });
    if (!upd.ok) {
      // 多半是欄位未建 . 不擋簽約 . 留 log 提醒上線前 ALTER TABLE
      console.warn("[tsa] store failed (tsa_* columns may not exist yet):", upd.status, (await upd.text()).slice(0, 160));
    } else {
      console.log("[tsa] timestamp stored for contract", contractId);
    }
  } catch (e) {
    console.warn("[tsa] stampAndStore error:", String(e));
  }
}

async function recordAttempt(ip: string, contractId: string | null, ok: boolean, failReason: string | null, ua: string): Promise<void> {
  try {
    await fetch(SUPABASE_URL + "/rest/v1/signature_attempts", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        ip,
        contract_id: contractId,
        ok,
        fail_reason: failReason,
        ua: ua.slice(0, 200),
      }),
    });
  } catch (e) {
    console.warn("recordAttempt failed:", e);
  }
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
  } catch {
    return { blocked: false, fails: 0 };
  }
}

async function uploadSignature(contractId: string, role: string, bytes: Uint8Array, ext: string): Promise<string | null> {
  const path = "contracts/" + contractId + "/" + role + "-signature." + ext;
  const uploadUrl = SUPABASE_URL + "/storage/v1/object/" + STORAGE_BUCKET + "/" + path;
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "image/" + (ext === "jpg" ? "jpeg" : ext),
      "x-upsert": "true",
    },
    body: bytes,
  });
  if (!res.ok) {
    console.error("signature upload failed:", res.status, await res.text());
    return null;
  }
  const signUrl = SUPABASE_URL + "/storage/v1/object/sign/" + STORAGE_BUCKET + "/" + path;
  const signRes = await fetch(signUrl, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ expiresIn: 30 * 24 * 3600 }),
  });
  if (!signRes.ok) {
    console.error("sign url failed:", await signRes.text());
    return null;
  }
  const signed = await signRes.json();
  const signedPath = signed.signedURL || signed.signedUrl;
  if (!signedPath) return null;
  return SUPABASE_URL + "/storage/v1" + signedPath;
}

async function sendCompletionEmail(contract: any): Promise<void> {
  if (!RESEND_API_KEY) return;
  const snap = contract.contract_snapshot || {};
  const recipients: Array<{ email: string; name: string; role: string }> = [];
  if (snap.client_email) recipients.push({ email: snap.client_email, name: snap.client_name || "Client", role: "client" });
  if (snap.worker_email) recipients.push({ email: snap.worker_email, name: snap.worker_name || "Worker", role: "worker" });

  for (const r of recipients) {
    const subject = "BeyondPath . both-signed . evidence copy . Contract " + contract.id.slice(0, 8);
    const html = buildCompletionHtml(r.name, contract);
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + RESEND_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: RESEND_FROM, to: [r.email], subject, html }),
      });
    } catch (e) {
      console.warn("completion email send failed for " + r.email + ":", e);
    }
  }
}

function buildCompletionHtml(name: string, c: any): string {
  const pdfU = c.pdf_url || "";
  const clientSigU = c.client_signature_url || "";
  const workerSigU = c.worker_signature_url || "";
  const clientTs = c.client_signed_at || "-";
  const workerTs = c.worker_signed_at || "-";
  const sigHash = c.signature_hash || "-";
  const pdfHash = c.pdf_hash || "-";
  const contractId = c.id;

  return (
    "<!doctype html><html><body style=\"font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px\">" +
    "<h2 style=\"border-bottom:2px solid #4ade80;padding-bottom:8px\">BeyondPath . 雙方簽署完成 . 存證副本</h2>" +
    "<p>" + name + "，</p>" +
    "<p>合約 <code>" + contractId + "</code> 雙方已完成簽署 . 以下為完整存證：</p>" +
    "<ul>" +
    "<li><strong>合約 PDF</strong>：<a href=\"" + pdfU + "\">下載</a>（7 天 signed URL）</li>" +
    "<li><strong>發案方簽署</strong>：<a href=\"" + clientSigU + "\">查看簽署照</a> . " + clientTs + "</li>" +
    "<li><strong>接案者簽署</strong>：<a href=\"" + workerSigU + "\">查看簽署照</a> . " + workerTs + "</li>" +
    "<li><strong>SHA-256 完整 hash</strong>：<code style=\"font-size:11px;word-break:break-all\">" + sigHash + "</code></li>" +
    "<li><strong>PDF hash</strong>：<code style=\"font-size:11px;word-break:break-all\">" + pdfHash + "</code></li>" +
    "</ul>" +
    "<p style=\"background:#e7f5e7;padding:12px 16px;border-left:3px solid #4ade80\"><strong>查驗</strong>：任何人可至 <a href=\"" + PUBLIC_SITE_BASE + "/contract-verify.html\">contract-verify.html</a> 上傳 PDF + 輸入合約 ID 比對 hash 驗本機檔是否為平台正本</p>" +
    "<p style=\"background:#fffacd;padding:12px 16px;border-left:3px solid #c7e84a\"><strong>Beta POC 階段</strong>：本合約為配對紀錄與爭議解決依據 . BeyondPath 不取代法律公證</p>" +
    "<hr><p style=\"font-size:11px;color:#999\">BeyondPath Beta POC v0.2 . Contract Phase 2 (online sign + SHA-256)</p>" +
    "</body></html>"
  );
}

interface ReqBody {
  contract_id: string;
  role: "client" | "worker";
  signature_base64: string;
  token: string;
}

// 2026-05-29 calcifer . 輕量串里程碑 (doc 29 半自動 B . Edward 5/29 拍板)
//   B 邊界 (含上線) → M3 自動加「上線確認」 . 交付物順序均分到 M1/M2/M3
//   fetch 關聯 intake 拿 delivery_scope + deliverables . 任何步驟失敗退回純 30/30/40
async function seedDefaultMilestones(contractId, intakeId) {
  let deliverables = [];
  let scope = "A";
  try {
    if (intakeId) {
      const iRes = await fetch(SUPABASE_URL + "/rest/v1/client_intakes?id=eq." + encodeURIComponent(intakeId) + "&select=delivery_scope,intake_data", { headers: authHeaders() });
      if (iRes.ok) {
        const iRows = await iRes.json();
        const intake = Array.isArray(iRows) ? iRows[0] : null;
        if (intake) {
          scope = intake.delivery_scope || (intake.intake_data && intake.intake_data.expect && intake.intake_data.expect.deliveryScope) || "A";
          const badges = intake.intake_data && intake.intake_data.expect && intake.intake_data.expect.badges;
          if (Array.isArray(badges)) deliverables = badges.slice();
        }
      }
    }
  } catch (e) {
    console.warn("[submit-signature] fetch intake for seed failed:", e);
  }

  // 半自動 B . 交付物順序均分到 3 個里程碑
  const buckets = [[], [], []];
  for (let i = 0; i < deliverables.length; i++) {
    const idx = Math.min(2, Math.floor(i * 3 / Math.max(1, deliverables.length)));
    buckets[idx].push(deliverables[i]);
  }
  let m3Title = "里程碑 3 . 完成交付";
  if (scope === "B") {
    buckets[2].push("上線確認 · 協助上線並確認可正常使用");
    m3Title = "里程碑 3 . 完成交付 + 上線確認";
  }
  const toText = (arr) => arr.length ? arr.map((x) => "· " + x).join("\n") : null;

  const rows = [
    { contract_id: contractId, milestone_number: 1, title: "里程碑 1 . 啟動交付", amount_pct: 30, deliverable_text: toText(buckets[0]) },
    { contract_id: contractId, milestone_number: 2, title: "里程碑 2 . 中段交付", amount_pct: 30, deliverable_text: toText(buckets[1]) },
    { contract_id: contractId, milestone_number: 3, title: m3Title, amount_pct: 40, deliverable_text: toText(buckets[2]) },
  ];
  try {
    const res = await fetch(SUPABASE_URL + "/rest/v1/contract_milestones?on_conflict=contract_id,milestone_number", {
      method: "POST",
      headers: Object.assign({}, authHeaders(), { "Prefer": "resolution=ignore-duplicates" }),
      body: JSON.stringify(rows),
    });
    if (!res.ok) {
      const t = await res.text();
      console.warn("[submit-signature] seedDefaultMilestones failed:", t.slice(0, 200));
    } else {
      console.log("[submit-signature] seedDefaultMilestones OK (scope=" + scope + ") for " + contractId.slice(0, 8));
    }
  } catch (e) {
    console.warn("[submit-signature] seedDefaultMilestones exception:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") || "";

  const rl = await checkRateLimit(ip);
  if (rl.blocked) {
    return jsonRes({ ok: false, error: "rate limit: too many failed attempts from this IP - try again in 15 min", fails: rl.fails }, 429);
  }

  if (!JWT_SECRET) {
    return jsonRes({ ok: false, error: "JWT_SECRET not configured" }, 500);
  }

  let body: ReqBody;
  try {
    body = await req.json();
  } catch {
    await recordAttempt(ip, null, false, "bad body", ua);
    return jsonRes({ ok: false, error: "bad body" }, 400);
  }

  if (!body.contract_id || !body.role || !body.signature_base64 || !body.token) {
    await recordAttempt(ip, body.contract_id || null, false, "missing fields", ua);
    return jsonRes({ ok: false, error: "contract_id + role + signature_base64 + token required" }, 400);
  }
  if (body.role !== "client" && body.role !== "worker") {
    await recordAttempt(ip, body.contract_id, false, "bad role", ua);
    return jsonRes({ ok: false, error: "role must be client or worker" }, 400);
  }

  const payload = await verifyContractToken(body.token, JWT_SECRET);
  if (!payload) {
    await recordAttempt(ip, body.contract_id, false, "invalid token", ua);
    return jsonRes({ ok: false, error: "invalid or expired token" }, 401);
  }
  if (payload.contract_id !== body.contract_id) {
    await recordAttempt(ip, body.contract_id, false, "token-contract mismatch", ua);
    return jsonRes({ ok: false, error: "token does not match contract_id" }, 403);
  }
  if (payload.role !== body.role) {
    await recordAttempt(ip, body.contract_id, false, "token-role mismatch", ua);
    return jsonRes({ ok: false, error: "token role does not match request role" }, 403);
  }

  const cRes = await fetch(
    SUPABASE_URL + "/rest/v1/contracts?id=eq." + body.contract_id + "&select=*",
    { headers: authHeaders() }
  );
  const cRows = await cRes.json();
  if (!Array.isArray(cRows) || cRows.length === 0) {
    await recordAttempt(ip, body.contract_id, false, "contract not found", ua);
    return jsonRes({ ok: false, error: "contract not found" }, 404);
  }
  const contract = cRows[0];

  if (contract.status === "cancelled") {
    await recordAttempt(ip, body.contract_id, false, "contract cancelled", ua);
    return jsonRes({ ok: false, error: "contract is cancelled" }, 410);
  }

  if (body.role === "client" && contract.client_signature_url) {
    await recordAttempt(ip, body.contract_id, false, "client already signed", ua);
    return jsonRes({ ok: false, error: "client already signed - contact BeyondPath if you need to re-sign" }, 409);
  }
  if (body.role === "worker" && contract.worker_signature_url) {
    await recordAttempt(ip, body.contract_id, false, "worker already signed", ua);
    return jsonRes({ ok: false, error: "worker already signed - contact BeyondPath if you need to re-sign" }, 409);
  }

  const bytes = decodeBase64Image(body.signature_base64);
  if (!bytes) {
    await recordAttempt(ip, body.contract_id, false, "bad base64", ua);
    return jsonRes({ ok: false, error: "invalid base64 image" }, 400);
  }
  if (bytes.length > MAX_IMAGE_BYTES) {
    await recordAttempt(ip, body.contract_id, false, "image too large", ua);
    return jsonRes({ ok: false, error: "image too large (max 5MB)" }, 413);
  }
  const mime = detectImageMime(bytes);
  if (!mime) {
    await recordAttempt(ip, body.contract_id, false, "unrecognized image format", ua);
    return jsonRes({ ok: false, error: "unrecognized image format (need png/jpeg/webp/heic/gif)" }, 415);
  }
  const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1];

  const sigUrl = await uploadSignature(body.contract_id, body.role, bytes, ext);
  if (!sigUrl) {
    await recordAttempt(ip, body.contract_id, false, "storage upload failed", ua);
    return jsonRes({ ok: false, error: "signature upload failed" }, 500);
  }

  const sigHash = await sha256Hex(bytes);
  const nowIso = new Date().toISOString();

  const updates: Record<string, any> = {};
  if (body.role === "client") {
    updates.client_signature_url = sigUrl;
    updates.client_signed_at = nowIso;
    updates.client_signature_uploaded_ip = ip;
  } else {
    updates.worker_signature_url = sigUrl;
    updates.worker_signed_at = nowIso;
    updates.worker_signature_uploaded_ip = ip;
  }

  const otherSigned = body.role === "client" ? !!contract.worker_signature_url : !!contract.client_signature_url;
  const willComplete = otherSigned;
  if (willComplete) {
    updates.status = "complete";
    const clientSigU = body.role === "client" ? sigUrl : (contract.client_signature_url || "");
    const workerSigU = body.role === "worker" ? sigUrl : (contract.worker_signature_url || "");
    const clientTs = body.role === "client" ? nowIso : (contract.client_signed_at || "");
    const workerTs = body.role === "worker" ? nowIso : (contract.worker_signed_at || "");
    const final = (contract.pdf_hash || "") + "|" + clientSigU + "|" + workerSigU + "|" + clientTs + "|" + workerTs;
    updates.signature_hash = await sha256Hex(final);
  } else {
    updates.status = "partial";
  }

  const updRes = await fetch(
    SUPABASE_URL + "/rest/v1/contracts?id=eq." + body.contract_id,
    {
      method: "PATCH",
      headers: Object.assign({}, authHeaders(), { "Prefer": "return=representation" }),
      body: JSON.stringify(updates),
    }
  );
  if (!updRes.ok) {
    const err = await updRes.text();
    console.error("contract update failed:", err);
    await recordAttempt(ip, body.contract_id, false, "db update failed: " + err.slice(0, 200), ua);
    return jsonRes({ ok: false, error: "db update failed", detail: err }, 500);
  }
  const updRows = await updRes.json();
  const updated = Array.isArray(updRows) ? updRows[0] : null;

  if (willComplete && updated) {
    // 2026-06-01 calcifer . sulima doc 45 . 第三方時間戳 (fire-and-forget . 不擋回應)
    if (updates.signature_hash) stampAndStore(body.contract_id, updates.signature_hash).catch(function () {});
    sendCompletionEmail(updated).catch(function (e) { console.warn("completion email error:", e); });
    // Phase 3 . auto-seed 3 default milestones (30/30/40)
    seedDefaultMilestones(body.contract_id, updated && updated.client_intake_id).catch(function (e) { console.warn("seed milestones error:", e); });
    // 2026-05-31 calcifer . doc 37 gap 2 . 合約雙方簽完 -> 通知 Edward 本人 (待後續) . fire-and-forget
    const _snap = (updated.contract_snapshot || {}) as Record<string, any>;
    notifyEdward("contract_signed", {
      title: (_snap.client_name || "client") + " x " + (_snap.worker_name || "worker"),
      workerName: _snap.worker_name || null,
      clientName: _snap.client_name || null,
      amount: _snap.project_budget || (updated.project_budget_ntd ? ("NT$ " + updated.project_budget_ntd) : null),
      contractId: body.contract_id,
    }).catch(function () {});
  }

  await recordAttempt(ip, body.contract_id, true, null, ua);

  return jsonRes({
    ok: true,
    contract_status: willComplete ? "complete" : "partial",
    role: body.role,
    signed_at: nowIso,
    signature_hash_partial: sigHash.slice(0, 16),
    contract_id: body.contract_id,
    final_hash: willComplete ? updates.signature_hash : null,
  });
});
