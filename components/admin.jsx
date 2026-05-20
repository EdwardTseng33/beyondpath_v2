// BeyondPath · Admin Console (Q3 Task 5 · 2026-05-19)
// POC 內部後台 · 無 auth gate · 不對外公開 · noindex/nofollow
// 功能: pending worker approve/reject + client_intake 配對 + send-decision-email

const { useState, useEffect } = React;

function formatDate(s) {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return d.toLocaleString("zh-TW", { dateStyle: "short", timeStyle: "short" });
  } catch (e) {
    return s;
  }
}

function shortId(id) {
  if (!id) return "—";
  return id.slice(0, 8);
}

function shortBrief(text, max) {
  if (!text) return "—";
  const cap = max || 120;
  return text.length > cap ? text.slice(0, cap) + "…" : text;
}

// ---------- Worker Card ----------

function WorkerCard({ worker, onApprove, onReject, onArchive }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const ai = worker.ai_proof || {};
  const uc = worker.unified_card || {};

  const tier = worker.tier_suggestion || ai.tier_suggestion || "?";
  const pillCls = tier === "B+" || tier === "Bplus" ? "info" : "accent";

  async function doAction(action) {
    setActionLoading(action);
    try {
      if (action === "approve") await onApprove(worker.id, notes);
      else if (action === "reject") await onReject(worker.id, notes);
      else if (action === "archive") await onArchive(worker.id, notes);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-card-h">
        <div style={{ flex: 1 }}>
          <div className="title">{worker.display_name || ai.name || worker.email || "(unnamed)"}</div>
          <div className="sub">{worker.email} · {shortId(worker.id)} · 申請 {formatDate(worker.created_at)}</div>
        </div>
        <span className={"pill " + pillCls}>{"Tier " + tier}</span>
      </div>

      <div className="admin-card-body">
        <div className="admin-detail">
          <div><span className="k">L_score</span><div className="v">{ai.L_score != null ? ai.L_score : "—"} ({ai.L_confidence || "—"})</div></div>
          <div><span className="k">Evidence</span><div className="v">{ai.evidence_quality || "—"}</div></div>
          <div><span className="k">Case count</span><div className="v">{ai.case_count || "—"}</div></div>
          <div><span className="k">Verticals</span><div className="v">{(ai.verticals || []).join(", ") || "—"}</div></div>
          <div><span className="k">Strengths</span><div className="v">{(ai.strengths || []).slice(0, 2).join(" / ") || "—"}</div></div>
          <div><span className="k">Growth</span><div className="v">{(ai.growth || []).slice(0, 2).join(" / ") || "—"}</div></div>
        </div>

        {/* Skill Matrix · 6 維 (Phase 0 #2 2026-05-21 補 · admin 之前看不到 skill_matrix · 能力矩陣斷裂修補) */}
        {ai.skill_matrix && typeof ai.skill_matrix === 'object' && (
          <div className="admin-skill-matrix" style={{ marginTop: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--line-soft)", borderRadius: 4 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>◆ Skill Matrix · 6 維 (1-10)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 14px", fontSize: 12 }}>
              {[
                { k: "workflow_design", l: "Workflow" },
                { k: "tool_orchestration", l: "Tools" },
                { k: "judgment", l: "Judgment" },
                { k: "domain_depth", l: "Domain" },
                { k: "client_communication", l: "Comm" },
                { k: "delivery_reliability", l: "Delivery" },
              ].map(({ k, l }) => {
                const v = ai.skill_matrix[k];
                const isNum = typeof v === "number";
                const color = isNum ? (v >= 8 ? "var(--accent)" : v >= 6 ? "var(--text)" : "var(--muted)") : "var(--muted-2)";
                return (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>{l}</span>
                    <span style={{ color, fontWeight: 700, fontFamily: "var(--mono)" }}>{isNum ? v : "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {expanded && (
          <div className="admin-expand">
            <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>◆ ai_proof (raw)</div>
            {JSON.stringify(ai, null, 2)}
            <div style={{ fontWeight: 700, color: "var(--accent)", marginTop: 14, marginBottom: 8 }}>◆ unified_card</div>
            {uc && Object.keys(uc).length > 0 ? JSON.stringify(uc, null, 2) : "(尚未產生 unified_card · 訪談未完成或 mapping fail)"}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <textarea
            className="admin-textarea"
            placeholder="admin_notes (optional · 內部備註、不對外)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="admin-card-actions">
        <button className="admin-btn primary" onClick={() => doAction("approve")} disabled={actionLoading != null}>
          {actionLoading === "approve" ? "處理中…" : "✓ Approve (進 worker pool)"}
        </button>
        <button className="admin-btn danger" onClick={() => doAction("reject")} disabled={actionLoading != null}>
          {actionLoading === "reject" ? "處理中…" : "✗ Reject"}
        </button>
        <button className="admin-btn" onClick={() => doAction("archive")} disabled={actionLoading != null}>
          {actionLoading === "archive" ? "處理中…" : "Archive"}
        </button>
        <button className="admin-btn" onClick={() => setExpanded(!expanded)}>{expanded ? "收起" : "展開原始資料"}</button>
      </div>
    </div>
  );
}

// ---------- Client Intake Card ----------

function ClientIntakeCard({ intake, onMatchTriggered }) {
  const [expanded, setExpanded] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [matchError, setMatchError] = useState(null);
  const [selectedWorkers, setSelectedWorkers] = useState({});
  const [emailMsg, setEmailMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const intakeData = intake.intake_data || {};
  const brief = intakeData.brief || intakeData.parsed?.summary || "(no brief)";

  async function runMatch() {
    setMatching(true);
    setMatchError(null);
    setMatchResult(null);
    try {
      const { data, error } = await window.bpAdmin.runMatch(intake.id);
      if (error) {
        setMatchError(error.message || "Unknown error");
      } else {
        setMatchResult(data);
        if (onMatchTriggered) onMatchTriggered(intake.id, data);
      }
    } catch (e) {
      setMatchError(e?.message || String(e));
    } finally {
      setMatching(false);
    }
  }

  function toggleWorker(workerId) {
    setSelectedWorkers((prev) => ({ ...prev, [workerId]: !prev[workerId] }));
  }

  async function sendInvites() {
    const ids = Object.keys(selectedWorkers).filter((k) => selectedWorkers[k]);
    if (ids.length === 0) {
      setSendResult({ error: "至少選 1 位 worker 邀請" });
      return;
    }
    setSending(true);
    setSendResult(null);
    try {
      const { data, error } = await window.bpAdmin.sendDecisionEmail({
        clientIntakeId: intake.id,
        workerApplicationIds: ids,
        decision: "invite",
        message: emailMsg,
      });
      if (error) {
        setSendResult({ error: error.message || "Unknown error" });
      } else {
        setSendResult({ ok: true, sent: ids.length, data });
      }
    } catch (e) {
      setSendResult({ error: e?.message || String(e) });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-card-h">
        <div style={{ flex: 1 }}>
          <div className="title">{intake.company_name || intake.email || "(no company)"}</div>
          <div className="sub">{intake.email} · {shortId(intake.id)} · 送出 {formatDate(intake.created_at)}</div>
        </div>
        <span className="pill accent">{intake.vertical || "no-vertical"}</span>
      </div>

      <div className="admin-card-body">
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "var(--surface-2)", borderLeft: "3px solid var(--accent)", fontSize: 13, lineHeight: 1.7 }}>
          {expanded ? brief : shortBrief(brief, 200)}
          {brief.length > 200 && (
            <button className="admin-btn" style={{ marginLeft: 8, padding: "2px 8px", fontSize: 10 }} onClick={() => setExpanded(!expanded)}>
              {expanded ? "收起" : "展開"}
            </button>
          )}
        </div>

        <div className="admin-detail">
          <div><span className="k">Budget</span><div className="v">{intake.budget_range || "—"}</div></div>
          <div><span className="k">Timeline</span><div className="v">{intake.timeline || "—"}</div></div>
          <div><span className="k">Status</span><div className="v">{intake.status}</div></div>
          <div><span className="k">Vertical</span><div className="v">{intake.vertical || "—"}</div></div>
        </div>

        {!matchResult && !matching && (
          <div className="admin-card-actions">
            <button className="admin-btn primary" onClick={runMatch}>
              ◆ 跑 AI 配對（match-workers）
            </button>
          </div>
        )}

        {matching && (
          <div className="admin-loading">跑配對演算法中…</div>
        )}

        {matchError && (
          <div className="admin-error">配對失敗：{matchError}（可能 match-workers Edge Function 還沒部署、或 worker pool 該 vertical 沒人）</div>
        )}

        {matchResult && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>
              ◆ TOP {(matchResult.top || matchResult.workers || []).length} MATCH 候選
            </div>
            {(matchResult.top || matchResult.workers || []).map((w, i) => (
              <div key={w.worker_application_id || w.id || i} className="match-result-card">
                <div className="score">{w.score != null ? Math.round(w.score) : "—"}</div>
                <div className="meta">
                  <div>{w.display_name || w.handle || "(unnamed)"} · <span style={{ color: "var(--muted)" }}>{w.tier_suggestion || w.tier || "?"}</span></div>
                  <div className="sub">{w.why || (w.breakdown ? ("tier " + (w.breakdown.tier_match || 0) + " · domain " + (w.breakdown.domain_match || 0) + " · L_score " + (w.breakdown.L_score_bonus || 0)) : "")}</div>
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={!!selectedWorkers[w.worker_application_id || w.id]}
                    onChange={() => toggleWorker(w.worker_application_id || w.id)}
                  />
                  邀請
                </label>
              </div>
            ))}
            <textarea
              className="admin-textarea"
              placeholder="給 worker 的訊息 (optional · 會放進 email 內容)"
              value={emailMsg}
              onChange={(e) => setEmailMsg(e.target.value)}
              rows={2}
              style={{ marginTop: 10 }}
            />
            <div className="admin-card-actions">
              <button className="admin-btn primary" onClick={sendInvites} disabled={sending}>
                {sending ? "寄信中…" : "✉ 寄邀請信給選中的 worker"}
              </button>
              <button className="admin-btn" onClick={runMatch} disabled={matching}>重新跑配對</button>
            </div>
            {sendResult && sendResult.error && <div className="admin-error">寄信失敗：{sendResult.error}</div>}
            {sendResult && sendResult.ok && <div style={{ marginTop: 10, padding: "10px 14px", border: "1px solid var(--accent-line)", background: "var(--accent-soft)", color: "var(--accent)", fontSize: 13 }}>✓ 已寄出 {sendResult.sent} 封邀請信</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Decisions Audit Tab ----------

function DecisionsTab() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await window.bpAdmin.listDecisions(100);
      if (error) setError(error.message || "Unknown error");
      else setDecisions(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="admin-loading">載入決定紀錄中…</div>;
  if (error) return <div className="admin-error">載入失敗：{error}（可能 worker_decisions table 還沒建）</div>;
  if (decisions.length === 0) return <div className="admin-empty">尚無配對決定紀錄</div>;

  return (
    <div>
      {decisions.map((d) => (
        <div key={d.id} className="admin-card">
          <div className="admin-card-h">
            <div style={{ flex: 1 }}>
              <div className="title">{d.decision || "—"}</div>
              <div className="sub">client {shortId(d.client_intake_id)} → worker {shortId(d.worker_application_id)}</div>
            </div>
            <span className={"pill " + (d.decision === "accepted" ? "accent" : d.decision === "declined" ? "warn" : "info")}>{d.decision}</span>
          </div>
          <div className="admin-detail">
            <div><span className="k">寄出時間</span><div className="v">{formatDate(d.created_at)}</div></div>
            <div><span className="k">決定時間</span><div className="v">{formatDate(d.decided_at)}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Main App ----------

function AdminApp() {
  const [tab, setTab] = useState("workers"); // workers | intakes | decisions
  const [workers, setWorkers] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState({ workers: true, intakes: true });
  const [error, setError] = useState({ workers: null, intakes: null });
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    loadWorkers();
    loadIntakes();
  }, []);

  async function loadWorkers() {
    setLoading((p) => ({ ...p, workers: true }));
    setError((p) => ({ ...p, workers: null }));
    const { data, error } = await window.bpAdmin.listWorkers();
    if (error) setError((p) => ({ ...p, workers: error.message || "Unknown" }));
    else setWorkers(data);
    setLoading((p) => ({ ...p, workers: false }));
  }

  async function loadIntakes() {
    setLoading((p) => ({ ...p, intakes: true }));
    setError((p) => ({ ...p, intakes: null }));
    const { data, error } = await window.bpAdmin.listClientIntakes();
    if (error) setError((p) => ({ ...p, intakes: error.message || "Unknown" }));
    else setIntakes(data);
    setLoading((p) => ({ ...p, intakes: false }));
  }

  async function handleStatusUpdate(workerId, newStatus, notes) {
    setActionError(null);
    const { error } = await window.bpAdmin.updateWorkerStatus(workerId, newStatus, notes);
    if (error) {
      setActionError(error.message || "Status update failed");
    } else {
      await loadWorkers();
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <div className="admin-brand">
          <span className="admin-mark"></span>
          <span className="admin-title">Beyond<span>Path</span> · Admin Console</span>
        </div>
        <div className="admin-meta">POC · INTERNAL ONLY · v0.1</div>
      </div>

      <div className="admin-tabs">
        <button className={"admin-tab " + (tab === "workers" ? "active" : "")} onClick={() => setTab("workers")}>
          Pending Workers <span className="count">{workers.length}</span>
        </button>
        <button className={"admin-tab " + (tab === "intakes" ? "active" : "")} onClick={() => setTab("intakes")}>
          Client Intakes <span className="count">{intakes.length}</span>
        </button>
        <button className={"admin-tab " + (tab === "decisions" ? "active" : "")} onClick={() => setTab("decisions")}>
          Decisions History
        </button>
      </div>

      {actionError && <div className="admin-error">操作失敗：{actionError}</div>}

      {tab === "workers" && (
        <div>
          {loading.workers && <div className="admin-loading">載入 worker 名單中…</div>}
          {error.workers && <div className="admin-error">載入失敗：{error.workers}</div>}
          {!loading.workers && !error.workers && workers.length === 0 && (
            <div className="admin-empty">目前沒有 pending / tier_b / tier_b_plus 的 worker</div>
          )}
          {!loading.workers && workers.map((w) => (
            <WorkerCard
              key={w.id}
              worker={w}
              onApprove={(id, notes) => handleStatusUpdate(id, "approved", notes)}
              onReject={(id, notes) => handleStatusUpdate(id, "rejected", notes)}
              onArchive={(id, notes) => handleStatusUpdate(id, "archived", notes)}
            />
          ))}
        </div>
      )}

      {tab === "intakes" && (
        <div>
          {loading.intakes && <div className="admin-loading">載入 client intake 中…</div>}
          {error.intakes && <div className="admin-error">載入失敗：{error.intakes}</div>}
          {!loading.intakes && !error.intakes && intakes.length === 0 && (
            <div className="admin-empty">目前沒有 new / reviewing 的 client intake</div>
          )}
          {!loading.intakes && intakes.map((it) => (
            <ClientIntakeCard key={it.id} intake={it} />
          ))}
        </div>
      )}

      {tab === "decisions" && <DecisionsTab />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AdminApp />);
