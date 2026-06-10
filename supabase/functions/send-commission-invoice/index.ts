// BeyondPath POC . send-commission-invoice . 2026-05-28 . calcifer
// Generates invoice PDF + uploads + emails worker + logs commission_records

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "BeyondPath <hello@beyondpath.tw>";
const PUBLIC_SITE_BASE = Deno.env.get("PUBLIC_SITE_BASE") ?? "https://beyondpath.tw";
const EDWARD_BANK_NAME = Deno.env.get("PMF_BANK_NAME") ?? "(set PMF_BANK_NAME)";
const EDWARD_BANK_ACCOUNT = Deno.env.get("PMF_BANK_ACCOUNT") ?? "(set PMF_BANK_ACCOUNT)";
const EDWARD_BANK_ACCOUNT_NAME = Deno.env.get("PMF_BANK_ACCOUNT_NAME") ?? "Edward Tseng";
const STORAGE_BUCKET = "contracts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};
function authH() {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": "application/json",
  };
}
function J(b: unknown, s = 200): Response {
  return new Response(JSON.stringify(b), {
    status: s,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

interface InvData {
  invoice_no: string;
  contract_id: string;
  worker_name: string;
  worker_email: string;
  client_name: string;
  commission_amount_ntd: number;
  commission_rate: number;
  tier: string;
  project_budget_ntd: number;
  contract_type: string;
  issued_at: string;
  due_at: string;
}

async function genPdf(d: InvData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const { height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fb = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = height - 60;
  const T = function (t: string, sz: number, ff: any, r: number, g: number, b: number, dy: number) {
    page.drawText(t, { x: 50, y, size: sz, font: ff, color: rgb(r, g, b) });
    y -= dy;
  };
  T("BeyondPath . Commission Invoice", 22, fb, 0, 0, 0, 26);
  T("Platform matching service fee (take rate) . BeyondPath v1.0", 10, font, 0.4, 0.4, 0.4, 30);
  T("Invoice No: " + d.invoice_no, 12, fb, 0, 0, 0, 16);
  T("Contract ID: " + d.contract_id, 10, font, 0.3, 0.3, 0.3, 14);
  T("Issued: " + d.issued_at + " . Due: " + d.due_at + " (7d)", 10, font, 0.3, 0.3, 0.3, 28);
  T("1. Billed To (Worker)", 13, fb, 0, 0, 0, 18);
  T("Name: " + d.worker_name, 11, font, 0, 0, 0, 16);
  T("Email: " + d.worker_email, 11, font, 0, 0, 0, 24);
  T("2. Service Fee Detail", 13, fb, 0, 0, 0, 18);
  T("Project (client): " + d.client_name, 11, font, 0, 0, 0, 16);
  T("Tier " + d.tier + " / " + d.contract_type, 11, font, 0, 0, 0, 16);
  T("Client total: NT$ " + d.project_budget_ntd.toLocaleString(), 11, font, 0, 0, 0, 16);
  T("Commission rate: " + d.commission_rate + "%", 11, font, 0, 0, 0, 18);
  T("Service fee: NT$ " + d.commission_amount_ntd.toLocaleString(), 13, fb, 0.7, 0.4, 0, 28);
  T("3. Payment Instruction (ATM Transfer)", 13, fb, 0, 0, 0, 18);
  T("Bank: " + EDWARD_BANK_NAME, 11, font, 0, 0, 0, 16);
  T("Account: " + EDWARD_BANK_ACCOUNT, 11, font, 0, 0, 0, 16);
  T("Account Name: " + EDWARD_BANK_ACCOUNT_NAME, 11, font, 0, 0, 0, 16);
  T("Memo: " + d.invoice_no, 11, font, 0.6, 0, 0, 24);
  T("Please remit within 7 days. Reply with transfer last 5 digits.", 10, font, 0.4, 0.4, 0.4, 14);
  T("BeyondPath marks commission_collected upon receipt.", 10, font, 0.4, 0.4, 0.4, 24);
  T("Service fee receipt issued by BeyondPath operator (Edward Tsai, sole proprietor).", 9, font, 0.5, 0.5, 0.5, 12);
  T("Formal company invoice reissued after corporate registration.", 9, font, 0.5, 0.5, 0.5, 0);
  page.drawText("BeyondPath v1.0 . " + d.invoice_no, { x: 50, y: 28, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
  return await doc.save();
}

async function upPdf(contractId: string, invNo: string, b: Uint8Array): Promise<string | null> {
  const path = "invoices/" + contractId + "_" + invNo + ".pdf";
  const u = SUPABASE_URL + "/storage/v1/object/" + STORAGE_BUCKET + "/" + path;
  const r = await fetch(u, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: "Bearer " + SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/pdf",
      "x-upsert": "true",
    },
    body: b,
  });
  if (!r.ok) {
    console.error("invoice upload fail", r.status, await r.text());
    return null;
  }
  const su = SUPABASE_URL + "/storage/v1/object/sign/" + STORAGE_BUCKET + "/" + path;
  const sr = await fetch(su, {
    method: "POST",
    headers: authH(),
    body: JSON.stringify({ expiresIn: 14 * 24 * 3600 }),
  });
  if (!sr.ok) return null;
  const s = await sr.json();
  const sp = s.signedURL || s.signedUrl;
  return sp ? (SUPABASE_URL + "/storage/v1" + sp) : null;
}

async function mailInvoice(d: InvData, url: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing, skip email");
    return false;
  }
  const subj = "BeyondPath Commission Invoice " + d.invoice_no + " . NT$ " + d.commission_amount_ntd.toLocaleString();
  const lines: string[] = [];
  lines.push("Hi " + d.worker_name + ",");
  lines.push("");
  lines.push("Contract " + d.contract_id.slice(0, 8) + " completed.");
  lines.push("");
  lines.push("Commission breakdown:");
  lines.push("  Client total: NT$ " + d.project_budget_ntd.toLocaleString());
  lines.push("  Your Tier: " + d.tier + " / " + d.contract_type + "  (" + d.commission_rate + "%)");
  lines.push("  Platform commission: NT$ " + d.commission_amount_ntd.toLocaleString());
  lines.push("");
  lines.push("Please remit within 7 days (by " + d.due_at + ") via ATM:");
  lines.push("  Bank: " + EDWARD_BANK_NAME);
  lines.push("  Account: " + EDWARD_BANK_ACCOUNT);
  lines.push("  Name: " + EDWARD_BANK_ACCOUNT_NAME);
  lines.push("  Memo: " + d.invoice_no);
  lines.push("");
  lines.push("Reply with transfer last 5 digits.");
  lines.push("");
  lines.push("Download invoice PDF: " + url);
  lines.push("View payout detail: " + PUBLIC_SITE_BASE + "/worker-payout.html?contract_id=" + d.contract_id);
  lines.push("");
  lines.push("Service fee receipt issued by BeyondPath operator (Edward Tsai, sole proprietor). E-invoice with company tax ID will be reissued after corporate registration.");
  lines.push("BeyondPath v1.0 . " + d.invoice_no);
  const txt = lines.join("\n");
  const html = "<pre style=\"font-family:system-ui,sans-serif;font-size:14px;line-height:1.7;white-space:pre-wrap;background:#fafafa;padding:16px;border-left:3px solid #c7e84a\">" + txt + "</pre><p style=\"text-align:center;margin:20px 0\"><a href=\"" + url + "\" style=\"display:inline-block;background:#c7e84a;color:#0a0a0b;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600\">Download Invoice PDF</a></p>";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + RESEND_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: RESEND_FROM, to: [d.worker_email], subject: subj, text: txt, html }),
  });
  if (!r.ok) {
    console.error("invoice email fail", r.status, await r.text());
    return false;
  }
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return J({ ok: false, error: "method not allowed" }, 405);

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return J({ ok: false, error: "missing auth" }, 401);
  const ur = await fetch(SUPABASE_URL + "/auth/v1/user", {
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + auth.slice(7) },
  });
  if (!ur.ok) return J({ ok: false, error: "invalid auth" }, 401);
  const u = await ur.json();
  if (u.email !== "edwardt0303@gmail.com") return J({ ok: false, error: "admin only" }, 403);

  let body: { contract_id: string };
  try { body = await req.json(); } catch { return J({ ok: false, error: "bad body" }, 400); }
  if (!body.contract_id) return J({ ok: false, error: "contract_id required" }, 400);

  const cR = await fetch(
    SUPABASE_URL + "/rest/v1/contracts?id=eq." + body.contract_id + "&select=*",
    { headers: authH() }
  );
  const rows = await cR.json();
  if (!Array.isArray(rows) || rows.length === 0) return J({ ok: false, error: "contract not found" }, 404);
  const c = rows[0];
  const snap = c.contract_snapshot || {};
  if (!c.commission_amount_ntd || c.commission_amount_ntd <= 0)
    return J({ ok: false, error: "no commission_amount_ntd . 補開合約 commission" }, 400);
  if (!snap.worker_email)
    return J({ ok: false, error: "worker_email missing in snapshot" }, 400);

  const now = new Date();
  const due = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
  const p2 = function (n: number) { return (n + "").padStart(2, "0"); };
  const invNo = "BP-" + now.getFullYear() + p2(now.getMonth() + 1) + p2(now.getDate()) + "-" + body.contract_id.slice(0, 6).toUpperCase();
  const iso = function (dt: Date) { return dt.getFullYear() + "-" + p2(dt.getMonth() + 1) + "-" + p2(dt.getDate()); };

  const d: InvData = {
    invoice_no: invNo,
    contract_id: body.contract_id,
    worker_name: snap.worker_name || "(unnamed)",
    worker_email: snap.worker_email,
    client_name: snap.client_name || "(unnamed)",
    commission_amount_ntd: c.commission_amount_ntd,
    commission_rate: c.commission_rate || 0,
    tier: snap.tier || "-",
    project_budget_ntd: c.project_budget_ntd || 0,
    contract_type: c.contract_type || "one_off",
    issued_at: iso(now),
    due_at: iso(due),
  };

  let pdf: Uint8Array;
  try { pdf = await genPdf(d); }
  catch (e) { return J({ ok: false, error: "pdf gen fail", detail: String(e) }, 500); }
  const url = await upPdf(body.contract_id, invNo, pdf);
  if (!url) return J({ ok: false, error: "storage upload fail" }, 500);

  const sent = await mailInvoice(d, url);

  await fetch(SUPABASE_URL + "/rest/v1/commission_records", {
    method: "POST",
    headers: authH(),
    body: JSON.stringify({
      contract_id: body.contract_id,
      event_type: "invoice_issued",
      amount_ntd: c.commission_amount_ntd,
      reference_number: invNo,
      notes: "Auto-issued by send-commission-invoice . PDF: " + url,
    }),
  });

  return J({
    ok: true,
    invoice_no: invNo,
    pdf_url: url,
    email_sent: sent,
    amount_ntd: c.commission_amount_ntd,
    due_at: d.due_at,
  });
});
