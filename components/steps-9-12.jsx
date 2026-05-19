// BeyondPath · Steps 9-12 (Client side)
const { useState: uS912, useEffect: uE912 } = React;
const _D912 = window.BP_DATA;
const _PAIR912 = _D912.SUGGESTED_PAIR.map((id) => _D912.WORKERS.find((w) => w.id === id));
const _fmt912 = (n) => "NT$" + n.toLocaleString();

function _Top912({ step, label }) {
  return (
    <div className="bp-topbar">
      <div className="bp-logo">
        <span className="bp-logo-mark"></span>BEYONDPATH<small>CASE · LUMINE Q4</small>
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

// ===== STEP 9 · Milestone delivery =====
function Step9() {
  const [ok, setOk] = uS912(false);
  return (
    <div className="bp-root is-desktop">
      <_Top912 step={9} label="Milestone Review · 期中交付" />
      <div className="bp-main" style={{ gridTemplateColumns: "1fr" }}>
        <div className="bp-content">
          <div className="bp-eyebrow"><span>Step 09 / Milestone · Milestone 驗收</span><span className="pill green">● mid milestone submitted</span></div>
          <h1 className="bp-h1">Mid-stage delivery from Arc + Mei.<br/>
            <span className="zh" style={{ color: "var(--muted)" }}>請於 7 日內回覆。逾期未回、BeyondPath 主動 ping 提醒；再 3 日無回應視為接受。平台只記錄驗收狀態、不處理款項。</span>
          </h1>
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { who: "Edward", role: "Visual KV", count: "2 / 2 KV · 4 alts each", img: _PAIR912[0].avatar, accent: "var(--accent)" },
              { who: "Edward", role: "Reels Script", count: "6 / 6 scripts · 15s each", img: _PAIR912[1].avatar, accent: "oklch(0.78 0.10 230)" },
            ].map((d, i) => (
              <div key={i} className="bp-panel">
                <div className="bp-panel-h">
                  <span>delivery #{i + 1}</span>
                  <span style={{ marginLeft: "auto", color: d.accent }}>● submitted</span>
                </div>
                <div className="bp-panel-b">
                  <div style={{
                    height: 160, borderRadius: 4,
                    background: `repeating-linear-gradient(45deg, var(--bg-1) 0 8px, var(--surface-2) 8px 16px)`,
                    border: "1px solid var(--line)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)",
                    marginBottom: 12,
                  }}>[ {d.role} · preview ]</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--line)" }}>
                      <img src={d.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.4)" }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)" }}>{d.who}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{d.count}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 18, padding: "16px 18px",
            background: ok ? "var(--accent-soft)" : "var(--surface)",
            border: "1px solid " + (ok ? "var(--accent)" : "var(--line)"),
            borderRadius: 6, display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: ok ? "var(--accent)" : "var(--text)" }}>
                {ok ? "✓ Mid milestone approved · acceptance logged" : "Approve mid milestone?"}
              </div>
              <div style={{ fontFamily: "var(--zh)", fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                {ok ? "驗收紀錄已更新 · 下一站 Final delivery (wk 8)" : "若品質有疑慮，可先標記 issue，平台協助整理爭議紀錄。"}
              </div>
            </div>
            {!ok && (<>
              <button className="bp-btn ghost">⚠ dispute</button>
              <button className="bp-btn primary" onClick={() => setOk(true)}>✓ approve · log</button>
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== STEP 10 · Closing NPS =====
function Step10() {
  const dims = [
    ["quality", "Delivery quality", "交付品質"],
    ["comm", "Communication", "溝通效率"],
    ["creative", "Creativity", "創意度"],
    ["schedule", "Schedule fit", "時程準確"],
    ["rec", "Overall recommend", "整體推薦度"],
  ];
  const [s, setS] = uS912({ quality: 5, comm: 5, creative: 5, schedule: 4, rec: 5 });
  return (
    <div className="bp-root is-desktop">
      <_Top912 step={10} label="Closing · NPS 雙邊評鑑" />
      <div className="bp-main" style={{ gridTemplateColumns: "1fr" }}>
        <div className="bp-content">
          <div className="bp-eyebrow"><span>Step 10 / NPS · 雙邊評鑑</span><span className="pill">case complete · acceptance archived</span></div>
          <h1 className="bp-h1">Rate Arc · 5 dimensions.<br/>
            <span className="zh" style={{ color: "var(--muted)" }}>AI 自動撰寫評語草稿，雙方確認送出。</span>
          </h1>
          <div className="bp-panel" style={{ marginTop: 22 }}>
            <div className="bp-panel-b">
              <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 14, borderBottom: "1px solid var(--line-soft)" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--line)" }}>
                  <img src={_PAIR912[0].avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--sans)", fontSize: 17, color: "var(--text)" }}>
                    Edward <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>@edward</span>
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                    Visual + Brand DNA · delivery quality record
                  </div>
                </div>
                <span className="bp-tier aplus">Tier A+</span>
              </div>
              <div style={{ marginTop: 14 }}>
                {dims.map(([k, en, zh]) => (
                  <div key={k} style={{
                    display: "grid", gridTemplateColumns: "200px 1fr 32px",
                    gap: 14, padding: "10px 0", alignItems: "center",
                    borderBottom: "1px dashed var(--line-soft)",
                  }}>
                    <div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)" }}>{en}</div>
                      <div style={{ fontFamily: "var(--zh)", fontSize: 11, color: "var(--muted)" }}>{zh}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setS((x) => ({ ...x, [k]: n }))}
                          style={{
                            flex: 1, height: 28, cursor: "pointer",
                            background: n <= s[k] ? "var(--accent)" : "var(--bg-1)",
                            border: "1px solid " + (n <= s[k] ? "var(--accent)" : "var(--line)"),
                            borderRadius: 3,
                            fontFamily: "var(--mono)", fontSize: 11,
                            color: n <= s[k] ? "var(--bg)" : "var(--muted)",
                          }}>{n}</button>
                      ))}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--accent)", textAlign: "right" }}>
                      {s[k]}.0
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 14, padding: "12px 14px", background: "var(--bg-1)",
                borderLeft: "2px solid var(--accent)", borderRadius: 4,
                fontFamily: "var(--zh)", fontSize: 13, color: "var(--text-2)", lineHeight: 1.7,
              }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.12em" }}>AI DRAFT</span>
                <div style={{ marginTop: 6 }}>
                  「Arc 把品牌 DNA 抓得極準、4 版 KV 都能直接過會。8 週內 ROAS +38%、比上次代理商還快。
                  唯一可惜的是中段排程被 Mei 後段壓縮，建議下次 Visual 提早一週起跑。整體推薦。」
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== STEP 11 · Tier flywheel =====
function Step11() {
  const [up, setUp] = uS912(false);
  uE912(() => { const t = setTimeout(() => setUp(true), 800); return () => clearTimeout(t); }, []);
  return (
    <div className="bp-root is-desktop">
      <_Top912 step={11} label="B3 Flywheel · Tier 升級" />
      <div className="bp-main" style={{ gridTemplateColumns: "1fr" }}>
        <div className="bp-content">
          <div className="bp-eyebrow"><span>Step 11 / Flywheel · Tier 飛輪</span><span className="pill green">● flywheel triggered</span></div>
          <h1 className="bp-h1">Worker Tier flywheel updates.<br/>
            <span className="zh" style={{ color: "var(--muted)" }}>NPS 高 → 推薦權重 +15% → 下次接案成功率複利。</span>
          </h1>
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {_PAIR912.map((w, i) => {
              const bef = [80, 64, 22][i];
              const aft = [92, 76, 34][i];
              const newBadge = i === 0 && up;
              return (
                <div key={w.id} className="bp-panel" style={{
                  borderColor: newBadge ? "var(--accent)" : "var(--line)",
                  background: newBadge ? "linear-gradient(180deg, var(--accent-soft), var(--surface) 60%)" : "var(--surface)",
                }}>
                  <div className="bp-panel-h">
                    <span>{w.handle}</span>
                    {newBadge && <span style={{ marginLeft: "auto", color: "var(--accent)" }}>✦ tier up</span>}
                  </div>
                  <div className="bp-panel-b" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--line)" }}>
                        <img src={w.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--text)" }}>{w.name}</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                          NPS {w.nps} → {(w.nps + [0.04, 0.08, 0.06][i]).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
                        <span>Tier A+ · {["DTC", "Reels Copy", "Ops"][i]}</span>
                        <span style={{ color: "var(--accent)" }}>{aft}%</span>
                      </div>
                      <div style={{ height: 6, background: "var(--bg-1)", borderRadius: 3, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", inset: 0, width: up ? aft + "%" : bef + "%", background: "var(--accent)", transition: "width 1.2s cubic-bezier(.2,.8,.2,1)" }}></div>
                        <div style={{ position: "absolute", left: bef + "%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.4)" }}></div>
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 6 }}>
                        +{aft - bef} pts · {newBadge ? "✦ unlocked Tier A+ DTC" : "next badge in " + (100 - aft) + "%"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bp-tip" style={{ marginTop: 18 }}>
            <span style={{ fontFamily: "var(--mono)" }}>flywheel</span>{" "}
            <span className="zh">
              <b>B5 履約評鑑</b> → <b>B3 認證升級</b> → <b>B1 推薦權重 +15%</b> → 下次接案優先序提升 → NPS 複利。
              這是 BeyondPath 真正的 closed-loop。
            </span>
          </div>
          <div className="bp-h2" style={{ marginTop: 22 }}>flywheel events</div>
          <div className="bp-log" style={{ height: "auto", maxHeight: 220 }}>
            {[
              ["+0.0s", "B5", "Arc 收到 NPS 4.94 · 創 personal best", "ok"],
              ["+0.4s", "B3", "Tier A+ DTC progress 80% → 92% · 解鎖徽章", "ok"],
              ["+0.8s", "B1", "下次推薦權重 +15% (domain × NPS)", "info"],
              ["+1.2s", "B2", "Arc 接案 capacity 4/4 → portfolio 自動更新", "task"],
              ["+1.6s", "record", "acceptance log archived · commercial terms off-platform", "ok"],
            ].map((e, i) => (
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

// ===== STEP 12 · Retainer conversion =====
function Step12() {
  const [conv, setConv] = uS912(false);
  return (
    <div className="bp-root is-desktop">
      <_Top912 step={12} label="Retainer · 從首案轉月費" />
      <div className="bp-main" style={{ gridTemplateColumns: "1fr" }}>
        <div className="bp-content">
          <div className="bp-eyebrow"><span>Step 12 / Retainer · Retainer 提案</span><span className="pill green">● ROAS +38% · case archived</span></div>
          <h1 className="bp-h1">Convert to monthly retainer?<br/>
            <span className="zh" style={{ color: "var(--muted)" }}>Trial Project 結束 · AI 已起草 retainer 提案。</span>
          </h1>
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
            <div>
              <div className="bp-h2">Trial outcome · LUMINE Q4</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {[
                  { lbl: "Final acceptance", v: "OK", sub: "logged · archived", a: true },
                  { lbl: "Scope variance", v: "-11%", sub: "vs original effort cap" },
                  { lbl: "ROAS", v: "+38%", sub: "vs prior agency baseline", a: true },
                  { lbl: "Days", v: "53 / 56", sub: "delivered 3d ahead" },
                  { lbl: "NPS · client", v: "4.94", sub: "(personal best for Arc)" },
                  { lbl: "NPS · workers", v: "4.80", sub: "client 溝通 5.0 · 預算 4.4" },
                ].map((s, i) => (
                  <div key={i} className="bp-rcard">
                    <div className="lbl">{s.lbl}</div>
                    <div className="val" style={{ color: s.a ? "var(--accent)" : "var(--text)" }}>{s.v}</div>
                    <div className="sub">{s.sub}</div>
                  </div>
                ))}
              </div>
              <div className="bp-h2" style={{ marginTop: 22 }}>portfolio export</div>
              <div className="bp-panel">
                <div className="bp-panel-b" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "case study card · 自動生成 (匿名版 / 署名版)",
                    "ROAS chart · GA4 + Meta Ads 自動拉",
                    "deliverables zip · 客戶 IP, worker portfolio 限時授權",
                    "NPS reciprocal block · 雙邊 4.9+ 自動互推",
                  ].map((t, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-2)",
                    }}>
                      <span style={{ color: "var(--accent)" }}>✓</span>{t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="bp-h2">retainer proposal · AI draft</div>
              <div className="bp-panel" style={{
                background: conv ? "linear-gradient(180deg, var(--accent-soft), var(--surface) 60%)" : "var(--surface)",
                borderColor: conv ? "var(--accent)" : "var(--line)",
              }}>
                <div className="bp-panel-h">
                  <span>retainer.md · v1</span>
                  {conv && <span style={{ marginLeft: "auto", color: "var(--accent)" }}>✓ signed</span>}
                </div>
                <div className="bp-panel-b" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.12em" }}>RECURRING</div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: 26, color: "var(--text)", marginTop: 4 }}>
                      <span style={{ color: "var(--accent)" }}>{_fmt912(82000)}</span> / mo
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
                      6-month commit · 1-month notice · -7% vs trial unit price
                    </div>
                  </div>
                  <div style={{ borderTop: "1px dashed var(--line-soft)", paddingTop: 14 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      monthly scope
                    </div>
                    {[
                      "1 KV refresh + 4 Reels script (Arc + Mei · locked)",
                      "Always-on ROAS monitoring (Jay · 8h/wk)",
                      "Q monthly review + roadmap call",
                      "AI 工具補貼 NT$3,500 / expert / mo",
                    ].map((t, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0",
                        fontFamily: "var(--zh)", fontSize: 12, color: "var(--text-2)",
                      }}>
                        <span style={{ color: "var(--accent)", fontFamily: "var(--mono)" }}>·</span>{t}
                      </div>
                    ))}
                  </div>
                  <button className={"bp-btn " + (conv ? "" : "primary")} onClick={() => setConv(!conv)}
                    style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                    {conv ? "↻ reset · view trial close" : "→ Sign retainer · keep this team"}
                  </button>
                </div>
              </div>
              <div className="bp-tip" style={{ marginTop: 14 }}>
                <span style={{ fontFamily: "var(--mono)" }}>b2 → b1</span>{" "}
                <span className="zh">retainer 是 BeyondPath 最重要的留存指標 · 飛輪終點 = 飛輪起點。</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.BP_Step9 = Step9;
window.BP_Step10 = Step10;
window.BP_Step11 = Step11;
window.BP_Step12 = Step12;
