// BeyondPath · BP_Journey — 把 Step 01 → 12 串成一條 clickable 旅程
// Step 01-04: 重用 ClientIntakeApp（受控 step）
// Step 05-12: 各自的 BP_StepN 整頁元件 + 共用底部 nav
//
// 持久化：localStorage[bp-journey-step]
// API: <BP_Journey defaultStep={0} />

const { useState: uSJ, useEffect: uEJ } = React;

const BP_JOURNEY_STEPS = [
  { n: "01", en: "Pre-intake", zh: "選領域 + 上傳需求", actor: "Client" },
  { n: "02", en: "Confirm",    zh: "確認期待",           actor: "Client" },
  { n: "03", en: "AI Parse",   zh: "AI 拆解需求",       actor: "Client / AI" },
  { n: "04", en: "Match",      zh: "AI 自動配對",        actor: "Client / AI" },
  { n: "05", en: "Accept",     zh: "Worker 接案",        actor: "Worker" },
  { n: "06", en: "Contract",   zh: "電子合約",           actor: "Both" },
  { n: "07", en: "Acceptance", zh: "驗收框架",           actor: "Client" },
  { n: "08", en: "Kickoff",    zh: "案件儀表板",         actor: "Both" },
  { n: "09", en: "Milestone",  zh: "Milestone 驗收",     actor: "Both" },
  { n: "10", en: "NPS",        zh: "雙邊評鑑",           actor: "Both" },
  { n: "11", en: "Flywheel",   zh: "Tier 飛輪",          actor: "Worker" },
  { n: "12", en: "Retainer",   zh: "Retainer 重新接案", actor: "Client" },
];

const BP_STORAGE_KEY = "bp-journey-step";

function BP_Journey({ defaultStep = 0, inShell = false }) {
  const [step, setStep] = uSJ(() => {
    try {
      const v = +localStorage.getItem(BP_STORAGE_KEY);
      if (Number.isFinite(v) && v >= 0 && v <= 11) return v;
    } catch {}
    return defaultStep;
  });
  const [showTracker, setShowTracker] = uSJ(() => {
    try { return localStorage.getItem("bp-journey-tracker") !== "0"; } catch { return true; }
  });

  uEJ(() => {
    try { localStorage.setItem(BP_STORAGE_KEY, String(step)); } catch {}
  }, [step]);
  uEJ(() => {
    try { localStorage.setItem("bp-journey-tracker", showTracker ? "1" : "0"); } catch {}
  }, [showTracker]);

  const meta = BP_JOURNEY_STEPS[step];
  const inIntake = step <= 3;

  // Step 5-12 元件
  const StepBody = [
    null, null, null, null,
    window.BP_Step5, window.BP_Step6, window.BP_Step7, window.BP_Step8,
    window.BP_Step9, window.BP_Step10, window.BP_Step11, window.BP_Step12,
  ][step];

  const next = () => setStep((s) => Math.min(11, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const jump = (i) => setStep(i);

  return (
    <div className="bp-journey-root" data-screen-label={`${meta.n} ${meta.en}`}>
      {/* mini tracker — demo / designer overlay; toggleable */}
      {showTracker && (
        <div className="bp-jtrack">
          <div className="bp-jtrack-mode">
            <span className="dot"></span>demo nav · 用戶端不會看到
            <button className="bp-jtrack-hide" onClick={() => setShowTracker(false)} title="hide demo tracker">hide ×</button>
          </div>
          <div className="bp-jtrack-inner">
            {BP_JOURNEY_STEPS.map((s, i) => (
              <button
                key={s.n}
                className={"bp-jdot " + (i === step ? "active" : i < step ? "done" : "")}
                onClick={() => jump(i)}
                title={`${s.n} · ${s.en} / ${s.zh}`}
              >
                <span className="num">{s.n}</span>
                <span className="lbl">{s.en}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {!showTracker && (
        <button className="bp-jtrack-show" onClick={() => setShowTracker(true)} title="show demo tracker">
          ◐ show demo nav · 12-step tracker
        </button>
      )}

      {/* body */}
      <div className="bp-jbody">
        {inIntake && (
          <window.ClientIntakeApp
            device="desktop"
            step={step}
            onStep={(v) => setStep(v)}
            onAdvanceBeyond={() => setStep(4)}
            presetParsed={step >= 2}
            hideStepper={true}
            hideTopbar={inShell}
          />
        )}
        {!inIntake && StepBody && <StepBody />}
        {!inIntake && !StepBody && (
          <div style={{ padding: 80, color: "#888", fontFamily: "var(--mono)" }}>
            step {meta.n} not loaded
          </div>
        )}
      </div>

      {/* fixed bottom nav — only for step 5-12 (intake has its own dock) */}
      {!inIntake && (
        <div className="bp-jnav">
          <button className="bp-btn ghost" onClick={back}>← back</button>
          <div className="bp-jnav-meta">
            <span className="num">{meta.n}</span>
            <span className="en">{meta.en}</span>
            <span className="zh">/ {meta.zh}</span>
            <span className="dot">·</span>
            <span className="actor">actor: {meta.actor}</span>
          </div>
          <span className="spacer" />
          {step < 11 ? (
            <button className="bp-btn primary" onClick={next}>
              next: {BP_JOURNEY_STEPS[step + 1].en} →
            </button>
          ) : (
            <button className="bp-btn primary" onClick={() => setStep(0)}>
              ↻ restart loop · back to 01
            </button>
          )}
        </div>
      )}
    </div>
  );
}

window.BP_Journey = BP_Journey;
