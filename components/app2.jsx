// BeyondPath · Client Intake (Step 1-4) — interactive React app
// Mounts into both desktop and mobile artboards via window.BPApp({device}).

const { useState, useEffect, useRef, useMemo } = React;
const { VERTICALS, VERTICAL_CATS, VERTICAL_DEMO_MAP, getDemoForVertical, SAMPLE_BRIEF, AI_PARSE_RESULT, WORKERS, SUGGESTED_PAIR } = window.BP_DATA;

const fmtNT = (n) => "NT$" + n.toLocaleString();

// ============================================================
// PMF Funnel · 發案漏斗 drop-off 埋點 (2026-05-30 calcifer · doc 34 T6)
// 缺口: 只有送出成功才進 client_intakes、開始填但沒送出的客戶查不到
//       → 算不出「開始發案 → 真送出」轉換率 (PMF 最關鍵的需求側漏斗)。
// 做法: 純前端 localStorage 匿名計數、零個資、零依賴、零 migration、零 deploy。
//       絕不記 brief/email/phone 內容 — 只記 時間戳 + 計數 (AGENTS.md: no real PII)。
// 算流失率: drop_off = 1 - completed / started  (console: window.bpFunnel.stats())
// 上線後升級: emit() 留好 hook、未來接 supabase funnel_events 無痛換 (B 方案、見 doc 34)。
// ============================================================
const bpFunnel = (function () {
  var KEY = "bp-funnel-client";
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return { started: 0, completed: 0, started_at: null, last_started_at: null, last_completed_at: null };
      var o = JSON.parse(raw);
      return (o && typeof o === "object") ? o : { started: 0, completed: 0 };
    } catch (e) { return { started: 0, completed: 0 }; }
  }
  function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  return {
    markStart: function () {
      var o = read();
      var now = new Date().toISOString();
      o.started = (o.started || 0) + 1;
      if (!o.started_at) o.started_at = now;
      o.last_started_at = now;
      write(o);
      this.emit("intake_start");
    },
    markComplete: function () {
      var o = read();
      o.completed = (o.completed || 0) + 1;
      o.last_completed_at = new Date().toISOString();
      write(o);
      this.emit("intake_submit");
    },
    stats: function () {
      var o = read();
      var s = o.started || 0, c = o.completed || 0;
      return {
        started: s, completed: c,
        drop_off: s > 0 ? +(1 - c / s).toFixed(3) : null,
        conversion: s > 0 ? +(c / s).toFixed(3) : null,
        started_at: o.started_at || null,
        last_started_at: o.last_started_at || null,
        last_completed_at: o.last_completed_at || null,
      };
    },
    emit: function (event) {
      try {
        if (typeof window !== "undefined" && window.bpFunnelSink && typeof window.bpFunnelSink === "function") {
          window.bpFunnelSink(event, { ts: new Date().toISOString() });
        }
      } catch (e) {}
    },
  };
})();
if (typeof window !== "undefined") window.bpFunnel = bpFunnel;

// 2026-05-29 calcifer Q1/Q4 . shared label maps for budget / timeline select values
const BUDGET_LABELS = {
  under_30k: "NT$30K 以下", "30_100k": "NT$30-100K", "100_300k": "NT$100-300K",
  "300k_plus": "NT$300K+", ai_estimate: "待 AI 估",
};
const TIMELINE_LABELS = {
  within_1w: "1 週內", "2_4w": "2-4 週", "1_3m": "1-3 個月",
  "3m_plus": "3 個月以上", flexible: "彈性",
};

// 2026-05-29 calcifer Q1 . CaseSummaryBar . sticky context strip on Step 02/03/04
// shows "{vertical icon} {vertical zh} . budget . timeline" so client (esp. mobile) always
// sees what case they are filing.
function CaseSummaryBar({ state }) {
  const v = (window.BP_DATA.VERTICALS || []).find((x) => x.id === state.vertical);
  const verticalZh = v ? v.zh : _t("client.vertical_fallback", "你選的領域");
  const verticalIcon = v ? v.icon : "◇";
  // 2026-05-29 calcifer Q4-revert . budget/timeline now optional (Step 01 select removed) -> show segment only when value exists, no empty dash noise.
  const budget = state.budgetRange ? (BUDGET_LABELS[state.budgetRange] || state.budgetRange) : null;
  const timeline = state.timeline ? (TIMELINE_LABELS[state.timeline] || state.timeline) : null;
  return (
    <div className="bp-case-summary" style={{
      position: "sticky", top: 0, zIndex: 20,
      display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      padding: "10px 14px", marginBottom: 16,
      // 2026-05-29 calcifer . solid bg (was 3% translucent -> bled through on mobile sticky scroll)
      background: "var(--bg, #0d0d0f)",
      border: "1px solid var(--accent-line, rgba(199,232,74,0.25))",
      borderRadius: "var(--r-sm, 6px)",
      fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--muted)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    }}>
      <span style={{ color: "var(--accent)", fontSize: 15, lineHeight: 1 }}>{verticalIcon}</span>
      <b style={{ color: "var(--accent)", fontWeight: 600 }}>{verticalZh}</b>
      {budget && <span style={{ opacity: 0.4 }}>{"·"}</span>}
      {budget && <span>{_t("client.summary_budget", "預算")} <b style={{ color: "var(--text-2, #c8c6c0)" }}>{budget}</b></span>}
      {timeline && <span style={{ opacity: 0.4 }}>{"·"}</span>}
      {timeline && <span>{_t("client.summary_timeline", "時程")} <b style={{ color: "var(--text-2, #c8c6c0)" }}>{timeline}</b></span>}
    </div>
  );
}

// 2026-05-29 calcifer Q4 . MissingHint . shows above CTA when blocked, lists missing fields
function MissingHint({ items, device }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="bp-missing-hint" style={{
      fontFamily: "var(--mono)", fontSize: 11.5, lineHeight: 1.5,
      color: "var(--accent)",
      maxWidth: device === "mobile" ? "100%" : 360,
      textAlign: device === "mobile" ? "center" : "right",
    }}>
      <span style={{ opacity: 0.85 }}>{_t("client.miss_prefix", "還差：")}</span>
      <span>{items.join(" · ")}</span>
    </div>
  );
}


// ---------- Tiny atoms ----------

// Tier atom (T1.5 . 2026-05-20 calcifer . spec 09)
// Maps tier_suggestion -> CSS modifier + zh narrative label.
// === i18n helpers (Step 3c - 2026-05-25) ===
function _t(key, fallback) {
  return window.BPi18n ? window.BPi18n.t(key, fallback) : fallback;
}
function useI18n() {
  const [, setRev] = React.useState(0);
  React.useEffect(() => {
    const h = () => setRev(r => r + 1);
    document.addEventListener("i18n:change", h);
    return () => document.removeEventListener("i18n:change", h);
  }, []);
}

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
          {/* 2026-06-01 calcifer · doc 43 UX · 明確進度「步驟 N/4」、不讓用戶以為流程很長 */}
          <div className="bp-step-count" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.08em", color: "var(--accent)", marginRight: 14, whiteSpace: "nowrap" }}>
            步驟 {Math.min(4, Math.max(1, step + 1))} / 4
          </div>
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

  // 2026-05-29 calcifer · 馬魯克 P0-3 · 發案領域鎖池子 (Edward 5/29 拍板動態查)
  // null = 還沒查到 (放行全部、不卡載入) · array = 池子裡有 approved worker 的 vertical
  // 池子加人 → 自動開更多領域、不必改 code。RPC 失敗也 fallback 放行全部 (寧可多開不卡早期試用)。
  const [availVerticals, setAvailVerticals] = useState(null);
  useEffect(() => {
    let alive = true;
    if (window.bpVerticals && window.bpVerticals.getAvailableVerticals) {
      window.bpVerticals.getAvailableVerticals().then((r) => {
        if (!alive) return;
        if (r && r.data && Array.isArray(r.data)) {
          const avail = r.data;
          setAvailVerticals(avail);
          // 若目前選的 vertical 不在池子裡 (預設 dtc 可能沒人) → 自動切到第一個有人的領域、避免帶著鎖死領域往下走
          const curIsOk = (function () {
            const cur = (VERTICALS || []).find((x) => x.id === state.vertical);
            if (!cur) return false;
            if (cur.id === "other") return true;
            if (cur.featured === "discovery") return true; // 2026-06-11 · 探索 = 平台直接交付、不依賴 pool
            return avail.indexOf(cur.id) !== -1 || avail.indexOf(cur.cat) !== -1;
          })();
          if (!curIsOk) {
            const firstOk = (VERTICALS || []).find((x) =>
              x.id !== "other" && (avail.indexOf(x.id) !== -1 || avail.indexOf(x.cat) !== -1)
            );
            if (firstOk) set({ vertical: firstOk.id });
          }
        }
        // error → 留 null = 放行全部 (fallback)
      }).catch(() => {});
    }
    return () => { alive = false; };
  }, []);

  // 某個 vertical 是否可發案 · null 階段 / RPC 失敗 → 全可選 · other 永遠可選
  // worker verticals 可能含 cat 名 (e.g. 'strategy') · 對映到該 cat 底下所有 vertical
  const isVerticalAvailable = (v) => {
    if (v.featured === "discovery") return true; // 2026-06-11 · 探索 = 平台直接交付、永遠開
    if (!availVerticals) return true;            // 還沒查到 → 不卡
    if (v.id === "other") return true;           // 其他 (人工媒合) 永遠開
    if (availVerticals.indexOf(v.id) !== -1) return true;     // 直接命中 vertical id
    if (availVerticals.indexOf(v.cat) !== -1) return true;    // 命中 cat 名 (worker 存 cat 別名)
    return false;
  };

  // 2026-06-11 調研批 · 探索入口獨立成置頂 strip、不進 grid / 不進 chip 計數
  const discoveryV = (VERTICALS || []).find((v) => v.featured === "discovery");
  const gridVerticals = useMemo(() => (VERTICALS || []).filter((v) => !v.featured), []);

  const filteredVerticals = useMemo(() => {
    let list = gridVerticals;
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
  }, [cat, q, gridVerticals]);

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
        <span>{_t("app.step_label_pre_intake", "Step 01 / Pre-intake · 選領域 + 上傳需求")}</span>
        <span className="pill green">● live</span>
      </div>
      <h1 className="bp-h1">
        Pick a vertical, drop your brief.
        <br />
        <span className="zh" style={{ color: "var(--muted)" }}>
          {_t("client.h1_step01_zh", "選擇案件垂直領域，匯入需求文件。")}
        </span>
      </h1>
      {/* 2026-06-11 P1 · 390 寬該段最擠、行距 1.65 (witch Gate 2 P1-4) */}
      <p className="bp-sub" style={{ lineHeight: 1.65 }}>
        {_t("client.sub_step01_short", "先選領域，貼上你的需求 — 平台 AI 幫你拆成可執行任務。")}
        <br /><br />
        <span style={{ color: "var(--accent)", fontWeight: 600 }}>{_t("client.early_beta_label", "◆ 平台代收代付 · 依 Tier 抽佣")}</span>{_t("client.early_beta_body", " ：平台負責需求拆解、候選推薦、代收代付與驗收紀錄；詳見服務條款。")}
      </p>

      <div style={{ marginTop: 36 }}>
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
            const count = c.id === "all" ? gridVerticals.length : gridVerticals.filter((v) => v.cat === c.id).length;
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
        {/* 2026-06-11 調研批 · 付費需求探索 · 全站入口產品 (research/ai-case-deliverability-insight-2026-06.md 建議 #1) */}
        {discoveryV && (
          <button
            className={"bp-vert " + (state.vertical === discoveryV.id ? "selected" : "")}
            style={{
              width: "100%",
              marginTop: 12,
              borderColor: "var(--accent-line)",
              background: state.vertical === discoveryV.id ? undefined : "var(--accent-soft)",
            }}
            onClick={() => set({ vertical: discoveryV.id })}
          >
            <span className="check">✓</span>
            <span className="ic">{discoveryV.icon}</span>
            <span className="en">{discoveryV.en} · {_t("client.discovery_entry_tag", "入口產品")}</span>
            <span className="zh">{_t("client.discovery_title", "付費需求探索 · 還說不清楚需求？先花小錢買確定性")}</span>
            <span className="blurb">{_t("client.discovery_blurb", "NT$30-50K · 1-2 週：需求計畫書 + 可點原型 + 固定報價單。6 個月內進正式案、探索費全額折抵；不續約、交付物也帶得走。")}</span>
            <span className="meta">
              <span>{_t("client.discovery_meta", "全領域通用 · 不綁長約 · 重合約條款只在正式案出現")}</span>
            </span>
          </button>
        )}
        <div className="bp-vert-grid" style={{ marginTop: 12 }}>
          {filteredVerticals.map((v) => {
            const avail = isVerticalAvailable(v);
            return (
            <button
              key={v.id}
              className={"bp-vert " + (state.vertical === v.id ? "selected" : "")}
              disabled={!avail}
              title={avail ? undefined : "此領域 worker 累積中、選「其他」可提交需求讓我們人工媒合"}
              style={avail ? undefined : { opacity: 0.45, cursor: "not-allowed" }}
              onClick={() => { if (avail) set({ vertical: v.id }); }}
            >
              <span className="check">✓</span>
              <span className="ic">{v.icon}</span>
              <span className="en">{v.en}</span>
              <span className="zh">{v.zh}</span>
              <span className="blurb">{v.blurb}</span>
              <span className="meta">
                {avail
                  ? <span>{v.lead ? "★ " + _t("client.vertical_lead_tag", "主打") + " · " : ""}{v.sample} sample workers</span>
                  : <span style={{ color: "var(--muted)" }}>{v.lead ? "★ " + _t("client.vertical_lead_tag", "主打") + " · " : ""}worker 累積中</span>}
              </span>
            </button>
            );
          })}
          {filteredVerticals.length === 0 && (
            <div className="bp-empty" style={{ gridColumn: "1 / -1" }}>
              <div className="ic">∅</div>
              沒有符合的領域。試試清除搜尋或切「Other」分流給平台客服。
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 36 }}>
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
              placeholder={_t("client.brief_placeholder", "# 我們是 ____\n# 我們需要 ____\n# 預算 ____ 時間 ____")}
            />
          </div>
        )}
      </div>

      {/* Enterprise needs (optional) · 企業 / B2B 流程選項 */}
      <div style={{ marginTop: 36 }}>
        <div className="bp-h2" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Enterprise needs · {_t("client.section_enterprise_zh", "企業流程")}</span>
          <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>{_t("client.optional_label", "optional · 選填")}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, marginBottom: 12, lineHeight: 1.6 }}>
          {_t("client.enterprise_hint", "B2B / 大型企業案、勾選後 BeyondPath 24h 內回信時一併處理 NDA / 發票 / 合約 / 預約視訊。不勾沒關係、預設走個人案流程。")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {[
            { id: "nda", label: _t("client.ent_nda_label", "需要 NDA"), sub: _t("client.ent_nda_sub", "簽保密協議才能談") },
            { id: "invoice", label: _t("client.ent_invoice_label", "需要公司發票"), sub: _t("client.ent_invoice_sub", "三聯式 / 含統編") },
            { id: "contract", label: _t("client.ent_contract_label", "公司對公司簽約"), sub: _t("client.ent_contract_sub", "正式服務合約 · 不接受 PayPal") },
            { id: "talkToEdward", label: _t("client.ent_talk_label", "想先跟 BeyondPath 團隊聊 30 min"), sub: _t("client.ent_talk_sub", "大金額 / 複雜案 · 視訊預約") },
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

      {/* 2026-05-29 calcifer Q4-revert . Step 01 Budget/Timeline select removed (Edward 5/29: hui yuan ben, rang AI cong brief zhua). budget_range/timeline state retained (nullable, Step 02 slider + submit reference). */}
      {/* Client Vetting · Q3 Task 2 · 2026-05-19 · 身分 + Early Beta 規則確認 */}
      <div style={{ marginTop: 36 }}>
        <div className="bp-h2" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>About you · {_t("client.section_about_you_zh", "關於你")}</span>
          <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)", padding: "2px 8px", border: "1px solid var(--accent-line)", borderRadius: 3 }}>{_t("client.required_label_bp", "required . 必填")}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, marginBottom: 12, lineHeight: 1.6 }}>
          {_t("client.about_you_hint_required", "讓我們更了解你的身分。資料只用於配對、不對外公開。")}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {[
            { id: "company", label: _t("client.about_company_label", "公司 / 品牌主"), sub: _t("client.about_company_sub", "有正式登記、發案做 B2B / B2C") },
            { id: "individual", label: _t("client.about_individual_label", "個人 / 自由業"), sub: _t("client.about_individual_sub", "freelancer / soloist · 個人專案") },
            { id: "studio", label: _t("client.about_studio_label", "工作室 / 創辦人"), sub: _t("client.about_studio_sub", "2-10 人團隊、想擴 capacity") },
            { id: "student", label: _t("client.about_student_label", "學生 / 學習中"), sub: _t("client.about_student_sub", "校內專案 / 投資組合 / 練手") },
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

        {/* Conditional client detail inputs (2026-05-28 calcifer . Sophie 5/28 pai ban) */}
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {state.clientType === "company" && (
            <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                <span>公司名稱 . company name <span style={{ color: "var(--accent)" }}>*</span></span>
                <input
                  type="text"
                  value={state.companyName || ""}
                  onChange={(e) => set({ companyName: e.target.value })}
                  placeholder={_t("client.company_name_placeholder", "例：BeyondPath Inc.")}
                  className="bp-input"
                  style={{ padding: "10px 12px", fontSize: 13, color: "var(--text)", background: "rgba(255,255,255,0.04)" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                <span>職稱 . job title <span style={{ fontSize: 10, opacity: 0.6 }}>(建議填)</span></span>
                <input
                  type="text"
                  value={state.jobTitle || ""}
                  onChange={(e) => set({ jobTitle: e.target.value })}
                  placeholder={_t("client.job_title_placeholder", "例：Founder / CTO / Marketing Lead")}
                  className="bp-input"
                  style={{ padding: "10px 12px", fontSize: 13, color: "var(--text)", background: "rgba(255,255,255,0.04)" }}
                />
              </label>
            </div>
          )}
          {/* Phone . all client type 選填 */}
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>
            <span>手機 . phone <span style={{ fontSize: 10, opacity: 0.6 }}>(選填 . 方便配對後快速聯絡)</span></span>
            <input
              type="tel"
              value={state.phone || ""}
              onChange={(e) => set({ phone: e.target.value })}
              placeholder={_t("client.phone_placeholder", "例：0912-345-678")}
              className="bp-input"
              style={{ padding: "10px 12px", fontSize: 13, color: "var(--text)", background: "rgba(255,255,255,0.04)" }}
            />
          </label>
        </div>
        {/* 2026-05-28 v0.2 · 服務條款 + 隱私政策同意（合併版 · 替代既有 beta_ack 多 checkbox） */}
        <div style={{
          marginTop: 16,
          padding: "12px 16px",
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
              {_t("client.terms_ack_prefix", "我已閱讀並同意 BeyondPath ")}
              <a
                href="/legal/terms.html"
                target="_blank"
                rel="noopener"
                onClick={(e) => e.stopPropagation()}
                style={{ color: "var(--accent)", borderBottom: "1px solid var(--accent-line)", textDecoration: "none" }}
              >{_t("client.terms_ack_terms_link", "《服務條款》")}</a>
              {_t("client.terms_ack_and", " 與 ")}
              <a
                href="/legal/privacy.html"
                target="_blank"
                rel="noopener"
                onClick={(e) => e.stopPropagation()}
                style={{ color: "var(--accent)", borderBottom: "1px solid var(--accent-line)", textDecoration: "none" }}
              >{_t("client.terms_ack_privacy_link", "《隱私政策》")}</a>
              <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11, marginLeft: 6 }}>{_t("client.terms_ack_note", "· 含服務費率與合作規範")}</span>
            </span>
          </label>
          {!state.betaAck && (
            <div style={{ marginTop: 8, paddingLeft: 24, fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>
              {_t("client.terms_ack_hint", ". 必填 . 請先勾選同意條款才能繼續")}
            </div>
          )}
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
      setError(_t("client.err_brief_too_short", "brief 內容太短（< 20 字）、無法 AI 拆解。請回 Step 01 補充。"));
      setPhase("error");
      return;
    }

    if (!window.bpAiParse) {
      setError(_t("client.err_supabase_not_loaded", "Supabase client 尚未載入、請重整頁面。"));
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
        // 2026-06-10 . 試算額度 429 友善化 (Edward 拍板: 匿名 3/天 · 登入 10/天)
        const det = invokeError.details || {};
        if (invokeError.status === 429) {
          if (det.error === "daily-limit-exceeded") {
            setError(det.scope === "account"
              ? _t("client.err_quota_account", "今日試算已達上限（每天 10 次）。你可以直接送出需求、或明天再試。")
              : _t("client.err_quota_anon", "今日免費試算次數已用完（每天 3 次）。登入後每天可試算 10 次。"));
          } else {
            setError(_t("client.err_quota_burst", "試算太頻繁了，請稍候 1 分鐘再試。"));
          }
          setPhase("error");
          return;
        }
        setError(_t("client.err_call_failed_prefix", "呼叫失敗：") + (invokeError.message || _t("client.err_unknown", "未知錯誤")));
        setPhase("error");
        return;
      }
      if (!data || !data.ok) {
        setError(_t("client.err_ai_parse_failed_prefix", "AI 拆解失敗：") + (data?.error || _t("client.err_unknown", "未知錯誤")));
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
      setError(e?.message || _t("client.err_network_retry", "網路錯誤、請重試"));
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
        <span>{_t("app.step_label_ai_parse", "Step 03 / AI Parse · AI 拆解需求")}</span>
        <span className="pill">{phase === "running" ? "Claude thinking…" : phase === "error" ? "error" : "complete"}</span>
      </div>
      <h1 className="bp-h1">
        AI is reading your brief.
        <br />
        <span className="zh" style={{ color: "var(--muted)" }}>
          {_t("client.step03_sub", "平台 AI 正在拆解你的需求成可執行任務。")}
        </span>
      </h1>

      <div className="bp-parse-grid" style={{ marginTop: 24 }}>
        <div>
          <div className="bp-h2" style={{ marginBottom: 8 }}>Trace · {_t("client.trace_title", "推理日誌")}</div>
          <div className="bp-log" style={{ padding: 18 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
              <div>[init] Claude Sonnet 4.6 · max_tokens=3000</div>
              <div>[brief] {(state.brief || "").length} chars · ~{Math.max(1, Math.round((state.brief || "").length / 4))} tokens</div>
              {phase === "running" && (
                <>
                  <div>[anthropic] POST /v1/messages …</div>
                  <div style={{ marginTop: 10, color: "var(--accent)" }}>● 等待 Claude 真實拆解中（預估 5-15 秒）</div>
                  <div style={{ marginTop: 6 }}>
                    <span className="cursor"></span>
                  </div>
                </>
              )}
              {phase === "done" && (
                <>
                  <div>[claude] sonnet-4-6 returned</div>
                  {tokens.input != null && <div>[usage] input {tokens.input} · output {tokens.output} tokens</div>}
                  <div style={{ marginTop: 8, color: "var(--accent)" }}>● parse complete · 結果見右方</div>
                </>
              )}
              {phase === "error" && (
                <>
                  <div style={{ color: "#e57373" }}>[error] {error}</div>
                  {/* 2026-06-10 . 匿名額度用完 → 引導登入 (誤傷共用 IP 的人也有出路) */}
                  {error === _t("client.err_quota_anon", "今日免費試算次數已用完（每天 3 次）。登入後每天可試算 10 次。") ? (
                    <a
                      href="/sign-in.html"
                      style={{
                        display: "inline-block", marginTop: 14, padding: "8px 16px",
                        fontFamily: "var(--mono)", fontSize: 12, color: "var(--bg)",
                        background: "var(--accent)", borderRadius: "var(--r-sm)", textDecoration: "none",
                      }}
                    >{_t("client.err_quota_anon_cta", "→ 前往登入")}</a>
                  ) : (
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
                      ↻ Retry · 重新拆解
                    </button>
                  )}
                  <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--muted)" }}>
                    {_t("client.quota_note", "免費試算每天 3 次 · 登入後每天 10 次")}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bp-h2" style={{ marginBottom: 8 }}>Result · {_t("client.result_title", "結構化卡片")}</div>
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
                <div className="lbl">Tasks · {_t("client.lbl_tasks", "任務拆解")}</div>
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
                <div className="lbl">Budget · {_t("client.lbl_budget", "預估")}</div>
                <div className="val">
                  <span className="accent">{fmtNT(result.budget.lo)}</span> –{" "}
                  <span className="accent">{fmtNT(result.budget.hi)}</span>
                </div>
                <div className="sub">市場行情參考 · 客戶端不另收平台費</div>
              </div>
              <div className="bp-rcard bp-rise bp-rise-3">
                <div className="lbl">Effort · {_t("client.lbl_effort", "總工時")}</div>
                <div className="val">
                  <span className="accent">{result.totalHours}h</span>{" "}
                  <span style={{ color: "var(--muted)", fontSize: 14 }}>
                    {/* 2026-06-11 P1 · 探索 1-2 週、不再對所有案型寫死 8wk (calcifer Gate 1 note) */}
                    {result.scope === "paid-discovery" ? "· 1-2wk · 單一窗口" : "· 8wk · 2-3 expert"}
                  </span>
                </div>
                <div className="sub">multi-expert DAG attached</div>
              </div>
              <div className="bp-rcard span2 bp-rise bp-rise-4">
                <div className="lbl">Flags · {_t("client.lbl_flags", "AI 提醒")}</div>
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
              {phase === "error" ? _t("client.phase_error_hint", "↻ 修正後重試、cards 才會出現") : _t("client.phase_pending_hint", "awaiting trace · cards will materialise")}
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
  // 2026-05-29 calcifer Q2 . deliverables follow selected vertical (now 成果語言/人話)
  const demo = getDemoForVertical(state.vertical);
  const deliverables = (demo.deliverables && demo.deliverables.length) ? demo.deliverables : ["上架就能用的品牌主視覺", "照著拍就行的短影音腳本", "可直接用的產品文案", "排好各平台的發布時間", "看得懂的成效報告"];
  // 2026-05-29 calcifer . 交付邊界 A/B 選項 (依 vertical 給 build/content 文案)
  const scopeOptions = (window.BP_DATA && window.BP_DATA.deliveryScopeOptionsFor)
    ? window.BP_DATA.deliveryScopeOptionsFor(state.vertical)
    : [{ id: "A", zh: "交付成果", desc: "交付檔案 / 程式，後續我自己處理" }, { id: "B", zh: "交付 + 協助上線", desc: "交付後協助上線、確認真的能用" }];

  return (
    <div>
      <div className="bp-eyebrow">
        <span>{_t("app.step_label_confirm", "Step 02 / Confirm · 確認期待")}</span>
        <span className="pill">{_t("client.confirm_pill", "補完 AI 沒猜到的")}</span>
      </div>
      <h1 className="bp-h1">
        Confirm what AI missed.
        <br />
        <span className="zh" style={{ color: "var(--muted)" }}>
          {_t("client.h1_step02_zh", "補完 AI 拆解中沒涵蓋的偏好。")}
        </span>
      </h1>

      <div className="bp-form" style={{ marginTop: 24 }}>
        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Worker Tier</div>
            <div className="lbl-zh">{_t("client.lbl_tier_zh", "期待認證等級")}</div>
          </div>
          <div className="bp-seg bp-seg-tier">
            {[
              { v: "B",   id: "B",   zh: _t("client.tier_b_zh", "實踐者"), price: "NT$30-80k" },
              { v: "A",   id: "A",   zh: _t("client.tier_a_zh", "專家"),   price: "NT$80-200k" },
              { v: "A+",  id: "A+",  zh: _t("client.tier_aplus_zh", "大師"),   price: "NT$200-500k" },
              { v: "S",   id: "S",   zh: _t("client.tier_s_zh", "典範"),   price: "NT$500k+" },
              { v: "any", id: "Any", zh: "",       price: _t("client.tier_any_price", "看 AI 拆解") },
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
            {_t("client.tier_price_note", "※ 價格區間為平台統計、實際報價依案件複雜度 + Claude AI 顧問建議調整（含 +15% 平台溢價）")}
          </div>
        </div>

        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Deliverables</div>
            <div className="lbl-zh">{_t("client.lbl_deliverables_zh", "交付內容")}</div>
          </div>
          <div className="bp-seg">
            {deliverables.map(
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

        {/* 2026-05-29 calcifer . 交付邊界 A/B (doc 30 蕪菁頭 + Edward 5/29 拍板 B) · 用既有 .bp-field + .bp-seg chip */}
        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Delivery Scope</div>
            <div className="lbl-zh">{_t("client.lbl_delivery_scope_zh", "你期待交付到哪？")}</div>
          </div>
          <div>
            <div className="bp-seg">
              {scopeOptions.map((o) => (
                <button
                  key={o.id}
                  className={e.deliveryScope === o.id ? "active" : ""}
                  onClick={() => setE({ deliveryScope: o.id })}
                >
                  <span className="tid" style={{ fontFamily: "var(--mono)", fontWeight: 700, marginRight: 2 }}>{o.id}</span>
                  <span className="zh">{o.zh}</span>
                </button>
              ))}
            </div>
            {(() => {
              const sel = scopeOptions.filter((x) => x.id === e.deliveryScope)[0];
              return sel ? (
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6, fontFamily: "var(--zh)", lineHeight: 1.6 }}>
                  {sel.desc}
                </div>
              ) : null;
            })()}
          </div>
        </div>

        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Delivery Window</div>
            <div className="lbl-zh">{_t("client.lbl_delivery_window_zh", "期待交付時間")}</div>
          </div>
          <div className="bp-seg">
            {[{id:"1 wk"},{id:"2 wk"},{id:"4 wk"},{id:"6 wk"},{id:"8 wk"},{id:"10 wk"},{id:"12 wk"},{id:"彈性", label:_t("client.delivery_flex", "彈性")}].map((opt) => { var w = opt.id; var label = opt.label || opt.id; return (
              <button
                key={w}
                className={e.window === w ? "active" : ""}
                onClick={() => setE({ window: w })}
              >
                {label}
              </button>
            );})}
          </div>
        </div>

        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">Budget Cap</div>
            <div className="lbl-zh">{_t("client.lbl_budget_cap_zh", "預算上限（彈性 / 嚴格）")}</div>
          </div>
          <div className="bp-range">
            <input
              type="range"
              min="50000"
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
            <div className="lbl-zh">{_t("client.lbl_multi_zh", "是否接受多人共案")}</div>
          </div>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className={"bp-toggle " + (e.multi ? "on" : "")}
              onClick={() => setE({ multi: !e.multi })}
            >
              <span className="sw"></span>
              <span>{e.multi ? _t("client.multi_on", "ON · 接受 2-3 expert") : _t("client.multi_off", "OFF · 單一 worker")}</span>
            </button>
          </div>
        </div>

        <div className="bp-field">
          <div className="bp-field-l">
            <div className="lbl-en">NPS Threshold</div>
            <div className="lbl-zh">{_t("client.lbl_nps_zh", "過往 NPS 門檻")}</div>
          </div>
          <div className="bp-seg">
            {[
              { v: 4.0, en: "≥ 4.0", zh: _t("client.nps_loose", "寬鬆") },
              { v: 4.3, en: "≥ 4.3", zh: _t("client.nps_standard", "標準") },
              { v: 4.5, en: "≥ 4.5", zh: _t("client.nps_strict", "嚴格") },
              { v: 4.7, en: "≥ 4.7", zh: _t("client.nps_top", "頂級") },
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
            <div className="lbl-zh">{_t("client.lbl_bonus_zh", "加分條件（複選）")}</div>
          </div>
          <div className="bp-seg">
            {[
              { id: "voice", en: "Worker has voice", zh: _t("client.bonus_voice_zh", "希望 worker 自帶 IG/Threads 聲量") },
              { id: "local", en: "TW market savvy", zh: _t("client.bonus_local_zh", "希望 worker 熟台灣市場文化") },
              { id: "loyalty", en: "Prior collaborator", zh: _t("client.bonus_loyalty_zh", "優先曾合作過的 worker") },
              { id: "mercy", en: "Open to newcomer", zh: _t("client.bonus_mercy_zh", "願意給新銳 worker 機會（非主流選項加分）") },
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
  const verticalZh = VERTICALS.find((v) => v.id === state.vertical)?.zh || _t("client.vertical_fallback", "你選的領域");

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

    // brief #6 (2026-05-20 calcifer): real match-workers algo + placeholder fallback
    function buildPlaceholderEntry(row) {
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
    }
    function applyRealScore(entry, rankedResult, row) {
      if (!rankedResult) return entry;
      return {
        ...entry,
        score: rankedResult.score,
        breakdown: {
          load: Math.round((rankedResult.breakdown.capacity_match || 0)),
          calendar: 0,
          tier: Math.round((rankedResult.breakdown.tier_match || 0)),
          nps: 0,
          domain: Math.round((rankedResult.breakdown.domain_match || 0)),
          voice: 0,
          boost: Math.round((rankedResult.breakdown.mercy_boost || 0) + (rankedResult.breakdown.L_score_bonus || 0)),
        },
        boost: {
          mercy: rankedResult.breakdown.mercy_boost > 0 ? 1 : 0,
          vertical: rankedResult.breakdown.domain_match >= 25 ? 1 : 0,
        },
        blurb: rankedResult.why || entry.blurb,
      };
    }

    window.bpWorkers.queryByVertical(vid, 5).then(function (pr) {
      if (cancelled) return;
      const data = pr.data;
      const error = pr.error;
      const REAL_MIN = 3;
      if (error || !Array.isArray(data) || data.length < REAL_MIN) {
        setPoolState({ workers: demoWorkers, source: "sample", loading: false, error: error || null });
        return;
      }
      const baseMapped = data.map(buildPlaceholderEntry);

      const parsed = state.parsed;
      if (parsed && window.bpMatch && typeof window.bpMatch.runForVertical === "function") {
        window.bpMatch.runForVertical({
          vertical: vid,
          parsedBrief: parsed,
          topN: 5,
        }).then(function (mr) {
          if (cancelled) return;
          if (mr.error || !Array.isArray(mr.data)) {
            setPoolState({ workers: baseMapped, source: "real", loading: false, error: null });
            return;
          }
          const byId = {};
          for (const r of mr.data) {
            if (r && r.worker_id) byId[r.worker_id] = r;
          }
          const augmented = baseMapped.map(function (entry, i) {
            const row = data[i];
            const ranked = byId[entry.id] || byId[row.id];
            return ranked ? applyRealScore(entry, ranked, row) : entry;
          });
          augmented.sort(function (a, b) { return b.score - a.score; });
          setPoolState({ workers: augmented, source: "real", loading: false, error: null });
        }).catch(function () {
          if (cancelled) return;
          setPoolState({ workers: baseMapped, source: "real", loading: false, error: null });
        });
      } else {
        setPoolState({ workers: baseMapped, source: "real", loading: false, error: null });
      }
    }).catch(function (e) {
      if (cancelled) return;
      setPoolState({ workers: demoWorkers, source: "sample", loading: false, error: { message: String(e) } });
    });
    return function () { cancelled = true; };
  }, [state.vertical, state.parsed, demoWorkers]);

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
        <span>{_t("app.step_label_match", "Step 04 / Match · AI 配對 + 人工覆核")}</span>
        <span className="pill" style={{ background: "rgba(255,200,80,0.1)", color: "#ffc850", borderColor: "rgba(255,200,80,0.3)" }}>{_t("client.step04_pill_poc", "● POC · 早期合作")}</span>
        <span
          className="pill"
          style={
            poolState.source === "real"
              ? { background: "var(--accent-soft)", color: "var(--accent)", borderColor: "var(--accent-line)" }
              : { background: "rgba(154,154,163,0.08)", color: "var(--muted)", borderColor: "var(--line)" }
          }
          title={poolState.source === "real" ? _t("client.pool_real_title", "已通過認證的真實 worker pool") : _t("client.pool_demo_title", "目前該領域認證 worker 累積中、以下為過往合作案例展示")}
        >
          {poolState.loading ? _t("client.pool_loading", "● 載入中…") : poolState.source === "real" ? _t("client.pool_real", "● 真實配對池") : _t("client.pool_demo", "● 案例展示")}
        </span>
      </div>
      <h1 className="bp-h1">
        Top examples in your vertical.
        <br />
        <span className="zh" style={{ color: "var(--muted)" }}>
          {_t("client.match_demo_hint_prefix", "下方為「")}{verticalZh}{_t("client.match_demo_hint_suffix", "」領域過往合作案例參考、實際配對 24h 內以 email 寄出。")}
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
        {/* 2026-05-29 calcifer Q3 . shortened to one line (was 2-block repeat of h1 sub) */}
        <div style={{ fontSize: 13, color: "var(--text-2)" }}>
          ✨ {_t("client.match_info_short", "下方為過往案例參考、")}<b style={{ color: "var(--accent)" }}>{_t("client.match_info_short_emph", "實際配對 24h 內寄 email")}</b>。
        </div>
      </div>

      <div className="bp-match-head" style={{ marginTop: 24 }}>
        <div>
          <div className="ttl-en">SUGGESTED PAIR · 2-EXPERT DAG</div>
          <div className="ttl-zh">
            {_t("client.suggested_expert", "Tier A+ 領域專家")} <span style={{ color: "var(--muted)" }}>({_t("client.suggested_visual", "視覺 · 50%")})</span> +
            {_t("client.suggested_expert", "Tier A+ 領域專家")} <span style={{ color: "var(--muted)" }}>({_t("client.suggested_copy", "文案 · 30%")})</span> +
            {_t("client.suggested_expert", "Tier A+ 領域專家")} <span style={{ color: "var(--muted)" }}>({_t("client.suggested_schedule", "排程 · 20%")})</span>
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
        {/* 2026-06-11 P1 · chips 計數改實際 pool 推導、不寫死 (calcifer Gate 1 note) */}
        <button
          className={"bp-chip " + (filter === "all" ? "active" : "")}
          onClick={() => setFilter("all")}
        >
          all · {verticalWorkers.length}
        </button>
        <button
          className={"bp-chip " + (filter === "tierA+" ? "active" : "")}
          onClick={() => setFilter("tierA+")}
        >
          tier A+ · {verticalWorkers.filter((w) => w.tier === "A+").length}
        </button>
        <button
          className={"bp-chip " + (filter === "mercy" ? "active" : "")}
          onClick={() => setFilter("mercy")}
        >
          {_t("client.filter_mercy_boost_label", "反馬太加成")} · {verticalWorkers.filter((w) => w.boost && w.boost.mercy > 0).length}
        </button>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
          sort · score desc
        </span>
      </div>

      {filtered.length === 0 && (
        <div className="bp-empty">
          <div className="ic">∅</div>
          {_t("client.match_no_match", "沒有符合的 worker。試試放寬條件，或 24h 客服介入。")}
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
              {/* 2026-06-11 調研批 · 驗收證據列 (QA 卡點: worker 匿名無法驗 → 給可驗證的履約證據) */}
              <div style={{ marginTop: 4, fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--accent)", letterSpacing: "0.04em" }}>
                ✓ {poolState.source === "real"
                  ? _t("client.evidence_real", "平台已驗：認證審核紀錄在案 · 結案數與 NPS 隨案累積")
                  : _t("client.evidence_demo", "示意卡 · 正式配對附平台驗證：結案紀錄 + NPS 紀錄 + 認證審核")}
                {typeof w.cases === "number" && w.cases > 0 ? " · " + w.cases + " cases" : ""}
                {typeof w.nps === "number" && w.nps ? " · NPS " + w.nps : ""}
              </div>
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
                          window.alert(p.client + "\n" + p.desc + "\nNPS " + p.nps + (p.roas !== "—" ? " · ROAS " + p.roas : "") + "\n\n" + _t("client.portfolio_modal_stub", "(完整 case study modal · 下個 sprint)"));
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
                  {_t("client.portfolio_first_case", "首案進行中 · 完成後解鎖 portfolio · 可從 voice / 領域 match 評估")}
                </div>
              )}
              {/* 2026-05-29 calcifer Q3 . stats-grid collapsed by default (expand card to see) */}
              {isExp && (
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
              )}

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
              {w.boost.mercy > 0 && <span className="mercy">{_t("client.mercy_label", "+10 反馬太")}</span>}
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
  // 2026-05-29 calcifer Q3 . Tier guide collapsed by default (was always-on noise)
  const [tierOpen, setTierOpen] = useState(false);
  return (
    <div className="bp-rail">
      <div className="bp-tip">
        {step === 0 && (
          <span>
            <code>tip</code>{" "}
            <span className="zh">
              {_t("client.rail_tip0_a", "想清楚是")} <b>{_t("client.rail_tip0_auto", "內容自動化")}</b> {_t("client.rail_tip0_b", "還是")} <b>{_t("client.rail_tip0_strategy", "策略諮詢")}</b>{_t("client.rail_tip0_c", "。前者走 worker pool，後者通常需要 Tier A+ 雙領域。")}
            </span>
          </span>
        )}
        {step === 1 && (
          <span>
            <code>fit</code>{" "}
            <span className="zh">
              {_t("client.rail_tip1_narrow", "條件越嚴 → 配對池越窄。推薦先寬，看完前 5 名再回來收緊。")}
              <br />
              <br />
              <button
                onClick={() => setTierOpen(!tierOpen)}
                style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "var(--accent)", fontFamily: "inherit", fontSize: "inherit" }}
              >
                <b>{_t("client.rail_tier_toggle", "了解各 Tier 差異")}</b> {tierOpen ? "▲" : "▼"}
              </button>
              {tierOpen && (
                <span className="zh" style={{ display: "block", marginTop: 6 }}>
                  <b>{_t("client.rail_tier_b", "B 實踐者")}</b> {_t("client.rail_tier_b_desc", "通過驗證 · 完成 3 件 NPS≥4，市價 −10%")}
                  <br />
                  <b>{_t("client.rail_tier_a", "A 專家")}</b> {_t("client.rail_tier_a_desc", "通過 < 10% 篩選，市價")}
                  <br />
                  <b>{_t("client.rail_tier_aplus", "A+ 大師")}</b> {_t("client.rail_tier_aplus_desc", "垂直領域認證（DTC / 品牌 DNA × AI），+15%")}
                  <br />
                  <b>{_t("client.rail_tier_s", "S 典範")}</b> {_t("client.rail_tier_s_desc", "雙領域大師 · 2 年以上紀錄，+35%")}
                  <br />
                  <b>Any</b> {_t("client.rail_tier_any_desc", "AI 自動匹配")}
                </span>
              )}
            </span>
          </span>
        )}
        {step === 2 && (
          <span>
            <code>parse</code>{" "}
            <span className="zh">
              {_t("client.rail_tip2", "AI 拆解結果 = 合約附件 A，會直接綁進 Step 6 合約草稿預覽範圍。")}
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
  // 2026-05-29 calcifer · doc 28 A.3 · 發案前登入閘 + 完整資料 gate
  // 保守紀律: 只在「按送出」這一刻攔 (modal 本來就只在 submit 開) · 不重畫 12 步 wizard
  // mode: checking | need-login | need-profile | ready
  const [mode, setMode] = useState("checking");
  const [userEmail, setUserEmail] = useState("");
  const [companyName, setCompanyName] = useState((state && state.companyName) || "");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState((state && state.phone) || "");
  const [identityType, setIdentityType] = useState((state && state.clientType === "company") ? "company" : "individual");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!window.bpAuth) { if (alive) setMode("ready"); return; }
      try {
        const { user } = await window.bpAuth.getUser();
        if (!alive) return;
        if (!user) { setMode("need-login"); return; }
        setUserEmail(user.email || "");
        if (window.bpProfile && window.bpProfile.get) {
          const { data } = await window.bpProfile.get();
          if (!alive) return;
          if (data && data.full_name) setFullName(data.full_name);
          if (data && data.phone) setPhone(data.phone);
          if (data && data.identity_type) setIdentityType(data.identity_type);
          setMode((data && data.profile_complete) ? "ready" : "need-profile");
        } else {
          setMode("ready");
        }
      } catch (e) {
        if (alive) setMode("ready");
      }
    })();
    return () => { alive = false; };
  }, []);

  const goLogin = () => {
    try { localStorage.setItem("bp-intake-draft", JSON.stringify(state || {})); } catch (e) {}
    let role = "client";
    try { role = localStorage.getItem("bp-active-role") || "client"; } catch (e) {}
    const ret = encodeURIComponent("app.html?role=" + role + "&resume=1");
    window.location.href = "sign-in.html?role=" + role + "&return=" + ret;
  };

  const saveProfile = async () => {
    setError("");
    if (!fullName || !fullName.trim()) { setError("請填姓名"); return; }
    if (!phone || phone.trim().length < 6) { setError("請填電話 · 配對成功後我們聯絡你的方式"); return; }
    if (!identityType) { setError("請選身分類型"); return; }
    setSubmitting(true);
    try {
      if (window.bpProfile && window.bpProfile.updateRequiredFields) {
        const { error: pErr } = await window.bpProfile.updateRequiredFields({
          fullName: fullName.trim(), phone: phone.trim(), identityType: identityType,
        });
        if (pErr) throw pErr;
      }
      setSubmitting(false);
      setMode("ready");
    } catch (e) {
      setSubmitting(false);
      setError("儲存資料失敗：" + ((e && e.message) ? e.message : "未知錯誤"));
    }
  };

  const doSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      if (window.bpClientIntake) {
        const { error: sbError } = await window.bpClientIntake.submit({
          email: userEmail,
          companyName: companyName || null,
          intakeData: Object.assign({}, state || {}, { phone: phone || (state && state.phone) || null }),
        });
        if (sbError) throw sbError;
      }
      try { localStorage.removeItem("bp-intake-draft"); } catch (e) {}
      // 2026-05-30 calcifer · PMF funnel 完成端 · 送出成功 (進 client_intakes)
      try { bpFunnel.markComplete(); } catch (e) {}
      // 2026-06-01 calcifer · doc 43 UX · 送出後給明確「24h email 回覆」確認、不靜默跳轉
      setSubmitting(false);
      setMode("done");
    } catch (e) {
      setSubmitting(false);
      setError(_t("client.err_submit_failed_prefix", "送出失敗：") + ((e && e.message) ? e.message : _t("client.err_unknown", "未知錯誤")) + _t("client.err_submit_failed_suffix", "。先複製 brief 寄到 edwardt0303@gmail.com 也行。"));
    }
  };

  const inputStyle = { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#f0eee8", fontFamily: "Noto Sans TC, sans-serif", fontSize: 15 };
  const primaryBtn = (busy) => ({ flex: 1, padding: "12px 18px", background: "#c7e84a", color: "#0a0a0b", border: "1px solid #c7e84a", fontFamily: "JetBrains Mono, monospace", fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, cursor: busy ? "wait" : "pointer", textTransform: "uppercase", opacity: busy ? 0.5 : 1 });
  const ghostBtn = { padding: "12px 18px", background: "transparent", color: "#c8c6c0", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "JetBrains Mono, monospace", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase" };
  const idBtn = (active) => ({ flex: 1, padding: "11px 14px", background: active ? "#c7e84a" : "transparent", color: active ? "#0a0a0b" : "#9a9aa3", border: "1px solid " + (active ? "#c7e84a" : "rgba(255,255,255,0.12)"), fontFamily: "JetBrains Mono, monospace", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", fontWeight: active ? 700 : 500 });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#0a0a0b", border: "1px solid rgba(199,232,74,0.4)", padding: "32px 28px", color: "#f0eee8" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.14em", color: "#c7e84a", textTransform: "uppercase", marginBottom: 10 }}>{_t("client.submit_eyebrow", "◆ 取得 24h 配對方案")}</div>

        {mode === "checking" && (
          <div style={{ padding: "30px 0", textAlign: "center", fontFamily: "Noto Sans TC, sans-serif", color: "#9a9aa3", fontSize: 14 }}>確認登入狀態…</div>
        )}

        {mode === "need-login" && (
          <>
            <h2 style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.3 }}>送出前先登入</h2>
            <p style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: 14, color: "#9a9aa3", margin: "0 0 22px", lineHeight: 1.6 }}>你填好的需求已暫存 · 登入後自動帶回來續送、不用重填。BeyondPath 用你的 email 回覆配對結果。</p>
            {error && <div style={{ padding: "10px 12px", background: "rgba(212,113,42,0.1)", border: "1px solid rgba(212,113,42,0.4)", color: "oklch(0.82 0.16 75)", fontSize: 13, marginBottom: 12 }}>⚠ {error}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button type="button" onClick={onCancel} style={ghostBtn}>{_t("client.submit_btn_cancel", "取消")}</button>
              <button type="button" onClick={goLogin} style={primaryBtn(false)}>→ 登入後送出</button>
            </div>
          </>
        )}

        {mode === "need-profile" && (
          <>
            <h2 style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.3 }}>補一下聯絡資料</h2>
            <p style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: 14, color: "#9a9aa3", margin: "0 0 22px", lineHeight: 1.6 }}>第一次發案要留聯絡方式 · 配對成功後我們才聯絡得上你。只填一次、之後不用再填。</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="姓名（必填）" value={fullName} onChange={(e) => { setFullName(e.target.value); setError(""); }} disabled={submitting} style={inputStyle} />
              <input type="tel" placeholder="電話（必填 · 配對成功後聯絡用）" value={phone} onChange={(e) => { setPhone(e.target.value); setError(""); }} disabled={submitting} style={inputStyle} />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setIdentityType("individual")} disabled={submitting} style={idBtn(identityType === "individual")}>個人</button>
                <button type="button" onClick={() => setIdentityType("company")} disabled={submitting} style={idBtn(identityType === "company")}>公司</button>
              </div>
              {error && <div style={{ padding: "10px 12px", background: "rgba(212,113,42,0.1)", border: "1px solid rgba(212,113,42,0.4)", color: "oklch(0.82 0.16 75)", fontSize: 13 }}>⚠ {error}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={onCancel} disabled={submitting} style={ghostBtn}>{_t("client.submit_btn_cancel", "取消")}</button>
                <button type="button" onClick={saveProfile} disabled={submitting} style={primaryBtn(submitting)}>{submitting ? "儲存中…" : "→ 存好、繼續送出"}</button>
              </div>
            </div>
          </>
        )}

        {mode === "ready" && (
          <>
            <h2 style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.3 }}>{_t("client.submit_title", "送出需求 · 取得 24h 配對方案")}</h2>
            <p style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: 14, color: "#9a9aa3", margin: "0 0 22px", lineHeight: 1.6 }}>{_t("client.submit_sub", "24h 內：AI 初審 + 人工覆核 → 配對方案、候選人與時程寄到你的 email。送出進人工審核、不代表正式合約或付款。")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {userEmail && <div style={{ padding: "10px 14px", background: "rgba(199,232,74,0.06)", border: "1px solid rgba(199,232,74,0.25)", color: "#c8c6c0", fontFamily: "Noto Sans TC, sans-serif", fontSize: 13 }}>✓ 已登入 · <b style={{ color: "#f0eee8" }}>{userEmail}</b></div>}
              <input type="text" placeholder={_t("client.submit_company_placeholder", "公司 / 品牌名（可選）")} value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={submitting} style={inputStyle} />
              {error && <div style={{ padding: "10px 12px", background: "rgba(212,113,42,0.1)", border: "1px solid rgba(212,113,42,0.4)", color: "oklch(0.82 0.16 75)", fontSize: 13 }}>⚠ {error}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={onCancel} disabled={submitting} style={ghostBtn}>{_t("client.submit_btn_cancel", "取消")}</button>
                <button type="button" onClick={doSubmit} disabled={submitting} style={primaryBtn(submitting)}>{submitting ? _t("client.submit_btn_submitting", "送出中…") : _t("client.submit_btn_submit", "→ 取得 24h 配對方案")}</button>
              </div>
            </div>
          </>
        )}

        {mode === "done" && (
          <>
            <h2 style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: 22, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.3 }}>{_t("client.submit_done_title", "已收到你的需求 ✓")}</h2>
            <p style={{ fontFamily: "Noto Sans TC, sans-serif", fontSize: 14, color: "#c8c6c0", margin: "0 0 18px", lineHeight: 1.7 }}>{_t("client.submit_done_body_prefix", "BeyondPath 會在 ")}<b style={{ color: "#c7e84a" }}>{_t("client.submit_done_body_emph", "24 小時內以 email")}</b>{_t("client.submit_done_body_suffix", " 回覆你配對方案、候選人與時程。")}</p>
            {userEmail && <div style={{ padding: "10px 14px", marginBottom: 18, background: "rgba(199,232,74,0.06)", border: "1px solid rgba(199,232,74,0.25)", color: "#c8c6c0", fontFamily: "Noto Sans TC, sans-serif", fontSize: 13 }}>{_t("client.submit_done_email_label", "回覆寄到：")}<b style={{ color: "#f0eee8" }}>{userEmail}</b></div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => { onDone && onDone(); }} style={primaryBtn(false)}>{_t("client.submit_done_continue", "→ 先看領域案例參考")}</button>
            </div>
          </>
        )}

        {mode !== "done" && <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px dashed rgba(255,255,255,0.08)", fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#6a6a78", letterSpacing: "0.06em", lineHeight: 1.7 }}>{_t("client.submit_disclaimer", "你的 brief + 配對結果進入 BeyondPath 後台、不會公開 · 24h 內 email 回覆 · 第一次送出僅取得配對方案、不代表正式合約或付款")}</div>}
      </div>
    </div>
  );
}

function ClientIntakeApp({ device = "desktop", initialStep = 0, presetParsed = false, step: controlledStep, onStep, onAdvanceBeyond, hideStepper = false, hideTopbar = false }) {
  useI18n();
  // 2026-05-30 calcifer · PMF funnel 進入端 · 開始填案 (mount-once · 不動 wizard 設計/流程)
  useEffect(() => { try { bpFunnel.markStart(); } catch (e) {} }, []);
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
      // 2026-05-29 calcifer Q2 . initial badges = vertical deliverables[0..1]
      badges: (initialDemo.deliverables || []).slice(0, 2),
      // 2026-05-29 calcifer . 交付邊界 A/B 預設 A (交付成果) · A/B id 跨 build/content 通用、不需 reset
      deliveryScope: "A",
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
    clientType: null,
    betaAck: false,
    companyName: "", // 2026-05-28 . Step 01 input . clientType=company shi bi tian
    jobTitle: "",    // 2026-05-28 . Step 01 input . clientType=company shi jian yi tian
    phone: "",       // 2026-05-28 . Step 01 input . quan xuan tian
    budgetRange: "", // 2026-05-28 . Step 01 select . bi tian
    timeline: "",    // 2026-05-28 . Step 01 select . bi tian
  });

  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const contentRef = useRef();

  // 2026-05-29 calcifer · doc 28 A.3 · 登入回來續送
  // sign-in 帶 ?resume=1 回來 + localStorage 有草稿 → 還原 wizard state + 跳到 Step4 + 自動開送出 modal
  useEffect(() => {
    try {
      if (!/[?&]resume=1/.test(window.location.search)) return;
      const raw = localStorage.getItem("bp-intake-draft");
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft && typeof draft === "object") {
        setState((s) => ({ ...s, ...draft }));
        setStep(3);
        setSubmitModalOpen(true);
      }
    } catch (e) {}
  }, []);

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
        // 2026-05-29 calcifer Q2 . deliverables follow vertical -> reset badges too
        expect: { ...s.expect, badges: (demo.deliverables || []).slice(0, 2) },
      };
    });
  }, [state.vertical]);

  const canContinue = () => {
    if (step === 0) {
      // 2026-05-28 calcifer . qiang hua bi tian (Sophie 5/28 pai ban)
      const briefOk = !!state.vertical && !!state.brief && state.brief.trim().length > 30;
      const aboutOk = !!state.clientType && !!state.betaAck;
      const companyOk = state.clientType !== "company" || (state.companyName && state.companyName.trim().length > 0);
      const isDevBypass = typeof window !== "undefined" && /[?&]dev=1/.test(window.location.search);
      return briefOk && (isDevBypass || (aboutOk && companyOk));
    }
    if (step === 2) return state.parseDone;
    return true;
  };

  // 2026-05-29 calcifer Q4 . reverse canContinue bools -> which fields still missing
  // (logic mirrors canContinue, does NOT change gating)
  const missingItems = () => {
    if (step !== 0) return [];
    const isDevBypass = typeof window !== "undefined" && /[?&]dev=1/.test(window.location.search);
    if (isDevBypass) return [];
    const out = [];
    if (!state.vertical) out.push(_t("client.miss_vertical", "選擇案件領域"));
    if (!state.brief || state.brief.trim().length <= 30) out.push(_t("client.miss_brief", "需求描述至少 30 字"));
    if (!state.clientType) out.push(_t("client.miss_clienttype", "選擇身分"));
    if (state.clientType === "company" && !(state.companyName && state.companyName.trim().length > 0)) out.push(_t("client.miss_company", "填公司名稱"));
    if (!state.betaAck) out.push(_t("client.miss_terms", "勾選同意條款"));
    return out;
  };

  const ctaLabel = () => {
    if (step === 0) return "Confirm expectations →";
    if (step === 1) return "Run AI parse →";
    if (step === 2) return "Find matches →";
    return submitDone ? _t("client.submit_done_label", "合約草稿預覽 →") : _t("client.submit_normal_label", "Submit · 取得 24h 配對方案 →");
  };

  return (
    <div className={"bp-root " + (device === "mobile" ? "bp-mobile is-mobile" : "is-desktop")}>
      {!hideTopbar && <Topbar step={step} device={device} hideStepper={hideStepper} />}
      <div className="bp-main">
        <div className="bp-content" ref={contentRef}>
          {/* 2026-05-29 calcifer Q1 . case summary on Step 02/03/04 (desktop + mobile) */}
          {step >= 1 && <CaseSummaryBar state={state} />}
          {step === 0 && <Step1 state={state} set={set} device={device} />}
          {step === 1 && <Step3 state={state} set={set} device={device} />}
          {step === 2 && <Step2 state={state} set={set} />}
          {step === 3 && <Step4 state={state} set={set} device={device} />}
          {device === "desktop" && (() => {
            const meta = [
              { n: "01", en: "Pre-intake", zh: _t("app.step_name_01", "選領域 + 上傳需求") },
              { n: "02", en: "Confirm",    zh: _t("app.step_name_02", "確認期待") },
              { n: "03", en: "AI Parse",   zh: _t("app.step_name_03", "AI 拆解需求") },
              { n: "04", en: "Match",      zh: _t("app.step_name_04", "AI 自動配對") },
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
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  {/* 2026-05-29 calcifer Q4 . missing-field hint above CTA */}
                  {!canContinue() && <MissingHint items={missingItems()} device={device} />}
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
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            {/* 2026-05-29 calcifer Q4 . missing-field hint above CTA (mobile) */}
            {!canContinue() && <MissingHint items={missingItems()} device={device} />}
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
