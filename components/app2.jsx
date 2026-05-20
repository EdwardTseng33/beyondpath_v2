// BeyondPath · Client Intake (Step 1-4) — interactive React app
// Mounts into both desktop and mobile artboards via window.BPApp({device}).

const { useState, useEffect, useRef, useMemo } = React;
const { VERTICALS, VERTICAL_CATS, VERTICAL_DEMO_MAP, getDemoForVertical, SAMPLE_BRIEF, AI_PARSE_RESULT, WORKERS, SUGGESTED_PAIR } = window.BP_DATA;

const fmtNT = (n) => "NT$" + n.toLocaleString();

// ---------- Tiny atoms ----------

// Tier atom (T1.5 . 2026-05-20 calcifer . spec 09)
// Maps tier_suggestion -> CSS modifier + zh narrative label.
const TIER_META = {
  "B":     { cls: "b",     label: "Tier B · 起步" },
  "Bplus": { cls: "bplus", label: "Tier B+ · 累積" },
  "B+":    { cls: "bplus", label: "Tier B+ · 累積" },
  "A":     { cls: "a",     label: "Tier A · 進階" },
  "A+":    { cls: "aplus", label: "Tier A+ · 資深" },
  "S":     { cls: "s",     label: "Tier S · 大師" },
};
const Tier = ({ t }) => {
  const meta = TIER_META[t] || { cls: "a", label: "Tier " + (t || "?") };
  return <span className={"bp-tier " + meta.cls}>{meta.label}</span>;
};
function tierClassFor(t) {
  return (TIER_META[t] && TIER_META[t].cls) || "a";
}
const Badge = ({ children }) => <span className="bp-badge">{children}</span>;

// ---------- Topbar ----------

function Topbar({ step, device, hideStepper }) {
  const labels = [
    { n: "01", en: "Pre-intake", zh: "選領域 + 上傳需求" },
    { n: "02", en: "Confirm", zh: "確認期待" },
    { n: "03", en: "AI Parse", zh: "AI 拆解需求" },
    { n: "04", en: "Match", zh: "AI 自動配對" },
  ];
  return (
    <div className="bp-topbar">
      <div className="bp-logo">
        <span className="bp-logo-mark"></span>
        BEYONDPATH
        {device === "desktop" && <small>CLIENT · INTAKE OS v0.3</small>}
      </div>
      {device === "desktop" && !hideStepper && (
        <div className="bp-stepper">
          {labels.map((l, i) => (
            <div
              key={l.n}
              className={i === step ? "active" : i < step ? "done" : ""}
            >
              <span className="num">{l.n}</span>
              <span>{l.en}</span>
            </div>
          ))}
        </div>
      )}
      <div className="bp-statusbar">
        <span className="dot"></span>
        <span>
          AI broker <b>online</b>
        </span>
        {device === "desktop" && (
          <>
            <span>·</span>
            <span>
              session <b>0xC3F4</b>
            </span>
            <span>·</span>
            <span>
              region <b>tw</b>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- STEP 1 · Pre-intake ----------

function Step1({ state, set, device }) {
  const [tab, setTab] = useState("sample"); // upload | paste | sample
  const [text, setText] = useState(state.brief || "");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const filteredVerticals = useMemo(() => {
    let list = VERTICALS;
    if (cat !== "all") list = list.filter((v) => v.cat === cat);
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.en.toLowerCase().includes(k) ||
          v.zh.includes(q.trim()) ||
          v.blurb.includes(q.trim())
      );
    }
    return list;
  }, [cat, q]);

  const useSample = () => {
    setTab("sample");
    const demo = getDemoForVertical(state.vertical);
    setText(demo.brief);
    set({ brief: demo.brief, briefSource: "sample" });
  };

  useEffect(() => {
    if (tab === "sample" && !text) useSample();
  }, []);

  // 當 state.brief 從 parent (ClientIntakeApp useEffect) 更新時、同步本地 textarea text
  useEffect(() => {
    if (tab === "sample" && state.brief && state.brief !== text) {
      setText(state.brief);
    }
  }, [state.brief, tab]);

  return (
    <div>
      <div className="bp-eyebrow">
        <span>Step 01 / Pre-intake · 選領域 + 上傳需求</span>
        <span className="pill green">● live</span>
      </div>
      <h1 className="bp-h1">
        Pick a vertical, drop your brief.
        <br />
        <span className="zh" style={{ color: "var(--muted)" }}>
          選擇案件垂直領域，匯入需求文件。
        </span>
      </h1>
      <p className="bp-sub">
        BeyondPath 用領域分流，每個領域有自己的需求模板與專屬 worker pool。先選領域，
        再用平台 AI 模板整理你的需求 — 或直接貼進來，我們幫你拆。
        <br /><br />
        <span style={{ color: "var(--accent)", fontWeight: 600 }}>◆ Early Beta · 不代收專案款</span> ：平台只做需求拆解、候選推薦、驗收紀錄；合約與付款由雙方確認。
      </p>

      <div style={{ marginTop: 26 }}>
        <div className="bp-h2" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span>Vertical · 垂直領域</span>
          <span style={{ flex: 1 }} />
          <input
            className="bp-input"
            placeholder="搜尋領域 / search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: 200, fontSize: 12, padding: "6px 10px", fontFamily: "var(--mono)" }}
          />
        </div>
        <div className="bp-toolbar" style={{ marginTop: 8 }}>
          {VERTICAL_CATS.map((c) => {
            const count = c.id === "all" ? VERTICALS.length : VERTICALS.filter((v) => v.cat === c.id).length;
            return (
              <button
                key={c.id}
                className={"bp-chip " + (cat === c.id ? "active" : "")}
                onClick={() => setCat(c.id)}
              >
                {c.en} <span className="zh" style={{ opacity: 0.7 }}>· {c.zh}</span>
                <span style={{ opacity: 0.5, marginLeft: 4, fontFamily: "var(--mono)", fontSize: 10 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="bp-vert-grid" style={{ marginTop: 12 }}>
          {filteredVerticals.map((v) => (
            <button
              key={v.id}
              className={"bp-vert " + (state.vertical === v.id ? "selected" : "")}
              onClick={() => set({ vertical: v.id })}
            >
              <span className="check">✓</span>
              <span className="ic">{v.icon}</span>
              <span className="en">{v.en}</span>
              <span className="zh">{v.zh}</span>
              <span className="blurb">{v.blurb}</span>
              <span className="meta">
                <span>{v.sample} sample workers</span>
              </span>
            </button>
          ))}
          {filteredVerticals.length === 0 && (
            <div className="bp-empty" style={{ gridColumn: "1 / -1" }}>
              <div className="ic">∅</div>
              沒有符合的領域。試試清除搜尋或切「Other」分流給平台客服。
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <div
          className="bp-h2"
          style={{ display: "flex", alignItems: "center" }}
        >
          <span>Brief · 需求文件</span>
          <span style={{ flex: 1 }} />
          <div className="bp-tabs" style={{ marginLeft: "auto" }}>
            <button
              className={tab === "upload" ? "active" : ""}
              onClick={() => setTab("upload")}
            >
              .md / .pdf
            </button>
            <button
              className={tab === "paste" ? "active" : ""}
              onClick={() => {
                setTab("paste");
                if (state.briefSource === "sample") {
                  setText("");
                  set({ brief: "", briefSource: "paste" });
                }
              }}
            >
              paste
            </button>
            <button
              className={tab === "sample" ? "active" : ""}
              onClick={useSample}
            >
              demo
            </button>
          </div>
        </div>

        {tab === "upload" && (
          <div className="bp-upload">
            <div>
              <div className="ttl">Drop a brief.md or brief.pdf</div>
              <div className="desc">
                可下載我們的{" "}
                <code>
                  {VERTICALS.find((v) => v.id === state.vertical)?.id || "DTC"}
                  -brief-template.md
                </code>{" "}
                ，用 ChatGPT / Claude 套版整理後上傳。AI 會掃描 PII 並自動遮罩。
              </div>
            </div>
            <div className="bp-upload-actions">
              <button className="bp-btn ghost">↓ template</button>
              <button
                className="bp-btn"
                onClick={() => {
                  setTab("sample");
                  useSample();
                }}
              >
                ⊕ choose file
              </button>
            </div>
          </div>
        )}

        {(tab === "paste" || tab === "sample") && (
          <div
            className="bp-panel"
            style={{ marginTop: 12, overflow: "hidden" }}
          >
            <div className="bp-panel-h">
              <span>{tab === "sample" ? `sample · ${(VERTICALS.find((v) => v.id === state.vertical)?.zh || "brief")}.md` : "brief.md"}</span>
              <span style={{ marginLeft: "auto" }}>
                {text.length.toLocaleString()} chars · ~
                {Math.max(1, Math.round(text.length / 4))} tok
              </span>
            </div>
            <textarea
              className="bp-input"
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                lineHeight: 1.65,
                minHeight: device === "mobile" ? 200 : 280,
                border: 0,
                background: "var(--bg-1)",
                borderRadius: 0,
                resize: "vertical",
                whiteSpace: "pre",
              }}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                set({ brief: e.target.value, briefSource: tab });
              }}
              placeholder="# 我們是 ____\n# 我們需要 ____\n# 預算 ____ 時間 ____"
            />
          </div>
        )}
      </div>

      {/* Enterprise needs (optional) · 企業 / B2B 流程選項 */}
      <div style={{ marginTop: 28 }}>
        <div className="bp-h2" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Enterprise needs · 企業流程</span>
          <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>optional · 選填</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, marginBottom: 12, lineHeight: 1.6 }}>
          B2B / 大型企業案、勾選後 BeyondPath 24h 內回信時一併處理 NDA / 發票 / 合約 / 預約視訊。不勾沒關係、預設走個人案流程。
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {[
            { id: "nda", label: "需要 NDA", sub: "簽保密協議才能談" },
            { id: "invoice", label: "需要公司發票", sub: "三聯式 / 含統編" },
            { id: "contract", label: "公司對公司簽約", sub: "正式服務合約 · 不接受 PayPal" },
            { id: "talkToEdward", label: "想先跟 BeyondPath 團隊聊 30 min", sub: "大金額 / 複雜案 · 視訊預約" },
          ].map((f) => {
            const active = state.enterprise && state.enterprise[f.id];
            return (
              <button
                key={f.id}
                onClick={() => set({ enterprise: { ...(state.enterprise || {}), [f.id]: !active } })}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  background: active ? "var(--accent-soft)" : "rgba(255,255,255,0.02)",
                  border: "1px solid " + (active ? "var(--accent-line)" : "var(--line-soft)"),
                  borderRadius: "var(--r-md)",
                  color: "var(--text)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  <span style={{
                    display: "inline-flex",
                    width: 16, height: 16,
                    border: "1px solid " + (active ? "var(--accent)" : "var(--muted)"),
                    background: active ? "var(--accent)" : "transparent",
                    color: "var(--bg)",
                    fontSize: 11,
                    alignItems: "center", justifyContent: "center",
                    borderRadius: 3,
                  }}>{active ? "✓" : ""}</span>
                  <span>{f.label}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", paddingLeft: 24, lineHeight: 1.5 }}>{f.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Client Vetting · Q3 Task 2 · 2026-05-19 · 身分 + Early Beta 規則確認 */}
      <div style={{ marginTop: 28 }}>
        <div className="bp-h2" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>About you · 關於你</span>
          <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>optional · 選填</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, marginBottom: 12, lineHeight: 1.6 }}>
          讓我們更了解你的身分。資料只用於配對、不對外公開。
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {[
            { id: "company", label: "公司 / 品牌主", sub: "有正式登記、發案做 B2B / B2C" },
            { id: "individual", label: "個人 / 自由業", sub: "freelancer / soloist · 個人專案" },
            { id: "studio", label: "工作室 / 創辦人", sub: "2-10 人團隊、想擴 capacity" },
            { id: "student", label: "學生 / 學習中", sub: "校內專案 / 投資組合 / 練手" },
          ].map((f) => {
            const active = state.clientType === f.id;
            return (
              <button
                key={f.id}
                onClick={() => set({ clientType: active ? null : f.id })}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  background: active ? "var(--accent-soft)" : "rgba(255,255,255,0.02)",
                  border: "1px solid " + (active ? "var(--accent-line)" : "var(--line-soft)"),
                  borderRadius: "var(--r-md)",
                  color: "var(--text)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  <span style={{
                    display: "inline-flex",
                    width: 16, height: 16,
                    border: "1px solid " + (active ? "var(--accent)" : "var(--muted)"),
                    background: active ? "var(--accent)" : "transparent",
                    color: "var(--bg)",
                    fontSize: 11,
                    alignItems: "center", justifyContent: "center",
                    borderRadius: 3,
                  }}>{active ? "✓" : ""}</span>
                  <span>{f.label}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", paddingLeft: 24, lineHeight: 1.5 }}>{f.sub}</div>
              </button>
            );
          })}
        </div>
        {/* Beta acknowledgment · 確認用戶理解 Early Beta 階段規則 */}
        <div style={{
          marginTop: 14,
          padding: "10px 14px",
          border: "1px dashed rgba(199,232,74,0.25)",
          background: "rgba(199,232,74,0.02)",
          fontSize: 12,
          color: "var(--text-2)",
          lineHeight: 1.6,
        }}>
          <label style={{ display: "flex", gap: 10, cursor: "pointer", alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={!!state.betaAck}
              onChange={(e) => set({ betaAck: e.target.checked })}
              style={{ marginTop: 3, flexShrink: 0 }}
            />
            <span>
              <b style={{ color: "var(--accent)" }}>我了解 Early Beta 階段規則</b>：BeyondPath 不代收專案款、合約由雙方確認；送出 brief 進人工審核、不代表正式承諾或付款。
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ---------- STEP 2 · AI Parse (real Claude API · 2026-05-15 取代 fake animation) ----------

function Step2({ state, set }) {
  const [phase, setPhase] = useState("running"); // running | done | error
  const [error, setError] = useState(null);
  const [tokens, setTokens] = useState({ input: null, output: null });
  const calledRef = useRef(false);

  async function runParse() {
    setPhase("running");
    setError(null);

    const brief = (state.brief || "").trim();
    if (brief.length < 20) {
      setError("brief 內容太短（< 20 字）、無法 AI 拆解。請回 Step 01 補充。");
      setPhase("error");
      return;
    }

    if (!window.bpAiParse) {
      setError("Supabase client 尚未載入、請重整頁面。");
      setPhase("error");
      return;
    }

    try {
      const { data, error: invokeError } = await window.bpAiParse.parseBrief({
        brief,
        budget_range: state.budgetRange,
        timeline: state.timeline,
        vertical: state.vertical,
        company_name: state.companyName,
      });

      if (invokeError) {
        setError("呼叫失敗：" + (invokeError.message || "未知錯誤"));
        setPhase("error");
        return;
      }
      if (!data || !data.ok) {
        setError("AI 拆解失敗：" + (data?.error || "未知錯誤"));
        setPhase("error");
        return;
      }

      setTokens({
        input: data.usage?.input_tokens ?? null,
        output: data.usage?.output_tokens ?? null,
      });
      setPhase("done");
      set({ parseDone: true, parsed: data.parsed });
    } catch (e) {
      setError(e?.message || "網路錯誤、請重試");
      setPhase("error");
    }
  }

  useEffect(() => {
    if (state.parseDone) {
      setPhase("done");
      return;
    }
    if (calledRef.current) return;
    calledRef.current = true;
    runParse();
  }, []);

  const result = state.parsed;

  return (
    <div>
      <div className="bp-eyebrow">
        <span>Step 03 / AI Parse · AI 拆解需求</span>
        <span className="pill">{phase === "running" ? "Claude thinking…" : phase === "error" ? "error" : "complete"}</span>
      </div>
      <h1 className="bp-h1">
        AI is reading your brief.
        <br />
        <span className="zh" style={{ color: "var(--muted)" }}>
          平台 AI 正在拆解你的需求成可執行任務。
        </span>
      </h1>

      <div className="bp-parse-grid" style={{ marginTop: 22 }}>
        <div>
          <div className="bp-h2" style={{ marginBottom: 8 }}>Trace · 推理日誌</div>
          <div className="bp-log" style={{ padding: 18 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
              <div>[init] Claude Sonnet 4.6 \u00b7 max_tokens=3000</div>
              <div>[brief] {(state.brief || "").length} chars \u00b7 ~{Math.max(1, Math.round((state.brief || "").length / 4))} tokens</div>
              {phase === "running" && (
                <>
                  <div>[anthropic] POST /v1/messages \u2026</div>
                  <div style={{ marginTop: 10, color: "var(--accent)" }}>\u25cf \u7b49\u5f85 Claude \u771f\u5be6\u62c6\u89e3\u4e2d\uff08\u9810\u4f30 5-15 \u79d2\uff09</div>
                  <div style={{ marginTop: 6 }}>
                    <span className="cursor"></span>
                  </div>
                </>
              )}
              {phase === "done" && (
                <>
                  <div>[claude] sonnet-4-6 returned</div>
                  {tokens.input != null && <div>[usage] input {tokens.input} \u00b7 output {tokens.output} tokens</div>}
                  <div style={{ marginTop: 8, color: "var(--accent)" }}>\u25cf parse complete \u00b7 \u7d50\u679c\u898b\u53f3\u65b9</div>
                </>
              )}
              {phase === "error" && (
                <>
                  <div style={{ color: "#e57373" }}>[error] {error}</div>
                  <button
                    onClick={runParse}
                    style={{
                      marginTop: 14,
                      padding: "8px 16px",
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      color: "var(--text)",
                      background: "var(--accent)",
                      border: 0,
                      borderRadius: "var(--r-sm)",
                      cursor: "pointer",
                    }}
                  >
                    \u21bb Retry \u00b7 \u91cd\u65b0\u62c6\u89e3
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bp-h2" style={{ marginBottom: 8 }}>Result · 結構化卡片</div>
          {phase === "done" && result ? (
            <div className="bp-result-grid">
              <div className="bp-rcard bp-rise bp-rise-1">
                <div className="lbl">Industry</div>
                <div className="val">
                  {result.industry?.en || "—"}{" "}
                  <span className="zh" style={{ color: "var(--muted)", fontSize: 14 }}>
                    {result.industry?.zh || ""}
                  </span>
                </div>
                <div className="sub">conf {result.industry?.confidence ?? "—"}</div>
              </div>
              <div className="bp-rcard bp-rise bp-rise-1">
                <div className="lbl">Recommended Tier</div>
                <div className="val">
                  Tier <span className="accent">{result.recommendedTier || "—"}</span>{" "}
                  <span className="zh" style={{ color: "var(--muted)", fontSize: 14 }}>
                    {result.vertical || ""}
                  </span>
                </div>
                <div className="sub">{result.vertical || ""}</div>
              </div>
              <div className="bp-rcard span2 bp-rise bp-rise-2">
                <div className="lbl">Tasks · 任務拆解</div>
                <div className="bp-tasklist">
                  {(result.tasks || []).map((t) => (
                    <div className="row" key={t.id}>
                      <div className="name">
                        <span className="en">{t.en}</span>
                        <span className="zh">/ {t.zh}</span>
                      </div>
                      <div className="role">{t.role}</div>
                      <div>
                        <Tier t={t.tier} />
                      </div>
                      <div className="hours">{t.hours}h</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bp-rcard bp-rise bp-rise-3">
                <div className="lbl">Budget · 預估</div>
                <div className="val">
                  <span className="accent">{fmtNT(result.budget.lo)}</span> –{" "}
                  <span className="accent">{fmtNT(result.budget.hi)}</span>
                </div>
                <div className="sub">includes +15% platform premium</div>
              </div>
              <div className="bp-rcard bp-rise bp-rise-3">
                <div className="lbl">Effort · 總工時</div>
                <div className="val">
                  <span className="accent">{result.totalHours}h</span>{" "}
                  <span style={{ color: "var(--muted)", fontSize: 14 }}>
                    · 8wk · 2-3 expert
                  </span>
                </div>
                <div className="sub">multi-expert DAG attached</div>
              </div>
              <div className="bp-rcard span2 bp-rise bp-rise-4">
                <div className="lbl">Flags · AI 提醒</div>
                <div style={{ marginTop: 4 }}>
                  {result.flags.map((f, i) => (
                    <div key={i} className={"bp-flag " + f.kind}>
                      <span className="ic">
                        {f.kind === "ok" ? "✓" : f.kind === "warn" ? "△" : "ⓘ"}
                      </span>
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                border: "1px dashed var(--line)",
                borderRadius: "var(--r-md)",
                padding: 40,
                textAlign: "center",
                fontFamily: "var(--mono)",
                color: "var(--muted)",
                fontSize: 12,
                background: "var(--bg-1)",
                minHeight: 380,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {phase === "error" ? "↻ 修正後重試、cards 才會出現" : "awaiting trace · cards will materialise"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- STEP 3 · Expectations ----------

function Step3({ state, set, device }) {
  const e = state.expect;
  const setE = (patch) => set({ expect: { ...e, ...patch } });

  return (
    <div>
      <div className="bp-eyebrow">
        <span>Step 02 / Confirm · 確認期待</span>
        <span className="pill">補完 AI 沒猜到的</span>
      </div>
      <h1 className="bp-h1">
        Confirm what AI missed.
        <br />
        <span className="zh" style={{ color: "var(--muted)" }}>
          補完 AI 拆解中沒涵蓋的偏好。
        </span>
      </h1>

      <div className="bp-form" style={{ marginTop: 22 }}>
        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Worker Tier</div>
            <div className="lbl-zh">期待認證等級</div>
          </div>
          <div className="bp-seg bp-seg-tier">
            {[
              { v: "B",   id: "B",   zh: "實踐者", price: "NT$30-80k" },
              { v: "A",   id: "A",   zh: "專家",   price: "NT$80-200k" },
              { v: "A+",  id: "A+",  zh: "大師",   price: "NT$200-500k" },
              { v: "S",   id: "S",   zh: "典範",   price: "NT$500k+" },
              { v: "any", id: "Any", zh: "",       price: "看 AI 拆解" },
            ].map((o) => (
              <button
                key={o.v}
                className={e.tier === o.v ? "active" : ""}
                onClick={() => setE({ tier: o.v })}
              >
                <span className="tid">{o.id}</span>
                {o.zh && <span className="zh">{o.zh}</span>}
                <span style={{ display: "block", fontSize: 10, color: "var(--muted)", marginTop: 2, fontFamily: "var(--mono)", letterSpacing: "0.02em" }}>{o.price}</span>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6, fontFamily: "var(--mono)" }}>
            ※ 價格區間為平台統計、實際報價依案件複雜度 + Claude AI 顧問建議調整（含 +15% 平台溢價）
          </div>
        </div>

        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Deliverables</div>
            <div className="lbl-zh">交付內容</div>
          </div>
          <div className="bp-seg">
            {["KV 主視覺", "Reels 腳本", "產品文案", "排程操盤", "ROAS 解讀"].map(
              (b) => (
                <button
                  key={b}
                  className={e.badges.includes(b) ? "active" : ""}
                  onClick={() => {
                    const has = e.badges.includes(b);
                    setE({
                      badges: has ? e.badges.filter((x) => x !== b) : [...e.badges, b],
                    });
                  }}
                >
                  <span className="zh">{b}</span>
                </button>
              )
            )}
          </div>
        </div>

        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Delivery Window</div>
            <div className="lbl-zh">期待交付時間</div>
          </div>
          <div className="bp-seg">
            {["1 wk", "2 wk", "4 wk", "6 wk", "8 wk", "10 wk", "12 wk", "彈性"].map((w) => (
              <button
                key={w}
                className={e.window === w ? "active" : ""}
                onClick={() => setE({ window: w })}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Budget Cap</div>
            <div className="lbl-zh">預算上限（彈性 / 嚴格）</div>
          </div>
          <div className="bp-range">
            <input
              type="range"
              min="100000"
              max="400000"
              step="10000"
              value={e.budget}
              onChange={(ev) => setE({ budget: +ev.target.value })}
            />
            <div className="v">
              {fmtNT(e.budget)} <span style={{ opacity: 0.6 }}>cap</span>
            </div>
          </div>
        </div>

        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Multi-expert</div>
            <div className="lbl-zh">是否接受多人共案</div>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className={"bp-toggle " + (e.multi ? "on" : "")}
              onClick={() => setE({ multi: !e.multi })}
            >
              <span className="sw"></span>
              <span>{e.multi ? "ON · 接受 2-3 expert" : "OFF · 單一 worker"}</span>
            </button>
          </div>
        </div>

        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">NPS Threshold</div>
            <div className="lbl-zh">過往 NPS 門檻</div>
          </div>
          <div className="bp-seg">
            {[
              { v: 4.0, en: "≥ 4.0", zh: "寬鬆" },
              { v: 4.3, en: "≥ 4.3", zh: "標準" },
              { v: 4.5, en: "≥ 4.5", zh: "嚴格" },
              { v: 4.7, en: "≥ 4.7", zh: "頂級" },
            ].map((o) => (
              <button
                key={o.v}
                className={e.nps === o.v ? "active" : ""}
                onClick={() => setE({ nps: o.v })}
              >
                {o.en} <span className="zh">/ {o.zh}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Bonus Signals</div>
            <div className="lbl-zh">加分條件（複選）</div>
          </div>
          <div className="bp-seg">
            {[
              { id: "voice", en: "Worker has voice", zh: "希望 worker 自帶 IG/Threads 聲量" },
              { id: "local", en: "TW market savvy", zh: "希望 worker 熟台灣市場文化" },
              { id: "loyalty", en: "Prior collaborator", zh: "優先曾合作過的 worker" },
              { id: "mercy", en: "Open to newcomer", zh: "願意給新銳 worker 機會（非主流選項加分）" },
            ].map((b) => (
              <button
                key={b.id}
                className={e.bonus.includes(b.id) ? "active" : ""}
                onClick={() => {
                  const has = e.bonus.includes(b.id);
                  setE({
                    bonus: has ? e.bonus.filter((x) => x !== b.id) : [...e.bonus, b.id],
                  });
                }}
              >
                {b.en} <span className="zh">/ {b.zh}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- STEP 4 · Match ----------

function Step4({ state, set, device }) {
  const [filter, setFilter] = useState("all"); // all | tierA+ | mercy
  const demo = getDemoForVertical(state.vertical);
  const demoWorkers = demo.workers;
  const verticalSuggestedPair = demo.suggestedPair;
  const verticalZh = VERTICALS.find((v) => v.id === state.vertical)?.zh || "你選的領域";

  // T1.5 . Supabase real worker pool (P0-2 . 2026-05-20 calcifer)
  //   real >= 3 -> use real pool (badge real pool)
  //   real < 3 / error / loading -> fallback to demo (badge sample)
  const [poolState, setPoolState] = useState({
    workers: demoWorkers,
    source: "sample",
    loading: false,
    error: null,
  });

  useEffect(() => {
    const vid = state.vertical;
    if (!vid || !window.bpWorkers || typeof window.bpWorkers.queryByVertical !== "function") {
      setPoolState({ workers: demoWorkers, source: "sample", loading: false, error: null });
      return;
    }
    let cancelled = false;
    setPoolState((prev) => ({ ...prev, loading: true }));
    window.bpWorkers.queryByVertical(vid, 5).then(({ data, error }) => {
      if (cancelled) return;
      const REAL_MIN = 3;
      if (error || !Array.isArray(data) || data.length < REAL_MIN) {
        setPoolState({ workers: demoWorkers, source: "sample", loading: false, error: error || null });
        return;
      }
      // Map worker_unified_v rows -> Step 4 display shape using unified_card.
      // Placeholder score/breakdown/boost until real scoring algo lands in P1-3.
      const mapped = data.map(function (row) {
        const card = row.unified_card || {};
        return {
          id: card.id || row.id,
          handle: card.handle || ("@" + (row.email || "worker").split("@")[0]),
          name: card.name || row.display_name || "anonymous",
          role: card.role || "Worker",
          tier: card.tier || row.tier_suggestion || "B",
          badges: Array.isArray(card.badges) ? card.badges : [],
          nps: typeof card.nps === "number" ? card.nps : null,
          cases: card.cases_completed || 0,
          capacity: card.capacity || 3,
          voice: 0,
          voiceCh: "-",
          domainMatch: 0.75,
          score: 75 + Math.max(0, Math.min(20, (card.L_score || 5) * 2)),
          breakdown: { load: 15, calendar: 12, tier: 10, nps: 8, domain: 10, voice: 2, boost: 5 },
          boost: { mercy: 0, vertical: 0 },
          blurb: card.blurb || "",
          works: Array.isArray(card.works) ? card.works : [],
          portfolio: Array.isArray(card.portfolio) ? card.portfolio : null,
          avatar: null,
          last: "new",
        };
      });
      setPoolState({ workers: mapped, source: "real", loading: false, error: null });
    }).catch(function (e) {
      if (cancelled) return;
      setPoolState({ workers: demoWorkers, source: "sample", loading: false, error: { message: String(e) } });
    });
    return function () { cancelled = true; };
  }, [state.vertical, demoWorkers]);

  const verticalWorkers = poolState.workers;
  const [expanded, setExpanded] = useState(state.selectedWorkers[0] || verticalSuggestedPair[0]);
  const selected = state.selectedWorkers;

  const filtered = useMemo(() => {
    let list = verticalWorkers.slice().sort((a, b) => b.score - a.score);
    if (filter === "tierA+") list = list.filter((w) => w.tier === "A+");
    if (filter === "mercy") list = list.filter((w) => w.boost && w.boost.mercy > 0);
    return list;
  }, [filter, verticalWorkers]);

  const toggleSel = (id) => {
    const has = selected.includes(id);
    set({
      selectedWorkers: has ? selected.filter((x) => x !== id) : [...selected, id],
    });
  };

  return (
    <div>
      <div className="bp-eyebrow">
        <span>Step 04 / Match · AI 配對 + 人工覆核</span>
        <span className="pill" style={{ background: "rgba(255,200,80,0.1)", color: "#ffc850", borderColor: "rgba(255,200,80,0.3)" }}>● POC · 早期合作</span>
        <span
          className="pill"
          style={
            poolState.source === "real"
              ? { background: "var(--accent-soft)", color: "var(--accent)", borderColor: "var(--accent-line)" }
              : { background: "rgba(154,154,163,0.08)", color: "var(--muted)", borderColor: "var(--line)" }
          }
          title={poolState.source === "real" ? "已通過認證的真實 worker pool" : "目前該領域認證 worker 累積中、以下為過往合作案例展示"}
        >
          {poolState.loading ? "● 載入中…" : poolState.source === "real" ? "● 真實配對池" : "● 案例展示"}
        </span>
      </div>
      <h1 className="bp-h1">
        Top examples in your vertical.
        <br />
        <span className="zh" style={{ color: "var(--muted)" }}>
          下方為「{verticalZh}」領域過往合作案例參考、實際配對 24h 內以 email 寄出。
        </span>
      </h1>
      <div style={{
        marginTop: 16,
        padding: "14px 18px",
        background: "rgba(199,232,74,0.06)",
        border: "1px solid rgba(199,232,74,0.25)",
        borderRadius: "var(--r-md)",
        fontSize: 13,
        color: "var(--text-2)",
        lineHeight: 1.7,
      }}>
        <div style={{ marginBottom: 6 }}>
          ✨ <b style={{ color: "var(--accent)" }}>已收到你的「{verticalZh}」需求、進入後台</b>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
          下方為「{verticalZh}」領域過往合作案例參考。<b style={{ color: "var(--text-2)" }}>實際配對方案 24h 內寄到你的 email</b>：含 AI 初審 + 團隊人工覆核 + 候選 worker + 報價區間。早期合作 · 第一批一對一處理。
        </div>
      </div>

      <div className="bp-match-head" style={{ marginTop: 22 }}>
        <div>
          <div className="ttl-en">SUGGESTED PAIR · 2-EXPERT DAG</div>
          <div className="ttl-zh">
            Tier A+ 領域專家 <span style={{ color: "var(--muted)" }}>(視覺 · 50%)</span> +
            Tier A+ 領域專家 <span style={{ color: "var(--muted)" }}>(文案 · 30%)</span> +
            Tier A+ 領域專家 <span style={{ color: "var(--muted)" }}>(排程 · 20%)</span>
          </div>
        </div>
        <div className="stats">
          <div>
            avg score · <b>88</b>
          </div>
          <div>
            est. cost · <b>NT$214K</b>
          </div>
          <div>
            first-match · <b>14d</b>
          </div>
        </div>
      </div>

      <div className="bp-toolbar">
        <button
          className={"bp-chip " + (filter === "all" ? "active" : "")}
          onClick={() => setFilter("all")}
        >
          all · 5
        </button>
        <button
          className={"bp-chip " + (filter === "tierA+" ? "active" : "")}
          onClick={() => setFilter("tierA+")}
        >
          tier A+ · 2
        </button>
        <button
          className={"bp-chip " + (filter === "mercy" ? "active" : "")}
          onClick={() => setFilter("mercy")}
        >
          反馬太加成 · 1
        </button>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
          sort · score desc
        </span>
      </div>

      {filtered.length === 0 && (
        <div className="bp-empty">
          <div className="ic">∅</div>
          沒有符合的 worker。試試放寬條件，或 24h 客服介入。
        </div>
      )}

      {filtered.map((w, i) => {
        const isSel = selected.includes(w.id);
        const isExp = expanded === w.id;
        const isSuggested = verticalSuggestedPair.includes(w.id);
        return (
          <div
            key={w.id}
            className={"bp-worker tier-" + tierClassFor(w.tier) + " " + (isSel ? "selected" : "") + " bp-rise"}
            style={{ animationDelay: `${i * 80}ms` }}
            onClick={() => setExpanded(isExp ? null : w.id)}
          >
            <div className="av">
              {w.avatar ? (
                <img src={w.avatar} alt={w.name} loading="lazy" />
              ) : (
                w.name.split(" ").map((n) => n[0]).join("")
              )}
            </div>
            <div className="body">
              <div className="title-row">
                <span className="name">{w.name}</span>
                <span className="handle">{w.handle}</span>
                <Tier t={w.tier} />
                {isSuggested && (
                  <span
                    className="bp-badge"
                    style={{
                      color: "var(--accent)",
                      borderColor: "var(--accent-line)",
                      background: "var(--accent-soft)",
                    }}
                  >
                    AI suggested
                  </span>
                )}
              </div>
              <div className="role">{w.role}</div>
              <div className="blurb">{w.blurb}</div>
              <div className="badges">
                {w.badges.map((b) => (
                  <Badge key={b}>{b}</Badge>
                ))}
              </div>
              {isExp && w.portfolio && w.portfolio.length > 0 && (
                <div className="bp-portfolio-strip bp-rise bp-rise-1">
                  <div className="bp-portfolio-h">
                    <span>PORTFOLIO · {w.portfolio.length} RECENT WORK</span>
                    <span className="hint">click to expand →</span>
                  </div>
                  <div className="bp-portfolio-row">
                    {w.portfolio.map((p, idx) => (
                      <div
                        key={idx}
                        className="bp-thumb"
                        title={p.client + " · " + p.desc + " · NPS " + p.nps + (p.roas !== "—" ? " · ROAS " + p.roas : "")}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          window.alert(p.client + "\n" + p.desc + "\nNPS " + p.nps + (p.roas !== "—" ? " · ROAS " + p.roas : "") + "\n\n(完整 case study modal · 下個 sprint)");
                        }}
                      >
                        <div className="bp-thumb-img">
                          <span className="bp-thumb-letter">{p.client.charAt(0)}</span>
                        </div>
                        <div className="bp-thumb-cap">
                          <div className="bp-thumb-client">{p.client}</div>
                          <div className="bp-thumb-desc">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isExp && (!w.portfolio || w.portfolio.length === 0) && (
                <div className="bp-portfolio-empty bp-rise bp-rise-1">
                  首案進行中 · 完成後解鎖 portfolio · 可從 voice / 領域 match 評估
                </div>
              )}
              <div className="stats-grid">
                <div>
                  NPS <b>{w.nps}</b>
                </div>
                <div>
                  load <b>{w.cases}/{w.capacity}</b>
                </div>
                <div>
                  last <b>{w.last}</b>
                </div>
                <div>
                  domain <b>{Math.round(w.domainMatch * 100)}%</b>
                </div>
                <div>
                  voice <b>{(w.voice / 1000).toFixed(1)}k</b> {w.voiceCh}
                </div>
                <div>
                  works <b>{w.works.slice(0, 2).join(" · ")}</b>
                </div>
              </div>

              {isExp && (
                <div className="bp-breakdown">
                  {[
                    { k: "load", lbl: "case load (25)", v: w.breakdown.load, max: 25 },
                    { k: "calendar", lbl: "calendar (20)", v: w.breakdown.calendar, max: 20 },
                    { k: "tier", lbl: "tier (15)", v: w.breakdown.tier, max: 15 },
                    { k: "nps", lbl: "past NPS (15)", v: w.breakdown.nps, max: 15 },
                    { k: "domain", lbl: "domain (15)", v: w.breakdown.domain, max: 15 },
                    { k: "voice", lbl: "voice (5)", v: w.breakdown.voice, max: 5 },
                    { k: "boost", lbl: "boosters (≤10)", v: w.breakdown.boost, max: 15 },
                  ].map((row) => (
                    <div className="bp-bar-row" key={row.k}>
                      <span className="lbl">{row.lbl}</span>
                      <span
                        className="bar"
                        style={{ "--pct": `${(row.v / row.max) * 100}%` }}
                      ></span>
                      <span className="v">{row.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="score-col">
              {w.boost.mercy > 0 && <span className="mercy">+10 反馬太</span>}
              <div className="score">
                {w.score}
                <span className="of">/100</span>
              </div>
              <div className="score-lbl">match score</div>
              <button
                className={"bp-btn " + (isSel ? "primary" : "")}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSel(w.id);
                }}
                style={{ marginTop: 6 }}
              >
                {isSel ? "✓ shortlisted" : "+ shortlist"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Right Rail (desktop) ----------

function Rail({ step, state }) {
  const v = VERTICALS.find((x) => x.id === state.vertical);
  return (
    <div className="bp-rail">
      <div>
        <div className="bp-rail-h">why this exists</div>
        <p className="desc" style={{ marginTop: 8 }}>
          客戶輸入需求 → 平台 AI 拆解 → 配給合適 AI 工作者執行 →
          雙邊評鑑 → 數據回到推薦系統。<b style={{ color: "var(--text)" }}>
          B1 → B4 → B5 → B2 → B3 飛輪</b>。
        </p>
      </div>

      <div className="bp-tip">
        {step === 0 && (
          <span>
            <code>tip</code>{" "}
            <span className="zh">
              想清楚是 <b>內容自動化</b> 還是 <b>策略諮詢</b>。前者走 worker pool
              ，後者通常需要 Tier A+ 雙領域。
            </span>
          </span>
        )}
        {step === 1 && (
          <span>
            <code>fit</code>{" "}
            <span className="zh">
              條件越嚴 → 配對池越窄。推薦先寬，看完前 5 名再回來收緊。
              <br />
              <br />
              <b style={{ color: "var(--accent)" }}>Tier 指南</b>：
              <br />
              <b>B 實踐者</b> 通過驗證 · 完成 3 件 NPS≥4，市價 −10%
              <br />
              <b>A 專家</b> 通過 &lt; 10% 篩選，市價
              <br />
              <b>A+ 大師</b> 垂直領域認證（DTC / 品牌 DNA × AI），+15%
              <br />
              <b>S 典範</b> 雙領域大師 · 2 年以上紀錄，+35%
              <br />
              <b>Any</b> AI 自動匹配
              <br />
              <br />
              <span style={{ color: "var(--accent)" }}>※ 未驗證接案者不會進入配對池</span>，
              等級越高接案費率越高，預算需求隨之上升。
            </span>
          </span>
        )}
        {step === 2 && (
          <span>
            <code>parse</code>{" "}
            <span className="zh">
              AI 拆解結果 = 合約附件 A，會直接綁進 Step 6 合約草稿預覽範圍。
            </span>
          </span>
        )}
        {false && (
          <span>
            <code>parse</code>{" "}
            <span className="zh">
              條件越嚴 → 配對池越窄。推薦先寬，看完前 5 名再回來收緊。
              <br />
              <br />
              <b style={{ color: "var(--accent)" }}>Tier 指南</b>：
              <br />
              <b>B 實踐者</b> 通過驗證 · 完成 3 件 NPS≥4，市價 −10%
              <br />
              <b>A 專家</b> 通過 &lt; 10% 篩選，市價
              <br />
              <b>A+ 大師</b> 垂直領域認證（DTC / 品牌 DNA × AI），+15%
              <br />
              <b>S 典範</b> 雙領域大師 · 2 年以上紀錄，+35%
              <br />
              <b>Any</b> AI 自動匹配
              <br />
              <br />
              <span style={{ color: "var(--accent)" }}>※ 未驗證接案者不會進入配對池</span>，
              等級越高接案費率越高，預算需求隨之上升。
            </span>
          </span>
        )}
        {step === 3 && (
          <span>
            <code>adr-006</code>{" "}
            <span className="zh">
              載入 / 檔期 / Tier / NPS / 領域 / 聲量 = 100 分。+10 反馬太、
              +5 loyalty、−5 連拒。
            </span>
          </span>
        )}
      </div>

      <div>
        <div className="bp-rail-h">session spec</div>
        <div className="bp-spec" style={{ marginTop: 10 }}>
          <span>vertical</span>
          <b>{v ? v.en : "—"}</b>
          <span>brief</span>
          <b>{state.brief ? `${state.brief.length} ch` : "empty"}</b>
          <span>tier req</span>
          <b>{state.expect.tier}</b>
          <span>budget cap</span>
          <b>{fmtNT(state.expect.budget)}</b>
          <span>multi-expert</span>
          <b>{state.expect.multi ? "yes" : "no"}</b>
          <span>shortlist</span>
          <b>{state.selectedWorkers.length} / 5</b>
          <span>est. step</span>
          <b>{["choose", "review", "tune", "match"][step]}</b>
        </div>
      </div>

      <div>
        <div className="bp-rail-h">what comes next</div>
        <div className="bp-spec" style={{ marginTop: 10 }}>
          {[
            { n: "01", t: "pre-intake" },
            { n: "02", t: "ai parse" },
            { n: "03", t: "tune plan" },
            { n: "04", t: "match expert" },
            { n: "05", t: "worker accept" },
            { n: "06", t: "contract draft preview" },
            { n: "07", t: "acceptance framework" },
            { n: "08", t: "kickoff dashboard" },
            { n: "09", t: "milestone review" },
            { n: "10", t: "delivery & nps" },
            { n: "11", t: "flywheel update" },
            { n: "12", t: "retainer / loop" },
          ].slice(step + 1, step + 5).map((s) => (
            <React.Fragment key={s.n}>
              <span>{s.n}</span>
              <b style={{ color: "var(--muted)" }}>{s.t}</b>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Main App ----------

function IntakeSubmitModal({ state, onCancel, onDone }) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const doSubmit = async () => {
    setError("");
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("請填一個有效 email · BeyondPath 24h 內回覆配對結果");
      return;
    }
    setSubmitting(true);
    try {
      if (window.bpClientIntake) {
        const { error: sbError } = await window.bpClientIntake.submit({
          email,
          companyName: companyName || null,
          intakeData: state || {},
        });
        if (sbError) throw sbError;
      }
      onDone && onDone();
    } catch (e) {
      setSubmitting(false);
      setError("送出失敗：" + (e?.message || "未知錯誤") + "。先複製 brief 寄到 edwardt0303@gmail.com 也行。");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#0a0a0b", border: "1px solid rgba(199,232,74,0.4)", padding: "32px 28px", color: "#f0eee8" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.14em", color: "#c7e84a", textTransform: "uppercase", marginBottom: 10 }}>◆ 取得 24h 配對方案</div>
        <h2 style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.3 }}>送出需求 · 取得 24h 配對方案</h2>
        <p style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: 14, color: "#9a9aa3", margin: "0 0 22px", lineHeight: 1.6 }}>24h 內：AI 初審 + 人工覆核 → 配對方案、候選人與時程寄到你的 email。Early Beta · 送出進人工審核、不代表正式合約或付款。</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" placeholder="your@email.com（必填）" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} disabled={submitting} style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#f0eee8", fontFamily: "Noto Sans TC, sans-serif", fontSize: 15 }} />
          <input type="text" placeholder="公司 / 品牌名（可選）" value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={submitting} style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#f0eee8", fontFamily: "Noto Sans TC, sans-serif", fontSize: 15 }} />
          {error && <div style={{ padding: "10px 12px", background: "rgba(212,113,42,0.1)", border: "1px solid rgba(212,113,42,0.4)", color: "oklch(0.82 0.16 75)", fontSize: 13 }}>⚠ {error}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onCancel} disabled={submitting} style={{ padding: "12px 18px", background: "transparent", color: "#c8c6c0", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "JetBrains Mono, monospace", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase" }}>取消</button>
            <button type="button" onClick={doSubmit} disabled={submitting} style={{ flex: 1, padding: "12px 18px", background: "#c7e84a", color: "#0a0a0b", border: "1px solid #c7e84a", fontFamily: "JetBrains Mono, monospace", fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, cursor: submitting ? "wait" : "pointer", textTransform: "uppercase", opacity: submitting ? 0.5 : 1 }}>{submitting ? "送出中…" : "→ 取得 24h 配對方案"}</button>
          </div>
        </div>
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px dashed rgba(255,255,255,0.08)", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#6a6a78", letterSpacing: "0.06em", lineHeight: 1.7 }}>Early Beta · 你的 brief + 配對結果進入 BeyondPath 後台、不會公開 · 24h 內 email 回覆 · 第一次送出僅取得配對方案、不代表正式合約或付款</div>
      </div>
    </div>
  );
}

function ClientIntakeApp({ device = "desktop", initialStep = 0, presetParsed = false, step: controlledStep, onStep, onAdvanceBeyond, hideStepper = false, hideTopbar = false }) {
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [uStep, setUStep] = useState(initialStep);
  const step = controlledStep != null ? controlledStep : uStep;
  const setStep = (next) => {
    const v = typeof next === "function" ? next(step) : next;
    if (onStep) onStep(v); else setUStep(v);
  };
  const initialVertical = "dtc";
  const initialDemo = getDemoForVertical(initialVertical);
  const [state, setState] = useState({
    vertical: initialVertical,
    brief: initialDemo.brief,
    briefSource: "sample",
    parseDone: presetParsed || initialStep > 1,
    parsed: (presetParsed || initialStep > 1) ? initialDemo.parse : null,
    expect: {
      tier: "A+",
      badges: ["KV 主視覺", "Reels 腳本"],
      window: "8 wk",
      budget: 240000,
      multi: true,
      nps: 4.5,
      bonus: ["voice", "local"],
    },
    selectedWorkers: initialDemo.suggestedPair.slice(0, 2),
    enterprise: {
      nda: false,
      invoice: false,
      contract: false,
      talkToEdward: false,
    },
    clientType: null, // Q3 Task 2 · 'company' | 'individual' | 'studio' | 'student'
    betaAck: false,   // Q3 Task 2 · Early Beta 規則確認 (寫進 intake_data)
  });

  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const contentRef = useRef();

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [step]);

  // vertical-aware demo data · 當 vertical 變且 briefSource === "sample"
  // → 重置 brief / parsed / selectedWorkers 為對應 vertical 的 demo
  // (用戶手動 paste / upload 的 brief 不會被覆蓋)
  useEffect(() => {
    setState((s) => {
      if (s.briefSource !== "sample") return s;
      const demo = getDemoForVertical(s.vertical);
      return {
        ...s,
        brief: demo.brief,
        parsed: s.parsed ? demo.parse : s.parsed,
        selectedWorkers: demo.suggestedPair.slice(0, 2),
      };
    });
  }, [state.vertical]);

  const canContinue = () => {
    if (step === 0) return state.vertical && state.brief && state.brief.trim().length > 30;
    if (step === 2) return state.parseDone;
    return true;
  };

  const ctaLabel = () => {
    if (step === 0) return "Confirm expectations →";
    if (step === 1) return "Run AI parse →";
    if (step === 2) return "Find matches →";
    return submitDone ? "合約草稿預覽 →" : "Submit · 取得 24h 配對方案 →";
  };

  return (
    <div className={"bp-root " + (device === "mobile" ? "bp-mobile is-mobile" : "is-desktop")}>
      {!hideTopbar && <Topbar step={step} device={device} hideStepper={hideStepper} />}
      <div className="bp-main">
        <div className="bp-content" ref={contentRef}>
          {step === 0 && <Step1 state={state} set={set} device={device} />}
          {step === 1 && <Step3 state={state} set={set} device={device} />}
          {step === 2 && <Step2 state={state} set={set} />}
          {step === 3 && <Step4 state={state} set={set} device={device} />}
          {device === "desktop" && (() => {
            const meta = [
              { n: "01", en: "Pre-intake", zh: "選領域 + 上傳需求" },
              { n: "02", en: "Confirm",    zh: "確認期待" },
              { n: "03", en: "AI Parse",   zh: "AI 拆解需求" },
              { n: "04", en: "Match",      zh: "AI 自動配對" },
            ][step];
            return (
              <div className="bp-dock">
                <button
                  className="bp-btn ghost"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  ← back
                </button>
                <div className="meta">
                  <span className="num">{meta.n}</span>
                  <span className="en">{meta.en}</span>
                  <span className="zh">/ {meta.zh}</span>
                  {step === 3 && state.selectedWorkers.length > 0 && (
                    <>
                      <span className="dot">·</span>
                      <span className="actor">shortlisted {state.selectedWorkers.length}</span>
                    </>
                  )}
                </div>
                <span className="spacer"></span>
                <button
                  className="bp-btn primary"
                  disabled={!canContinue()}
                  onClick={() => {
                    if (step === 3) {
                      if (submitDone && onAdvanceBeyond) onAdvanceBeyond(state);
                      else setSubmitModalOpen(true);
                    } else setStep((s) => Math.min(3, s + 1));
                  }}
                >
                  {ctaLabel()} <span className="arrow">→</span>
                </button>
              </div>
            );
          })()}
        </div>
        {device === "desktop" && <Rail step={step} state={state} />}
      </div>

      {device === "mobile" && (
        <div className="bp-mnav">
          <button
            className="bp-btn ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            ←
          </button>
          <div className="meta">
            <b>0{step + 1}</b> / 04 · {["pre-intake", "ai parse", "confirm", "match"][step]}
          </div>
          <button
            className="bp-btn primary"
            disabled={!canContinue()}
            onClick={() => {
              if (step === 3) {
                if (submitDone && onAdvanceBeyond) onAdvanceBeyond(state);
                else setSubmitModalOpen(true);
              } else setStep((s) => Math.min(3, s + 1));
            }}
          >
            {step === 3 ? (submitDone ? "contract →" : "submit →") : "next →"}
          </button>
        </div>
      )}

      {submitModalOpen && (
        <IntakeSubmitModal
          state={state}
          onCancel={() => setSubmitModalOpen(false)}
          onDone={() => {
            setSubmitModalOpen(false);
            setSubmitDone(true);
            if (onAdvanceBeyond) onAdvanceBeyond(state);
          }}
        />
      )}
    </div>
  );
}

window.ClientIntakeApp = ClientIntakeApp;
window.IntakeSubmitModal = IntakeSubmitModal;
