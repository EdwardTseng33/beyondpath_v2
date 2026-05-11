// BeyondPath · Worker dashboard (接案方視角 · 同一個 LUMINE 案件)
const { useState: uSW } = React;
const _DW = window.BP_DATA;
const _ARC = _DW.WORKERS.find((w) => w.id === "w-arc");

function WorkerDashboard({ inShell = false }) {
  const [tab, setTab] = uSW("active");

  return (
    <div className="bp-root is-desktop">
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
            <span className="num">$</span><span>wallet + AI 補貼</span>
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
                    { lbl: "Your payout", v: "NT$101,650", sub: "50% × 95% net", a: true },
                    { lbl: "Released", v: "NT$30,495", sub: "deposit 30% · escrow", a: true },
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
                  { name: "HANA 香氛 · spring restage", role: "Visual KV", w: "wk 2 / 4", payout: 64000, p: 50 },
                  { name: "Plant by Plant · packaging", role: "Brand DNA", w: "wk 6 / 6 · final review", payout: 128000, p: 95 },
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
                        <span style={{ color: "var(--muted)" }}>payout</span>
                        <span style={{ color: "var(--text-2)" }}>NT${c.payout.toLocaleString()}</span>
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
              <div className="bp-h2" style={{ marginTop: 26 }}>wallet · this month</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { lbl: "Released", v: "NT$162,145", sub: "↑ 38% MoM", a: true },
                  { lbl: "In escrow", v: "NT$170,750", sub: "from 3 active cases" },
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
                <span style={{ fontFamily: "var(--mono)" }}>worker net</span>{" "}
                <span className="zh">扣除平台 5% 抽佣後即時撥款 (T+3) · AI 工具補貼為 Tier A+ 額外福利，不計入抽佣。</span>
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
              <span>avg payout</span><b>NT$92K</b>
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

function WorkerEmptyState() {
  const APPLICATION_EMAIL = "edwardt0303@gmail.com";
  const buildApplicationMailto = () => {
    const today = new Date().toISOString().slice(0, 10);
    const subject = encodeURIComponent(`[BeyondPath Tier B] {你的名字}・{主領域}・申請 ${today}`);
    const lines = [
      "Hi BeyondPath team、",
      "",
      "我想申請 Tier B Certification。",
      "",
      "▸ 基本資料",
      "- 名字：",
      "- 主要 email：",
      "- 所在地（城市）：",
      "- 主領域（從 15 領域擇 1-2）：",
      "- 近 12 個月實作案件數：",
      "- 目前主要接案管道：（PTT / 朋友介紹 / 104 / Cake / Behance / 其他）",
      "",
      "▸ AI workflow",
      "- 主要使用 AI 工具：（Claude / ChatGPT / Cursor / Midjourney / 其他）",
      "- 你最自豪的 1 個 AI workflow 案例（簡述 + URL）：",
      "",
      "▸ Portfolio · 3 個近 12 個月實際 AI 相關案件",
      "1. URL + 你的角色 + 客戶類型：",
      "2. ",
      "3. ",
      "",
      "▸ Logistics",
      "- 從哪聽到 BeyondPath（推薦人 / 社群 / 文章 / 其他）：",
      "- 期望被審通過的 Tier 級別：（B / B+ / A）",
      "- 可進行 30-min video review 的時段（平日 / 週末 · 上午 / 下午 / 晚上）：",
      "",
      "▸ 附註（optional）",
      "任何想讓我們知道的：",
      "",
      "————",
      "本信由 BeyondPath landing page 自動產生申請草稿。",
      "Prototype demo · 真實服務 2026 Q3 上線。",
    ];
    return `mailto:${APPLICATION_EMAIL}?subject=${subject}&body=${encodeURIComponent(lines.join("\n"))}`;
  };
  const applicationMailto = buildApplicationMailto();
  const [copiedEmail, setCopiedEmail] = uSW(false);
  const [submitted, setSubmitted] = uSW(() => {
    try {
      return new URLSearchParams(window.location.search).get("submitted") === "1";
    } catch (e) {
      return false;
    }
  });

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
            這是 prototype demo · 目前不會自動送出或儲存個資。若你要正式申請，請用下方按鈕開啟 email 草稿，或手動寄到 Edward 的信箱。
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
            <a href={applicationMailto} style={{ display: "inline-block", padding: "12px 24px", border: "1px solid #c7e84a", background: "#c7e84a", color: "#0a0a0b", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textDecoration: "none" }}>寄申請信給 Edward</a>
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
                try {
                  window.history.replaceState(null, "", "app.html?role=worker&onboarding=1&submitted=1");
                } catch (e) {}
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              → Apply for Tier B Certification
            </button>
            <div className="bp-onb-ghost"><a href="#" onClick={(e) => e.preventDefault()}>Read terms &amp; DPA →</a></div>
            <div className="bp-onb-fine">
              提交後 7 天內 AI broker + 平台委員會審核
              <br/>通過後直接進入配對池 · 不收任何申請費
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
