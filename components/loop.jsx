// BeyondPath · Full Loop · Steps 01 → 12 → 01 closed cycle
const { useState: uSL, useEffect: uEL } = React;

const _LOOP = [
  { n: 1, key: "intake", who: "client", label: "Intake · 描述需求", zh: "Edward 在 sandbox 描述 LUMINE Q4 需求", pillar: "B1" },
  { n: 2, key: "decompose", who: "ai", label: "AI 拆解", zh: "Brief → 5 任務 + DAG · 預算 NT$214K", pillar: "B1" },
  { n: 3, key: "match", who: "ai", label: "Match · 推薦 expert", zh: "從 1.2K worker 中加權出 Top-12", pillar: "B1" },
  { n: 4, key: "pair", who: "client", label: "Pair confirm", zh: "確認 3 人組合 · Arc + Mei + Jay", pillar: "B1" },
  { n: 5, key: "accept", who: "worker", label: "Worker accept", zh: "72h 內 3 人 ✓ accept", pillar: "B2" },
  { n: 6, key: "contract", who: "system", label: "E-contract", zh: "10 條必含 · 雙邊簽署", pillar: "B2" },
  { n: 7, key: "acceptance", who: "client", label: "Acceptance framework", zh: "鎖定驗收標準 · 商務條款 off-platform", pillar: "B2" },
  { n: 8, key: "kickoff", who: "system", label: "Kickoff DAG", zh: "雙邊看板 live · AI daily summary", pillar: "B2" },
  { n: 9, key: "milestone", who: "client", label: "Milestone review", zh: "期中驗收 · 留存交付證據", pillar: "B2" },
  { n: 10, key: "nps", who: "both", label: "Closing NPS", zh: "雙邊 5 維互評 · AI 草稿", pillar: "B5" },
  { n: 11, key: "tier", who: "system", label: "Tier flywheel", zh: "Arc → Tier A+ · 推薦權重 +15%", pillar: "B3" },
  { n: 12, key: "retainer", who: "client", label: "Retainer 轉月費", zh: "trial → recurring · NT$82K/mo", pillar: "B1" },
];

const _PILLAR_COLOR = {
  B1: "var(--accent)",
  B2: "oklch(0.78 0.10 230)",
  B3: "oklch(0.82 0.16 75)",
  B5: "oklch(0.74 0.15 340)",
};
const _PILLAR_NAME = {
  B1: "供需媒合",
  B2: "履約交付",
  B3: "認證升級",
  B5: "雙邊評鑑",
};

const _WHO_DOT = (w) => ({
  client: { c: "var(--accent)", l: "client" },
  worker: { c: "oklch(0.82 0.16 75)", l: "worker" },
  ai: { c: "oklch(0.78 0.10 230)", l: "AI" },
  system: { c: "var(--text-2)", l: "system" },
  both: { c: "oklch(0.74 0.15 340)", l: "both" },
}[w]);

function FullLoop() {
  const [step, setStep] = uSL(1);
  const [auto, setAuto] = uSL(false);

  uEL(() => {
    if (!auto) return;
    const t = setTimeout(() => setStep((s) => (s % 12) + 1), 1800);
    return () => clearTimeout(t);
  }, [step, auto]);

  const cur = _LOOP[step - 1];
  const next = _LOOP[step % 12];

  // arc layout
  const cx = 320, cy = 320, R = 230;
  const nodes = _LOOP.map((s, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { ...s, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
  });

  return (
    <div className="bp-root is-desktop">
      <div className="bp-topbar">
        <div className="bp-logo">
          <span className="bp-logo-mark"></span>BEYONDPATH
          <small>FULL LOOP · LUMINE Q4 · closed cycle</small>
        </div>
        <div style={{ marginLeft: 24, fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.08em" }}>
          STEP {String(cur.n).padStart(2, "0")} / 12 · <span style={{ color: "var(--text-2)" }}>{cur.label}</span>
        </div>
        <div className="bp-statusbar">
          <button className="bp-btn ghost" style={{ padding: "6px 12px" }} onClick={() => setStep((s) => ((s + 10) % 12) + 1)}>← prev</button>
          <button className="bp-btn ghost" style={{ padding: "6px 12px" }} onClick={() => setStep((s) => (s % 12) + 1)}>next →</button>
          <button className={"bp-btn " + (auto ? "primary" : "ghost")} style={{ padding: "6px 12px" }} onClick={() => setAuto((a) => !a)}>
            {auto ? "■ pause" : "▶ auto-play"}
          </button>
        </div>
      </div>

      <div className="bp-main" style={{ gridTemplateColumns: "640px 1fr" }}>
        {/* Left · circular loop */}
        <div className="bp-content" style={{ padding: "20px 24px", borderRight: "1px solid var(--line-soft)" }}>
          <div className="bp-eyebrow">
            <span>Closed loop</span>
            <span className="pill green">● 12 → 01 · 飛輪終點 = 起點</span>
          </div>
          <svg viewBox="0 0 640 640" style={{ width: "100%", height: "auto", display: "block", marginTop: 6 }}>
            {/* outer guide ring */}
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--line-soft)" strokeWidth="1" strokeDasharray="2 4" />
            {/* arrow segments between nodes (current highlighted) */}
            {nodes.map((node, i) => {
              const j = (i + 1) % 12;
              const p = nodes[j];
              const a1 = Math.atan2(node.y - cy, node.x - cx);
              const a2 = Math.atan2(p.y - cy, p.x - cx);
              const sweep = a2 > a1 ? 0 : 1;
              const isActive = i + 1 === cur.n;
              return (
                <path key={i}
                  d={`M ${node.x} ${node.y} A ${R} ${R} 0 0 1 ${p.x} ${p.y}`}
                  fill="none"
                  stroke={isActive ? "var(--accent)" : "var(--line)"}
                  strokeWidth={isActive ? 3 : 1.2}
                  opacity={isActive ? 1 : 0.55}
                />
              );
            })}
            {/* center label */}
            <g>
              <text x={cx} y={cy - 28} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 11, fill: "var(--muted)", letterSpacing: "0.18em" }}>BEYONDPATH</text>
              <text x={cx} y={cy + 4} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 13, fill: "var(--accent)", letterSpacing: "0.18em" }}>FLYWHEEL</text>
              <text x={cx} y={cy + 32} textAnchor="middle" style={{ fontFamily: "var(--zh)", fontSize: 11, fill: "var(--muted)" }}>{cur.zh}</text>
              <text x={cx} y={cy + 60} textAnchor="middle" style={{ fontFamily: "var(--mono)", fontSize: 10, fill: _PILLAR_COLOR[cur.pillar], letterSpacing: "0.16em" }}>
                {cur.pillar} · {_PILLAR_NAME[cur.pillar]}
              </text>
            </g>
            {/* nodes */}
            {nodes.map((node) => {
              const active = node.n === cur.n;
              const past = node.n < cur.n;
              const c = _PILLAR_COLOR[node.pillar];
              return (
                <g key={node.n} style={{ cursor: "pointer" }} onClick={() => setStep(node.n)}>
                  <circle cx={node.x} cy={node.y} r={active ? 22 : 16}
                    fill={active ? c : past ? "var(--accent-soft)" : "var(--surface)"}
                    stroke={active ? c : past ? "var(--accent-line)" : "var(--line)"}
                    strokeWidth={active ? 2 : 1} />
                  <text x={node.x} y={node.y + 4} textAnchor="middle"
                    style={{
                      fontFamily: "var(--mono)", fontSize: active ? 12 : 11,
                      fill: active ? "var(--bg)" : past ? "var(--accent)" : "var(--text-2)",
                      fontWeight: 600,
                    }}>
                    {String(node.n).padStart(2, "0")}
                  </text>
                  {/* label outside circle */}
                  {(() => {
                    const lx = cx + (node.x - cx) * 1.16;
                    const ly = cy + (node.y - cy) * 1.16;
                    return (
                      <text x={lx} y={ly} textAnchor="middle"
                        style={{
                          fontFamily: "var(--mono)", fontSize: 10,
                          fill: active ? "var(--text)" : "var(--muted)",
                          letterSpacing: "0.04em",
                        }}>
                        {node.label.split(" · ")[0]}
                      </text>
                    );
                  })()}
                </g>
              );
            })}
          </svg>

          {/* pillar legend */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: -10, flexWrap: "wrap" }}>
            {Object.keys(_PILLAR_COLOR).map((p) => (
              <span key={p} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: _PILLAR_COLOR[p] }}></span>
                {p} {_PILLAR_NAME[p]}
              </span>
            ))}
          </div>
        </div>

        {/* Right · current step detail */}
        <div className="bp-content" style={{ padding: "22px 26px" }}>
          <div className="bp-eyebrow">
            <span>Step {String(cur.n).padStart(2, "0")} / 12</span>
            <span className="pill" style={{ color: _PILLAR_COLOR[cur.pillar], borderColor: _PILLAR_COLOR[cur.pillar] }}>
              ● {cur.pillar} · {_PILLAR_NAME[cur.pillar]}
            </span>
            <span className="pill" style={{ color: _WHO_DOT(cur.who).c, borderColor: _WHO_DOT(cur.who).c }}>
              actor · {_WHO_DOT(cur.who).l}
            </span>
          </div>
          <h1 className="bp-h1" style={{ marginTop: 6 }}>
            {cur.label}.<br/>
            <span className="zh" style={{ color: "var(--muted)" }}>{cur.zh}</span>
          </h1>

          {/* progress bar of the loop */}
          <div style={{ marginTop: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
              <span>cycle progress</span>
              <span style={{ color: "var(--accent)" }}>{Math.round((cur.n / 12) * 100)}% · {cur.n}/12</span>
            </div>
            <div style={{ height: 6, background: "var(--bg-1)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: (cur.n / 12) * 100 + "%", height: "100%", background: "var(--accent)", transition: "width .6s cubic-bezier(.2,.8,.2,1)" }}></div>
            </div>
          </div>

          {/* Now / Next */}
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="bp-panel">
              <div className="bp-panel-h"><span style={{ color: "var(--accent)" }}>● now · {cur.label}</span></div>
              <div className="bp-panel-b">
                <div className="bp-spec">
                  <span>actor</span><b>{_WHO_DOT(cur.who).l}</b>
                  <span>pillar</span><b style={{ color: _PILLAR_COLOR[cur.pillar] }}>{cur.pillar} · {_PILLAR_NAME[cur.pillar]}</b>
                  <span>artifact</span><b>{[
                    "brief.json", "DAG.yaml", "rank.json", "pair.lock",
                    "accepts.log", "terms.md", "acceptance.md", "board.live",
                    "midship.zip", "nps.json", "tier.delta", "retainer.md",
                  ][cur.n - 1]}</b>
                  <span>fires event</span><b style={{ fontFamily: "var(--mono)" }}>step.{cur.key}.done</b>
                </div>
              </div>
            </div>
            <div className="bp-panel">
              <div className="bp-panel-h"><span>↳ next · {next.label}</span></div>
              <div className="bp-panel-b">
                <div style={{ fontFamily: "var(--zh)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{next.zh}</div>
                <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                  triggers · listens to <b style={{ color: "var(--accent)" }}>step.{cur.key}.done</b>
                </div>
              </div>
            </div>
          </div>

          {/* loop close emphasis */}
          {cur.n === 12 && (
            <div style={{
              marginTop: 18, padding: "16px 18px",
              background: "linear-gradient(90deg, var(--accent-soft), transparent)",
              border: "1px solid var(--accent)", borderRadius: 6,
              fontFamily: "var(--zh)", fontSize: 13, color: "var(--text)", lineHeight: 1.7,
            }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.16em" }}>LOOP CLOSE</span>
              <div style={{ marginTop: 6 }}>
                Retainer 簽下後客戶不再從 Step 01 重做 brief，而是 <b style={{ color: "var(--accent)" }}>每月觸發 mini-loop</b>：
                每個月 1 次 KV refresh + 4 Reels script + ROAS 監測 → milestone → NPS → tier 複利。
                <b> 飛輪終點 = 飛輪起點</b>，且每跑一圈雙邊推薦權重再 +5~15%。
              </div>
            </div>
          )}

          {/* full timeline strip */}
          <div className="bp-h2" style={{ marginTop: 22 }}>full timeline · click any step</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 4 }}>
            {_LOOP.map((s) => {
              const active = s.n === cur.n;
              const past = s.n < cur.n;
              return (
                <button key={s.n} onClick={() => setStep(s.n)} style={{
                  padding: "10px 4px", cursor: "pointer",
                  background: active ? _PILLAR_COLOR[s.pillar] : past ? "var(--accent-soft)" : "var(--bg-1)",
                  border: "1px solid " + (active ? _PILLAR_COLOR[s.pillar] : past ? "var(--accent-line)" : "var(--line)"),
                  borderRadius: 3,
                  fontFamily: "var(--mono)", fontSize: 11,
                  color: active ? "var(--bg)" : past ? "var(--accent)" : "var(--text-2)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontWeight: 600 }}>{String(s.n).padStart(2, "0")}</span>
                  <span style={{ fontSize: 9, opacity: 0.85 }}>{s.pillar}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

window.BP_FullLoop = FullLoop;
