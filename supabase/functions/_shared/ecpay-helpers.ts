// BeyondPath . 綠界 ECPay AIO v5 helpers
// 2026-05-28 . calcifer
//
// 綠界 CheckMacValue 規則 (V5 SHA256):
//   1. 將所有參數依參數名稱 ASCII 升冪排序
//   2. 加上 HashKey 與 HashIV: "HashKey=xxx&Key1=Value1&Key2=Value2&...&HashIV=yyy"
//   3. URL encode (綠界自家規格, 跟 RFC 3986 略不同)
//   4. 全部轉小寫
//   5. SHA-256 hash
//   6. 轉大寫
//
// 綠界自家 URL encode 規格:
//   . encodeURIComponent 後對特定字元做還原: ! ' ( ) * → 不 encode
//   . 空白 → +
//   . 已經是 . _ - * 不 encode
// Ref: https://developers.ecpay.com.tw/?p=2902

// 綠界 URL encode (.NET HttpUtility.UrlEncode equivalent)
export function ecpayUrlEncode(str: string): string {
  if (str === null || str === undefined) return "";
  let encoded = encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/%21/g, "!")
    .replace(/%27/g, "'")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")
    .replace(/%2A/g, "*");
  return encoded;
}

// SHA-256 hex (lowercase) via Web Crypto API (Deno-friendly)
async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  const bytes = new Uint8Array(hash);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i].toString(16);
    hex += b.length === 1 ? "0" + b : b;
  }
  return hex;
}

// 計算 CheckMacValue
export async function calcEcpayCheckMacValue(
  params: Record<string, string | number>,
  hashKey: string,
  hashIv: string
): Promise<string> {
  // 1. ASCII 升冪排序 (排除 CheckMacValue 自身)
  const keys = Object.keys(params)
    .filter((k) => k !== "CheckMacValue")
    .sort((a, b) => a.localeCompare(b));

  // 2. 串成 "Key=Value&..." 並 prepend HashKey + append HashIV
  const pairs: string[] = ["HashKey=" + hashKey];
  for (const k of keys) {
    pairs.push(k + "=" + String(params[k]));
  }
  pairs.push("HashIV=" + hashIv);
  const raw = pairs.join("&");

  // 3. URL encode
  const encoded = ecpayUrlEncode(raw);

  // 4. 全轉小寫
  const lower = encoded.toLowerCase();

  // 5. SHA-256 hash + 轉大寫
  const hex = await sha256Hex(lower);
  return hex.toUpperCase();
}

// Verify CheckMacValue from webhook (constant-time-ish)
export async function verifyEcpayCheckMacValue(
  payload: Record<string, string | number>,
  expectedCmv: string,
  hashKey: string,
  hashIv: string
): Promise<boolean> {
  const calc = await calcEcpayCheckMacValue(payload, hashKey, hashIv);
  return calc === expectedCmv;
}

// 生 MerchantTradeNo (BP + YYYYMMDDHHmmss + 4 random alnum, max 20 chars)
export function generateMerchantTradeNo(): string {
  const now = new Date();
  const p2 = (n: number) => (n + "").padStart(2, "0");
  const ts =
    now.getFullYear().toString().slice(2) +
    p2(now.getMonth() + 1) +
    p2(now.getDate()) +
    p2(now.getHours()) +
    p2(now.getMinutes()) +
    p2(now.getSeconds());
  const alnum = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += alnum[Math.floor(Math.random() * alnum.length)];
  }
  return "BP" + ts + rand; // BP + 12 + 4 = 18 chars (max 20)
}

// 綠界 MerchantTradeDate 格式: "YYYY/MM/DD HH:mm:ss"
export function ecpayDateString(d: Date): string {
  const p2 = (n: number) => (n + "").padStart(2, "0");
  return (
    d.getFullYear() +
    "/" +
    p2(d.getMonth() + 1) +
    "/" +
    p2(d.getDate()) +
    " " +
    p2(d.getHours()) +
    ":" +
    p2(d.getMinutes()) +
    ":" +
    p2(d.getSeconds())
  );
}

// 綠界 PaymentType (對應 payment_intents.payment_type)
export function mapPaymentType(t: string): string {
  switch (t) {
    case "credit_card":
      return "Credit";
    case "atm":
      return "ATM";
    case "cvs":
      return "CVS";
    case "all":
    default:
      return "ALL";
  }
}

// Parse form-urlencoded body (webhook 用 . 綠界 POST application/x-www-form-urlencoded)
export function parseFormUrlencoded(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  const pairs = body.split("&");
  for (const p of pairs) {
    const eq = p.indexOf("=");
    if (eq < 0) {
      if (p) out[decodeURIComponent(p)] = "";
      continue;
    }
    const k = decodeURIComponent(p.slice(0, eq).replace(/\+/g, " "));
    const v = decodeURIComponent(p.slice(eq + 1).replace(/\+/g, " "));
    out[k] = v;
  }
  return out;
}
