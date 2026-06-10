// BeyondPath · Steps 5-8 (Client side)
const { useState: useState57, useEffect: useEffect57 } = React;
const _D = window.BP_DATA;
const _PAIR = _D.SUGGESTED_PAIR.map((id) => _D.WORKERS.find((w) => w.id === id));
const _fmt = (n) => "NT$" + n.toLocaleString();

function _Top({ step, label }) {
  return (
    <div className="bp-topbar">
      <div className="bp-logo">
        <span className="bp-logo-mark"></span>BEYONDPATH
        <small>CASE · LUMINE Q4</small>
      </div>
      <div style={{ marginLeft: 24, fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.08em" }}>
        STEP {String(step).padStart(2, "0")} / 12 · <span style={{ color: "var(--text-2)" }}>{label}</span>
      </div>
      <div className="bp-statusbar">
        <span className="dot"></span><span>review <b>green</b></span>
        <span>·</span><span>case <b>#0xC3F4</b></span>
      </div>
    </div>
  );
}

// ===== STEP 5 · Worker accept =====
function Step5() {
  const [accepts, setA] = useState57([]);
  useEffect57(() => {
    const t1 = setTimeout(() => setA(["w-arc"]), 700);
    const t2 = setTimeout(() => setA(["w-arc", "w-mei"]), 1700);
    const t3 = setTimeout(() => setA(["w-arc", "w-mei", "w-jay"]), 2900);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);
  return (
    <div className="bp-root is-desktop">
      <_Top step={5} label="Worker Accept · 接案確認" />
      <div className="bp-main" style={{ gridTemplateColumns: "1fr" }}>
        <div className="bp-content">
          <div className="bp-eyebrow"><span>Step 05 / Accept · Worker 接案</span><span className="pill green">● broadcasting · 72h window</span></div>
          <h1 className="bp-h1">Awaiting accept from suggested pair.<br/>
            <span className="zh" style={{ color: "var(--muted)" }}>已推案給 3 位 worker，72h 內回覆。</span>
          </h1>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            {_PAIR.map((w, i) => {
              const ok = accepts.includes(w.id);
              return (
                <div className="bp-worker" key={w.id} style={{ cursor: "default" }}>
                  <div className="av"><img src={w.avatar} alt={w.name} /></div>
                  <div className="body">
                    <div className="title-row">
                      <span className="name">{w.name}</span>
                      <span className="handle">{w.handle}</span>
                      <span className="bp-tier aplus">Tier {w.tier}</span>
                      <span className="bp-badge">DAG node {String.fromCharCode(65 + i)} · {[50, 30, 20][i]}%</span>
                    </div>
                    <div className="role">{w.role}</div>
                    <div className="blurb">{w.blurb}</div>
                  </div>
                  <div className="score-col">
                    {ok ? (
                      <div className="bp-rise" style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--accent)", background: "var(--accent-soft)", border: "1px solid var(--accent-line)", padding: "8px 14px", borderRadius: 6, letterSpacing: "0.04em" }}>
                        ✓ ACCEPTED
                      </div>
                    ) : (
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", border: "1px dashed var(--line)", padding: "8px 14px", borderRadius: 6 }}>
                        ◌ awaiting
                      </div>
                    )}
                    <div className="score-lbl" style={{ marginTop: 6 }}>sent {[12, 12, 11][i]}m ago</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bp-tip" style={{ marginTop: 24 }}>
            <span style={{ fontFamily: "var(--mono)" }}>fallback</span>{" "}
            <span className="zh">若 72h 內任一 expert 婉拒，自動觸發 next-best 替補（候補池中）。</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== STEP 6 · E-contract =====
function Step6() {
  const [s, setS] = useState57({ client: false, w_arc: true, w_mei: true, w_jay: false });
  const clauses = [
    ["01", "雙方資訊", "LUMINE Co. ↔ 3-expert pool"],
    ["02", "服務範圍", "見附件 A · AI 拆解 5 任務", true],
    ["03", "範圍 + Milestone", "交付物 · 驗收標準 · 版本節點", true],
    ["04", "IP 三段式", "客戶 / 模板匿名再用 / portfolio"],
    ["05", "NDA 雙向", "3 年 · 自簽署日"],
    ["06", "終止條款", "依雙方合約自行約定"],
    ["07", "DPA 個資", "個資法 §27 · 30 日清除"],
    ["08", "仲裁地", "台北 · 中華民國仲裁協會"],
    ["09", "不可抗力", "force majeure"],
    ["10", "平台聲明", "需求拆解 + 候選推薦 + 驗收紀錄"],
  ];
  const parties = [
    { id: "client", role: "Client", name: "LUMINE", who: "Edward" },
    { id: "w_arc", role: "Visual", name: "Edward", who: "@edward.v" },
    { id: "w_mei", role: "Copy", name: "Edward", who: "@edward.c" },
    { id: "w_jay", role: "Ops", name: "Edward", who: "@edward.o" },
  ];
  return (
    <div className="bp-root is-desktop">
      <_Top step={6} label="E-Contract · 電子合約" />
      <div className="bp-main" style={{ gridTemplateColumns: "1fr" }}>
        <div className="bp-content">
          <div className="bp-eyebrow"><span>Step 06 / Contract · 電子合約</span><span className="pill">10 條必含 · 沙利曼 red line</span></div>
          <h1 className="bp-h1">Auto-drafted contract.<br/>
            <span className="zh" style={{ color: "var(--muted)" }}>AI 已套入雙方資料 + 拆解結果作為附件 A。</span>
          </h1>
          <div className="bp-panel" style={{ marginTop: 22 }}>
            <div className="bp-panel-h">
              <span>contract.md · v1 · auto-filled</span>
              <span style={{ marginLeft: "auto", color: "var(--accent)" }}>✓ 10/10 必含條款齊備</span>
            </div>
            <div className="bp-panel-b" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {clauses.map((c) => (
                <div key={c[0]} style={{
                  background: "var(--bg-1)",
                  borderLeft: c[3] ? "2px solid var(--accent)" : "1px solid var(--line-soft)",
                  borderTop: "1px solid var(--line-soft)", borderRight: "1px solid var(--line-soft)", borderBottom: "1px solid var(--line-soft)",
                  borderRadius: 4, padding: "10px 12px",
                }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em" }}>§{c[0]}</div>
                  <div style={{ fontFamily: "var(--zh)", fontSize: 13, color: "var(--text)", margin: "4px 0 2px" }}>{c[1]}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{c[2]}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {parties.map((p) => (
              <button key={p.id} className="bp-rcard" style={{
                cursor: "pointer", textAlign: "left",
                border: s[p.id] ? "1px solid var(--accent)" : "1px solid var(--line)",
                background: s[p.id] ? "var(--accent-soft)" : "var(--surface)",
              }} onClick={() => setS((x) => ({ ...x, [p.id]: !x[p.id] }))}>
                <div className="lbl">{p.role}</div>
                <div className="val" style={{ fontSize: 14 }}>{p.name}</div>
                <div className="sub" style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span>{p.who}</span>
                  <span style={{ color: s[p.id] ? "var(--accent)" : "var(--muted)" }}>
                    {s[p.id] ? "✓ SIGNED" : "○ pending"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== STEP 7 · Acceptance framework =====
function Step7() {
  const [stage, setStage] = useState57("ready");
  const milestones = [
    { n: 1, lbl: "Kickoff 定義", pct: "M1", when: "now", state: stage === "done" ? "locked" : "reviewing" },
    { n: 2, lbl: "期中驗收", pct: "M2", when: "wk 4", state: "scheduled" },
    { n: 3, lbl: "結案驗收", pct: "M3", when: "wk 8", state: "scheduled" },
  ];
  return (
    <div className="bp-root is-desktop">
      <_Top step={7} label="Acceptance · 驗收框架" />
      <div className="bp-main" style={{ gridTemplateColumns: "1fr" }}>
        <div className="bp-content">
          <div className="bp-eyebrow"><span>Step 07 / Acceptance · 驗收框架</span><span className="pill">代收代付 · via 綠界</span></div>
          <h1 className="bp-h1">Lock scope and acceptance criteria.<br/>
            <span className="zh" style={{ color: "var(--muted)" }}>BeyondPath 先定義交付與驗收；案款由平台透過綠界代收、驗收通過後撥付。</span>
          </h1>
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }}>
            <div className="bp-panel">
              <div className="bp-panel-h">milestone acceptance · 3 checkpoints</div>
              <div className="bp-panel-b">
                {milestones.map((m, i) => (
                  <div key={m.n} style={{
                    display: "grid", gridTemplateColumns: "32px 1fr auto auto", gap: 12,
                    alignItems: "center", padding: "12px 0",
                    borderBottom: i < 2 ? "1px dashed var(--line-soft)" : "0",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: m.state === "locked" ? "var(--accent)" : m.state === "reviewing" ? "var(--accent-soft)" : "var(--bg-1)",
                      border: "1px solid " + (m.state === "scheduled" ? "var(--line)" : "var(--accent)"),
                      color: m.state === "locked" ? "var(--bg)" : "var(--accent)",
                      fontFamily: "var(--mono)", fontSize: 12,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{m.state === "locked" ? "✓" : m.n}</div>
                    <div>
                      <div style={{ fontFamily: "var(--zh)", fontSize: 14, color: "var(--text)" }}>{m.lbl}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{m.pct} · {m.when}</div>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--text-2)" }}>{["scope", "mid", "final"][i]}</div>
                    <div style={{
                      fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: m.state === "locked" ? "var(--accent)" : m.state === "reviewing" ? "var(--warn)" : "var(--muted)",
                    }}>{m.state}</div>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--bg-1)", borderRadius: 4, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                  output · <b style={{ color: "var(--text)" }}>acceptance.md</b> · 驗收紀錄連動撥款
                </div>
              </div>
            </div>
            <div>
              <div className="bp-panel">
                <div className="bp-panel-h">payment &amp; commercial terms · 代收代付</div>
                <div className="bp-panel-b" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { n: "案款由平台透過綠界代收", k: "collect", a: true },
                    { n: "驗收通過後撥付接案者", k: "payout" },
                    { n: "服務費依 Tier 自案款扣抵", k: "fee" },
                    { n: "合約與驗收紀錄由平台存證", k: "record" },
                  ].map((p) => (
                    <div key={p.k} style={{
                      padding: "10px 12px",
                      background: p.a ? "var(--accent-soft)" : "var(--bg-1)",
                      border: "1px solid " + (p.a ? "var(--accent)" : "var(--line)"),
                      borderRadius: 4, display: "flex", alignItems: "center", gap: 10,
                      fontFamily: "var(--mono)", fontSize: 12,
                      color: p.a ? "var(--accent)" : "var(--text-2)",
                    }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: p.a ? "var(--accent)" : "transparent", border: "1px solid " + (p.a ? "var(--accent)" : "var(--line)") }}></span>
                      {p.n}
                    </div>
                  ))}
                </div>
              </div>
              <button className="bp-btn primary" style={{ marginTop: 14, width: "100%", justifyContent: "center", padding: "14px" }}
                onClick={() => { setStage("reviewing"); setTimeout(() => setStage("done"), 900); }}>
                {stage === "ready" && "→ Lock acceptance criteria"}
                {stage === "reviewing" && "AI checking scope…"}
                {stage === "done" && "✓ Acceptance locked · case ready"}
              </button>
              <div style={{ marginTop: 12, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", textAlign: "center", lineHeight: 1.6 }}>
note · 案款經綠界代收代付 · 費率與細節見服務條款 §3
              </div>
            </div>
          </div>

          <div className="bp-h2" style={{ marginTop: 28 }}>您的驗收保護機制 · 5 SCENARIOS</div>
          <div className="bp-trust-grid">
            <_TrustCard
              variant="safe"
              icon="lifebuoy"
              en="REPLACEMENT PATH"
              zh="Worker 中途離場"
              body="平台 7 天內協助找替補 worker，並保留交付紀錄給雙方接續。"
              stat="0 案發 · 7-day SLA"
            />
            <_TrustCard
              variant="warn"
              icon="scales"
              en="MID ARBITRATION"
              zh="品質有爭議"
              body="雙方提證據，平台依驗收紀錄協助裁定該階段款項的撥付。"
              stat="1.2% 案件觸發"
            />
            <_TrustCard
              variant="neutral"
              icon="door"
              en="SCOPE RESET"
              zh="你想取消"
              body="協助重新定義完成範圍、交付物與待處理項目。"
              stat="0.6% 案件觸發"
            />
            <_TrustCard
              variant="neutral"
              icon="handshake"
              en="MUTUAL CANCEL"
              zh="雙方都想停"
              body="整理已完成成果、未完成項目與後續交接清單。"
              stat="0.4% 案件觸發"
            />
            <_TrustCard
              variant="safe"
              icon="storm"
              en="FORCE MAJEURE"
              zh="不可抗力"
              body="協助暫停時程、記錄已完成成果，讓雙方重新約定後續。"
              stat="< 0.1% 案件觸發"
            />
          </div>
          <div className="bp-escrow-strip">
            <span className="bp-escrow-logo">BeyondPath Acceptance Log</span>
            <span className="bp-escrow-sep">·</span>
            <span>綠界代收代付</span>
            <span className="bp-escrow-sep">·</span>
            <span>驗收通過後撥付接案者</span>
            <span className="bp-escrow-sep">·</span>
            <span className="bp-escrow-meta">服務條款 §3 · 代收代付</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Trust card sub-component =====
function _TrustCard({ variant, icon, en, zh, body, stat }) {
  return (
    <div className={"bp-trust-card " + variant} tabIndex="0">
      <div className="bp-trust-icon">
        <_TrustIcon name={icon} />
      </div>
      <div className="bp-trust-en">{en}</div>
      <div className="bp-trust-zh">{zh}</div>
      <div className="bp-trust-body">{body}</div>
      <div className="bp-trust-stat">{stat}</div>
    </div>
  );
}
function _TrustIcon({ name }) {
  // 32x32, stroke 1.5px, currentColor
  if (name === "lifebuoy") return (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="11"/>
      <circle cx="16" cy="16" r="5"/>
      <path d="M16 5v6M16 21v6M5 16h6M21 16h6"/>
    </svg>
  );
  if (name === "scales") return (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 5v22M8 27h16"/>
      <path d="M16 7l-7 11h14z"/>
      <path d="M9 18a3 3 0 006 0M16 18a3 3 0 006 0" transform="translate(0 0)"/>
    </svg>
  );
  if (name === "door") return (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5h11v22H9z"/>
      <path d="M17 16h.01"/>
      <path d="M22 14l5 2-5 2" />
    </svg>
  );
  if (name === "handshake") return (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18l5-5 4 3 5-5 4 3 6-3"/>
      <path d="M9 13l3 3 4-4 4 3 5-3"/>
      <path d="M4 22l8 4 8-4 8 2"/>
    </svg>
  );
  if (name === "storm") return (
    <svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9h22M7 14h18M9 19h12M12 24h6"/>
      <path d="M19 9l-2 6 4 0-4 8" strokeWidth="1.6"/>
    </svg>
  );
  return null;
}

// ===== STEP 8 · Kickoff dashboard =====
function Step8() {
  const events = [
    ["today 14:32", "Arc", "KV moodboard v1 → 4 directions", "ok"],
    ["today 11:08", "Mei", "已收到品牌 GPTs v2.3 · 開始 Reels 腳本草稿", "info"],
    ["today 09:00", "system", "kickoff sync 結束 · DAG locked", "task"],
    ["yest 18:42", "Jay", "Meta + LINE OA 串接金鑰已配置", "ok"],
    ["yest 14:00", "system", "acceptance criteria locked · commercial terms off-platform", "ok"],
  ];
  return (
    <div className="bp-root is-desktop">
      <_Top step={8} label="Kickoff · 雙邊看板" />
      <div className="bp-main" style={{ gridTemplateColumns: "1fr" }}>
        <div className="bp-content">
          <div className="bp-eyebrow"><span>Step 08 / Kickoff · 案件儀表板</span><span className="pill green">● week 1 of 8</span></div>
          <h1 className="bp-h1">Project live. 3 experts on the DAG.<br/>
            <span className="zh" style={{ color: "var(--muted)" }}>看板雙邊同步，AI 每日 22:00 撰寫摘要。</span>
          </h1>
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { lbl: "Days elapsed", v: "6", sub: "/ 56 · 11%" },
              { lbl: "Milestones", v: "1", sub: "/ 3 · scope locked" },
              { lbl: "Acceptance", v: "M1", sub: "scope · criteria · risks" },
              { lbl: "Health", v: "● green", sub: "0 dispute · 0 delay", a: true },
            ].map((s, i) => (
              <div key={i} className="bp-rcard">
                <div className="lbl">{s.lbl}</div>
                <div className="val" style={{ color: s.a ? "var(--accent)" : "var(--text)" }}>{s.v}</div>
                <div className="sub">{s.sub}</div>
              </div>
            ))}
          </div>
          <div className="bp-h2" style={{ marginTop: 26 }}>DAG · Critical Path</div>
          <div className="bp-panel">
            <div className="bp-panel-b">
              <div style={{ display: "grid", gridTemplateColumns: "150px repeat(8, 1fr)", gap: 4, alignItems: "center", fontFamily: "var(--mono)", fontSize: 11 }}>
                <div></div>
                {Array.from({ length: 8 }, (_, i) => <div key={i} style={{ color: "var(--muted)", textAlign: "center" }}>w{i + 1}</div>)}
                {[
                  { who: "Arc · Visual KV", bars: [1, 1, 1, 0, 0, 0, 0, 0], color: "var(--accent)" },
                  { who: "Mei · Reels Script", bars: [0, 1, 1, 1, 1, 0, 0, 0], color: "oklch(0.78 0.10 230)" },
                  { who: "Jay · Sched + ROAS", bars: [0, 0, 0, 0, 1, 1, 1, 1], color: "oklch(0.82 0.16 75)" },
                ].map((row, i) => (
                  <React.Fragment key={i}>
                    <div style={{ color: "var(--text-2)" }}>{row.who}</div>
                    {row.bars.map((b, j) => (
                      <div key={j} style={{
                        height: 22,
                        background: b ? row.color : "transparent",
                        border: "1px solid " + (b ? row.color : "var(--line-soft)"),
                        borderRadius: 3,
                      }}></div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
              <div style={{ marginTop: 14, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                critical path · Arc → Mei → Jay · longest dependency = 8 wk
              </div>
            </div>
          </div>
          <div className="bp-h2" style={{ marginTop: 22 }}>Activity</div>
          <div className="bp-log" style={{ height: "auto", maxHeight: 240 }}>
            {events.map((e, i) => (
              <div className="row" key={i}>
                <span className="t">{e[0]}</span>
                <span className={"lvl " + e[3]}>{e[1]}</span>
                <span className="msg"><span className="zh">{e[2]}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.BP_Step5 = Step5;
window.BP_Step6 = Step6;
window.BP_Step7 = Step7;
window.BP_Step8 = Step8;
