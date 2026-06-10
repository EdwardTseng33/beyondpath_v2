// BeyondPath POC . Edge Function . generate-contract-pdf
// Spec: Edward 5/28 D-plan online sign · self-host PDF + platform store + manual signature photo upload + timestamp
// Phase 1 scope (ship today):
//   . admin call -> fetch intake + worker -> generate PDF (pdf-lib in Deno)
//   . upload Storage bucket "contracts" -> get signed URL (7d TTL)
//   . insert contracts row (status="pending")
//   . send email (Resend) to both parties with PDF link
//   . return { ok, contract_id, pdf_url }
//
// Phase 2 (next sprint):
//   . signature photo upload endpoint
//   . SHA-256 hash verify
//   . contract.html verify page

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { signContractToken } from "../_shared/contract-jwt.ts";
import { calcCommission, formatCommissionBlock } from "../_shared/commission-calc.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";
const JWT_SECRET = Deno.env.get("JWT_SECRET") ?? "";
const STORAGE_BUCKET = "contracts";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

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

interface ReqBody {
  client_intake_id: string;
  worker_application_id: string;
  project_budget?: string;
  project_budget_ntd?: number;  // NEW 2026-05-28 . integer NT$ for commission calc
  contract_type?: "one_off" | "retainer";  // NEW 2026-05-28 . default one_off
  custom_terms?: string;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

interface ContractData {
  client_name: string;
  client_email: string;
  worker_name: string;
  worker_email: string;
  project_budget: string;
  tier: string;
  vertical: string;
  timeline: string;
  contract_id: string;
  generated_at: string;
  // 2026-05-28 . commission breakdown lines (rendered between Project Detail + Payment Terms)
  commission_lines?: string[];
}
async function generatePdf(data: ContractData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 60;

  page.drawText("BeyondPath Service Contract", { x: 50, y, size: 22, font: fontBold, color: rgb(0, 0, 0) });
  y -= 26;
  page.drawText("BeyondPath v1.0 . Issued " + (data.generated_at || "").slice(0, 10), { x: 50, y, size: 10, font: font, color: rgb(0.4, 0.4, 0.4) });
  y -= 30;

  page.drawText("1. Parties / Parties to Contract", { x: 50, y, size: 13, font: fontBold });
  y -= 20;
  page.drawText("Client (Brand): " + data.client_name, { x: 60, y, size: 11, font });
  y -= 16;
  page.drawText("  Email: " + data.client_email, { x: 60, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 22;
  page.drawText("Worker (Service Provider): " + data.worker_name, { x: 60, y, size: 11, font });
  y -= 16;
  page.drawText("  Email: " + data.worker_email, { x: 60, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 30;

  page.drawText("2. Project Detail", { x: 50, y, size: 13, font: fontBold });
  y -= 20;
  page.drawText("Vertical: " + data.vertical, { x: 60, y, size: 11, font });
  y -= 16;
  page.drawText("Worker Tier: " + data.tier, { x: 60, y, size: 11, font });
  y -= 16;
  page.drawText("Project Budget: " + data.project_budget, { x: 60, y, size: 11, font });
  y -= 16;
  page.drawText("Timeline: " + data.timeline, { x: 60, y, size: 11, font });
  y -= 30;

  // 2026-05-28 . Service Fee Breakdown (commission · between Project Detail + Payment Terms)
  if (data.commission_lines && data.commission_lines.length > 0) {
    page.drawText("3. Service Fee Breakdown (BeyondPath commission)", { x: 50, y, size: 13, font: fontBold });
    y -= 20;
    for (const line of data.commission_lines) {
      page.drawText(line, { x: 60, y, size: 11, font });
      y -= 16;
    }
    y -= 14;
    page.drawText("4. Payment Terms (Recommended split)", { x: 50, y, size: 13, font: fontBold });
  } else {
    page.drawText("3. Payment Terms (Recommended split)", { x: 50, y, size: 13, font: fontBold });
  }
  y -= 20;
  page.drawText("- 30% on kickoff (start of project)", { x: 60, y, size: 11, font });
  y -= 16;
  page.drawText("- 30% on mid-point (first deliverable review)", { x: 60, y, size: 11, font });
  y -= 16;
  page.drawText("- 40% on completion (final deliverable acceptance)", { x: 60, y, size: 11, font });
  y -= 16;
  page.drawText("Payment via BeyondPath collect-and-remit (ECPay): platform collects client payment,", { x: 60, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 13;
  page.drawText("deducts service fee, then remits net amount to worker. Not escrow. See Terms s.3.4.", { x: 60, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 30;

  page.drawText("4. NDA & Non-compete (Terms section 8)", { x: 50, y, size: 13, font: fontBold });
  y -= 20;
  page.drawText("- 2-year NDA on project briefs / business info / client lists", { x: 60, y, size: 11, font });
  y -= 16;
  page.drawText("- 6-month non-compete: no direct bypass of BeyondPath with same counterparty", { x: 60, y, size: 11, font });
  y -= 16;
  page.drawText("- Violation penalty: 1x case 2x / monthly 1.5x / poach 3x + 6m ban", { x: 60, y, size: 10, font, color: rgb(0.5, 0, 0) });
  y -= 30;

  page.drawText("5. Full Terms reference", { x: 50, y, size: 13, font: fontBold });
  y -= 20;
  page.drawText("Service Terms: " + PUBLIC_SITE_BASE + "/legal/terms.html", { x: 60, y, size: 10, font, color: rgb(0, 0, 0.8) });
  y -= 14;
  page.drawText("Privacy Policy: " + PUBLIC_SITE_BASE + "/legal/privacy.html", { x: 60, y, size: 10, font, color: rgb(0, 0, 0.8) });
  y -= 30;

  page.drawText("6. Signatures (online sign via contract.html)", { x: 50, y, size: 13, font: fontBold });
  y -= 24;
  page.drawText("Sign online at " + PUBLIC_SITE_BASE + "/contract.html (personalized link sent to your inbox).", { x: 50, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 14;
  page.drawText("Both parties sign + upload signature photo (or tablet sign). 14-day token validity.", { x: 50, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 14;
  page.drawText("BeyondPath timestamps + SHA-256 hashes + emails final certificate to both parties.", { x: 50, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 24;

  page.drawRectangle({ x: 50, y: y - 60, width: 220, height: 60, borderColor: rgb(0, 0, 0), borderWidth: 1 });
  page.drawText("Client Signature:", { x: 56, y: y - 12, size: 10, font: fontBold });
  page.drawText("(uploaded online via contract.html)", { x: 56, y: y - 30, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
  page.drawText("Date: ____________", { x: 56, y: y - 54, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

  page.drawRectangle({ x: 320, y: y - 60, width: 220, height: 60, borderColor: rgb(0, 0, 0), borderWidth: 1 });
  page.drawText("Worker Signature:", { x: 326, y: y - 12, size: 10, font: fontBold });
  page.drawText("(uploaded online via contract.html)", { x: 326, y: y - 30, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
  page.drawText("Date: ____________", { x: 326, y: y - 54, size: 9, font, color: rgb(0.4, 0.4, 0.4) });

  page.drawText("Contract ID: " + data.contract_id, { x: 50, y: 40, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  page.drawText("Generated: " + data.generated_at, { x: 50, y: 28, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  page.drawText("BeyondPath v1.0 . Online sign + SHA-256 integrity hash", { x: 50, y: 16, size: 8, font, color: rgb(0.6, 0.6, 0.6) });

  return await doc.save();
}
async function uploadPdf(contractId: string, pdfBytes: Uint8Array): Promise<string | null> {
  const path = "contracts/" + contractId + ".pdf";
  const uploadUrl = SUPABASE_URL + "/storage/v1/object/" + STORAGE_BUCKET + "/" + path;
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/pdf",
      "x-upsert": "true",
    },
    body: pdfBytes,
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("upload failed:", res.status, txt);
    return null;
  }
  const signUrl = SUPABASE_URL + "/storage/v1/object/sign/" + STORAGE_BUCKET + "/" + path;
  const signRes = await fetch(signUrl, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ expiresIn: 7 * 24 * 3600 }),
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

async function sendEmail(
  to: string,
  name: string,
  role: "client" | "worker",
  pdfUrl: string,
  contractId: string,
  signLink: string,
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing - skip email send (Phase 1 best-effort)");
    return false;
  }
  const roleZh = role === "client" ? "發案方 (client)" : "接案者 (worker)";
  const otherZh = role === "client" ? "接案者 (worker)" : "發案方 (client)";
  const subject = "BeyondPath . 合約已產生 . 請線上簽署 . Contract " + contractId.slice(0, 8);
  const html =
    "<!doctype html><html><body style=\"font-family:system-ui,sans-serif;line-height:1.7;color:#222;max-width:600px;margin:24px auto;padding:0 16px\">" +
    "<h2 style=\"border-bottom:2px solid #c7e84a;padding-bottom:8px\">BeyondPath . 合約已產生 . 線上簽署</h2>" +
    "<p>" + name + "，</p>" +
    "<p>你的 BeyondPath 配對合約 PDF 已產生（你是 <strong>" + roleZh + "</strong>）。本次升級為線上簽署 . 14 天內完成：</p>" +
    "<p style=\"text-align:center;margin:24px 0\">" +
    "<a href=\"" + signLink + "\" style=\"display:inline-block;background:#c7e84a;color:#0a0a0b;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px\">→ 開啟簽署頁</a>" +
    "</p>" +
    "<ol>" +
    "<li><strong>預覽 PDF</strong>：合約全文會在簽署頁顯示 . 也可<a href=\"" + pdfUrl + "\" style=\"color:#0066cc\">直接下載 PDF</a>（7 天 signed URL）</li>" +
    "<li><strong>手寫簽 或 平板簽</strong>：紙本拍照、平板簽圖、手機自繪皆可（image/*）</li>" +
    "<li><strong>上傳簽署照片</strong>：簽署頁直接上傳 . SHA-256 hash + 時間戳 + IP 紀錄會自動記錄</li>" +
    "<li>雙方都簽完後 . BeyondPath 自動寄存證副本給雙方（含雙方簽署照 + 完整 hash）</li>" +
    "</ol>" +
    "<p style=\"background:#fffacd;padding:12px 16px;border-left:3px solid #c7e84a\"><strong>金流與存證說明</strong>：案款由 BeyondPath 透過綠界第三方支付代收、扣抵接案者服務費後撥付（代收代付、非 escrow、不長期託管 . 見服務條款 §3.4）。本平台合約存證（合約 + 雙方簽署照 + SHA-256 hash + 時間戳）作配對紀錄與爭議解決依據、不取代法律公證。</p>" +
    "<p>合約 ID：<code>" + contractId + "</code></p>" +
    "<p>對方角色：<strong>" + otherZh + "</strong>（已同步收到此通知 + 對方專屬簽署連結）</p>" +
    "<p>查驗合約：任何人可至 <a href=\"" + PUBLIC_SITE_BASE + "/contract-verify.html\">contract-verify.html</a> 上傳 PDF 比對 hash</p>" +
    "<hr style=\"margin:32px 0;border:0;border-top:1px solid #ddd\">" +
    "<p style=\"font-size:13px;color:#666\">完整條款：<a href=\"" + PUBLIC_SITE_BASE + "/legal/terms.html\">服務條款</a> . <a href=\"" + PUBLIC_SITE_BASE + "/legal/privacy.html\">隱私政策</a></p>" +
    "<p style=\"font-size:13px;color:#666\">疑問：<a href=\"mailto:edwardt0303@gmail.com\">edwardt0303@gmail.com</a></p>" +
    "<p style=\"font-size:11px;color:#999\">BeyondPath v1.0 . 線上簽署 + SHA-256 完整性 hash</p>" +
    "</body></html>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + RESEND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html }),
  });
  if (!res.ok) {
    console.error("resend send failed:", res.status, await res.text());
    return false;
  }
  return true;
}
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return jsonRes({ ok: false, error: "method not allowed" }, 405);
  }

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return jsonRes({ ok: false, error: "missing auth" }, 401);
  }
  const userJwt = auth.slice(7);
  const userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
    headers: { "apikey": SUPABASE_SERVICE_ROLE_KEY, "Authorization": "Bearer " + userJwt },
  });
  if (!userRes.ok) {
    return jsonRes({ ok: false, error: "invalid auth" }, 401);
  }
  const user = await userRes.json();
  if (user.email !== "edwardt0303@gmail.com") {
    return jsonRes({ ok: false, error: "admin only" }, 403);
  }

  if (!JWT_SECRET) {
    return jsonRes({ ok: false, error: "JWT_SECRET not configured - contract.html sign links cannot be generated" }, 500);
  }

  let body: ReqBody;
  try {
    body = await req.json();
  } catch {
    return jsonRes({ ok: false, error: "bad body" }, 400);
  }
  if (!body.client_intake_id || !body.worker_application_id) {
    return jsonRes({ ok: false, error: "client_intake_id + worker_application_id required" }, 400);
  }

  const intakeRes = await fetch(
    SUPABASE_URL + "/rest/v1/client_intakes?id=eq." + body.client_intake_id + "&select=*",
    { headers: authHeaders() }
  );
  const intakes = await intakeRes.json();
  if (!Array.isArray(intakes) || intakes.length === 0) {
    return jsonRes({ ok: false, error: "client_intake not found" }, 404);
  }
  const intake = intakes[0];

  const workerRes = await fetch(
    SUPABASE_URL + "/rest/v1/worker_applications?id=eq." + body.worker_application_id + "&select=*",
    { headers: authHeaders() }
  );
  const workers = await workerRes.json();
  if (!Array.isArray(workers) || workers.length === 0) {
    return jsonRes({ ok: false, error: "worker_application not found" }, 404);
  }
  const worker = workers[0];

  const dupRes = await fetch(
    SUPABASE_URL + "/rest/v1/contracts?client_intake_id=eq." + body.client_intake_id + "&worker_application_id=eq." + body.worker_application_id + "&select=id,status",
    { headers: authHeaders() }
  );
  const dups = await dupRes.json();
  if (Array.isArray(dups) && dups.length > 0) {
    return jsonRes({ ok: false, error: "contract already exists", contract_id: dups[0].id, status: dups[0].status }, 409);
  }

  const contractId = crypto.randomUUID();
  const snapshot = {
    client_name: intake.company_name || intake.email || "(unnamed)",
    client_email: intake.email,
    worker_name: worker.display_name || worker.email || "(unnamed)",
    worker_email: worker.email,
    project_budget: body.project_budget || intake.budget_range || "TBD",
    tier: worker.tier_suggestion || worker.status || "B",
    vertical: intake.vertical || "(general)",
    timeline: intake.timeline || "TBD",
    payment_split: "30/30/40",
    contract_version: "v1.0",
    generated_at: new Date().toISOString(),
  };

  // 2026-05-28 . compute commission (Tier x contract_type . see commission-calc.ts)
  const budgetForCalc = typeof body.project_budget_ntd === "number" && body.project_budget_ntd > 0
    ? body.project_budget_ntd
    : 0;
  const contractType = body.contract_type === "retainer" ? "retainer" : "one_off";
  let commissionBlock = null as null | ReturnType<typeof calcCommission>;
  let commissionLines: string[] = [];
  if (budgetForCalc > 0) {
    commissionBlock = calcCommission({
      worker_tier: snapshot.tier,
      contract_type: contractType,
      project_budget_ntd: budgetForCalc,
    });
    commissionLines = formatCommissionBlock(commissionBlock);
  } else {
    console.warn("generate-contract-pdf: project_budget_ntd not provided . commission breakdown skipped");
  }

  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generatePdf({
      client_name: snapshot.client_name,
      client_email: snapshot.client_email || "",
      worker_name: snapshot.worker_name,
      worker_email: snapshot.worker_email || "",
      project_budget: snapshot.project_budget,
      tier: snapshot.tier,
      vertical: snapshot.vertical,
      timeline: snapshot.timeline,
      contract_id: contractId,
      generated_at: snapshot.generated_at,
      commission_lines: commissionLines,
    });
  } catch (e) {
    console.error("pdf gen failed:", e);
    return jsonRes({ ok: false, error: "pdf generation failed", detail: String(e) }, 500);
  }

  const pdfHash = await sha256Hex(pdfBytes);

  const pdfUrl = await uploadPdf(contractId, pdfBytes);
  if (!pdfUrl) {
    return jsonRes({ ok: false, error: "storage upload failed - check Storage bucket contracts exists in Supabase Studio" }, 500);
  }

  // Phase 2 . sign contract tokens for both parties (14d TTL)
  let clientToken = "";
  let workerToken = "";
  try {
    clientToken = await signContractToken({ contract_id: contractId, role: "client" }, JWT_SECRET);
    workerToken = await signContractToken({ contract_id: contractId, role: "worker" }, JWT_SECRET);
  } catch (e) {
    console.error("contract token sign failed:", e);
    return jsonRes({ ok: false, error: "contract token sign failed", detail: String(e) }, 500);
  }

  const insertRes = await fetch(SUPABASE_URL + "/rest/v1/contracts", {
    method: "POST",
    headers: Object.assign({}, authHeaders(), { "Prefer": "return=representation" }),
    body: JSON.stringify({
      id: contractId,
      client_intake_id: body.client_intake_id,
      worker_application_id: body.worker_application_id,
      pdf_url: pdfUrl,
      pdf_hash: pdfHash,
      contract_snapshot: snapshot,
      status: "pending",
      notified_at: new Date().toISOString(),
      client_sign_token: clientToken,
      worker_sign_token: workerToken,
      // 2026-05-28 . commission columns
      project_budget_ntd: budgetForCalc > 0 ? budgetForCalc : null,
      contract_type: contractType,
      commission_rate: commissionBlock ? commissionBlock.commission_rate : null,
      commission_amount_ntd: commissionBlock ? commissionBlock.commission_amount_ntd : null,
      worker_net_amount_ntd: commissionBlock ? commissionBlock.worker_net_amount_ntd : null,
    }),
  });
  if (!insertRes.ok) {
    const err = await insertRes.text();
    console.error("contract insert failed:", err);
    return jsonRes({ ok: false, error: "db insert failed", detail: err }, 500);
  }

  const clientSignLink = PUBLIC_SITE_BASE + "/contract.html?id=" + contractId + "&role=client&token=" + encodeURIComponent(clientToken);
  const workerSignLink = PUBLIC_SITE_BASE + "/contract.html?id=" + contractId + "&role=worker&token=" + encodeURIComponent(workerToken);

  const clientSent = snapshot.client_email
    ? await sendEmail(snapshot.client_email, snapshot.client_name, "client", pdfUrl, contractId, clientSignLink)
    : false;
  const workerSent = snapshot.worker_email
    ? await sendEmail(snapshot.worker_email, snapshot.worker_name, "worker", pdfUrl, contractId, workerSignLink)
    : false;

  return jsonRes({
    ok: true,
    contract_id: contractId,
    pdf_url: pdfUrl,
    pdf_hash: pdfHash,
    commission: commissionBlock,
    emails: { client_sent: clientSent, worker_sent: workerSent },
    phase: 2,
    sign_links: {
      // returned for admin debug only . NOT exposed to anon
      client: clientSignLink,
      worker: workerSignLink,
    },
  });
});
