// BeyondPath · Worker dashboard (接案方視角 · 同一個 LUMINE 案件)
const { useState: uSW } = React;
const _DW = window.BP_DATA;
const _ARC = _DW.WORKERS.find((w) => w.id === "w-arc");

function WorkerDashboard({ inShell = false }) {
  const [tab, setTab] = uSW("active");
  const isDemoView = (() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      return qs.get("view") === "worker-demo" || qs.get("view") === "worker-dashboard" || qs.get("onboarding") === "0";
    } catch (e) {
      return false;
    }
  })();

  return (
    <div className="bp-root is-desktop">
      {isDemoView && (
        <div style={{ padding: "10px 18px", borderBottom: "1px solid rgba(199,232,74,0.22)", background: "rgba(199,232,74,0.055)", display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexWrap: "wrap", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--text-2)" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>WORKER PROTOTYPE DEMO</span>
          <span className="zh" style={{ fontFamily: "var(--zh)", letterSpacing: 0 }}>這是通過認證後的接案方畫面範例，資料皆為模擬。</span>
          <a href="app.html?role=worker&onboarding=1" style={{ color: "var(--accent)", textDecoration: "none", borderBottom: "1px solid var(--accent-line)" }}>我要申請認證 →</a>
        </div>
      )}
      <div className="bp-topbar">
        {!inShell && (
          <div className="bp-logo">
            <span className="bp-logo-mark"></span>BEYONDPATH
            <small>WORKER · @edward</small>
          </div>
        )}
        <div className="bp-stepper" style={{ marginLeft: inShell ? 0 : 24 }}>
          <div className={tab === "active" ? "active" : ""} onClick={() => setTab("active")} style={{ cursor: "pointer" }}>
            <span className="num">02</span><span>active</span>
          </div>
          <div className={tab === "tier" ? "active" : ""} onClick={() => setTab("tier")} style={{ cursor: "pointer" }}>
            <span className="num">A+</span><span>tier</span>
          </div>
          <div className={tab === "wallet" ? "active" : ""} onClick={() => setTab("wallet")} style={{ cursor: "pointer" }}>
            <span className="num">$</span><span>terms + AI 補貼</span>
          </div>
          <div className={tab === "coach" ? "active" : ""} onClick={() => setTab("coach")} style={{ cursor: "pointer" }}>
            <span className="num">✦</span><span>AI coach</span>
          </div>
          <div className={tab === "inbox" ? "active" : ""} onClick={() => setTab("inbox")} style={{ cursor: "pointer" }}>
            <span className="num">⊕</span><span>inbox · 3</span>
          </div>
        </div>
        <div className="bp-statusbar">
          <span className="dot"></span><span>capacity <b>3 / 4</b></span>
          <span>·</span><span>NPS <b>4.94</b></span>
        </div>
      </div>

      <div className="bp-main" style={{ gridTemplateColumns: "1fr 360px" }}>
        <div className="bp-content">
          {/* HERO · greeting + score */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "flex-end", paddingBottom: 22, borderBottom: "1px solid var(--line-soft)" }}>
            <div>
              <div className="bp-eyebrow"><span>Welcome back</span><span className="pill green">● tier up unlocked</span></div>
              <h1 className="bp-h1" style={{ marginTop: 6 }}>
                Hi, Edward.
                <br/><span className="zh" style={{ color: "var(--muted)" }}>3 個案在跑、1 個提案待回。</span>
              </h1>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <div style={{ width: 84, height: 84, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--accent-line)", boxShadow: "0 0 0 4px var(--accent-soft)" }}>
                <img src={_ARC.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.4) contrast(1.1)" }} />
              </div>
              <div>
                <div className="bp-rcard" style={{ background: "transparent", border: 0, padding: 0 }}>
                  <div className="lbl">match score this month</div>
                  <div className="val" style={{ fontFamily: "var(--mono)", fontSize: 36, color: "var(--accent)" }}>92<span style={{ color: "var(--muted)", fontSize: 14 }}>/100</span></div>
                  <div className="sub">+8 vs last month · domain DTC ↑</div>
                </div>
              </div>
            </div>
          </div>

          {tab === "active" && (
            <>
              {/* Active case · LUMINE */}
              <div className="bp-h2" style={{ marginTop: 26 }}>active case · LUMINE Q4</div>
              <div className="bp-panel">
                <div className="bp-panel-h">
                  <span>case #0xC3F4 · Tier A+ · DAG node A · 50%</span>
                  <span style={{ marginLeft: "auto", color: "var(--accent)" }}>● week 4 / 8 · on track</span>
                </div>
                <div className="bp-panel-b" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { lbl: "Your scope", v: "Visual KV × 2", sub: "4 alts each · 18h" },
                    { lbl: "Your scope", v: "50%", sub: "Visual KV · accepted", a: true },
                    { lbl: "Acceptance", v: "M1 OK", sub: "scope locked · review log", a: true },
                    { lbl: "Next milestone", v: "wk 4 · mid", sub: "2 KV + 4 alts due" },
                  ].map((s, i) => (
                    <div key={i} className="bp-rcard" style={{ background: "var(--bg-1)" }}>
                      <div className="lbl">{s.lbl}</div>
                      <div className="val" style={{ color: s.a ? "var(--accent)" : "var(--text)" }}>{s.v}</div>
                      <div className="sub">{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other active */}
              <div className="bp-h2" style={{ marginTop: 22 }}>other active</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { name: "HANA 香氛 · spring restage", role: "Visual KV", w: "wk 2 / 4", proof: "mid review", p: 50 },
                  { name: "Plant by Plant · packaging", role: "Brand DNA", w: "wk 6 / 6 · final review", proof: "final proof", p: 95 },
                ].map((c, i) => (
                  <div key={i} className="bp-panel">
                    <div className="bp-panel-h">
                      <span>{c.name}</span>
                      <span style={{ marginLeft: "auto" }}>{c.w}</span>
                    </div>
                    <div className="bp-panel-b">
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)" }}>{c.role}</div>
                      <div style={{ height: 4, background: "var(--bg-1)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                        <div style={{ width: c.p + "%", height: "100%", background: "var(--accent)" }}></div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--mono)", fontSize: 11 }}>
                        <span style={{ color: "var(--muted)" }}>proof</span>
                        <span style={{ color: "var(--text-2)" }}>{c.proof}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "tier" && (
            <>
              <div className="bp-h2" style={{ marginTop: 26 }}>Tier ladder · 從入門到大師</div>
              <div className="bp-tier-ladder">
                {[
                  { id: "C",  en: "Unverified",   zh: "未通過審核", icon: "circle",   col: "#5a5a62", bg: "rgba(90,90,98,0.10)",   line: "rgba(90,90,98,0.35)",   sub: "此狀態無法接案 · 不進入配對池", crit: "—" },
                  { id: "B",  en: "Practitioner", zh: "實踐者",     icon: "check",    col: "#7e8da8", bg: "rgba(126,141,168,0.12)", line: "rgba(126,141,168,0.38)", sub: "通過基礎驗證 · 市價 −10%", crit: "1–2 案" },
                  { id: "A",  en: "Expert",       zh: "專家",       icon: "diamond",  col: "#5ec4d6", bg: "rgba(94,196,214,0.12)",  line: "rgba(94,196,214,0.42)",  sub: "通過認證，平均 NPS 4.3 · 市價", crit: "3–9 案" },
                  { id: "A+", en: "Master",       zh: "大師",       icon: "spark",    col: "#c7e84a", bg: "rgba(199,232,74,0.14)",  line: "rgba(199,232,74,0.55)",  sub: "通過垂直認證 · 市價 +15%", crit: "10–29 案", current: true },
                  { id: "S",  en: "Paragon",      zh: "典範",       icon: "star",     col: "#f0c651", bg: "rgba(240,198,81,0.13)",  line: "rgba(240,198,81,0.5)",   sub: "≥ 30 案，平均 NPS 4.7 · 市價 +35%", crit: "30+ 案", next: true },
                ].map((t) => (
                  <div key={t.id} className={"bp-tier-step " + (t.current ? "current" : t.next ? "next" : "")}
                       style={{ "--tcol": t.col, "--tbg": t.bg, "--tline": t.line }}>
                    <div className="ic">
                      {t.icon === "circle" && <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>}
                      {t.icon === "check"  && <svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12.5l2.5 2.5L16 9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      {t.icon === "diamond" && <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3l8 9-8 9-8-9z" fill="currentColor" opacity="0.18"/><path d="M12 3l8 9-8 9-8-9z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>}
                      {t.icon === "spark"   && <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2l1.8 6.4L20 10l-6.2 1.6L12 18l-1.8-6.4L4 10l6.2-1.6z" fill="currentColor"/><circle cx="19" cy="5" r="1.4" fill="currentColor"/><circle cx="5" cy="19" r="1" fill="currentColor"/></svg>}
                      {t.icon === "star"    && <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2.5l2.7 6.3 6.8.6-5.2 4.5 1.6 6.6L12 17l-5.9 3.5 1.6-6.6L2.5 9.4l6.8-.6z" fill="currentColor"/></svg>}
                      {t.icon === "crown"   && <svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" fill="currentColor" opacity="0.25"/><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="3" cy="8" r="1.4" fill="currentColor"/><circle cx="21" cy="8" r="1.4" fill="currentColor"/><circle cx="12" cy="5" r="1.4" fill="currentColor"/></svg>}
                    </div>
                    <div className="lbl">
                      <div className="row1"><span className="tid">Tier {t.id}</span><span className="ten">{t.en}</span></div>
                      <div className="row2"><span className="tzh">{t.zh}</span><span className="tcrit">{t.crit}</span></div>
                      <div className="row3">{t.sub}</div>
                    </div>
                    {t.current && <span className="state">● you are here</span>}
                    {t.next && <span className="state next">8% to go</span>}
                  </div>
                ))}
              </div>

              <div className="bp-h2" style={{ marginTop: 22 }}>Tier progress · A+ DTC</div>
              <div className="bp-panel">
                <div className="bp-panel-b">
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span className="bp-tier aplus" style={{ fontSize: 14, padding: "6px 14px" }}>Tier A+</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
                        <span>DTC Content · level progress</span>
                        <span style={{ color: "var(--accent)" }}>92%</span>
                      </div>
                      <div style={{ height: 8, background: "var(--bg-1)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: "92%", height: "100%", background: "var(--accent)" }}></div>
                      </div>
                      <div style={{ marginTop: 6, fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
                        next level (Tier S · DTC) · 8% to go · 約 1 個高 NPS 案件
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bp-h2" style={{ marginTop: 22 }}>升級到 Tier S 還差什麼 · UPGRADE CHECKLIST</div>
              <div className="bp-panel">
                <div className="bp-panel-h">
                  <span style={{ color: "#f0c651", fontFamily: "var(--mono)", letterSpacing: "0.08em" }}>TIER S · 典範</span>
                  <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>4 / 7 · 57%</span>
                </div>
                <div className="bp-panel-b">
                  <div className="bp-progress-bar"><div className="bp-progress-fill" style={{ width: "57%" }}></div></div>
                  <div className="bp-checklist" style={{ marginTop: 14 }}>
                    {[
                      { done: true,  t: "平均 NPS ≥ 4.7",                    sub: "current 4.94 · streak 6 個月" },
                      { done: true,  t: "至少 2 個 retainer 案",             sub: "2 / 2 · LUMINE + HANA" },
                      { done: true,  t: "解鎖「Brand DNA × AI」垂直認證",   sub: "unlocked 2024-12" },
                      { done: true,  t: "累積 24+ 高 NPS 案",                sub: "24 / 24 · 已達基線" },
                      { done: false, t: "完成 Tier S 認證 case study",       sub: "0 / 2 · 需 NPS ≥ 4.9 案件作評審 sample" },
                      { done: false, t: "平均 case 預算 ≥ NT$120K",          sub: "current avg NT$98K · 還差 NT$22K" },
                      { done: false, t: "通過 S-tier 客戶推薦審查",          sub: "0 / 1 · 需 1 位 Tier S 客戶推薦或委員會審核" },
                    ].map((row, i) => (
                      <div key={i} className={"bp-check-row " + (row.done ? "done" : "todo")}>
                        <div className="bp-check-icon">
                          {row.done ? (
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                              <circle cx="12" cy="12" r="10" fill="var(--accent)"/>
                              <path d="M7 12.5l3 3 7-7" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="var(--accent-line)" strokeWidth="1.5"/>
                            </svg>
                          )}
                        </div>
                        <div className="bp-check-text">
                          <div className="bp-check-title">{row.t}</div>
                          <div className="bp-check-sub">{row.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bp-tip" style={{ marginTop: 14, borderLeft: "2px solid #f0c651" }}>
                    <span style={{ fontFamily: "var(--mono)", color: "#f0c651" }}>next</span>{" "}
                    <span className="zh">完成 1 個 NT$120K+ 高 NPS 案 + 認證 case study × 2 → 觸發 Tier S 委員會審核 →</span>
                  </div>
                </div>
              </div>


              <div className="bp-h2" style={{ marginTop: 22 }}>badges earned · 你的徽章牆</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[
                  { k: "DTC", t: "DTC × 7 cases",   on: true,  sub: "unlocked 2024-09",   col: "#c7e84a", icon: "spark"   },
                  { k: "BD",  t: "Brand DNA × AI",  on: true,  sub: "unlocked 2024-12",   col: "#5ec4d6", icon: "diamond" },
                  { k: "S",   t: "Tier S · DTC",    on: false, sub: "8% to go",           col: "#f0c651", icon: "star"    },
                  { k: "RT",  t: "Retainer Master", on: false, sub: "需 3 個 retainer 案", col: "#c39bff", icon: "crown"   },
                ].map((b, i) => (
                  <div key={i} className="bp-rcard" style={{
                    border: b.on ? `1px solid ${b.col}` : "1px dashed var(--line)",
                    background: b.on ? `color-mix(in oklab, ${b.col} 12%, transparent)` : "var(--bg-1)",
                    opacity: b.on ? 1 : 0.55,
                    textAlign: "center",
                    position: "relative",
                  }}>
                    <div style={{
                      width: 52, height: 52, margin: "0 auto 8px", borderRadius: "50%",
                      background: b.on ? `color-mix(in oklab, ${b.col} 22%, transparent)` : "var(--surface-2)",
                      color: b.on ? b.col : "var(--muted)",
                      border: b.on ? `1.5px solid ${b.col}` : "1px dashed var(--line)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {b.icon === "spark"   && <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2l1.8 6.4L20 10l-6.2 1.6L12 18l-1.8-6.4L4 10l6.2-1.6z" fill="currentColor"/></svg>}
                      {b.icon === "diamond" && <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 3l8 9-8 9-8-9z" fill="currentColor" opacity="0.25"/><path d="M12 3l8 9-8 9-8-9z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>}
                      {b.icon === "star"    && <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2.5l2.7 6.3 6.8.6-5.2 4.5 1.6 6.6L12 17l-5.9 3.5 1.6-6.6L2.5 9.4l6.8-.6z" fill="currentColor"/></svg>}
                      {b.icon === "crown"   && <svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" fill="currentColor" opacity="0.25"/><path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>}
                    </div>
                    <div className="val" style={{ fontSize: 12, color: b.on ? "var(--text)" : "var(--muted)" }}>{b.t}</div>
                    <div className="sub">{b.sub}</div>
                    {b.on && <span style={{ position:"absolute", top:8, right:8, fontFamily:"var(--mono)", fontSize:9, color:b.col, letterSpacing:"0.08em" }}>UNLOCKED</span>}
                  </div>
                ))}
              </div>

              <div className="bp-h2" style={{ marginTop: 22 }}>weighting · 你目前的推薦權重</div>
              <div className="bp-panel">
                <div className="bp-panel-b">
                  {[
                    ["domain match (15)", 14, 15],
                    ["NPS recency (15)", 14, 15],
                    ["tier (15)", 14, 15],
                    ["voice (5)", 5, 5],
                    ["calendar (20)", 18, 20],
                    ["case load (25)", 19, 25],
                  ].map((r, i) => (
                    <div className="bp-bar-row" key={i}>
                      <span className="lbl">{r[0]}</span>
                      <span className="bar" style={{ "--pct": (r[1] / r[2] * 100) + "%" }}></span>
                      <span className="v">{r[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "wallet" && (
            <>
              <div className="bp-h2" style={{ marginTop: 26 }}>commercial terms · this month</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { lbl: "Accepted scope", v: "3 cases", sub: "↑ 38% MoM", a: true },
                  { lbl: "Review logs", v: "7", sub: "from 3 active cases" },
                  { lbl: "AI 工具補貼", v: "NT$3,500", sub: "Claude Pro · ChatGPT Team", a: true },
                ].map((s, i) => (
                  <div key={i} className="bp-rcard">
                    <div className="lbl">{s.lbl}</div>
                    <div className="val" style={{ color: s.a ? "var(--accent)" : "var(--text)" }}>{s.v}</div>
                    <div className="sub">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="bp-h2" style={{ marginTop: 22 }}>AI 工具補貼 · Tier A+ benefit</div>
              <div className="bp-panel">
                <div className="bp-panel-b" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {[
                    { t: "Claude Pro", s: "已啟用 · 平台支付 NT$700/mo" },
                    { t: "ChatGPT Team", s: "已啟用 · 平台支付 NT$900/mo" },
                    { t: "Midjourney Standard", s: "已啟用 · NT$960/mo" },
                    { t: "Figma Pro + Plugin pack", s: "已啟用 · NT$940/mo" },
                  ].map((p, i) => (
                    <div key={i} style={{
                      padding: "12px 14px", background: "var(--bg-1)",
                      border: "1px solid var(--accent-line)", borderRadius: 4,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text)" }}>{p.t}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{p.s}</div>
                      </div>
                      <span style={{ color: "var(--accent)" }}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bp-tip" style={{ marginTop: 14 }}>
                <span style={{ fontFamily: "var(--mono)" }}>commercial terms</span>{" "}
                <span className="zh">早期不在平台內代收專案款；報價、付款與合約由雙方自行約定，BeyondPath 先累積驗收與交付證據。</span>
              </div>
            </>
          )}

          {tab === "coach" && (
            <>
              <div className="bp-h2" style={{ marginTop: 26 }}>
                AI 教練 · skill assessment
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginLeft: 10, letterSpacing: "0.08em" }}>
                  ANALYZED FROM 24 CASES + 162 DELIVERABLES
                </span>
              </div>
              <div className="bp-panel">
                <div className="bp-panel-h">
                  <span>skill gap analysis · 你 vs Tier A+ DTC 中位</span>
                  <span style={{ marginLeft: "auto", color: "var(--accent)" }}>4 / 6 領先 · 2 / 6 落後</span>
                </div>
                <div className="bp-panel-b">
                  {[
                    { k: "Visual KV", you: 92, peer: 78, gap: 14 },
                    { k: "Brand DNA × AI", you: 88, peer: 74, gap: 14 },
                    { k: "DTC domain", you: 85, peer: 72, gap: 13 },
                    { k: "Reels / short video", you: 58, peer: 76, gap: -18, flag: true },
                    { k: "Performance copy", you: 49, peer: 73, gap: -24, flag: true },
                    { k: "Client communication", you: 90, peer: 80, gap: 10 },
                  ].map((s, i) => (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "180px 1fr 70px 60px",
                      gap: 12, alignItems: "center", padding: "10px 0",
                      borderBottom: "1px dashed var(--line-soft)",
                    }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: s.flag ? "var(--warn)" : "var(--text)" }}>
                        {s.flag ? "▲ " : ""}{s.k}
                      </div>
                      <div style={{ height: 10, background: "var(--bg-1)", borderRadius: 2, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: 0, width: s.peer + "%", background: "var(--surface-2)" }}></div>
                        <div style={{ position: "absolute", inset: 0, width: s.you + "%", background: s.flag ? "var(--warn)" : "var(--accent)", opacity: 0.85 }}></div>
                        <div style={{ position: "absolute", left: s.peer + "%", top: -2, bottom: -2, width: 1, background: "var(--text-2)" }}></div>
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)", textAlign: "right" }}>{s.you} / 100</div>
                      <div style={{
                        fontFamily: "var(--mono)", fontSize: 11, textAlign: "right",
                        color: s.gap >= 0 ? "var(--accent)" : "var(--warn)",
                      }}>{s.gap >= 0 ? "+" : ""}{s.gap}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--bg-1)", borderLeft: "2px solid var(--accent)", borderRadius: 4, fontFamily: "var(--zh)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.7 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.12em" }}>AI SUMMARY</span>
                    <div style={{ marginTop: 6 }}>
                      你的 <b>Visual + Brand DNA</b> 已穩居 Tier A+ DTC 領先群。下一個 unlock（Tier S）的瓶頸是
                      <b style={{ color: "var(--warn)" }}> Reels 短影音 </b>與
                      <b style={{ color: "var(--warn)" }}> 績效型文案</b>——這兩塊正是 LUMINE 案中由 Mei 補上的部分。
                      補齊後預估推薦權重再 +12%。
                    </div>
                  </div>
                </div>
              </div>

              <div className="bp-h2" style={{ marginTop: 22 }}>recommended · 補足學習路徑（個人化）</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { tag: "COURSE", t: "Reels 60s storytelling", who: "by Edward · BeyondPath original", time: "2h 40m · 8 modules", lift: "+9 score", paid: "平台補貼 100%" },
                  { tag: "COURSE", t: "Performance copy fundamentals", who: "Maven cohort · imported", time: "4 weeks · live", lift: "+14 score", paid: "平台補貼 NT$4,800 / 6,000" },
                  { tag: "PRACTICE", t: "Reels rapid drill", who: "AI 模擬客戶 brief × 6", time: "self-paced · 6h", lift: "+6 score", paid: "免費 · Tier A+ 福利" },
                ].map((c, i) => (
                  <div key={i} className="bp-panel">
                    <div className="bp-panel-h">
                      <span style={{ color: "var(--accent)", fontFamily: "var(--mono)" }}>{c.tag}</span>
                      <span style={{ marginLeft: "auto", color: "var(--accent)" }}>{c.lift}</span>
                    </div>
                    <div className="bp-panel-b" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ fontFamily: "var(--sans)", fontSize: 15, color: "var(--text)", lineHeight: 1.4 }}>{c.t}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{c.who}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-2)" }}>{c.time}</div>
                      <div style={{
                        marginTop: 4, padding: "6px 10px",
                        background: "var(--accent-soft)", borderRadius: 3,
                        fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)",
                      }}>{c.paid}</div>
                      <button className="bp-btn primary" style={{ marginTop: 6, width: "100%", justifyContent: "center" }}>→ enroll</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bp-h2" style={{ marginTop: 22 }}>tools · 你還沒接上的最新工具（AI 自動偵測）</div>
              <div className="bp-panel">
                <div className="bp-panel-b" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {[
                    { t: "Runway Gen-3 Alpha", why: "你的 Reels 短影音可從 KV 直接生成 · 估計時程 -40%", state: "推薦", new: true },
                    { t: "Claude Projects + Brand GPTs", why: "你 LUMINE 已用過、可一鍵複製到 HANA / Plant", state: "已接", new: false },
                    { t: "Arcads · UGC AI actor", why: "績效型短影片 · 補你 Performance copy 弱項", state: "推薦", new: true },
                    { t: "Figma Make", why: "從 KV 直接出可互動 mock，retainer 案常用", state: "推薦", new: true },
                  ].map((tool, i) => (
                    <div key={i} style={{
                      padding: "12px 14px",
                      background: tool.state === "已接" ? "var(--bg-1)" : "var(--accent-soft)",
                      border: "1px solid " + (tool.state === "已接" ? "var(--line)" : "var(--accent-line)"),
                      borderRadius: 4,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--text)" }}>
                          {tool.new && <span style={{ color: "var(--accent)", marginRight: 6, fontSize: 10, letterSpacing: "0.1em" }}>NEW</span>}
                          {tool.t}
                        </div>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: tool.state === "已接" ? "var(--muted)" : "var(--accent)" }}>
                          {tool.state === "已接" ? "✓ connected" : "+ try"}
                        </span>
                      </div>
                      <div style={{ fontFamily: "var(--zh)", fontSize: 12, color: "var(--muted)", marginTop: 6, lineHeight: 1.6 }}>
                        {tool.why}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bp-tip" style={{ marginTop: 14 }}>
                <span style={{ fontFamily: "var(--mono)" }}>coach</span>{" "}
                <span className="zh">學習路徑由 AI 根據你 24 個案例 / 162 件交付物 + Tier S 標準缺口反推。完成後自動回填至 B3 Tier 進度，不需手動申請。</span>
              </div>
            </>
          )}

          {tab === "inbox" && (
            <>
              <div className="bp-h2" style={{ marginTop: 26 }}>inbox · 3 待回</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { tier: "A+", who: "AURA Skincare", role: "Brand DNA × AI", score: 89, fee: 280000, hot: true, zh: "8 週・3 SKU 全套素材・retainer 入口・client NPS 4.7" },
                  { tier: "A+", who: "Wahmi · Q1 GTM", role: "Visual KV", score: 81, fee: 156000, zh: "6 週・需要快速產出, AI 拆解結果已附" },
                  { tier: "A", who: "Maru · packaging", role: "Visual", score: 72, fee: 84000, zh: "4 週・小型專案, 試做機會" },
                ].map((p, i) => (
                  <div key={i} className="bp-worker" style={{ cursor: "default" }}>
                    <div className="av" style={{ background: "var(--bg-1)", color: "var(--accent)", fontFamily: "var(--mono)" }}>
                      {p.who.split(" ")[0].slice(0, 2).toUpperCase()}
                    </div>
                    <div className="body">
                      <div className="title-row">
                        <span className="name">{p.who}</span>
                        <span className="bp-tier aplus">Tier {p.tier}</span>
                        {p.hot && <span className="bp-badge" style={{ color: "var(--accent)", borderColor: "var(--accent-line)", background: "var(--accent-soft)" }}>retainer entry</span>}
                      </div>
                      <div className="role">{p.role} · est. NT${p.fee.toLocaleString()}</div>
                      <div className="blurb">{p.zh}</div>
                    </div>
                    <div className="score-col">
                      <div className="score">{p.score}<span className="of">/100</span></div>
                      <div className="score-lbl">match</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button className="bp-btn ghost">decline</button>
                        <button className="bp-btn primary">accept →</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right rail · stable across tabs */}
        <div className="bp-rail">
          <div>
            <div className="bp-rail-h">your stats · 30d</div>
            <div className="bp-spec" style={{ marginTop: 10 }}>
              <span>NPS</span><b>4.94</b>
              <span>cases delivered</span><b>5</b>
              <span>avg project</span><b>NT$92K</b>
              <span>capacity</span><b>3 / 4</b>
              <span>response time</span><b>2h 14m</b>
              <span>accept rate</span><b>67%</b>
            </div>
          </div>
          <div className="bp-tip">
            <span style={{ fontFamily: "var(--mono)" }}>tip</span>{" "}
            <span className="zh">本月新人加成名額已用罄 · 你目前處於 <b>Tier A+ 飛輪複利區</b>，每多一個高 NPS 案 → 推薦權重 +0.7%。</span>
          </div>
          <div>
            <div className="bp-rail-h">upcoming</div>
            <div className="bp-spec" style={{ marginTop: 10 }}>
              <span>Mon · LUMINE</span><b>KV review</b>
              <span>Wed · HANA</span><b>v2 sync</b>
              <span>Fri · Plant</span><b>final QA</b>
              <span>next week</span><b style={{ color: "var(--muted)" }}>2 holds</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WORKER EMPTY STATE · Tier B Certification Apply Flow
// 6-step interactive flow · prototype-safe (no backend, client-side state only)
// step 'intro' → 'form' → 'portfolio' → 'generate' → 'paste' → 'preview' → submitted=1
// ============================================================

const APPLICATION_VERTICALS = [
  { id: "dtc", label: "DTC 內容", desc: "保養 / 食品 / 設計品牌 / 生活風格" },
  { id: "saas", label: "B2B SaaS GTM", desc: "GTM 內容 / sales deck / demo script / lead automation" },
  { id: "brand", label: "設計品牌", desc: "品牌 DNA + AI 視覺系統 / 社群素材模板" },
];

const APPLICATION_TOOLS = [
  "Claude", "ChatGPT", "Cursor", "Midjourney", "Veo / Runway",
  "Notion AI", "Make / n8n", "v0.dev", "Perplexity", "其他"
];

function buildAIBrief(form, portfolio) {
  const verts = (form.verticals || []).map((v) => APPLICATION_VERTICALS.find((x) => x.id === v)?.label).filter(Boolean).join("、");
  const tools = (form.tools || []).join("、");
  const cases = (portfolio || []).filter((p) => p.title).map((p, i) => `  案 ${i+1} · ${p.title}（${p.vertical || "未填"}）· 交付：${p.deliver || "未填"} · 結果：${p.outcome || "未填"}`).join("\n");
  return `你是 BeyondPath 認證 AI 整理員。我（${form.name || "申請者"}）正在申請台灣 AI 交付網路 BeyondPath 的 Tier B 認證。我已先在平台填了基本資料：

主領域：${verts || "未填"}
過去 2 年案件數：${form.caseCount || "未填"}
中文母語：${form.zh ? "是" : "否"}
長期付費 AI 工具：${tools || "未填"}

我手邊的案件骨架：
${cases || "  （尚未填）"}

請帶我跑 5 段對話、整理我的 AI 工作證據：
段 1 · 工具流：我從接案到交付的完整 workflow（每步用什麼工具、判斷邏輯、卡住怎麼 fallback）
段 2 · 證據深度：每個案件的具體交付物、客戶反饋（具體越好、空泛 = 你要追問）
段 3 · 判斷力：(a) 我怎麼判斷 AI 跑爛 (b) 我拒絕過什麼案件 (c) 一次我把 AI 救回來的具體 case
段 4 · 報價邏輯：定價方式、典型區間、為什麼這個價
段 5 · 自評 L 分：用 L1-L10 標準（L5=主流 / L7=可申請 Tier B / L8+=可申請 B+）對照我的證據打分

跑完後請產出一段 JSON、格式如下、我會貼回 BeyondPath：

{
  "L_score": <1-10>,
  "L_confidence": "<例 L6-L7>",
  "tier_suggestion": "<Tier B 或 Tier B+ 或 補件>",
  "skill_matrix": {
    "workflow_design": <1-10>,
    "tool_orchestration": <1-10>,
    "judgement": <1-10>,
    "domain_depth": <1-10>,
    "client_communication": <1-10>,
    "delivery_reliability": <1-10>
  },
  "strengths": ["<具體 1>", "<具體 2>", "<具體 3>"],
  "growth": ["<升等需要的 1>", "<升等需要的 2>"],
  "evidence_quality": "<深 / 中 / 淺>"
}

重要：證據不夠 → 你要追問、不要美化、自評過頭 BeyondPath 平台會 FLAG。`;
}

function WorkerEmptyState() {
  const APPLICATION_EMAIL = "edwardt0303@gmail.com";
  const [copiedEmail, setCopiedEmail] = uSW(false);
  const [copiedBrief, setCopiedBrief] = uSW(false);
  const [step, setStep] = uSW("intro"); // intro | form | portfolio | generate | paste | preview
  const [form, setForm] = uSW({ name: "", verticals: [], caseCount: "", zh: true, tools: [] });
  const [portfolio, setPortfolio] = uSW([
    { title: "", vertical: "", deliver: "", outcome: "" },
    { title: "", vertical: "", deliver: "", outcome: "" },
    { title: "", vertical: "", deliver: "", outcome: "" },
  ]);
  const [pasteRaw, setPasteRaw] = uSW("");
  const [parseError, setParseError] = uSW("");
  const [parsed, setParsed] = uSW(null);
  const [submitted, setSubmitted] = uSW(() => {
    try {
      return new URLSearchParams(window.location.search).get("submitted") === "1";
    } catch (e) {
      return false;
    }
  });

  const brief = buildAIBrief(form, portfolio);

  function toggleArr(key, val) {
    setForm((f) => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  }
  function setPortfolioField(i, key, val) {
    setPortfolio((p) => p.map((row, idx) => idx === i ? { ...row, [key]: val } : row));
  }
  function tryParsePaste() {
    setParseError("");
    setParsed(null);
    if (!pasteRaw.trim()) { setParseError("貼上 AI 整理的 JSON"); return; }
    try {
      const m = pasteRaw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("找不到 JSON");
      const obj = JSON.parse(m[0]);
      if (typeof obj.L_score !== "number") throw new Error("缺 L_score");
      if (!obj.skill_matrix) throw new Error("缺 skill_matrix");
      setParsed(obj);
      setStep("preview");
    } catch (e) {
      setParseError(`格式有問題：${e.message}。請確認貼的是完整 JSON、含 L_score 和 skill_matrix。`);
    }
  }

  if (submitted) {
    // v0.5.2 · 簡化 confirmation view：不重複 wrap bp-root/bp-topbar（避免跟 BP_AppShell 雙 frame conflict）
    // 直接用 plain section、加 min-height + 明確 background 防禦
    return (
      <div style={{ width: "100%", minHeight: "80vh", padding: "60px 24px", background: "var(--bg, #0a0a0b)", color: "var(--text, #f0eee8)", display: "flex", justifyContent: "center", alignItems: "flex-start", fontFamily: "'IBM Plex Sans', 'Noto Sans TC', system-ui, sans-serif" }}>
        <div style={{ maxWidth: 640, width: "100%", textAlign: "center" }}>
          <svg viewBox="0 0 80 80" width="96" height="96" style={{ margin: "0 auto 24px", display: "block" }}>
            <circle cx="40" cy="40" r="36" fill="none" stroke="#c7e84a" strokeWidth="2"/>
            <path d="M24 40 l12 12 l22 -22" fill="none" stroke="#c7e84a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.2, margin: "0 0 14px", color: "#f0eee8" }}>申請草稿已準備好。</h1>
          <p style={{ color: "#9a9aa3", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.08em", marginBottom: 28 }}>EMAIL APPLICATION · SEND TO EDWARD</p>

          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 28, textAlign: "left" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: "#9a9aa3", textTransform: "uppercase" }}>
              下一步 · WHAT HAPPENS NEXT
            </div>
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                `請先把申請信寄到 ${APPLICATION_EMAIL}`,
                "Edward 收到後，會在 7 天內回覆是否進入初步 review",
                "通過 → 進首案池（保留 20% slot 給新人）→ 第一個案最快 2 週",
                "沒通過 → 我們會給回饋說明哪裡需要補強 · 6 個月後可重申",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "start" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#c7e84a", fontWeight: 700, minWidth: 18 }}>0{i+1}</span>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: "#c8c6c0" }}>{t}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(199,232,74,0.05)", border: "1px solid rgba(199,232,74,0.4)", padding: "14px 18px", marginBottom: 28, fontSize: 13, color: "#c8c6c0", textAlign: "left" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "#c7e84a", display: "block", marginBottom: 6 }}>◆ PROTOTYPE NOTE</span>
            這是 prototype demo · 目前不會自動送出或儲存個資。若你要正式申請，請把作品、AI workflow 與可聯絡方式手動寄到 Edward 的信箱。
          </div>

          <div style={{ border: "1px dashed rgba(255,255,255,0.16)", padding: "14px 16px", marginBottom: 22, textAlign: "left", background: "rgba(255,255,255,0.018)" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "#9a9aa3", textTransform: "uppercase", marginBottom: 8 }}>手動寄送收件人</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <code style={{ color: "#c7e84a", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, background: "rgba(199,232,74,0.06)", border: "1px solid rgba(199,232,74,0.2)", padding: "8px 10px" }}>{APPLICATION_EMAIL}</code>
              <button
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(APPLICATION_EMAIL);
                    setCopiedEmail(true);
                    setTimeout(() => setCopiedEmail(false), 1600);
                  } catch (e) {}
                }}
                style={{ padding: "8px 12px", border: "1px solid rgba(199,232,74,0.5)", background: "transparent", color: "#f0eee8", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer" }}
              >
                {copiedEmail ? "已複製" : "複製 email"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="app.html?role=worker&view=worker-demo" style={{ display: "inline-block", padding: "12px 24px", border: "1px solid rgba(199,232,74,0.65)", color: "#c7e84a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.12em", textDecoration: "none" }}>看通過後 Worker Console</a>
            <a href="landing.html" style={{ display: "inline-block", padding: "12px 24px", border: "1px solid #c8c6c0", color: "#f0eee8", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.12em", textDecoration: "none" }}>← 回 BeyondPath 首頁</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bp-root is-desktop">
      <div className="bp-topbar">
        <div className="bp-logo"><span className="bp-logo-mark"></span>BEYONDPATH<small>WORKER · pending</small></div>
        <div className="bp-statusbar"><span className="dot" style={{ background: "var(--warn)", boxShadow: "0 0 0 3px oklch(0.82 0.16 75 / 0.20)" }}></span><span>not certified yet</span></div>
      </div>
      <div className="bp-main" style={{ gridTemplateColumns: "1fr" }}>
        <div className="bp-content">
          {step === "intro" && (
          <div className="bp-onboarding">
            <div className="bp-onb-mark">
              <svg viewBox="0 0 240 240" width="120" height="120" fill="none" stroke="currentColor" strokeWidth="1.4">
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
                  const cx = 120 + Math.cos(a) * 92;
                  const cy = 120 + Math.sin(a) * 92;
                  const col = i < 3 ? "var(--accent)" : i < 6 ? "oklch(0.78 0.10 230)" : i < 9 ? "oklch(0.82 0.16 75)" : "oklch(0.78 0.16 320)";
                  return <circle key={i} cx={cx} cy={cy} r="9" fill={col} opacity="0.85"/>;
                })}
                <path d="M114 110l16 10-16 10z" fill="var(--accent)"/>
              </svg>
            </div>
            <div className="bp-eyebrow" style={{ justifyContent: "center", marginTop: 18 }}>
              <span>Apply · Tier B Certification</span>
              <span className="pill green">● applications open</span>
            </div>
            <h1 className="bp-h1" style={{ textAlign: "center", marginTop: 10 }}>
              You're 1 step away from the closed club.
              <br/><span className="zh" style={{ color: "var(--muted)" }}>還差一步加入 &lt; 10%</span>
            </h1>

            <div className="bp-panel bp-onb-card" style={{ marginTop: 26 }}>
              <div className="bp-panel-h">
                <span>Tier B Certification · 4 步</span>
                <span style={{ marginLeft: "auto", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>免費 · 不收任何申請費</span>
              </div>
              <div className="bp-panel-b">
                {[
                  { n: 1, t: "Submit application form", sub: "5 min · 基本資料 + 身份 + email" },
                  { n: 2, t: "Upload 3 portfolio cases", sub: "近 12 個月實際 AI 相關案件" },
                  { n: 3, t: "AI 拆解 portfolio · 評估技能", sub: "即時自動 · skill matrix 6 維" },
                  { n: 4, t: "30-min video review · 平台委員", sub: "批次審核 · 每月 1 號 / 15 號" },
                ].map((s) => (
                  <div key={s.n} className="bp-onb-step">
                    <div className="bp-onb-step-n">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                        <circle cx="12" cy="12" r="10" fill="var(--accent)"/>
                        <path d="M7 12.5l3 3 7-7" stroke="var(--bg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="bp-onb-step-t">{s.t}</div>
                      <div className="bp-onb-step-s">{s.sub}</div>
                    </div>
                  </div>
                ))}
                <div className="bp-onb-stat">
                  <div><span className="lbl">avg approval</span><span className="v">7 days</span></div>
                  <div><span className="lbl">pass rate</span><span className="v">28% (live)</span></div>
                </div>
              </div>
            </div>

            <button
              className="bp-btn primary bp-onb-cta"
              onClick={() => {
                setStep("form");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              → 開始申請 Tier B 認證
            </button>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <a href="app.html?role=worker&view=worker-demo" className="bp-btn ghost" style={{ textDecoration: "none" }}>先看通過後 Worker Console →</a>
            </div>
            <div className="bp-onb-ghost"><a href="#" onClick={(e) => e.preventDefault()}>Read terms &amp; DPA →</a></div>
            <div className="bp-onb-fine">
              全程約 30-45 分鐘 · 24 小時內初步回覆
              <br/>免費申請 · prototype 階段不收任何個資
            </div>
          </div>
          )}

          {/* ====== STEP 1 · BASIC INFO FORM ====== */}
          {step === "form" && (
          <div style={{ maxWidth: 780, margin: "32px auto", padding: "0 24px" }}>
            <ApplyProgress current={1} setStep={setStep} />
            <h1 className="bp-h1" style={{ margin: "20px 0 6px" }}>先告訴我們你是誰。<span className="zh" style={{ color: "var(--muted)", fontSize: "0.5em", display: "block", marginTop: 6 }}>Step 1 · 5 分鐘填完</span></h1>
            <div className="bp-panel" style={{ marginTop: 22 }}>
              <div className="bp-panel-h"><span>基本資料</span><span style={{ marginLeft: "auto", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>BASIC · 1/2</span></div>
              <div className="bp-panel-b" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <FormField label="你的暱稱（客戶會看到）">
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：Arc" style={fieldStyle} />
                </FormField>
                <FormField label="主領域（選 1-2 個 · BP 主場）">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {APPLICATION_VERTICALS.map((v) => (
                      <label key={v.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", border: `1px solid ${form.verticals.includes(v.id) ? "var(--accent)" : "var(--line-soft)"}`, background: form.verticals.includes(v.id) ? "var(--accent-soft)" : "transparent", cursor: "pointer" }}>
                        <input type="checkbox" checked={form.verticals.includes(v.id)} onChange={() => toggleArr("verticals", v.id)} style={{ marginTop: 3, accentColor: "var(--accent)" }} />
                        <div>
                          <div style={{ color: "var(--text)", fontWeight: 600 }}>{v.label}</div>
                          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{v.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </FormField>
                <FormField label="過去 2 年案件數量區間">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["< 5", "5–15", "16–30", "30+"].map((c) => (
                      <button key={c} type="button" onClick={() => setForm({ ...form, caseCount: c })} style={{ padding: "8px 14px", border: `1px solid ${form.caseCount === c ? "var(--accent)" : "var(--line-soft)"}`, background: form.caseCount === c ? "var(--accent-soft)" : "transparent", color: "var(--text)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 13 }}>{c}</button>
                    ))}
                  </div>
                </FormField>
                <FormField label="長期付費使用的 AI 工具（多選）">
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {APPLICATION_TOOLS.map((t) => (
                      <button key={t} type="button" onClick={() => toggleArr("tools", t)} style={{ padding: "6px 12px", border: `1px solid ${form.tools.includes(t) ? "var(--accent)" : "var(--line-soft)"}`, background: form.tools.includes(t) ? "var(--accent-soft)" : "transparent", color: form.tools.includes(t) ? "var(--accent)" : "var(--text-2)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12, borderRadius: 999 }}>{t}</button>
                    ))}
                  </div>
                </FormField>
              </div>
            </div>
            <StepNav onBack={() => setStep("intro")} onNext={() => setStep("portfolio")} nextDisabled={!form.name || form.verticals.length === 0 || !form.caseCount} nextLabel="下一步 · 填 3 個案件 →" />
          </div>
          )}

          {/* ====== STEP 2 · PORTFOLIO CASES ====== */}
          {step === "portfolio" && (
          <div style={{ maxWidth: 780, margin: "32px auto", padding: "0 24px" }}>
            <ApplyProgress current={2} setStep={setStep} />
            <h1 className="bp-h1" style={{ margin: "20px 0 6px" }}>列 3 個真實案件。<span className="zh" style={{ color: "var(--muted)", fontSize: "0.5em", display: "block", marginTop: 6 }}>Step 2 · 10 分鐘 · 簡略骨架即可、待會 AI 帶你展開</span></h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22 }}>
              {portfolio.map((p, i) => (
                <div key={i} className="bp-panel">
                  <div className="bp-panel-h"><span>案件 {i + 1}</span><span style={{ marginLeft: "auto", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>CASE · {i + 1}/3</span></div>
                  <div className="bp-panel-b" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <FormField label="案件標題 / 一句話描述">
                      <input value={p.title} onChange={(e) => setPortfolioField(i, "title", e.target.value)} placeholder="例：DTC 保養品牌週產 12 支 IG 短影音" style={fieldStyle} />
                    </FormField>
                    <FormField label="所屬 vertical">
                      <input value={p.vertical} onChange={(e) => setPortfolioField(i, "vertical", e.target.value)} placeholder="例：DTC 內容" style={fieldStyle} />
                    </FormField>
                    <FormField label="交付物（具體什麼、幾份）">
                      <input value={p.deliver} onChange={(e) => setPortfolioField(i, "deliver", e.target.value)} placeholder="例：12 支 30 秒短影音 + IG caption" style={fieldStyle} />
                    </FormField>
                    <FormField label="結果（客戶反饋 / NPS / 是否續約）">
                      <input value={p.outcome} onChange={(e) => setPortfolioField(i, "outcome", e.target.value)} placeholder="例：NPS 4.8 · 續約 3 個月" style={fieldStyle} />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>
            <StepNav onBack={() => setStep("form")} onNext={() => setStep("generate")} nextDisabled={!portfolio[0].title} nextLabel="下一步 · 生成 AI Brief →" />
          </div>
          )}

          {/* ====== STEP 3a · GENERATE PROMPT + OPEN AI ====== */}
          {step === "generate" && (
          <div style={{ maxWidth: 780, margin: "32px auto", padding: "0 24px" }}>
            <ApplyProgress current={3} setStep={setStep} />
            <h1 className="bp-h1" style={{ margin: "20px 0 6px" }}>用你自己的 AI 整理工作證據。<span className="zh" style={{ color: "var(--muted)", fontSize: "0.5em", display: "block", marginTop: 6 }}>Step 3 · 30 分鐘 · 一鍵打開你常用的 AI</span></h1>
            <div className="bp-panel" style={{ marginTop: 22, border: "1px solid var(--accent-line)", background: "rgba(199,232,74,0.04)" }}>
              <div className="bp-panel-h"><span>怎麼用</span></div>
              <div className="bp-panel-b" style={{ fontSize: 14, lineHeight: 1.75 }}>
                <ol style={{ paddingLeft: 22, margin: 0 }}>
                  <li>下方 brief 是<b>給 AI 看的指示</b>、已塞入你 Step 1+2 的答案</li>
                  <li>點「複製 Brief」→ 再點「打開 Claude / ChatGPT / Gemini」其中一個</li>
                  <li>到 AI 對話框貼上、AI 會帶你跑 30 分鐘訪談</li>
                  <li>AI 最後產出一段 JSON、回來這裡<b>貼回 BeyondPath</b></li>
                </ol>
                <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderLeft: "2px solid var(--accent)", fontSize: 13, color: "var(--text-2)" }}>不收費、不傳資料、純用你自己付費的 AI 跑。</div>
              </div>
            </div>
            <div className="bp-panel" style={{ marginTop: 16 }}>
              <div className="bp-panel-h"><span>BRIEF · 對 AI 的指示</span><span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{brief.length} chars</span></div>
              <div className="bp-panel-b">
                <textarea readOnly value={brief} style={{ width: "100%", minHeight: 280, background: "rgba(0,0,0,0.3)", color: "var(--text-2)", border: "1px solid var(--line-soft)", padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, resize: "vertical" }} />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                  <button type="button" onClick={() => { try { navigator.clipboard.writeText(brief); setCopiedBrief(true); setTimeout(() => setCopiedBrief(false), 1600); } catch (e) {} }} style={btnPrimaryStyle}>{copiedBrief ? "✓ 已複製" : "複製 Brief"}</button>
                  <a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer" style={btnGhostStyle}>打開 Claude →</a>
                  <a href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer" style={btnGhostStyle}>打開 ChatGPT →</a>
                  <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer" style={btnGhostStyle}>打開 Gemini →</a>
                </div>
              </div>
            </div>
            <StepNav onBack={() => setStep("portfolio")} onNext={() => setStep("paste")} nextLabel="AI 跑完了、貼回來 →" />
          </div>
          )}

          {/* ====== STEP 3b · PASTE BACK ====== */}
          {step === "paste" && (
          <div style={{ maxWidth: 780, margin: "32px auto", padding: "0 24px" }}>
            <ApplyProgress current={4} setStep={setStep} />
            <h1 className="bp-h1" style={{ margin: "20px 0 6px" }}>貼回 AI 整理的結果。<span className="zh" style={{ color: "var(--muted)", fontSize: "0.5em", display: "block", marginTop: 6 }}>Step 4 · 1 分鐘 · 把 AI 給的 JSON 整段貼進來</span></h1>
            <div className="bp-panel" style={{ marginTop: 22 }}>
              <div className="bp-panel-h"><span>PASTE · AI 整理結果</span></div>
              <div className="bp-panel-b">
                <textarea value={pasteRaw} onChange={(e) => { setPasteRaw(e.target.value); setParseError(""); }} placeholder='{ "L_score": 7, "L_confidence": "L6-L7", "tier_suggestion": "Tier B", "skill_matrix": { ... }, "strengths": [...], "growth": [...], "evidence_quality": "深" }' style={{ width: "100%", minHeight: 280, background: "rgba(0,0,0,0.3)", color: "var(--text)", border: "1px solid var(--line-soft)", padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, resize: "vertical" }} />
                {parseError && <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(212,113,42,0.1)", border: "1px solid rgba(212,113,42,0.4)", color: "oklch(0.82 0.16 75)", fontSize: 13 }}>⚠ {parseError}</div>}
                <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" onClick={tryParsePaste} style={btnPrimaryStyle}>檢查格式 + 生成能力卡 →</button>
                  <button type="button" onClick={() => { setPasteRaw(SAMPLE_PASTE); setParseError(""); }} style={btnGhostStyle}>用範例試試</button>
                </div>
              </div>
            </div>
            <StepNav onBack={() => setStep("generate")} onNext={tryParsePaste} nextLabel="生成能力卡 →" />
          </div>
          )}

          {/* ====== STEP 3c · PREVIEW CARD + LAYER 2 + LAYER 3 ====== */}
          {step === "preview" && parsed && (
          <div style={{ maxWidth: 880, margin: "32px auto", padding: "0 24px" }}>
            <ApplyProgress current={5} setStep={setStep} />
            <h1 className="bp-h1" style={{ margin: "20px 0 6px" }}>這就是你即將出現在客戶面前的樣子。<span className="zh" style={{ color: "var(--muted)", fontSize: "0.5em", display: "block", marginTop: 6 }}>Step 5 · 預覽你的能力卡 + 下一關</span></h1>

            {/* ABILITY CARD */}
            <div className="bp-panel" style={{ marginTop: 22, borderColor: "var(--accent)", boxShadow: "0 0 0 1px var(--accent-line), 0 8px 32px rgba(199,232,74,0.08)" }}>
              <div className="bp-panel-h" style={{ background: "var(--accent-soft)" }}>
                <span style={{ color: "var(--accent)" }}>◆ AI WORKFLOW PROOF PROFILE</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>PREVIEW · NOT YET SUBMITTED</span>
              </div>
              <div className="bp-panel-b" style={{ padding: "24px 22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{form.name || "—"}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, fontFamily: "var(--mono)" }}>{form.verticals.map((v) => APPLICATION_VERTICALS.find((x) => x.id === v)?.label).filter(Boolean).join(" · ")} · {form.caseCount} 案</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em" }}>AI LEVEL</div>
                    <div style={{ fontSize: 42, fontWeight: 800, color: "var(--accent)", lineHeight: 1, fontFamily: "var(--mono)" }}>L{parsed.L_score}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{parsed.L_confidence}</div>
                  </div>
                </div>
                <div style={{ padding: "10px 14px", background: "var(--accent-soft)", border: "1px solid var(--accent-line)", marginBottom: 18, fontSize: 14, color: "var(--text)" }}>
                  <b style={{ color: "var(--accent)" }}>建議：{parsed.tier_suggestion}</b> · 證據強度 {parsed.evidence_quality || "—"}
                </div>

                {/* SKILL MATRIX 6 維 */}
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 10 }}>SKILL MATRIX · 6 維</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                  {Object.entries(parsed.skill_matrix || {}).map(([k, v]) => (
                    <div key={k} style={{ padding: "10px 12px", border: "1px solid var(--line-soft)", background: "rgba(0,0,0,0.15)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{skillLabel(k)}</span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>{v}/10</span>
                      </div>
                      <div style={{ height: 4, background: "rgba(199,232,74,0.1)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(v / 10) * 100}%`, background: "var(--accent)" }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {parsed.strengths && parsed.strengths.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 8 }}>STRENGTHS</div>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>
                      {parsed.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* LAYER 2 · 我們的考核 */}
            <div className="bp-panel" style={{ marginTop: 22 }}>
              <div className="bp-panel-h">
                <span>◇ 第 2 層 · 我們的考核（自評之外）</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>LAYER 2 · OBJECTIVE</span>
              </div>
              <div className="bp-panel-b" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <ObjLayer
                  num="01"
                  title="情境題 · 30 分鐘 · 看判斷力"
                  desc="BP 出一份假 client brief（DTC 品牌想做週 12 支短影音、預算 8 萬、3 週）。你 30 分鐘內交回「我會怎麼接、用什麼工具、為什麼這個價」。"
                  status="pending"
                />
                <ObjLayer
                  num="02"
                  title="持續 NPS · 每結案一次自動評"
                  desc="通過後接的每一案、結案 client 評分都累積進你的 trust data。NPS 跌破 3.5 自動降階、4.7+ 自動推薦升 B+。"
                  status="auto"
                />
                <ObjLayer
                  num="03"
                  title="試水案 pilot · 等 BP 有 client 進來才開"
                  desc="BP 派一個小案（5-15K 真實付費）給你、結案表現直接證明能力。"
                  status="future"
                />
              </div>
            </div>

            {/* LAYER 3 · 教育路徑 · routing by L 分 */}
            <div className="bp-panel" style={{ marginTop: 16 }}>
              <div className="bp-panel-h">
                <span>◈ 第 3 層 · 教育資源（按你 L{parsed.L_score} 自動推薦）</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>LAYER 3 · GROWTH</span>
              </div>
              <div className="bp-panel-b">
                <EducationRouting score={parsed.L_score} growth={parsed.growth || []} />
              </div>
            </div>

            {/* SUBMIT */}
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
              <button
                className="bp-btn primary"
                style={{ minWidth: 280, padding: "14px 28px" }}
                onClick={() => {
                  try { window.history.replaceState(null, "", "app.html?role=worker&onboarding=1&submitted=1"); } catch (e) {}
                  setSubmitted(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                → Submit · 送交 Edward 24h 內覆核
              </button>
              <button type="button" onClick={() => setStep("paste")} style={{ ...btnGhostStyle, padding: "8px 18px" }}>← 回去改 AI 結果</button>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS · WORKER APPLY FLOW
// ============================================================

function ApplyProgress({ current, setStep }) {
  const steps = [
    { n: 1, label: "基本資料", key: "form" },
    { n: 2, label: "3 個案件", key: "portfolio" },
    { n: 3, label: "生成 Brief", key: "generate" },
    { n: 4, label: "貼回結果", key: "paste" },
    { n: 5, label: "預覽能力卡", key: "preview" },
  ];
  return (
    <div style={{ display: "flex", gap: 0, alignItems: "center", flexWrap: "wrap", padding: "12px 0", borderBottom: "1px solid var(--line-soft)" }}>
      <button type="button" onClick={() => setStep("intro")} style={{ background: "transparent", border: "none", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", marginRight: 14, textTransform: "uppercase" }}>← 回 intro</button>
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: current >= s.n ? 1 : 0.4 }}>
            <span style={{ width: 24, height: 24, borderRadius: 99, background: current === s.n ? "var(--accent)" : current > s.n ? "var(--accent-soft)" : "rgba(255,255,255,0.08)", color: current === s.n ? "var(--bg)" : "var(--text)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700 }}>{current > s.n ? "✓" : s.n}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: current === s.n ? "var(--accent)" : "var(--text-2)", letterSpacing: "0.05em" }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <span style={{ width: 18, height: 1, background: "var(--line-soft)", margin: "0 8px" }}></span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 8, fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  );
}

function StepNav({ onBack, onNext, nextDisabled, nextLabel }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 24, flexWrap: "wrap" }}>
      {onBack ? <button type="button" onClick={onBack} style={btnGhostStyle}>← 上一步</button> : <span></span>}
      <button type="button" onClick={onNext} disabled={nextDisabled} style={{ ...btnPrimaryStyle, opacity: nextDisabled ? 0.35 : 1, cursor: nextDisabled ? "not-allowed" : "pointer" }}>{nextLabel}</button>
    </div>
  );
}

function ObjLayer({ num, title, desc, status }) {
  const statusBadge = { pending: { txt: "你即將要做", color: "var(--accent)" }, auto: { txt: "通過後自動跑", color: "oklch(0.78 0.10 230)" }, future: { txt: "等 BP 有 client 才開", color: "var(--muted)" } }[status];
  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 16px", border: "1px solid var(--line-soft)", background: "rgba(0,0,0,0.15)" }}>
      <span style={{ fontFamily: "var(--mono)", color: "var(--accent)", fontWeight: 700, fontSize: 13, minWidth: 24 }}>{num}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ color: "var(--text)", fontWeight: 600, fontSize: 15 }}>{title}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "2px 8px", border: `1px solid ${statusBadge.color}`, color: statusBadge.color, letterSpacing: "0.08em", textTransform: "uppercase" }}>{statusBadge.txt}</span>
        </div>
        <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

function EducationRouting({ score, growth }) {
  let tier, color, items;
  if (score >= 7) {
    tier = "已達 Tier B 申請門檻"; color = "var(--accent)";
    items = [
      { t: "升 Tier B+ 路徑", d: "再補一個 vertical 的 2 件深證據 + 多 vertical workflow 範例" },
      { t: "AI 工具補貼資訊", d: "通過後可申請 Claude Pro / Cursor 訂閱補貼（每月 NT$ 500-1500）" },
      { t: "B+ 旗艦池", d: "L8+ 多 vertical 跨界、優先配高單價案件" },
    ];
  } else if (score >= 4) {
    tier = "L4-6 中段 · 補強區"; color = "oklch(0.82 0.16 75)";
    items = [
      { t: "你缺的 3 個技能", d: growth.length > 0 ? growth.join(" / ") : "判斷力深度 · 跨工具 orchestration · 客戶溝通 (預設、AI 未填時)" },
      { t: "Vertical 培訓", d: "DTC 內容 / B2B SaaS GTM / 設計品牌 三方向、每個方向有 5-10 個技能清單" },
      { t: "補強後重試", d: "申請 6 個月內可重試、保留你的 portfolio 不必重填" },
    ];
  } else {
    tier = "L1-3 入門 · 基礎學習"; color = "var(--muted)";
    items = [
      { t: "AI 工具基礎課程", d: "ChatGPT / Claude / Midjourney 基礎用法（外部優質資源連結）" },
      { t: "Workflow 思維建立", d: "從「會用 AI」到「能對成果負責」需要的 5 個轉變" },
      { t: "Build evidence first", d: "先累積 3-5 個真實案件、3-6 個月後再來申請" },
    ];
  }
  return (
    <div>
      <div style={{ display: "inline-block", padding: "4px 12px", border: `1px solid ${color}`, color, fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", marginBottom: 14 }}>{tier}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", border: "1px solid var(--line-soft)", background: "rgba(0,0,0,0.15)" }}>
            <span style={{ color: "var(--accent)", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13, minWidth: 18 }}>0{i + 1}</span>
            <div>
              <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>{it.t}</div>
              <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>{it.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function skillLabel(k) {
  return ({
    workflow_design: "Workflow 設計",
    tool_orchestration: "多工具搭配",
    judgement: "判斷力",
    domain_depth: "領域深度",
    client_communication: "客戶溝通",
    delivery_reliability: "交付可靠度",
  })[k] || k;
}

const fieldStyle = { width: "100%", padding: "10px 12px", background: "rgba(0,0,0,0.25)", border: "1px solid var(--line-soft)", color: "var(--text)", fontFamily: "var(--zh)", fontSize: 14, borderRadius: 0 };
const btnPrimaryStyle = { padding: "10px 18px", background: "var(--accent)", color: "var(--bg)", border: "1px solid var(--accent)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", fontWeight: 700, textTransform: "uppercase" };
const btnGhostStyle = { padding: "10px 16px", background: "transparent", color: "var(--text)", border: "1px solid var(--line-soft)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.08em", cursor: "pointer", textDecoration: "none", display: "inline-block" };

const SAMPLE_PASTE = `{
  "L_score": 7,
  "L_confidence": "L6-L7",
  "tier_suggestion": "Tier B",
  "skill_matrix": {
    "workflow_design": 8,
    "tool_orchestration": 7,
    "judgement": 7,
    "domain_depth": 8,
    "client_communication": 6,
    "delivery_reliability": 7
  },
  "strengths": [
    "DTC vertical 兩個完整 workflow 含 fallback 機制",
    "AI 跑爛救回來的具體 case · 保養品文案 prompt 重設",
    "報價邏輯清楚 · 按 milestone + 工具訂閱攤提"
  ],
  "growth": [
    "客戶溝通段空泛 · 補一個具體溝通 case",
    "跨 vertical 深度 · 想升 B+ 需要第二個 vertical 深證據"
  ],
  "evidence_quality": "中"
}`;

window.BP_WorkerDashboard = WorkerDashboard;

function WorkerRoot(props) {
  // SmartWorker dispatch: show empty state if onboarding flag set
  var onboarding = false;
  try { onboarding = localStorage.getItem("bp-worker-onboarding") === "1"; } catch (e) {}
  if (onboarding) return <WorkerEmptyState />;
  return <WorkerDashboard {...props} />;
}

window.BP_WorkerRoot = WorkerRoot;
window.BP_WorkerEmptyState = WorkerEmptyState;
