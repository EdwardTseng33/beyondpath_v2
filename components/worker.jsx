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
        <div style={{ padding: "8px 18px", borderBottom: "1px solid rgba(199,232,74,0.18)", background: "rgba(199,232,74,0.04)", display: "flex", gap: 10, alignItems: "center", justifyContent: "center", flexWrap: "wrap", fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.08em", color: "var(--muted)" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>◆ DEMO</span>
          <span className="zh" style={{ fontFamily: "var(--zh)", letterSpacing: 0 }}>這是通過認證後的接案方畫面範例 · 資料皆為模擬</span>
        </div>
      )}
      <div className="bp-topbar">
        {!inShell && (
          <div className="bp-logo">
            <span className="bp-logo-mark"></span>BEYONDPATH
            <small>WORKER · DEMO</small>
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
          {/* DEMO ENTRY · 首次訪客大 CTA · 引導去評估流程 */}
          {isDemoView && (
            <div style={{
              padding: "20px 24px",
              marginBottom: 26,
              border: "1px solid var(--accent)",
              background: "linear-gradient(135deg, rgba(199,232,74,0.12), rgba(199,232,74,0.02))",
              boxShadow: "0 0 0 1px var(--accent-line), 0 8px 32px rgba(199,232,74,0.10)",
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              alignItems: "center",
            }}>
              <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 80 80" width="64" height="64" fill="none">
                  {Array.from({ length: 12 }, (_, i) => {
                    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
                    const cx = 40 + Math.cos(a) * 30;
                    const cy = 40 + Math.sin(a) * 30;
                    const col = i < 3 ? "var(--accent)" : i < 6 ? "oklch(0.78 0.10 230)" : i < 9 ? "oklch(0.82 0.16 75)" : "oklch(0.78 0.16 320)";
                    return <circle key={i} cx={cx} cy={cy} r="4" fill={col} opacity="0.9"/>;
                  })}
                  <path d="M37 36l8 4-8 4z" fill="var(--accent)"/>
                </svg>
              </div>
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 6, textTransform: "uppercase" }}>◆ 首次進入 · TIER B APPLY</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4, lineHeight: 1.3 }}>先做你的 AI 認證評估、生成能力卡</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>5 步 · 30-45 分鐘 · 用你自己的 AI 整理工作證據 · 24h 內 BeyondPath 系統評估完成</div>
              </div>
              <a href="app.html?role=worker&onboarding=1" style={{
                padding: "14px 24px",
                background: "var(--accent)",
                color: "var(--bg)",
                fontFamily: "var(--mono)",
                fontSize: 12,
                letterSpacing: "0.1em",
                fontWeight: 700,
                textDecoration: "none",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                border: "1px solid var(--accent)",
                flexShrink: 0,
              }}>→ 開始評估</a>
            </div>
          )}

          {/* HERO · greeting + score */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "flex-end", paddingBottom: 22, borderBottom: "1px solid var(--line-soft)" }}>
            <div>
              <div className="bp-eyebrow"><span>Welcome back</span><span className="pill green">● tier up unlocked</span></div>
              <h1 className="bp-h1" style={{ marginTop: 6 }}>
                Welcome back.
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
                  { tag: "COURSE", t: "Reels 60s storytelling", who: "BeyondPath original", time: "2h 40m · 8 modules", lift: "+9 score", paid: "平台補貼 100%" },
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
// 2026-05-15 v0.2 · server-side AI interview (取代外部 ChatGPT/Claude paste-back)
// step 'intro' → 'chat' (server-side Claude 7 段訪談) → 'preview' (ability card) → submitted=1
// Edge Function: worker-ai-interview · helper: bpAiInterview.sendMessage(messages)
// ============================================================

// [2026-05-15 v0.3 雙軌] Route A (自帶 AI · 主流) 用的 brief prompt
// 給有 ChatGPT / Claude / Gemini 付費工具的 worker copy + 貼進外部 AI 對話跑訪談
// Route B (BP 內建 · 保底) 用 supabase/functions/worker-ai-interview/index.ts 的 SYSTEM_PROMPT (server-side)
// 兩個 prompt schema 對齊 (同樣 7 段 + 同樣 ai_proof JSON output) · 雙軌都通 preview
const AI_BRIEF = `你是 BeyondPath 認證 AI 整理員。我正在申請台灣 AI 交付網路 BeyondPath 的 Tier B / B+ 認證。

請帶我跑一段 30 分鐘訪談、按下面 7 段順序問。每段具體追問、不接受空泛回答（例「我會用 ChatGPT」要追問「用在什麼任務？哪個案件？拿什麼成果？」）。最後產出一段結構化 JSON、我會貼回 BeyondPath 平台、由平台 render 成能力卡 + BeyondPath 系統評估。

【訪談 7 段】

段 1 · 基本資料
- 暱稱（客戶會看到的版本）/ 所在地 / 中文母語 yes/no
- 主領域：DTC 內容 / B2B SaaS GTM / 設計品牌（三選 1-2、BeyondPath 主場、其他先加 waitlist）
- 過去 2 年案件數量區間：< 5 / 5-15 / 16-30 / 30+

段 2 · AI 工具棧
- 長期付費 AI 工具（ChatGPT / Claude / Cursor / Midjourney / Veo / Notion AI 等）
- 各用多久 + 主要用在什麼任務（要具體任務、不要空話）

段 3 · 工具流 Workflow（核心段）
- 1-3 個完整 workflow：從接案到交付、每一步用什麼工具、判斷邏輯、卡住怎麼 fallback
- 必問：你怎麼判斷 AI 跑出來能不能用？什麼時候改 prompt / 換工具 / 放棄自動化改手動？

段 4 · 過去案件成果（要證據）
- 2-5 個真實案件：類型 / 產業 / 交付物 / 用時 / 客戶反饋（NPS / 文字 / 是否續約）
- 至少 2 件深證據：截圖 / 對話紀錄 / 結案 invoice / testimonial

段 5 · 判斷力（必問完整 3 條）
- a. 你怎麼判斷 AI 跑爛？做什麼 sanity check？
- b. 你拒絕過什麼樣的案件？為什麼？
- c. 你最自豪的一次「AI 跑爛、你救回來」具體是什麼？

段 6 · 報價邏輯
- 定價方式（按案 / 按時 / 按交付物 / 按 milestone）
- 典型價格區間 NT$ / 為什麼這個價

段 7 · 自評 L 分（你用 L1-L10 對照我的證據打分）
- L1-3 萌芽：會用 AI 但沒系統、單一工具
- L4-6 系統化：AI 嵌進固定流程、多工具搭配、可重複
- L7-9 自治化：AI 跑多步驟、人類 review、能 debug AI 失敗
- L10 自進化：AI 自己改進工作流（2026 全球 < 50 人）
- 三錨點：L5 = 主流 / L7 = 可申 Tier B / L8+ = 可申 B+

【訪談完最後產出這段 JSON】

我會整段貼回 BeyondPath：

{
  "name": "<我的暱稱>",
  "verticals": ["<vertical · 例 DTC 內容>"],
  "case_count": "<區間>",
  "L_score": <1-10>,
  "L_confidence": "<例 L6-L7>",
  "tier_suggestion": "<Tier B / Tier B+ / 補件>",
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

【你應禮貌拒絕的情境】
- 我拒絕提供任何證據 → 「按 BeyondPath 方法、至少需要 1 件實物證據才能客觀評」
- 我要你直接給高分 → 「inflated 分數平台會 FLAG、對申請沒幫助」
- 我主領域不在 BP 三 vertical → 「BeyondPath 主場目前是 DTC 內容 / SaaS GTM / 設計品牌、你可以先加 waitlist」

請開始第 1 段。`;

function WorkerEmptyState() {
  const APPLICATION_EMAIL = "edwardt0303@gmail.com";
  const [copiedEmail, setCopiedEmail] = uSW(false);
  const [copiedBrief, setCopiedBrief] = uSW(false);
  // step: intro | generate | paste | chat | preview
  //   Route A (自帶 AI · 主流): intro → generate → paste → preview
  //   Route B (BP 內建 · 保底): intro → chat → preview
  // 2026-05-15 v0.3 雙軌:Edward 拍板「給對方內容讓對方 AI 跑」是主流 · 未來 MCP 直推延伸這條
  const [step, setStep] = uSW("intro");
  const [route, setRoute] = uSW(""); // "self" (自帶 AI) | "internal" (BP 內建) · 用來 routing ApplyProgress + back behavior
  const [parsed, setParsed] = uSW(null);
  const [submitted, setSubmitted] = uSW(() => {
    try {
      return new URLSearchParams(window.location.search).get("submitted") === "1";
    } catch (e) {
      return false;
    }
  });

  // ====== Route A · 自帶 AI paste-back state ======
  const [pasteRaw, setPasteRaw] = uSW("");
  const [parseError, setParseError] = uSW("");

  function tryParsePaste() {
    setParseError("");
    setParsed(null);
    if (!pasteRaw.trim()) {
      setParseError("把 AI 整理出來的內容整段貼進來就好（含中文說明 OK · 我們會自動抓出 JSON 部分）。");
      return;
    }
    try {
      const m = pasteRaw.match(/\{[\s\S]*\}/);
      if (!m) {
        throw new Error("貼進來的內容找不到 JSON 區塊（要含 { } 大括號）。請回 ChatGPT/Claude 確認最後有產出 JSON、整段複製貼上。");
      }
      const obj = JSON.parse(m[0]);
      if (typeof obj.L_score !== "number") {
        throw new Error("JSON 裡缺 `L_score`（一個 0-10 的數字）。可能是 AI 沒走完訪談、回去看是否漏了 L 分評估那段。");
      }
      if (!obj.skill_matrix) {
        throw new Error("JSON 裡缺 `skill_matrix`（6 維能力評分）。回 ChatGPT/Claude 補完 6 維評分後重貼。");
      }
      setParsed(obj);
      setStep("preview");
    } catch (e) {
      const friendly = e.message.includes("Unexpected") || e.message.includes("Unterminated")
        ? `JSON 格式不完整（${e.message.slice(0, 60)}…）。常見原因：複製時漏了結尾 } 或多了句點。再貼一次試試、或點下方「用範例試試」看正確格式長怎樣。`
        : e.message;
      setParseError(friendly);
    }
  }

  // ====== Route B · server-side AI interview state ======
  const [interviewMessages, setInterviewMessages] = uSW([]); // [{ role: 'user'|'assistant', content }]
  const [interviewInput, setInterviewInput] = uSW("");
  const [interviewAsking, setInterviewAsking] = uSW(false); // AI thinking indicator
  const [interviewError, setInterviewError] = uSW("");
  const [interviewStep, setInterviewStep] = uSW(0); // 1-7 from AI's step field
  const [interviewProgress, setInterviewProgress] = uSW(""); // 例 "Step 3 / 7"
  const interviewStartedRef = React.useRef(false);

  async function sendInterviewTurn(userText) {
    if (interviewAsking) return; // 防 double submit
    setInterviewError("");

    // 組新 messages: 既有 + 本次 user input (空 = 第一次 seed)
    const trimmed = (userText || "").trim();
    const nextMessages = trimmed
      ? [...interviewMessages, { role: "user", content: trimmed }]
      : interviewMessages;

    setInterviewMessages(nextMessages);
    setInterviewInput("");
    setInterviewAsking(true);

    if (!window.bpAiInterview) {
      setInterviewAsking(false);
      setInterviewError("AI 訪談模組沒載入（bpAiInterview undefined）。檢查 supabase.js 是否在頁面上。");
      return;
    }

    const { data, error } = await window.bpAiInterview.sendMessage(nextMessages);
    setInterviewAsking(false);

    if (error || !data?.ok) {
      const msg = error?.message || data?.error || "AI 訪談呼叫失敗、請稍後再試。";
      const hint = data?.hint ? ` · ${data.hint}` : "";
      setInterviewError(msg + hint);
      return;
    }

    // AI 回應 append 進 messages
    const aiContent = data.message || "";
    if (aiContent) {
      setInterviewMessages([...nextMessages, { role: "assistant", content: aiContent }]);
    }

    if (typeof data.step === "number") setInterviewStep(data.step);
    if (data.progress_hint) setInterviewProgress(data.progress_hint);

    // status: 'complete' → 自動切 preview
    if (data.status === "complete" && data.ai_proof) {
      setParsed(data.ai_proof);
      // 短延遲讓 user 看到最後一句感謝再切（300ms）
      setTimeout(() => setStep("preview"), 600);
    }
  }

  function startInterview() {
    if (interviewStartedRef.current) return;
    interviewStartedRef.current = true;
    // 空 messages 觸發第一段問題 (Edge Function seed [INTERVIEW_START])
    sendInterviewTurn("");
  }

  function handleInterviewSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const text = interviewInput.trim();
    if (!text || interviewAsking) return;
    sendInterviewTurn(text);
  }

  function resetInterview() {
    setInterviewMessages([]);
    setInterviewInput("");
    setInterviewAsking(false);
    setInterviewError("");
    setInterviewStep(0);
    setInterviewProgress("");
    interviewStartedRef.current = false;
  }

  // ====== localStorage 進度暫存 (2026-05-15 v0.3) ======
  // 答到一半 reload 不丟進度 · 24h 過期 · submit 成功或回首頁清除
  const STORAGE_KEY = "bp_worker_apply_state_v1";
  const STORAGE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h
  const restoredRef = React.useRef(false);

  // Mount: restore 進度
  React.useEffect(() => {
    if (restoredRef.current || submitted) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved || saved.version !== 1) return;
      if (!saved.savedAt || Date.now() - saved.savedAt > STORAGE_MAX_AGE_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      // 只 restore "中間" step (paste / chat / preview 有進度)、intro / generate 不必
      const validRestoreSteps = ["paste", "chat", "preview"];
      if (!validRestoreSteps.includes(saved.step)) return;

      if (saved.route) setRoute(saved.route);
      if (saved.pasteRaw) setPasteRaw(saved.pasteRaw);
      if (Array.isArray(saved.interviewMessages) && saved.interviewMessages.length > 0) {
        setInterviewMessages(saved.interviewMessages);
        interviewStartedRef.current = true; // 已開始過、避免 auto re-trigger
      }
      if (typeof saved.interviewStep === "number") setInterviewStep(saved.interviewStep);
      if (saved.interviewProgress) setInterviewProgress(saved.interviewProgress);
      if (saved.parsed && typeof saved.parsed === "object") setParsed(saved.parsed);
      setStep(saved.step);
    } catch (e) {
      // localStorage 壞 / disabled / quota / JSON parse error → silent fail (clean slate)
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }, [submitted]);

  // State change: save 進度 (debounce ish · 直接每次 effect)
  React.useEffect(() => {
    if (submitted) return;
    // intro / generate 沒進度可存
    if (step === "intro" || step === "generate") return;
    try {
      const payload = {
        version: 1,
        savedAt: Date.now(),
        step,
        route,
        pasteRaw: pasteRaw || "",
        interviewMessages: interviewMessages || [],
        interviewStep: interviewStep || 0,
        interviewProgress: interviewProgress || "",
        parsed: parsed || null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // quota exceeded / disabled → silent skip
    }
  }, [step, route, pasteRaw, interviewMessages, interviewStep, interviewProgress, parsed, submitted]);

  // submit 成功 / 回首頁 → clear (resetInterview + setRoute("") 不夠、明確清 storage)
  const clearProgressStorage = React.useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  // ====== Chat auto-scroll 到底 (2026-05-15 v0.3) ======
  const chatScrollRef = React.useRef(null);
  React.useEffect(() => {
    if (step !== "chat") return;
    const el = chatScrollRef.current;
    if (el) {
      // 微延遲讓 DOM 渲完
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [interviewMessages, interviewAsking, step]);

  if (submitted) {
    // 提交後清進度 storage (放這裡確保 submitted=1 URL 進來時也清)
    clearProgressStorage();
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
          <p style={{ color: "#9a9aa3", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.08em", marginBottom: 28 }}>EMAIL APPLICATION · SEND TO REVIEW</p>

          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 28, textAlign: "left" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.14em", color: "#9a9aa3", textTransform: "uppercase" }}>
              下一步 · WHAT HAPPENS NEXT
            </div>
            <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                `Supabase 已收到你的申請（能力卡 + email）`,
                `24h 內：AI 初審 + 人工覆核 → 結果回信到你留的 email`,
                "通過 → 進首案池（保留 20% slot 給新人）→ 第一個案最快 2 週",
                "沒通過 → 我們會給具體補強方向 · 6 個月後可重申",
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "start" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#c7e84a", fontWeight: 700, minWidth: 18 }}>0{i+1}</span>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: "#c8c6c0" }}>{t}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(199,232,74,0.05)", border: "1px solid rgba(199,232,74,0.4)", padding: "14px 18px", marginBottom: 28, fontSize: 13, color: "#c8c6c0", textAlign: "left" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "#c7e84a", display: "block", marginBottom: 6 }}>● EARLY BETA · 申請已送出</span>
            你的能力卡與 email 已存入 BeyondPath 後台。24h 內 AI 初審 + 人工覆核完成後、結果寄到你的 email。想額外補資料或自我介紹，可寄到下方 email。
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
    <div style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", background: "var(--bg, #0a0a0b)", color: "var(--text, #f0eee8)" }}>
      <div style={{ minHeight: "100%", padding: "32px 24px 80px" }}>
        <div>
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

            {/* Senior fast-track · 資深 worker 跳過 4 步、直接跟 Edward 30 min 聊 */}
            <div style={{
              marginTop: 22,
              padding: "14px 18px",
              background: "rgba(255,200,80,0.06)",
              border: "1px solid rgba(255,200,80,0.25)",
              borderRadius: "var(--r-md)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 16 }}>👔</span>
                <b style={{ color: "#ffc850", fontSize: 13.5 }}>資深 worker（10+ 年 / Tier A+ 以上）</b>
                <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>fast-track</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                30 分鐘 AI 訪談對你的職涯太短。直接跟 BeyondPath 團隊預約 30 min 視訊聊策略合作、跳過下方 4 步、直接進 Tier A+ pipeline。
              </div>
              <a
                href="mailto:edwardt0303@gmail.com?subject=BeyondPath%20Senior%20Worker%20Fast-Track%20%E7%94%B3%E8%AB%8B&body=Edward%20%E5%A5%BD%EF%BC%8C%0A%0A%E6%88%91%E6%98%AF%E8%B3%87%E6%B7%B1%20worker%EF%BC%88_____%20%E5%B9%B4%E7%B6%93%E9%A9%97%EF%BC%89%E3%80%81%E6%83%B3%E8%B7%B3%E9%81%8E%204%20%E6%AD%A5%E7%B0%A1%E5%8C%96%E8%A8%AA%E8%AB%87%E3%80%81%E7%9B%B4%E6%8E%A5%E8%B7%9F%E4%BD%A0%E9%A0%90%E7%B4%84%2030%20min%20%E8%A6%96%E8%A8%8A%E8%81%8A%E7%AD%96%E7%95%A5%E5%90%88%E4%BD%9C%E3%80%82%0A%0A%E4%B8%BB%E5%8A%9B%E9%A0%98%E5%9F%9F%EF%BC%9A_____%0A%E4%B8%BB%E8%A6%81%E5%85%AC%E5%8F%B8%20%2F%20%E4%BD%9C%E5%93%81%EF%BC%9A_____%0A%E5%8F%AF%E9%A0%90%E7%B4%84%E6%99%82%E6%AE%B5%EF%BC%9A_____%0A%0A%E8%AC%9D%E8%AC%9D"
                style={{
                  alignSelf: "flex-start",
                  marginTop: 4,
                  padding: "8px 16px",
                  background: "#ffc850",
                  color: "#0a0a0b",
                  borderRadius: "var(--r-sm)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--sans)",
                }}
              >
                → 預約團隊 30 min 視訊
              </a>
            </div>

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

            {/* 雙軌 CTA · 2026-05-15 v0.3 ·  Edward「給對方內容讓對方 AI 跑」是主流、BP 內建作保底 */}
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Route A · 主推：自帶 AI */}
              <button
                className="bp-btn primary bp-onb-cta"
                onClick={() => {
                  setRoute("self");
                  setStep("generate");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{ width: "100%" }}
              >
                → 我有 ChatGPT / Claude / Gemini · 自己跑訪談
              </button>
              <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", fontFamily: "var(--mono)", letterSpacing: "0.04em", marginTop: -4 }}>
                推薦 · 用你已付費的 AI · 整理好的證據貼回來
              </div>

              {/* Route B · 保底：BP 內建 */}
              <button
                type="button"
                onClick={() => {
                  setRoute("internal");
                  setStep("chat");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setTimeout(() => startInterview(), 80);
                }}
                style={{
                  width: "100%",
                  padding: "12px 18px",
                  background: "transparent",
                  color: "var(--text)",
                  border: "1px solid var(--line-soft)",
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  marginTop: 6,
                }}
              >
                沒付費 AI · 用 BeyondPath 內建訪談 →
              </button>
              <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", fontFamily: "var(--mono)", letterSpacing: "0.04em", marginTop: -4 }}>
                保底選項 · BeyondPath AI 直接帶你跑 7 段 · 15-25 min
              </div>
            </div>

            <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <a href="app.html?role=worker&view=worker-demo" className="bp-btn ghost" style={{ textDecoration: "none" }}>先看通過後 Worker Console →</a>
            </div>
            <div className="bp-onb-ghost"><a href="#" onClick={(e) => e.preventDefault()}>Read terms &amp; DPA →</a></div>
            <div className="bp-onb-fine">
              全程約 30-45 分鐘 · 24 小時內初步回覆
              <br/>免費申請 · prototype 階段不收任何個資
            </div>
          </div>
          )}


          {/* ====== ROUTE A · STEP 1 · GENERATE BRIEF + OPEN AI (自帶 AI · 主流路徑) ====== */}
          {step === "generate" && (
          <div style={{ maxWidth: 780, margin: "32px auto", padding: "0 24px" }}>
            <ApplyProgress current={1} setStep={setStep} route="self" onRouteReset={() => { setRoute(""); setPasteRaw(""); clearProgressStorage(); }} />
            <h1 className="bp-h1" style={{ margin: "20px 0 6px" }}>用你自己的 AI 整理工作證據。<span className="zh" style={{ color: "var(--muted)", fontSize: "0.5em", display: "block", marginTop: 6 }}>Step 1 · 30 分鐘 · 一鍵打開你常用的 AI</span></h1>
            <div className="bp-panel" style={{ marginTop: 22, border: "1px solid var(--accent-line)", background: "rgba(199,232,74,0.04)" }}>
              <div className="bp-panel-h"><span>怎麼用</span></div>
              <div className="bp-panel-b" style={{ fontSize: 14, lineHeight: 1.75 }}>
                <ol style={{ paddingLeft: 22, margin: 0 }}>
                  <li>下方 brief 是<b>對 AI 的訪談指引</b>、含 7 段問題（基本資料 / 工具棧 / workflow / 案例證據 / 判斷力 / 報價 / L 分自評）</li>
                  <li>點「複製 Brief」→ 再點「打開 Claude / ChatGPT / Gemini」其中一個</li>
                  <li>到 AI 對話框貼上、AI 會帶你跑 30 分鐘訪談、有不懂的 AI 會追問</li>
                  <li>AI 最後產出一段 JSON、回來這裡<b>貼回 BeyondPath</b></li>
                </ol>
                <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderLeft: "2px solid var(--accent)", fontSize: 13, color: "var(--text-2)" }}>不收費、不傳資料、純用你自己付費的 AI 跑。未來會支援 MCP 直接讓你的 AI 把證據推進 BeyondPath、跳過複製貼上。</div>
              </div>
            </div>
            <div className="bp-panel" style={{ marginTop: 16 }}>
              <div className="bp-panel-h"><span>BRIEF · 對 AI 的指示</span><span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{AI_BRIEF.length} chars</span></div>
              <div className="bp-panel-b">
                <textarea readOnly value={AI_BRIEF} style={{ width: "100%", minHeight: 280, background: "rgba(0,0,0,0.3)", color: "var(--text-2)", border: "1px solid var(--line-soft)", padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, resize: "vertical" }} />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                  <button type="button" onClick={() => { try { navigator.clipboard.writeText(AI_BRIEF); setCopiedBrief(true); setTimeout(() => setCopiedBrief(false), 1600); } catch (e) {} }} style={btnPrimaryStyle}>{copiedBrief ? "✓ 已複製" : "複製 Brief"}</button>
                  <a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer" style={btnGhostStyle}>打開 Claude →</a>
                  <a href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer" style={btnGhostStyle}>打開 ChatGPT →</a>
                  <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer" style={btnGhostStyle}>打開 Gemini →</a>
                </div>
              </div>
            </div>
            <StepNav onBack={() => { setRoute(""); setStep("intro"); }} onNext={() => setStep("paste")} nextLabel="AI 跑完了、貼回來 →" />
          </div>
          )}

          {/* ====== ROUTE A · STEP 2 · PASTE BACK (自帶 AI · 主流路徑) ====== */}
          {step === "paste" && (
          <div style={{ maxWidth: 780, margin: "32px auto", padding: "0 24px" }}>
            <ApplyProgress current={2} setStep={setStep} route="self" onRouteReset={() => { setRoute(""); setPasteRaw(""); clearProgressStorage(); }} />
            <h1 className="bp-h1" style={{ margin: "20px 0 6px" }}>貼回 AI 整理的結果。<span className="zh" style={{ color: "var(--muted)", fontSize: "0.5em", display: "block", marginTop: 6 }}>Step 2 · 1 分鐘 · 把 AI 給的 JSON 整段貼進來</span></h1>
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

          {/* ====== ROUTE B · STEP 1 · AI INTERVIEW (server-side · BP 內建 · 保底路徑) ====== */}
          {step === "chat" && (
          <div style={{ maxWidth: 780, margin: "32px auto", padding: "0 24px" }}>
            <ApplyProgress current={1} setStep={setStep} route="internal" onRouteReset={() => { resetInterview(); setRoute(""); clearProgressStorage(); }} />
            <h1 className="bp-h1" style={{ margin: "20px 0 6px" }}>
              AI 訪談你的工作流。
              <span className="zh" style={{ color: "var(--muted)", fontSize: "0.5em", display: "block", marginTop: 6 }}>
                Step 1 · 15-25 分鐘 · BeyondPath AI 帶你跑 7 段問題
              </span>
            </h1>

            {/* 進入訪談前的引導（messages 空 + 還沒在 ask）*/}
            {interviewMessages.length === 0 && !interviewAsking && !interviewError && (
              <div className="bp-panel" style={{ marginTop: 22, border: "1px solid var(--accent-line)", background: "rgba(199,232,74,0.04)" }}>
                <div className="bp-panel-h"><span>怎麼進行</span></div>
                <div className="bp-panel-b" style={{ fontSize: 14, lineHeight: 1.75 }}>
                  <ol style={{ paddingLeft: 22, margin: 0 }}>
                    <li>BeyondPath AI 會帶你跑 7 段訪談、共 15-25 分鐘</li>
                    <li>段順序：領域 / 年資 → AI 工具棧 → 案件數量 + 3 例 → 最自豪 workflow → L-Score 自評 → 6 維技能 → 接案偏好</li>
                    <li>答得越具體（客戶名 / 數字 / 工具串接細節）、評分越準</li>
                    <li>答完 AI 自動產能力卡、BeyondPath 系統 24h 內完成評估</li>
                  </ol>
                  <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(0,0,0,0.2)", borderLeft: "2px solid var(--accent)", fontSize: 13, color: "var(--text-2)" }}>
                    後端 Claude Sonnet 4.6 · 每段答完 AI 會追問具體例子、別怕「答得太簡單」。
                  </div>
                  <button
                    type="button"
                    onClick={startInterview}
                    style={{ ...btnPrimaryStyle, marginTop: 18 }}
                  >
                    → 開始訪談
                  </button>
                </div>
              </div>
            )}

            {/* Chat messages list - 訪談進行中或已開始 */}
            {(interviewMessages.length > 0 || interviewAsking || interviewError) && (
              <div className="bp-panel" style={{ marginTop: 22 }}>
                <div className="bp-panel-h">
                  <span>AI INTERVIEW · 訪談中</span>
                  {interviewProgress && (
                    <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)" }}>
                      {interviewProgress}
                    </span>
                  )}
                </div>
                <div className="bp-panel-b" style={{ padding: 0 }}>
                  <div ref={chatScrollRef} style={{ display: "flex", flexDirection: "column", gap: 14, padding: "18px 20px", maxHeight: 480, overflowY: "auto" }}>
                    {interviewMessages.map((msg, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth: "82%",
                          padding: "10px 14px",
                          background: msg.role === "user" ? "var(--accent-soft)" : "rgba(255,255,255,0.04)",
                          border: msg.role === "user" ? "1px solid var(--accent-line)" : "1px solid var(--line-soft)",
                          color: msg.role === "user" ? "var(--accent)" : "var(--text)",
                          fontSize: 14,
                          lineHeight: 1.65,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {interviewAsking && (
                      <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <div style={{
                          padding: "10px 14px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--line-soft)",
                          color: "var(--muted)",
                          fontSize: 13,
                          fontFamily: "var(--mono)",
                        }}>
                          AI 思考中<span style={{ animation: "bpDotPulse 1.4s infinite" }}>...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error display + retry */}
                  {interviewError && (
                    <div style={{ margin: "0 20px 14px", padding: "10px 12px", background: "rgba(212,113,42,0.1)", border: "1px solid rgba(212,113,42,0.4)", color: "oklch(0.82 0.16 75)", fontSize: 13, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ flex: 1 }}>⚠ {interviewError}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setInterviewError("");
                          // retry：若有 input 拿 input 重送、否則 seed 重啟
                          if (interviewInput.trim()) {
                            sendInterviewTurn(interviewInput);
                          } else if (interviewMessages.length === 0) {
                            startInterview();
                          } else {
                            // 重送最後一次 user message
                            const lastUser = [...interviewMessages].reverse().find(m => m.role === "user");
                            if (lastUser) {
                              // 從 messages 移掉最後 assistant（如果有）重送
                              const cleaned = interviewMessages[interviewMessages.length - 1]?.role === "assistant"
                                ? interviewMessages.slice(0, -1)
                                : interviewMessages;
                              setInterviewMessages(cleaned);
                              setTimeout(() => sendInterviewTurn(""), 50);
                            }
                          }
                        }}
                        style={{ padding: "4px 10px", background: "transparent", border: "1px solid currentColor", color: "inherit", fontSize: 12, cursor: "pointer", fontFamily: "var(--mono)" }}
                      >
                        retry
                      </button>
                    </div>
                  )}

                  {/* Input form */}
                  <form onSubmit={handleInterviewSubmit} style={{ display: "flex", gap: 10, padding: "14px 20px", borderTop: "1px solid var(--line-soft)" }}>
                    <textarea
                      value={interviewInput}
                      onChange={(e) => setInterviewInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleInterviewSubmit(e);
                        }
                      }}
                      placeholder={interviewAsking ? "AI 正在思考、請稍候..." : "輸入你的答案... (Enter 送出 · Shift+Enter 換行)"}
                      disabled={interviewAsking}
                      style={{
                        flex: 1,
                        minHeight: 56,
                        background: "rgba(0,0,0,0.3)",
                        color: "var(--text)",
                        border: "1px solid var(--line-soft)",
                        padding: "10px 12px",
                        fontFamily: "var(--sans)",
                        fontSize: 14,
                        lineHeight: 1.6,
                        resize: "vertical",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={interviewAsking || !interviewInput.trim()}
                      style={{
                        ...btnPrimaryStyle,
                        opacity: (interviewAsking || !interviewInput.trim()) ? 0.4 : 1,
                        cursor: (interviewAsking || !interviewInput.trim()) ? "not-allowed" : "pointer",
                        alignSelf: "flex-end",
                      }}
                    >
                      送出
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Cancel / restart 控制 */}
            <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => { resetInterview(); setRoute(""); clearProgressStorage(); setStep("intro"); }}
                style={{ ...btnGhostStyle, padding: "8px 18px", fontSize: 12 }}
              >
                ← 取消、回首頁
              </button>
              {interviewMessages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("確定要重新開始訪談？目前進度會丟失。")) {
                      resetInterview();
                      setTimeout(() => startInterview(), 80);
                    }
                  }}
                  style={{ ...btnGhostStyle, padding: "8px 18px", fontSize: 12 }}
                >
                  重新開始訪談
                </button>
              )}
            </div>
          </div>
          )}

          {/* ====== STEP 2 · PREVIEW CARD + LAYER 2 + LAYER 3 ====== */}
          {step === "preview" && parsed && (
          <div style={{ maxWidth: 880, margin: "32px auto", padding: "0 24px" }}>
            <ApplyProgress current={route === "internal" ? 2 : 3} setStep={setStep} route={route || "self"} onRouteReset={() => { resetInterview(); setRoute(""); setPasteRaw(""); clearProgressStorage(); }} />
            <h1 className="bp-h1" style={{ margin: "20px 0 6px" }}>這就是你即將出現在客戶面前的樣子。<span className="zh" style={{ color: "var(--muted)", fontSize: "0.5em", display: "block", marginTop: 6 }}>預覽你的能力卡 + 送出申請</span></h1>

            {/* ABILITY CARD */}
            <div className="bp-panel" style={{ marginTop: 22, borderColor: "var(--accent)", boxShadow: "0 0 0 1px var(--accent-line), 0 8px 32px rgba(199,232,74,0.08)" }}>
              <div className="bp-panel-h" style={{ background: "var(--accent-soft)" }}>
                <span style={{ color: "var(--accent)" }}>◆ AI WORKFLOW PROOF PROFILE</span>
                <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>PREVIEW · NOT YET SUBMITTED</span>
              </div>
              <div className="bp-panel-b" style={{ padding: "24px 22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{parsed.name || "—"}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, fontFamily: "var(--mono)" }}>{(parsed.verticals || []).join(" · ")}{parsed.case_count ? ` · ${parsed.case_count} 案` : ""}</div>
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
              <SubmitToSupabaseBtn parsed={parsed} onDone={() => {
                try { window.history.replaceState(null, "", "app.html?role=worker&onboarding=1&submitted=1"); } catch (e) {}
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} />
              <button
                type="button"
                onClick={() => setStep(route === "internal" ? "chat" : "paste")}
                style={{ ...btnGhostStyle, padding: "8px 18px" }}
              >
                {route === "internal" ? "← 回去訪談（補答案）" : "← 回去改 AI 結果"}
              </button>
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

function SubmitToSupabaseBtn({ parsed, onDone }) {
  const [email, setEmail] = uSW("");
  const [status, setStatus] = uSW("idle"); // idle | loading | error | success
  const [errMsg, setErrMsg] = uSW("");

  async function doSubmit() {
    setErrMsg("");
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErrMsg("先填一個有效 email · BeyondPath 24h 內回覆要寄到這裡");
      return;
    }
    if (!window.bpWorkerApply) {
      setErrMsg("Supabase 還沒載入完成、過幾秒再試");
      return;
    }
    setStatus("loading");
    try {
      const { data, error } = await window.bpWorkerApply.submit({
        email,
        displayName: parsed?.name,
        aiProof: parsed,
      });
      if (error) throw error;
      setStatus("success");
      setTimeout(() => onDone && onDone(), 600);
    } catch (e) {
      setStatus("error");
      setErrMsg("送出失敗：" + (e?.message || "未知錯誤") + "。先複製能力卡截圖、寄到 edwardt0303@gmail.com 也可以。");
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 12, alignItems: "stretch" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>SUBMIT · 留下 email 收 BeyondPath 系統評估結果</div>
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setErrMsg(""); }}
        placeholder="your@email.com"
        disabled={status === "loading" || status === "success"}
        style={{ width: "100%", padding: "12px 14px", background: "rgba(0,0,0,0.3)", border: "1px solid var(--line-soft)", color: "var(--text)", fontFamily: "var(--zh)", fontSize: 15 }}
      />
      {errMsg && <div style={{ padding: "10px 12px", background: "rgba(212,113,42,0.1)", border: "1px solid rgba(212,113,42,0.4)", color: "oklch(0.82 0.16 75)", fontSize: 13 }}>⚠ {errMsg}</div>}
      <button
        type="button"
        onClick={doSubmit}
        disabled={status === "loading" || status === "success"}
        className="bp-btn primary"
        style={{ padding: "14px 28px", opacity: status === "loading" || status === "success" ? 0.5 : 1, cursor: status === "loading" || status === "success" ? "wait" : "pointer" }}
      >
        {status === "loading" ? "送出中…" : status === "success" ? "✓ 已送出" : "→ Submit · 送交評估、24h 內回覆"}
      </button>
    </div>
  );
}

function ApplyProgress({ current, setStep, route, onRouteReset }) {
  // 2026-05-15 v0.3 雙軌:Route A (self · 自帶 AI · 3 step) vs Route B (internal · BP 內建 · 2 step)
  const steps = route === "internal"
    ? [
        { n: 1, label: "AI 訪談", key: "chat" },
        { n: 2, label: "預覽能力卡", key: "preview" },
      ]
    : [
        { n: 1, label: "取 Brief", key: "generate" },
        { n: 2, label: "貼回結果", key: "paste" },
        { n: 3, label: "預覽能力卡", key: "preview" },
      ];
  return (
    <div style={{ display: "flex", gap: 0, alignItems: "center", flexWrap: "wrap", padding: "12px 0", borderBottom: "1px solid var(--line-soft)" }}>
      <button
        type="button"
        onClick={() => { if (onRouteReset) onRouteReset(); setStep("intro"); }}
        style={{ background: "transparent", border: "none", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", marginRight: 14, textTransform: "uppercase" }}
      >← 回 intro</button>
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

// [2026-05-15 v0.3 雙軌] Route A paste-back flow 的範例 JSON
// worker 點「用範例試試」button 時 setPasteRaw(SAMPLE_PASTE) · 給 user 看正確格式
// schema 對齊 Route B 的 ai_proof output (skill_matrix 6 維 + L_score + tier_suggestion 等)
const SAMPLE_PASTE = `{
  "name": "Arc",
  "verticals": ["DTC 內容"],
  "case_count": "16-30",
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
