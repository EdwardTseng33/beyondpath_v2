// BeyondPath POC . Shared . RFC3161 Trusted Timestamp (zero-cost via freeTSA)
// 2026-06-01 calcifer . sulima doc 45 . 簽約完成後對 final signature_hash 取得第三方時間戳
//
// Why: 自家系統時間 (client_signed_at / worker_signed_at) 是「自證」、可被質疑竄改。
//      RFC3161 TSA 由獨立第三方 (freeTSA.org) 簽發、含其私鑰簽名 + 可信時間源、
//      事後任何人可用 freeTSA 公開憑證鏈驗證「此 hash 在此時間點之前已存在」。
//      法律上 = 不可否認的存在性證明 (proof of existence)。
//
// Cost: freeTSA.org = 免費、無需註冊、無 API key。零成本符合 POC 紀律。
// Standard: RFC 3161 Time-Stamp Protocol . Content-Type application/timestamp-query/reply
//
// Fail-soft: TSA 不可用 (down / timeout / 4xx) 一律不擋簽約流程、回 { ok:false }。
//            時間戳是「加分證據」、不是簽約的必要條件。
//
// 驗證 (事後、人工或 contract-verify.html 未來擴充):
//   openssl ts -verify -data <file> -in token.tsr -CAfile freetsa_cacert.pem
//   或上傳 token 到 https://freetsa.org/index_en.php 驗

const FREETSA_URL = "https://freetsa.org/tsr";
const TSA_TIMEOUT_MS = 8000;

// RFC3161 TimeStampReq for a SHA-256 digest is a fixed DER template;
// only the 32 digest bytes vary. We hand-build it (no ASN.1 lib needed).
//
// SEQUENCE {
//   INTEGER 1                              -- version
//   MessageImprint SEQUENCE {
//     AlgorithmIdentifier SEQUENCE {
//       OID 2.16.840.1.101.3.4.2.1         -- sha-256
//       NULL
//     }
//     OCTET STRING (32 bytes digest)
//   }
//   BOOLEAN TRUE                           -- certReq (ask TSA to include its cert)
// }
function buildTimeStampReq(sha256: Uint8Array): Uint8Array {
  if (sha256.length !== 32) throw new Error("rfc3161-tsa: digest must be 32 bytes (SHA-256)");
  // DER bytes from INTEGER(version) through certReq BOOLEAN. SHA-256 OID = 2.16.840.1.101.3.4.2.1
  const reqBody: number[] = [
    0x02, 0x01, 0x01,                                       // INTEGER version = 1
    0x30, 0x2f,                                             // MessageImprint SEQUENCE len 0x2f (47)
      0x30, 0x0b,                                           //   AlgId SEQUENCE len 0x0b (11)
        0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, // OID 2.16.840.1.101.3.4.2.1 (sha-256)
        0x05, 0x00,                                         //   NULL
      0x04, 0x20,                                           //   OCTET STRING len 0x20 (32)
  ];
  // append digest
  for (let i = 0; i < 32; i++) reqBody.push(sha256[i]);
  // certReq BOOLEAN TRUE
  reqBody.push(0x01, 0x01, 0xff);
  // outer SEQUENCE wrap
  const inner = new Uint8Array(reqBody);
  const out = new Uint8Array(2 + inner.length);
  out[0] = 0x30;            // SEQUENCE
  out[1] = inner.length;    // length (< 128, single byte — true for sha-256 req)
  out.set(inner, 2);
  return out;
}

function bytesToB64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

export interface TsaResult {
  ok: boolean;
  token_b64?: string;   // base64 of the full RFC3161 TimeStampResp (DER)
  tsa_url?: string;
  tsa_at?: string;      // our wall-clock at request time (TSA's authoritative time is inside the token)
  error?: string;
}

// hexDigest: 64-char hex string of the SHA-256 to be timestamped (e.g. final signature_hash)
export async function timestampSha256Hex(hexDigest: string): Promise<TsaResult> {
  try {
    if (!/^[0-9a-fA-F]{64}$/.test(hexDigest)) return { ok: false, error: "invalid sha256 hex" };
    const digest = new Uint8Array(32);
    for (let i = 0; i < 32; i++) digest[i] = parseInt(hexDigest.substr(i * 2, 2), 16);
    const req = buildTimeStampReq(digest);

    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, TSA_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(FREETSA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/timestamp-query" },
        body: req as BodyInit,
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return { ok: false, error: "tsa http " + res.status };
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length < 16) return { ok: false, error: "tsa empty reply" };
    return {
      ok: true,
      token_b64: bytesToB64(buf),
      tsa_url: FREETSA_URL,
      tsa_at: new Date().toISOString(),
    };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
