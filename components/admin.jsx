// BeyondPath · Admin Console (Q3 Task 5 · 2026-05-19)
// POC 內部後台 · 無 auth gate · 不對外公開 · noindex/nofollow
// 功能: pending worker approve/reject + client_intake 配對 + send-decision-email

const { useState, useEffect } = React;

// === i18n helpers (Step 3b - 2026-05-25) ===
function _t(key, fallback) {
  return window.BPi18n ? window.BPi18n.t(key, fallback) : fallback;
}
function useI18n() {
  const [, setRev] = useState(0);
  useEffect(() => {
    const h = () => setRev(r => r + 1);
    document.addEventListener("i18n:change", h);
    return () => document.removeEventListener("i18n:change", h);
  }, []);
}


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

// ---------- SLA overdue 紅燈 (2026-05-31 calcifer · 沙利曼 doc 38 必補 3 + 馬魯克) ----------
// worker 申請 SLA 3-7 天 (ack 信承諾 3-7 工作日人工覆核) · client 發案 SLA 24h (ack 信承諾 24h 內回覆)
// 躺超過 SLA = 標紅排前 · 避免漏審 · 兜底答應用戶的 SLA
// hoursSince: created_at 到現在的小時數 (null-safe)
function hoursSince(s) {
  if (!s) return null;
  const t = new Date(s).getTime();
  if (isNaN(t)) return null;
  return (Date.now() - t) / 36e5;
}
// worker SLA: > 7d = overdue(red) · 3-7d = warn(amber) · 只對未覆核狀態算
const WORKER_PENDING_STATUSES = ["pending", "reviewing", "need_more_info"];
function workerSla(w) {
  const pending = WORKER_PENDING_STATUSES.indexOf(w && w.status) >= 0 || !w.status;
  if (!pending) return { level: "none", hours: null };
  const h = hoursSince(w.created_at);
  if (h == null) return { level: "none", hours: null };
  if (h > 7 * 24) return { level: "overdue", hours: h };
  if (h > 3 * 24) return { level: "warn", hours: h };
  return { level: "ok", hours: h };
}
// client SLA: > 24h = overdue(red) · 只對未配對狀態算
const CLIENT_PENDING_STATUSES = ["new", "reviewing"];
function clientSla(it) {
  const pending = CLIENT_PENDING_STATUSES.indexOf(it && it.status) >= 0 || !it.status;
  if (!pending) return { level: "none", hours: null };
  const h = hoursSince(it.created_at);
  if (h == null) return { level: "none", hours: null };
  if (h > 24) return { level: "overdue", hours: h };
  if (h > 18) return { level: "warn", hours: h };
  return { level: "ok", hours: h };
}
function slaLabel(sla) {
  if (!sla || sla.hours == null) return null;
  const h = sla.hours;
  const txt = h >= 48 ? (Math.floor(h / 24) + "d") : (Math.floor(h) + "h");
  if (sla.level === "overdue") return { text: "⚠ 逾期 " + txt, color: "var(--danger, #d94a4a)", bg: "rgba(217,74,74,0.10)" };
  if (sla.level === "warn") return { text: "△ 待審 " + txt, color: "var(--warn, #f5a623)", bg: "rgba(245,166,35,0.10)" };
  return null;
}
// 排序: overdue 最前 · warn 次之 · 其餘按 created_at desc · 用於 list 渲染
function sortBySla(arr, slaFn) {
  const rank = { overdue: 0, warn: 1, ok: 2, none: 3 };
  return arr.slice().sort((a, b) => {
    const ra = rank[slaFn(a).level] ?? 3;
    const rb = rank[slaFn(b).level] ?? 3;
    if (ra !== rb) return ra - rb;
    // 同級內: 越久越前 (created_at 越早越前)
    return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
  });
}

// ---------- Empty State (2026-05-28 P0-2 · 女巫) ----------

function AdminEmptyState({ icon = "○", title, hint, cta, ctaUrl, ctaCopy, secondary }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    if (!ctaCopy) return;
    try {
      await navigator.clipboard.writeText(ctaCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) { /* fallback - 不阻斷 */ }
  }
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-icon" aria-hidden="true">{icon}</div>
      <div className="admin-empty-title">{title}</div>
      {hint && <div className="admin-empty-hint">{hint}</div>}
      {(cta || ctaCopy) && (
        <div className="admin-empty-actions">
          {cta && ctaUrl && (
            <a className="admin-btn primary" href={ctaUrl} target="_blank" rel="noopener">{cta}</a>
          )}
          {ctaCopy && (
            <button className="admin-btn" onClick={handleCopy}>
              {copied ? "✓ 已複製" : "複製連結"}
            </button>
          )}
        </div>
      )}
      {secondary && <div className="admin-empty-secondary">{secondary}</div>}
    </div>
  );
}

// ---------- Worker Card ----------

function WorkerCard({ worker, onApprove, onReject, onArchive }) {
  useI18n();
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
          <div className="sub">{worker.email} · {shortId(worker.id)} · {_t("admin.card_label_applied", "申請")} {formatDate(worker.created_at)}</div>
        </div>
        {(() => { const _sl = slaLabel(workerSla(worker)); return _sl ? (
          <span className="pill" style={{ borderColor: _sl.color, color: _sl.color, background: _sl.bg, marginRight: 6 }}>{_sl.text}</span>
        ) : null; })()}
        <span className={"pill " + pillCls}>{"Tier " + tier}</span>
      </div>

      <div className="admin-card-body">
        <div className="admin-detail">
          <div><span className="k">L_score</span><div className="v">{ai.L_score != null ? ai.L_score : "—"} ({ai.L_confidence || "—"})</div></div>
          <div><span className="k">Evidence</span><div className="v">{ai.evidence_quality || "—"}</div></div>
          <div><span className="k">Case count</span><div className="v">{ai.case_count || "—"}</div></div>
          <div><span className="k">Verticals</span><div className="v">{(ai.verticals || []).join(", ") || "—"}</div></div>
          <div>
            <span className="k">{_t("admin.label_country", "居住地 Country")}</span>
            <div className="v" style={{ color: worker.country && worker.country !== "TW" ? "var(--warn, #f5a623)" : undefined, fontWeight: worker.country && worker.country !== "TW" ? 600 : undefined }}>
              {(() => {
                const c = worker.country;
                if (!c) return _t("admin.country_legacy", "— (legacy · 視為 TW)");
                const labelMap = { TW: "🇹🇼 台灣 TW", SG: "🇸🇬 新加坡 SG", MY: "🇲🇾 馬來西亞 MY", HK: "🇭🇰 香港 HK", OTHER: "🌐 其他 OTHER" };
                return labelMap[c] || c;
              })()}
              {worker.country && worker.country !== "TW" && (
                <span style={{ marginLeft: 6, fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)" }}>{_t("admin.country_intl_tag", "[INTL POOL · Y1 不簽]")}</span>
              )}
            </div>
          </div>
          <div><span className="k">Strengths</span><div className="v">{(ai.strengths || []).slice(0, 2).join(" / ") || "—"}</div></div>
          <div><span className="k">Growth</span><div className="v">{(ai.growth || []).slice(0, 2).join(" / ") || "—"}</div></div>
        </div>

        {/* Skill Matrix · 6 維 (Phase 0 #2 2026-05-21 補 · admin 之前看不到 skill_matrix · 能力矩陣斷裂修補) */}
        {ai.skill_matrix && typeof ai.skill_matrix === 'object' && (
          <div className="admin-skill-matrix" style={{ marginTop: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--line-soft)", borderRadius: 4 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>{_t("admin.label_skill_matrix_title", "◆ Skill Matrix · 6 維 (1-10)")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 14px", fontSize: 12 }}>
              {[
                { k: "workflow_design", l: _t("admin.label_skill_workflow", "Workflow") },
                { k: "tool_orchestration", l: _t("admin.label_skill_tools", "Tools") },
                { k: "judgment", l: _t("admin.label_skill_judgment", "Judgment") },
                { k: "domain_depth", l: _t("admin.label_skill_domain", "Domain") },
                { k: "client_communication", l: _t("admin.label_skill_comm", "Comm") },
                { k: "delivery_reliability", l: _t("admin.label_skill_delivery", "Delivery") },
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

        {/* Audit Flags · Phase 0 #3 (2026-05-21 · spec docs/launch/12-audit-flags-spec.md) · ai_proof 警示燈 server-side audit */}
        {ai.audit_flags && Array.isArray(ai.audit_flags) && ai.audit_flags.length > 0 && (() => {
          const severityOrder = { high: 0, medium: 1, low: 2 };
          const sorted = [...ai.audit_flags].sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9));
          const sevToColor = (sev) => sev === "high" ? "var(--danger)" : sev === "medium" ? "var(--warn)" : "var(--muted)";
          const sevToGlyph = (sev) => sev === "high" ? "⚠" : sev === "medium" ? "△" : "◯";
          return (
            <div className="admin-audit-flags" style={{ marginTop: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--line-soft)", borderRadius: 4 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>{_t("admin.label_audit_flags_title", "◆ Audit Flags · 訪談證據偵測")}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontFamily: "var(--mono)" }}>
                {sorted.map((f, i) => (
                  <div key={(f.id || "flag") + "-" + i} style={{ color: sevToColor(f.severity), display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700 }}>{sevToGlyph(f.severity)}</span>
                    <span style={{ fontWeight: 700 }}>{f.id}</span>
                    <span style={{ color: "var(--muted)" }}>·</span>
                    <span style={{ color: "var(--muted)" }}>{f.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {expanded && (
          <div className="admin-expand">
            <div style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 8 }}>{_t("admin.label_ai_proof_raw", "◆ ai_proof (raw)")}</div>
            {JSON.stringify(ai, null, 2)}
            <div style={{ fontWeight: 700, color: "var(--accent)", marginTop: 14, marginBottom: 8 }}>{_t("admin.label_unified_card", "◆ unified_card")}</div>
            {uc && Object.keys(uc).length > 0 ? JSON.stringify(uc, null, 2) : _t("admin.label_unified_card_empty", "(尚未產生 unified_card · 訪談未完成或 mapping fail)")}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <textarea
            className="admin-textarea"
            placeholder={_t("admin.placeholder_admin_notes", "admin_notes (optional · 內部備註、不對外)")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="admin-card-actions">
        <button className="admin-btn primary" onClick={() => doAction("approve")} disabled={actionLoading != null}>
          {actionLoading === "approve" ? _t("admin.btn_processing", "處理中…") : _t("admin.btn_approve", "✓ Approve (進 worker pool)")}
        </button>
        <button className="admin-btn danger" onClick={() => doAction("reject")} disabled={actionLoading != null}>
          {actionLoading === "reject" ? _t("admin.btn_processing", "處理中…") : _t("admin.btn_reject", "✗ Reject")}
        </button>
        <button className="admin-btn" onClick={() => doAction("archive")} disabled={actionLoading != null}>
          {actionLoading === "archive" ? _t("admin.btn_processing", "處理中…") : _t("admin.btn_archive", "Archive")}
        </button>
        <button className="admin-btn" onClick={() => setExpanded(!expanded)}>{expanded ? _t("admin.btn_collapse", "收起") : _t("admin.btn_expand_raw", "展開原始資料")}</button>
      </div>
    </div>
  );
}

// ---------- Client Intake Card ----------

function ClientIntakeCard({ intake, onMatchTriggered }) {
  useI18n();
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
      setSendResult({ error: _t("admin.err_select_one_worker", "至少選 1 位 worker 邀請") });
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
          <div className="sub">{intake.email} · {shortId(intake.id)} · {_t("admin.card_label_submitted", "送出")} {formatDate(intake.created_at)}</div>
        </div>
        {(() => { const _sl = slaLabel(clientSla(intake)); return _sl ? (
          <span className="pill" style={{ borderColor: _sl.color, color: _sl.color, background: _sl.bg, marginRight: 6 }}>{_sl.text}</span>
        ) : null; })()}
        <span className="pill accent">{intake.vertical || "no-vertical"}</span>
      </div>

      <div className="admin-card-body">
        <div style={{ marginBottom: 12, padding: "10px 14px", background: "var(--surface-2)", borderLeft: "3px solid var(--accent)", fontSize: 13, lineHeight: 1.7 }}>
          {expanded ? brief : shortBrief(brief, 200)}
          {brief.length > 200 && (
            <button className="admin-btn" style={{ marginLeft: 8, padding: "2px 8px", fontSize: 10 }} onClick={() => setExpanded(!expanded)}>
              {expanded ? _t("admin.btn_collapse", "收起") : _t("admin.btn_expand", "展開")}
            </button>
          )}
        </div>

        <div className="admin-detail">
          <div><span className="k">Budget</span><div className="v">{intake.budget_range || "—"}</div></div>
          <div><span className="k">Timeline</span><div className="v">{intake.timeline || "—"}</div></div>
          <div><span className="k">Status</span><div className="v">{intake.status}</div></div>
          <div><span className="k">Vertical</span><div className="v">{intake.vertical || "—"}</div></div>
          {/* 2026-05-28 calcifer . 新欄 . Step 01 必填強化 */}
          <div><span className="k">Company</span><div className="v">{intake.company_name || "—"}</div></div>
          <div><span className="k">Job Title</span><div className="v">{intake.job_title || "—"}</div></div>
          <div><span className="k">Phone</span><div className="v">{intake.phone || "—"}</div></div>
          <div><span className="k">Client Type</span><div className="v">{(intake.intake_data && intake.intake_data.clientType) || "—"}</div></div>
        </div>

        {!matchResult && !matching && (
          <div className="admin-card-actions">
            <button className="admin-btn primary" onClick={runMatch}>
              {_t("admin.btn_run_match", "◆ 跑 AI 配對（match-workers）")}
            </button>
          </div>
        )}

        {matching && (
          <div className="admin-loading">{_t("admin.msg_matching", "跑配對演算法中…")}</div>
        )}

        {matchError && (
          <div className="admin-error">{_t("admin.msg_match_failed_prefix", "配對失敗：")}{matchError}{_t("admin.msg_match_failed_suffix", "（可能 match-workers Edge Function 還沒部署、或 worker pool 該 vertical 沒人）")}</div>
        )}

        {matchResult && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>
              {_t("admin.label_top_match_prefix", "◆ TOP ")}{(matchResult.top || matchResult.workers || []).length}{_t("admin.label_top_match_suffix", " MATCH 候選")}
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
                  {_t("admin.label_invite", "邀請")}
                </label>
                {/* 2026-05-28 calcifer . C-1 Phase 1 . 產合約按鈕 (D-plan online sign) */}
                <ContractGenButton
                  clientIntakeId={intake.id}
                  workerApplicationId={w.worker_application_id || w.id}
                  workerLabel={w.display_name || w.handle || "(unnamed)"}
                />
              </div>
            ))}
            <textarea
              className="admin-textarea"
              placeholder={_t("admin.placeholder_worker_msg", "給 worker 的訊息 (optional · 會放進 email 內容)")}
              value={emailMsg}
              onChange={(e) => setEmailMsg(e.target.value)}
              rows={2}
              style={{ marginTop: 10 }}
            />
            <div className="admin-card-actions">
              <button className="admin-btn primary" onClick={sendInvites} disabled={sending}>
                {sending ? _t("admin.btn_sending", "寄信中…") : _t("admin.btn_send_invites", "✉ 寄邀請信給選中的 worker")}
              </button>
              <button className="admin-btn" onClick={runMatch} disabled={matching}>{_t("admin.btn_rerun_match", "重新跑配對")}</button>
            </div>
            {sendResult && sendResult.error && <div className="admin-error">{_t("admin.msg_send_failed_prefix", "寄信失敗：")}{sendResult.error}</div>}
            {sendResult && sendResult.ok && <div style={{ marginTop: 10, padding: "10px 14px", border: "1px solid var(--accent-line)", background: "var(--accent-soft)", color: "var(--accent)", fontSize: 13 }}>{_t("admin.msg_send_ok_prefix", "✓ 已寄出 ")}{sendResult.sent}{_t("admin.msg_send_ok_suffix", " 封邀請信")}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Decisions Audit Tab ----------

function DecisionsTab() {
  useI18n();
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

  if (loading) return <div className="admin-loading">{_t("admin.label_load_decisions", "載入決定紀錄中…")}</div>;
  if (error) return <div className="admin-error">{_t("admin.msg_load_decisions_failed_prefix", "載入失敗：")}{error}{_t("admin.msg_load_decisions_failed_suffix", "（可能 worker_decisions table 還沒建）")}</div>;
  if (decisions.length === 0) return (
    <AdminEmptyState
      icon="◇"
      title={_t("admin.empty_decisions_title", "尚無配對決定紀錄")}
      hint={_t("admin.empty_decisions_hint", "在 CLIENT INTAKES 頁跑配對、寄出邀請信後、紀錄會自動顯示在這。")}
      secondary={_t("admin.empty_decisions_secondary", "每筆 = 一次 worker × client 配對的結果")}
    />
  );

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
            <div><span className="k">{_t("admin.card_label_sent_time", "寄出時間")}</span><div className="v">{formatDate(d.created_at)}</div></div>
            <div><span className="k">{_t("admin.card_label_decided_time", "決定時間")}</span><div className="v">{formatDate(d.decided_at)}</div></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Settings Tab · 5 維權重編輯 (2026-05-21 A3) ----------

function SettingsTab() {
  useI18n();
  const DEFAULT = window.bpAdmin?.DEFAULT_MATCH_WEIGHTS || { tier: 25, capacity: 20, domain: 30, L_score: 15, mercy: 10 };
  const [weights, setWeights] = useState(() => window.bpAdmin?.getMatchWeights() || { ...DEFAULT });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const sum = weights.tier + weights.capacity + weights.domain + weights.L_score + weights.mercy;
  const isDefault = weights.tier === DEFAULT.tier && weights.capacity === DEFAULT.capacity &&
                    weights.domain === DEFAULT.domain && weights.L_score === DEFAULT.L_score &&
                    weights.mercy === DEFAULT.mercy;

  function updateWeight(key, val) {
    const n = parseInt(val, 10);
    if (Number.isNaN(n) || n < 0 || n > 100) return;
    setWeights((w) => ({ ...w, [key]: n }));
    setSaved(false);
  }
  function handleSave() {
    setError(null);
    const r = window.bpAdmin.setMatchWeights(weights);
    if (r.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } else {
      setError(r.error?.message || _t("admin.err_save_failed", "儲存失敗"));
    }
  }
  function handleReset() {
    const r = window.bpAdmin.resetMatchWeights();
    if (r.ok) {
      setWeights({ ...DEFAULT });
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } else {
      setError(r.error?.message || _t("admin.err_reset_failed", "重置失敗"));
    }
  }

  const DIMENSIONS = [
    { k: "tier", label: _t("admin.weight_tier_label", "Tier 對位"), hint: _t("admin.weight_tier_hint", "client required_tier 跟 worker 當前 Tier 的吻合度") },
    { k: "capacity", label: _t("admin.weight_capacity_label", "容量"), hint: _t("admin.weight_capacity_hint", "worker 當前接案餘力 · timeline rush 加權") },
    { k: "domain", label: _t("admin.weight_domain_label", "領域吻合"), hint: _t("admin.weight_domain_hint", "client.vertical 跟 worker.verticals 主／鄰近 + 任務 → skill_matrix 對應") },
    { k: "L_score", label: _t("admin.weight_lscore_label", "L-score"), hint: _t("admin.weight_lscore_hint", "worker 自評 AI 使用 leverage 程度 0-10") },
    { k: "mercy", label: _t("admin.weight_mercy_label", "反馬太效應"), hint: _t("admin.weight_mercy_hint", "> 90 天沒接案的 worker 補一個 boost · 防新人凍結") },
  ];

  return (
    <div className="admin-card" style={{ maxWidth: 760 }}>
      <div className="admin-card-h">
        <div style={{ flex: 1 }}>
          <div className="title">{_t("admin.settings_title", "5 維配對權重")}</div>
          <div className="sub">{_t("admin.settings_sub", "改完按「儲存」、下次 runMatch 自動帶 · 儲存在你瀏覽器 localStorage")}</div>
        </div>
        <span className={"pill " + (isDefault ? "info" : "accent")}>{isDefault ? "default" : "customized"}</span>
      </div>

      <div className="admin-card-body">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {DIMENSIONS.map(({ k, label, hint }) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "120px 60px 1fr", gap: 12, alignItems: "center" }}>
              <label style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)", letterSpacing: "0.08em" }}>{label}</label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={weights[k]}
                onChange={(e) => updateWeight(k, e.target.value)}
                className="admin-textarea"
                style={{ width: 60, padding: "8px 10px", fontFamily: "var(--mono)", fontSize: 14, textAlign: "center" }}
              />
              <span style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>{hint}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--line-soft)", borderRadius: 4, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "var(--muted)" }}>Sum</span>
            <span style={{ color: sum === 100 ? "var(--accent)" : "var(--warn)", fontWeight: 700, fontFamily: "var(--mono)" }}>{sum}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.55 }}>
            {_t("admin.settings_sum_hint", "sum 100 = 平衡配置（每維權重 / 100 = 影響力百分比）· 大於 100 等於相對放大、小於 100 等於相對縮小。")}
            <br />
            {_t("admin.settings_default_hint", "目前 default：tier 25 / capacity 20 / domain 30 / L_score 15 / mercy 10 = 100")}
          </div>
        </div>

        {error && <div className="admin-error" style={{ marginTop: 12 }}>{error}</div>}
        {saved && <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(199,232,74,0.08)", border: "1px solid var(--accent-line)", color: "var(--accent)", fontSize: 12, fontFamily: "var(--mono)" }}>{_t("admin.settings_saved_msg", "✓ 已儲存 · 下次配對自動帶這組權重")}</div>}
      </div>

      <div className="admin-card-actions">
        <button className="admin-btn primary" onClick={handleSave}>{_t("admin.btn_save_weights", "儲存權重")}</button>
        <button className="admin-btn" onClick={handleReset}>{_t("admin.btn_reset_default", "回 default")}</button>
      </div>
    </div>
  );
}

// ---------- Dashboard Tab · 數據總覽 (2026-06-01 calcifer) ----------
// 營運健康度匯總一頁 · 北極星 (雙邊 60 天回購率) + 8 個關鍵指標
// 資料來源 doc 36 (PMF 量化) · 撈法 window.bpAdmin.loadDashboardMetrics (只讀)
// graceful: 數字撈不到 / 為 0 顯示「尚無數據」, 不空白不壞掉

function fmtNtd(n) {
  if (n == null || isNaN(n)) return "—";
  return "NT$ " + Math.round(n).toLocaleString();
}
function isWithinDays(s, days) {
  if (!s) return false;
  const t = new Date(s).getTime();
  if (isNaN(t)) return false;
  return (Date.now() - t) <= days * 864e5;
}

function MetricCard({ label, value, sub, accent, span }) {
  return (
    <div
      className="admin-card"
      style={{
        margin: 0,
        padding: "18px 20px",
        gridColumn: span ? ("span " + span) : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, color: accent || "var(--text)", fontFamily: "var(--mono)", wordBreak: "keep-all", overflowWrap: "anywhere" }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>{sub}</div>
      )}
    </div>
  );
}

function DashSectionTitle({ children, note }) {
  return (
    <div style={{ margin: "28px 0 14px", display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
        {children}
      </span>
      {note && <span style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>{note}</span>}
    </div>
  );
}

function DashboardTab() {
  useI18n();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [errors, setErrors] = useState({});

  async function load() {
    setLoading(true);
    const raw = await window.bpAdmin.loadDashboardMetrics();
    const errs = {};
    if (raw.contracts.err) errs.contracts = raw.contracts.err;
    if (raw.workers.err) errs.workers = raw.workers.err;
    if (raw.intakes.err) errs.intakes = raw.intakes.err;
    if (raw.nps.err) errs.nps = raw.nps.err;
    if (raw.arbitration.err) errs.arbitration = raw.arbitration.err;
    setErrors(errs);
    setMetrics(raw);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div className="admin-loading">{_t("admin.dash_loading", "載入營運數據中…")}</div>;
  if (!metrics) return <div className="admin-error">{_t("admin.dash_load_failed", "數據載入失敗")}</div>;

  const contracts = metrics.contracts.rows || [];
  const workers = metrics.workers.rows || [];
  const intakes = metrics.intakes.rows || [];
  const nps = metrics.nps.rows || [];
  const arbitration = metrics.arbitration.rows || [];

  const gmv = contracts.reduce((s, c) => s + (c.client_paid_total_ntd || 0), 0);
  const commissionCollected = contracts.reduce((s, c) => s + (c.commission_collected_total_ntd || 0), 0);

  const totalContracts = contracts.length;
  const stageCount = { pending: 0, partial: 0, complete: 0, cancelled: 0, other: 0 };
  contracts.forEach((c) => {
    if (stageCount[c.status] != null) stageCount[c.status] += 1;
    else stageCount.other += 1;
  });
  const inProgress = stageCount.pending + stageCount.partial;
  const completed = stageCount.complete;
  const arbActive = arbitration.filter((a) => a.status && a.status !== "resolved").length;

  const APPROVED = ["approved", "tier_b", "tier_b_plus"];
  const workerPool = workers.filter((w) => APPROVED.indexOf(w.status) >= 0).length;
  const workerPending = workers.filter((w) => !w.status || ["pending", "reviewing", "need_more_info"].indexOf(w.status) >= 0).length;

  const totalIntakes = intakes.length;
  const intakesThisWeek = intakes.filter((it) => isWithinDays(it.created_at, 7)).length;

  const clientNps = nps.filter((r) => r.role === "client").map((r) => r.score).filter((s) => typeof s === "number");
  const workerNps = nps.filter((r) => r.role === "worker").map((r) => r.score).filter((s) => typeof s === "number");
  const avgOf = (arr) => arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;
  const clientNpsAvg = avgOf(clientNps);
  const workerNpsAvg = avgOf(workerNps);

  const avgDealNtd = completed > 0 ? Math.round(gmv / completed) : null;

  let starValue = null;
  let starNote = null;
  if (completed < 1) {
    starNote = _t("admin.dash_star_no_data", "尚無數據 · 北極星需 1 件以上完成案才能起算。完成首案加雙邊 NPS 收到後，發案方 60 天內發第二案、接案方 60 天內接第二案的比率。早期案量少時以質性訪談為主（doc 36）。");
  } else {
    const workerCaseCount = {};
    contracts.forEach((c) => {
      if (c.worker_application_id) workerCaseCount[c.worker_application_id] = (workerCaseCount[c.worker_application_id] || 0) + 1;
    });
    const workersWithCase = Object.keys(workerCaseCount).length;
    const workersRepeat = Object.keys(workerCaseCount).filter((k) => workerCaseCount[k] >= 2).length;
    if (workersWithCase > 0) {
      starValue = Math.round((workersRepeat / workersWithCase) * 100);
      starNote = _t("admin.dash_star_early", "早期粗估（接案方接第二案比率）· 樣本少請以質性訪談為主。發案方回購需帳號系統關聯，樣本足夠後補。");
    } else {
      starNote = _t("admin.dash_star_no_data", "尚無足夠樣本起算");
    }
  }

  const errKeys = Object.keys(errors);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>{_t("admin.dash_title", "數據總覽")}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, lineHeight: 1.7 }}>{_t("admin.dash_subtitle", "營運健康度匯總 · 北極星 + 金流 + 案件 + 雙邊健康（即時撈 Supabase）")}</div>
        </div>
        <button className="admin-btn" onClick={load}>{_t("admin.dash_refresh", "重新整理")}</button>
      </div>

      {errKeys.length > 0 && (
        <div className="admin-error" style={{ fontSize: 12 }}>
          {_t("admin.dash_partial_err", "部分資料表讀取失敗、其餘指標仍正常顯示：")}
          {errKeys.join(" / ")}
        </div>
      )}

      <DashSectionTitle note={_t("admin.dash_star_section_note", "雙邊媒合平台 PMF 核心 · 用戶用行動投票（doc 36 一）")}>
        {_t("admin.dash_star_section", "★ 北極星指標 · 雙邊 60 天回購率")}
      </DashSectionTitle>
      <div className="admin-card" style={{ margin: 0, padding: "22px 24px", borderColor: "var(--accent-line)", background: "var(--accent-soft)" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {_t("admin.dash_star_label", "雙邊 60 天回購率")}
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2, color: "var(--accent)", fontFamily: "Georgia, serif", fontStyle: "italic", marginTop: 4 }}>
          {starValue != null ? (starValue + "%") : _t("admin.dash_no_data_short", "尚無數據")}
        </div>
        {starNote && <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.8, marginTop: 8, maxWidth: 640 }}>{starNote}</div>}
      </div>

      <DashSectionTitle note={_t("admin.dash_money_note", "代收代付 · 結案後累計（doc 36 四）")}>
        {_t("admin.dash_money_section", "◆ 金流")}
      </DashSectionTitle>
      <div className="dash-grid">
        <MetricCard
          label={_t("admin.dash_gmv", "客戶付款總額 GMV")}
          value={gmv > 0 ? fmtNtd(gmv) : fmtNtd(0)}
          sub={gmv > 0 ? null : _t("admin.dash_gmv_zero", "尚無結案收款")}
          accent={gmv > 0 ? "var(--text)" : "var(--muted)"}
        />
        <MetricCard
          label={_t("admin.dash_commission", "抽佣收取總額")}
          value={commissionCollected > 0 ? fmtNtd(commissionCollected) : fmtNtd(0)}
          sub={commissionCollected > 0 ? null : _t("admin.dash_commission_zero", "尚無抽佣入帳")}
          accent={commissionCollected > 0 ? "var(--gold, #c7841a)" : "var(--muted)"}
        />
        <MetricCard
          label={_t("admin.dash_avg_deal", "平均案件金額")}
          value={avgDealNtd != null ? fmtNtd(avgDealNtd) : _t("admin.dash_no_data_short", "尚無數據")}
          sub={avgDealNtd != null ? (completed + _t("admin.dash_avg_deal_basis", " 件完成案均值")) : _t("admin.dash_avg_deal_zero", "需 1 件以上完成案")}
          accent={avgDealNtd != null ? "var(--text)" : "var(--muted)"}
        />
      </div>

      <DashSectionTitle note={_t("admin.dash_case_note", "全部合約 · 依狀態分布")}>
        {_t("admin.dash_case_section", "◆ 案件")}
      </DashSectionTitle>
      <div className="dash-grid">
        <MetricCard
          label={_t("admin.dash_total_cases", "案件總數")}
          value={totalContracts > 0 ? totalContracts : _t("admin.dash_no_data_short", "尚無數據")}
          sub={totalContracts > 0 ? null : _t("admin.dash_total_cases_zero", "尚無合約建立")}
          accent={totalContracts > 0 ? "var(--text)" : "var(--muted)"}
        />
        <MetricCard
          label={_t("admin.dash_in_progress", "進行中")}
          value={inProgress}
          sub={_t("admin.dash_in_progress_sub", "簽約中 / 履約中")}
          accent={inProgress > 0 ? "var(--warn, #f5a623)" : "var(--muted)"}
        />
        <MetricCard
          label={_t("admin.dash_completed", "完成")}
          value={completed}
          sub={_t("admin.dash_completed_sub", "雙方已簽 + 全數釋款")}
          accent={completed > 0 ? "var(--ok, #4ade80)" : "var(--muted)"}
        />
        <MetricCard
          label={_t("admin.dash_arbitration", "仲裁中")}
          value={arbActive}
          sub={metrics.arbitration.err ? _t("admin.dash_arb_err", "仲裁表未建") : _t("admin.dash_arbitration_sub", "進入爭議處理")}
          accent={arbActive > 0 ? "var(--danger, #d94a4a)" : "var(--muted)"}
        />
      </div>

      <DashSectionTitle note={_t("admin.dash_health_note", "供需兩邊體質 · 防單邊枯竭（doc 36 三）")}>
        {_t("admin.dash_health_section", "◆ 雙邊健康")}
      </DashSectionTitle>
      <div className="dash-grid">
        <MetricCard
          label={_t("admin.dash_worker_pool", "認證接案者數")}
          value={workerPool}
          sub={workerPending > 0 ? (workerPending + _t("admin.dash_worker_pending", " 位待審")) : _t("admin.dash_worker_pool_sub", "已通過認證進池")}
          accent={workerPool > 0 ? "var(--accent)" : "var(--muted)"}
        />
        <MetricCard
          label={_t("admin.dash_intake_week", "本週新發案")}
          value={intakesThisWeek}
          sub={totalIntakes + _t("admin.dash_intake_total", " 件累計發案")}
          accent={intakesThisWeek > 0 ? "var(--accent)" : "var(--muted)"}
        />
        <MetricCard
          label={_t("admin.dash_nps_client", "發案方 NPS 平均")}
          value={clientNpsAvg != null ? clientNpsAvg : _t("admin.dash_no_data_short", "尚無數據")}
          sub={clientNpsAvg != null ? (clientNps.length + _t("admin.dash_nps_count", " 筆回覆 / 滿分 10")) : _t("admin.dash_nps_zero", "尚無 NPS 回覆")}
          accent={clientNpsAvg != null ? (clientNpsAvg >= 7 ? "var(--ok, #4ade80)" : "var(--warn, #f5a623)") : "var(--muted)"}
        />
        <MetricCard
          label={_t("admin.dash_nps_worker", "接案方 NPS 平均")}
          value={workerNpsAvg != null ? workerNpsAvg : _t("admin.dash_no_data_short", "尚無數據")}
          sub={workerNpsAvg != null ? (workerNps.length + _t("admin.dash_nps_count", " 筆回覆 / 滿分 10")) : _t("admin.dash_nps_zero", "尚無 NPS 回覆")}
          accent={workerNpsAvg != null ? (workerNpsAvg >= 7 ? "var(--ok, #4ade80)" : "var(--warn, #f5a623)") : "var(--muted)"}
        />
      </div>

      <div style={{ marginTop: 28, padding: "12px 16px", background: "var(--surface-2)", borderLeft: "3px solid var(--line)", fontSize: 11, color: "var(--muted)", lineHeight: 1.8 }}>
        {_t("admin.dash_footer_note", "指標定義出自 docs/launch/36（PMF 量化）· 早期案量少時量化是輔助、質性訪談是主體 · 本頁只讀、不影響任何營運資料。")}
      </div>
    </div>
  );
}


// ---------- Main App ----------

function AdminApp() {

  useI18n();
  const [tab, setTab] = useState("dashboard"); // dashboard | workers | intakes | decisions | contracts | nps | arbitration | settings
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
        <a className="admin-brand" href="landing.html" aria-label="BeyondPath · back to home" title="Back to home">
          <span className="admin-mark"></span>
          <span className="admin-title">Beyond<span className="le-acc">Path</span><small>ADMIN CONSOLE</small></span>
        </a>
        <div className="admin-meta">INTERNAL</div>
      </div>

      <div className="admin-tabs">
        <button className={"admin-tab " + (tab === "dashboard" ? "active" : "")} onClick={() => setTab("dashboard")}>
          {_t("admin.dash_tab", "數據總覽")}
        </button>
        <button className={"admin-tab " + (tab === "workers" ? "active" : "")} onClick={() => setTab("workers")}>
          Pending Workers <span className="count">{workers.length}</span>
        </button>
        <button className={"admin-tab " + (tab === "intakes" ? "active" : "")} onClick={() => setTab("intakes")}>
          Client Intakes <span className="count">{intakes.length}</span>
        </button>
        <button className={"admin-tab " + (tab === "decisions" ? "active" : "")} onClick={() => setTab("decisions")}>
          Decisions History
        </button>
        {/* 2026-05-28 calcifer . C-1 Phase 1 . 合約管理 tab */}
        <button className={"admin-tab " + (tab === "contracts" ? "active" : "")} onClick={() => setTab("contracts")}>
          ◆ Contracts
        </button>
        <button className={"admin-tab " + (tab === "nps" ? "active" : "")} onClick={() => setTab("nps")}>
          ★ NPS Reviews
        </button>
        <button className={"admin-tab " + (tab === "arbitration" ? "active" : "")} onClick={() => setTab("arbitration")}>
          ⚠ Arbitration
        </button>
        <button className={"admin-tab " + (tab === "settings" ? "active" : "")} onClick={() => setTab("settings")}>
          ⚙ Settings
        </button>
      </div>

      {actionError && <div className="admin-error">{_t("admin.err_action_prefix", "操作失敗：")}{actionError}</div>}

      {tab === "dashboard" && <DashboardTab />}

      {tab === "workers" && (
        <div>
          {loading.workers && <div className="admin-loading">{_t("admin.msg_loading_workers", "載入 worker 名單中…")}</div>}
          {error.workers && <div className="admin-error">{_t("admin.msg_load_workers_failed_prefix", "載入失敗：")}{error.workers}</div>}
          {!loading.workers && !error.workers && workers.length === 0 && (
            <AdminEmptyState
              icon="◯"
              title={_t("admin.empty_workers_title", "目前沒有 pending 的接案者申請")}
              hint={_t("admin.empty_workers_hint", "把申請連結寄給候選人、他們完成申請後會出現在這。")}
              cta={_t("admin.empty_workers_cta", "打開申請頁")}
              ctaUrl="https://beyondpath.tw/app.html?role=worker"
              ctaCopy="https://beyondpath.tw/app.html?role=worker"
            />
          )}
          {!loading.workers && sortBySla(workers, workerSla).map((w) => (
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
          {loading.intakes && <div className="admin-loading">{_t("admin.msg_loading_intakes", "載入 client intake 中…")}</div>}
          {error.intakes && <div className="admin-error">{_t("admin.msg_load_intakes_failed_prefix", "載入失敗：")}{error.intakes}</div>}
          {!loading.intakes && !error.intakes && intakes.length === 0 && (
            <AdminEmptyState
              icon="◇"
              title={_t("admin.empty_intakes_title", "目前沒有新的 client intake")}
              hint={_t("admin.empty_intakes_hint", "把 client 表單連結寄給潛在客戶、他們填完會出現在這。")}
              cta={_t("admin.empty_intakes_cta", "打開 client 表單")}
              ctaUrl="https://beyondpath.tw/app.html?role=client"
              ctaCopy="https://beyondpath.tw/app.html?role=client"
            />
          )}
          {!loading.intakes && sortBySla(intakes, clientSla).map((it) => (
            <ClientIntakeCard key={it.id} intake={it} />
          ))}
        </div>
      )}

      {tab === "decisions" && <DecisionsTab />}

      {tab === "contracts" && <ContractsTab />}

      {tab === "nps" && <NpsReviewsTab />}

      {tab === "arbitration" && <ArbitrationTab />}

      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

// ============================================================
// 2026-05-28 calcifer . C-1 Phase 1 . ContractGenButton (用於 ClientIntakeCard match worker 列)
// ============================================================
function ContractGenButton({ clientIntakeId, workerApplicationId, workerLabel }) {
  const [status, setStatus] = useState("idle"); // idle | loading | ok | err
  const [result, setResult] = useState(null);

  async function handleClick() {
    if (status === "loading") return;
    const ok = window.confirm(_t("admin.contract_confirm_prompt", "確定要為此配對產生合約 PDF？") + "\n\nworker: " + (workerLabel || workerApplicationId) + "\nintake: " + clientIntakeId.slice(0, 8) + "\n\n" + _t("admin.contract_confirm_note", "PDF 會自動寄給雙方 . 7 天 signed URL"));
    if (!ok) return;
    setStatus("loading");
    setResult(null);
    try {
      // 2026-05-28 calcifer . 建合約時填 budget + type . 抽佣計算
      const budgetStr = window.prompt(_t("admin.contract_budget_prompt", "客戶總付 NT$ (整數 . 留空則不算抽佣)"), "");
      let budgetNtd = null;
      if (budgetStr) {
        const b = parseInt(budgetStr.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(b) && b > 0) budgetNtd = b;
      }
      const ctypeStr = window.prompt(_t("admin.contract_type_prompt", "合約類型 . one_off / retainer (月聘 +3% 抽佣)"), "one_off");
      const ctype = ctypeStr === "retainer" ? "retainer" : "one_off";
      const { data, error } = await window.bpAdmin.createContract({
        clientIntakeId,
        workerApplicationId,
        projectBudgetNtd: budgetNtd,
        contractType: ctype,
      });
      if (error) {
        setStatus("err");
        setResult({ error: error.message || String(error), detail: error.detail });
      } else {
        setStatus("ok");
        setResult(data);
      }
    } catch (e) {
      setStatus("err");
      setResult({ error: e?.message || String(e) });
    }
  }
  return (
    <span style={{ marginLeft: 8, display: "inline-flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
      <button
        className={"admin-btn " + (status === "ok" ? "" : "primary")}
        onClick={handleClick}
        disabled={status === "loading" || status === "ok"}
        title={_t("admin.contract_btn_tooltip", "產生雙方合約 PDF + 寄 email . Phase 1 (D-plan 自家 PDF)")}
        style={{ fontSize: 11, padding: "4px 10px" }}
      >
        {status === "loading" ? _t("admin.contract_btn_loading", "產生中…") : status === "ok" ? _t("admin.contract_btn_ok", "✓ 已寄送") : _t("admin.contract_btn_idle", "◆ 產合約")}
      </button>
      {status === "ok" && result && result.pdf_url && (
        <a href={result.pdf_url} target="_blank" rel="noopener" style={{ fontSize: 10, color: "var(--accent)", textDecoration: "underline" }}>
          {_t("admin.contract_view_pdf", "下載合約 PDF →")}
        </a>
      )}
      {status === "err" && result && (
        <span style={{ fontSize: 10, color: "var(--danger, #d94a4a)" }}>
          {_t("admin.contract_err_prefix", "✗ ")}{result.error}{result.detail ? " (" + result.detail.slice(0, 80) + ")" : ""}
        </span>
      )}
    </span>
  );
}

// ============================================================
// 2026-05-28 calcifer . C-1 Phase 1 . ContractsTab
// ============================================================
function ContractsTab() {
  useI18n();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    const { data, error } = await window.bpAdmin.listContracts(100);
    if (error) setError(error.message || "Unknown");
    else setContracts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) return <div className="admin-loading">{_t("admin.contracts_loading", "載入合約清單中…")}</div>;
  if (error) return <div className="admin-error">{_t("admin.contracts_err_prefix", "載入失敗：")}{error}{_t("admin.contracts_err_suffix", "（檢查 contracts table 是否已建 + Storage bucket contracts 是否存在）")}</div>;
  if (contracts.length === 0) return (
    <AdminEmptyState
      icon="◆"
      title={_t("admin.contracts_empty_title", "尚無合約紀錄")}
      hint={_t("admin.contracts_empty_hint", "在 Client Intakes 跑配對後 . 在 worker 列按「◆ 產合約」即可寄送雙方")}
      secondary={_t("admin.contracts_empty_secondary", "D-plan 線上簽約 . Phase 1 = PDF + email . Phase 2 = 簽署照片上傳")}
    />
  );

  return (
    <div>
      <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--surface-2)", borderLeft: "3px solid var(--accent)", fontSize: 13, lineHeight: 1.7 }}>
        <strong style={{ color: "var(--accent)" }}>◆ {_t("admin.contracts_header", "合約管理 . D-plan 線上簽約 Phase 1")}</strong>
        <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 4 }}>
          {_t("admin.contracts_header_note", ". PDF 7 天 signed URL . 雙方 email 已寄 . Phase 2 will add 簽署照片上傳 + SHA-256 verify")}
        </div>
      </div>
      {contracts.map((c) => {
        const snap = c.contract_snapshot || {};
        const statusMap = {
          pending: { label: _t("admin.contracts_status_pending", "Pending . PDF 已寄 雙方未簽"), color: "var(--warn, #f5a623)" },
          partial: { label: _t("admin.contracts_status_partial", "Partial . 一方已簽"), color: "var(--accent)" },
          complete: { label: _t("admin.contracts_status_complete", "Complete . 雙方已簽"), color: "var(--ok, #4ade80)" },
          cancelled: { label: _t("admin.contracts_status_cancelled", "Cancelled"), color: "var(--muted)" },
        };
        const st = statusMap[c.status] || { label: c.status, color: "var(--muted)" };
        return (
          <div key={c.id} className="admin-card">
            <div className="admin-card-h">
              <div style={{ flex: 1 }}>
                <div className="title">{snap.client_name || "(client?)"} ⇄ {snap.worker_name || "(worker?)"}</div>
                <div className="sub">{shortId(c.id)} · {formatDate(c.created_at)} · {snap.vertical || "—"} · {snap.project_budget || "—"} · split {snap.payment_split || "30/30/40"}</div>
              </div>
              <span className="pill" style={{ borderColor: st.color, color: st.color }}>{st.label}</span>
            </div>
            <div className="admin-card-body">
              <div className="admin-detail" style={{ fontSize: 13 }}>
                <div><span className="k">{_t("admin.contracts_field_client", "Client")}</span><div className="v">{snap.client_name}<br/><span style={{ color: "var(--muted)", fontSize: 11 }}>{snap.client_email}</span></div></div>
                <div><span className="k">{_t("admin.contracts_field_worker", "Worker")}</span><div className="v">{snap.worker_name}<br/><span style={{ color: "var(--muted)", fontSize: 11 }}>{snap.worker_email}</span></div></div>
                <div><span className="k">{_t("admin.contracts_field_tier", "Tier")}</span><div className="v">{snap.tier || "—"}</div></div>
                <div><span className="k">{_t("admin.contracts_field_timeline", "Timeline")}</span><div className="v">{snap.timeline || "—"}</div></div>
                <div><span className="k">{_t("admin.contracts_field_pdf_hash", "PDF Hash")}</span><div className="v" style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{c.pdf_hash ? c.pdf_hash.slice(0, 32) + "…" : "—"}</div></div>
                <div><span className="k">{_t("admin.contracts_field_sig_hash", "Final Signature Hash")}</span><div className="v" style={{ fontFamily: "var(--mono)", fontSize: 10 }}>{c.signature_hash ? c.signature_hash.slice(0, 32) + "…" : (c.status === "complete" ? "computing…" : "—")}</div></div>
                <div><span className="k">{_t("admin.contracts_field_client_signed", "發案方簽署")}</span><div className="v">{formatDate(c.client_signed_at) || _t("admin.contracts_unsigned", "未簽")}</div></div>
                <div><span className="k">{_t("admin.contracts_field_worker_signed", "接案者簽署")}</span><div className="v">{formatDate(c.worker_signed_at) || _t("admin.contracts_unsigned", "未簽")}</div></div>
                <div><span className="k">{_t("admin.contracts_field_notified", "Email 寄送時間")}</span><div className="v">{formatDate(c.notified_at) || "—"}</div></div>
                <div><span className="k">{_t("admin.contracts_field_budget", "客戶總付")}</span><div className="v">{c.project_budget_ntd ? ("NT$ " + c.project_budget_ntd.toLocaleString()) : "—"}</div></div>
                <div><span className="k">{_t("admin.contracts_field_commission", "平台抽佣")}</span><div className="v" style={{ color: "var(--gold, #c7841a)" }}>{c.commission_amount_ntd ? ("NT$ " + c.commission_amount_ntd.toLocaleString() + " (" + (c.commission_rate || 0) + "%)") : "—"}</div></div>
                <div><span className="k">{_t("admin.contracts_field_worker_net", "接案者實收")}</span><div className="v" style={{ color: "var(--accent)" }}>{c.worker_net_amount_ntd ? ("NT$ " + c.worker_net_amount_ntd.toLocaleString()) : "—"}</div></div>
                <div><span className="k">{_t("admin.contracts_field_paid_status", "金流狀態")}</span><div className="v" style={{ fontSize: 11 }}>{"客戶已付 " + (c.client_paid_total_ntd || 0).toLocaleString() + " / 抽佣已收 " + (c.commission_collected_total_ntd || 0).toLocaleString()}</div></div>
              </div>
              {c.status === "complete" && (c.client_signature_url || c.worker_signature_url) && (
                <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                  {c.client_signature_url && (
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, fontFamily: "var(--mono)" }}>CLIENT SIGNATURE</div>
                      <a href={c.client_signature_url} target="_blank" rel="noopener">
                        <img src={c.client_signature_url} alt="client signature" style={{ maxWidth: "100%", maxHeight: 120, border: "1px solid var(--line)", borderRadius: 4, background: "#fff", display: "block" }} />
                      </a>
                    </div>
                  )}
                  {c.worker_signature_url && (
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, fontFamily: "var(--mono)" }}>WORKER SIGNATURE</div>
                      <a href={c.worker_signature_url} target="_blank" rel="noopener">
                        <img src={c.worker_signature_url} alt="worker signature" style={{ maxWidth: "100%", maxHeight: 120, border: "1px solid var(--line)", borderRadius: 4, background: "#fff", display: "block" }} />
                      </a>
                    </div>
                  )}
                </div>
              )}
              <div className="admin-card-actions" style={{ marginTop: 12 }}>
                {c.pdf_url && (
                  <a className="admin-btn primary" href={c.pdf_url} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>
                    {_t("admin.contracts_btn_download", "↓ 下載 PDF (7天有效)")}
                  </a>
                )}
                {c.status === "complete" && (
                  <ResendCertificateButton contractId={c.id} />
                )}
                <button className="admin-btn" onClick={loadAll}>{_t("admin.contracts_btn_refresh", "重新整理")}</button>
                <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: "var(--mono)", color: "var(--muted)" }}>
                  {_t("admin.contracts_phase_tag", "Phase 3 . 履約看板 + 結案 NPS + Tier 升降")}
                  {c.milestones_total > 0 && (
                    <span style={{ marginLeft: 8, color: "var(--accent)" }}>{c.milestones_total}% {_t("admin.contracts_released", "已釋款")}</span>
                  )}
                  {c.nps_invited_at && (
                    <span style={{ marginLeft: 8, color: "var(--ok, #4ade80)" }}>{_t("admin.contracts_nps_sent", "NPS 已寄")}</span>
                  )}
                </span>
              </div>
              {/* 2026-05-28 calcifer . Phase 3 . 履約看板展開 */}
              <ContractMilestoneBlock contractId={c.id} contractStatus={c.status} />
              {/* 2026-05-28 calcifer . 金流對帳 sub-panel */}
              <ContractCommissionPanel contract={c} onRefresh={loadAll} />
              {/* 2026-05-28 calcifer . 綠界自動付款 panel */}
              <PaymentIntentsPanel contract={c} onRefresh={loadAll} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// 2026-05-28 calcifer . C-1 Phase 2 . ResendCertificateButton
// ============================================================
function ResendCertificateButton({ contractId }) {
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState(null);

  async function handleClick() {
    if (status === "loading") return;
    const okC = window.confirm(_t("admin.contracts_resend_confirm", "確定要重寄存證副本給雙方？") + "\n\ncontract: " + contractId.slice(0, 8));
    if (!okC) return;
    setStatus("loading");
    setErrMsg(null);
    try {
      const { data, error } = await window.bpAdmin.resendContractCertificate(contractId);
      if (error) {
        setStatus("err");
        setErrMsg(error.message || String(error));
      } else {
        setStatus("ok");
        setTimeout(function () { setStatus("idle"); }, 3000);
      }
    } catch (e) {
      setStatus("err");
      setErrMsg(e?.message || String(e));
    }
  }
  return (
    <button
      className="admin-btn"
      onClick={handleClick}
      disabled={status === "loading"}
      title={_t("admin.contracts_resend_tooltip", "重寄完整存證副本 email 給雙方")}
      style={{ fontSize: 12 }}
    >
      {status === "loading" ? _t("admin.contracts_resend_loading", "寄送中…") : status === "ok" ? _t("admin.contracts_resend_ok", "✓ 已寄送") : status === "err" ? (_t("admin.contracts_resend_err", "✗ ") + (errMsg ? errMsg.slice(0, 40) : "失敗")) : _t("admin.contracts_resend_idle", "✉ 重寄存證副本")}
    </button>
  );
}


// Phase 3 . ContractMilestoneBlock
function ContractMilestoneBlock({ contractId, contractStatus }) {
  useI18n();
  const [open, setOpen] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seeded, setSeeded] = useState(false);

  async function loadMilestones() {
    setLoading(true);
    setError(null);
    const r = await window.bpAdmin.listMilestones(contractId);
    if (r.error) {
      setError(r.error.message || "Unknown");
      setMilestones([]);
    } else {
      setMilestones(r.data || []);
    }
    setLoading(false);
  }

  async function seedMilestones() {
    if (!window.confirm(_t("admin.ms_seed_confirm", "為此合約建立預設 3 個里程碑 (30/30/40)？"))) return;
    const r = await window.bpAdmin.seedDefaultMilestones(contractId);
    if (r.error) {
      window.alert(_t("admin.ms_seed_err", "建立失敗 . ") + (r.error.message || "Unknown"));
    } else {
      setSeeded(true);
      loadMilestones();
    }
  }

  useEffect(() => {
    if (open) loadMilestones();
  }, [open]);

  if (contractStatus !== "complete") return null;

  return (
    <div style={{ marginTop: 12, borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
      <button className="admin-btn" onClick={() => setOpen(!open)} style={{ fontSize: 12 }}>
        {open ? "▼ " : "▶ "}{_t("admin.ms_toggle", "履約看板 . Milestones")} {milestones.length > 0 ? "(" + milestones.length + ")" : ""}
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          {loading && <div style={{ fontSize: 12, color: "var(--muted)" }}>{_t("admin.ms_loading", "載入中…")}</div>}
          {error && (
            <div className="admin-error" style={{ fontSize: 12 }}>
              {error}
              {error.indexOf("contract_milestones") >= 0 && (
                <div style={{ marginTop: 6 }}>{_t("admin.ms_table_missing", "(請先跑 migration)")}</div>
              )}
            </div>
          )}
          {!loading && !error && milestones.length === 0 && (
            <div style={{ padding: 10, background: "var(--surface-2)", fontSize: 12, color: "var(--muted)" }}>
              {_t("admin.ms_empty", "尚無里程碑紀錄")}
              <button className="admin-btn primary" onClick={seedMilestones} style={{ marginLeft: 12, fontSize: 11, padding: "4px 10px" }} disabled={seeded}>
                {seeded ? _t("admin.ms_seeded", "已建立") : _t("admin.ms_seed_btn", "+ 建預設 3 個里程碑")}
              </button>
            </div>
          )}
          {!loading && !error && milestones.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {milestones.map((m) => (
                <MilestoneCard key={m.id} milestone={m} onUpdated={loadMilestones} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// Phase 3 . MilestoneCard
function MilestoneCard({ milestone, onUpdated }) {
  useI18n();
  const m = milestone;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const statusMap = {
    pending: { label: _t("admin.ms_st_pending", "Pending"), color: "var(--muted)" },
    in_progress: { label: _t("admin.ms_st_in_progress", "進行中"), color: "var(--warn, #f5a623)" },
    delivered: { label: _t("admin.ms_st_delivered", "已交付 待驗收"), color: "var(--accent)" },
    approved: { label: _t("admin.ms_st_approved", "✓ 驗收通過"), color: "var(--ok, #4ade80)" },
    disputed: { label: _t("admin.ms_st_disputed", "✗ 退件"), color: "var(--danger, #d94a4a)" },
    arbitration: { label: _t("admin.ms_st_arbitration", "⚠ 仲裁中"), color: "var(--danger, #d94a4a)" },
  };
  const st = statusMap[m.status] || { label: m.status, color: "var(--muted)" };

  async function doUpdate(newStatus) {
    let deliverableText = null;
    let disputeReason = null;
    if (newStatus === "delivered") {
      deliverableText = window.prompt(_t("admin.ms_deliverable_prompt", "交付物說明:"));
      if (deliverableText === null) return;
    } else if (newStatus === "disputed") {
      disputeReason = window.prompt(_t("admin.ms_dispute_prompt", "退件原因:"));
      if (!disputeReason) return;
    } else if (newStatus === "approved") {
      if (!window.confirm(_t("admin.ms_approve_confirm_prefix", "確定驗收通過？對應 ") + m.amount_pct + _t("admin.ms_approve_confirm_suffix", "% 釋款給 worker"))) return;
    }
    setBusy(true);
    setErr(null);
    const r = await window.bpAdmin.updateMilestone({
      milestoneId: m.id,
      newStatus,
      deliverableText,
      disputeReason,
    });
    setBusy(false);
    if (r.error) {
      setErr(r.error.message || String(r.error));
    } else {
      onUpdated();
    }
  }

  return (
    <div style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 6, background: "var(--surface)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>
          <span style={{ fontFamily: "var(--mono)", color: "var(--muted)", marginRight: 8 }}>#{m.milestone_number}</span>
          {m.title}
          <span style={{ marginLeft: 10, fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)" }}>{m.amount_pct}%</span>
        </div>
        <span className="pill" style={{ borderColor: st.color, color: st.color, fontSize: 11 }}>{st.label}</span>
      </div>
      {m.deliverable_text && (
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6, paddingLeft: 8, borderLeft: "2px solid var(--line)" }}>
          {_t("admin.ms_deliverable_label", "交付物 . ")}{m.deliverable_text}
        </div>
      )}
      <MilestoneDeliverablesInline milestoneId={m.id} />
      {m.dispute_reason && (
        <div style={{ fontSize: 12, color: "var(--danger, #d94a4a)", marginBottom: 6, paddingLeft: 8, borderLeft: "2px solid var(--danger, #d94a4a)" }}>
          {_t("admin.ms_dispute_label", "退件原因 . ")}{m.dispute_reason}
          {m.dispute_count > 0 && <span> ({m.dispute_count}/3)</span>}
        </div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
        {m.status === "pending" && (
          <button className="admin-btn" disabled={busy} onClick={() => doUpdate("in_progress")} style={{ fontSize: 11 }}>
            {_t("admin.ms_btn_start", "標進行中")}
          </button>
        )}
        {(m.status === "pending" || m.status === "in_progress") && (
          <button className="admin-btn primary" disabled={busy} onClick={() => doUpdate("delivered")} style={{ fontSize: 11 }}>
            {_t("admin.ms_btn_deliver", "標已交付")}
          </button>
        )}
        {m.status === "delivered" && (
          <button className="admin-btn primary" disabled={busy} onClick={() => doUpdate("approved")} style={{ fontSize: 11, background: "var(--ok, #4ade80)" }}>
            {_t("admin.ms_btn_approve", "驗收通過 . 釋款")}
          </button>
        )}
        {m.status === "delivered" && (
          <button className="admin-btn" disabled={busy} onClick={() => doUpdate("disputed")} style={{ fontSize: 11, color: "var(--danger, #d94a4a)" }}>
            {_t("admin.ms_btn_dispute", "退件")}
          </button>
        )}
        {m.status === "disputed" && m.dispute_count < 3 && (
          <button className="admin-btn primary" disabled={busy} onClick={() => doUpdate("in_progress")} style={{ fontSize: 11 }}>
            {_t("admin.ms_btn_redo", "Worker 重做")}
          </button>
        )}
        {m.status === "arbitration" && (
          <span style={{ fontSize: 11, color: "var(--danger, #d94a4a)", fontFamily: "var(--mono)" }}>
            {_t("admin.ms_arbitration_note", "已超過 3 次退件 . 需仲裁")}
          </span>
        )}
        {busy && <span style={{ fontSize: 11, color: "var(--muted)" }}>{_t("admin.ms_busy", "處理中…")}</span>}
        {err && <span style={{ fontSize: 11, color: "var(--danger, #d94a4a)" }}>✗ {err}</span>}
      </div>
    </div>
  );
}


// Phase 3 . NpsReviewsTab
function NpsReviewsTab() {
  useI18n();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await window.bpAdmin.listNpsResponses(100);
      if (r.error) setError(r.error.message || "Unknown");
      else setResponses(r.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="admin-loading">{_t("admin.nps_loading", "載入 NPS 中…")}</div>;
  if (error) return <div className="admin-error">{_t("admin.nps_err_prefix", "載入失敗 . ")}{error}</div>;

  let clientAvg = 0, workerAvg = 0;
  const clientScores = responses.filter((r) => r.role === "client").map((r) => r.score);
  const workerScores = responses.filter((r) => r.role === "worker").map((r) => r.score);
  if (clientScores.length > 0) clientAvg = Math.round((clientScores.reduce((a, b) => a + b, 0) / clientScores.length) * 100) / 100;
  if (workerScores.length > 0) workerAvg = Math.round((workerScores.reduce((a, b) => a + b, 0) / workerScores.length) * 100) / 100;

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1, padding: 16, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>{_t("admin.nps_client_avg", "發案方 → 接案者 平均")}</div>
          <div style={{ fontSize: 32, color: "var(--accent)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>{clientAvg || "—"}</div>
          <div style={{ fontSize: 10, color: "var(--muted)" }}>{clientScores.length} {_t("admin.nps_responses_count", "筆回覆")}</div>
        </div>
        <div style={{ flex: 1, padding: 16, background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>{_t("admin.nps_worker_avg", "接案者 → 發案方 平均")}</div>
          <div style={{ fontSize: 32, color: "var(--accent)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>{workerAvg || "—"}</div>
          <div style={{ fontSize: 10, color: "var(--muted)" }}>{workerScores.length} {_t("admin.nps_responses_count", "筆回覆")}</div>
        </div>
      </div>
      {responses.length === 0 && (
        <AdminEmptyState icon="★" title={_t("admin.nps_empty", "尚無 NPS 回覆")} hint={_t("admin.nps_empty_hint", "完成所有 milestone 後系統會自動寄 NPS 邀請信給雙方")} />
      )}
      {responses.map((r) => (
        <div key={r.id} className="admin-card" style={{ padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 24, color: r.score >= 9 ? "var(--ok, #4ade80)" : r.score >= 7 ? "var(--accent)" : "var(--danger, #d94a4a)", fontFamily: "Georgia, serif", fontWeight: 700 }}>{r.score}</span>
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>/ 10</span>
              <span style={{ marginLeft: 12, fontSize: 12 }}>
                {r.role === "client" ? _t("admin.nps_role_client", "發案方評接案者") : _t("admin.nps_role_worker", "接案者評發案方")}
                {r.is_anonymous && <span style={{ marginLeft: 8, fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)" }}>{_t("admin.nps_anon", "[匿名]")}</span>}
              </span>
            </div>
            <span style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)" }}>{r.contract_id ? r.contract_id.slice(0, 8) : ""} . {new Date(r.created_at).toLocaleDateString()}</span>
          </div>
          {r.comment && (
            <div style={{ marginTop: 8, padding: 10, background: "var(--surface-2)", fontSize: 13, lineHeight: 1.6, borderLeft: "3px solid var(--accent)" }}>{r.comment}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// Phase 3+ 2026-05-28 calcifer . ArbitrationTab
function ArbitrationTab() {
  useI18n();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("pending");

  async function load() {
    setLoading(true);
    setError(null);
    const r = await window.bpAdmin.listArbitrationCases();
    if (r.error) setError(r.error.message || "Unknown");
    else setCases(r.data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = cases.filter((c) => {
    if (filter === "all") return true;
    if (filter === "pending") return c.status === "pending" || c.status === "positions_complete" || c.status === "deadline_expired";
    if (filter === "resolved") return c.status === "resolved";
    return true;
  });

  if (loading) return <div className="admin-loading">載入仲裁案件中…</div>;
  if (error) return <div className="admin-error">載入失敗：{error}（請先跑 20260528_arbitration_cases.sql migration）</div>;

  return (
    <div>
      <div style={{ marginBottom: 16, padding: "12px 16px", background: "var(--surface-2)", borderLeft: "3px solid var(--err, #d94a4a)", fontSize: 13, lineHeight: 1.7 }}>
        <strong style={{ color: "var(--err, #d94a4a)" }}>⚠ 仲裁案件管理 . Phase 3+ 退件 3 次自動觸發</strong>
        <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 4 }}>
          雙方各自提立場 (5 工作日 deadline) → admin 判定 worker_redo / partial_pay X% / contract_terminate
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["pending", "resolved", "all"].map((f) => (
          <button key={f} className={"admin-btn " + (filter === f ? "primary" : "")} onClick={() => setFilter(f)} style={{ fontSize: 11 }}>
            {f.toUpperCase()} ({cases.filter((c) => f === "all" ? true : f === "pending" ? (c.status !== "resolved") : (c.status === "resolved")).length})
          </button>
        ))}
        <button className="admin-btn" onClick={load} style={{ marginLeft: "auto", fontSize: 11 }}>重新整理</button>
      </div>
      {filtered.length === 0 && <AdminEmptyState icon="⚠" title="無仲裁案件" hint="當客戶第 3 次退件時 . 系統會自動觸發仲裁" />}
      {filtered.map((c) => <ArbitrationCaseCard key={c.id} arb={c} onUpdated={load} />)}
    </div>
  );
}

function ArbitrationCaseCard({ arb, onUpdated }) {
  const [verdict, setVerdict] = useState("worker_redo");
  const [verdictText, setVerdictText] = useState("");
  const [verdictPercent, setVerdictPercent] = useState("");
  const [breachMult, setBreachMult] = useState("");
  const [paymentNtd, setPaymentNtd] = useState("");
  const [breachNtd, setBreachNtd] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const statusColor = {
    pending: "var(--warn, #f5a623)",
    positions_complete: "var(--accent)",
    deadline_expired: "var(--err, #d94a4a)",
    resolved: "var(--ok, #4ade80)",
  }[arb.status] || "var(--muted)";

  async function submitVerdict() {
    if (!verdictText) { setMsg({ err: "verdict_text 必填" }); return; }
    if (!window.confirm("確定送出判定？此動作不可回復 . 寄存證副本給雙方")) return;
    setBusy(true);
    setMsg(null);
    const r = await window.bpAdmin.decideArbitration({
      caseId: arb.id,
      verdictDecision: verdict,
      verdictText,
      verdictPercent: verdictPercent ? Number(verdictPercent) : null,
      verdictBreachMultiplier: breachMult ? Number(breachMult) : null,
      finalPaymentAmountNtd: paymentNtd ? Number(paymentNtd) : null,
      finalBreachAmountNtd: breachNtd ? Number(breachNtd) : null,
    });
    setBusy(false);
    if (r.error) setMsg({ err: r.error.message || "判定失敗" });
    else { setMsg({ ok: "✓ 判定已送出 . 存證副本已寄" }); setTimeout(onUpdated, 1200); }
  }

  return (
    <div className="admin-card">
      <div className="admin-card-h">
        <div style={{ flex: 1 }}>
          <div className="title">仲裁案 {arb.id.slice(0, 8)}</div>
          <div className="sub">milestone {arb.milestone_id.slice(0, 8)} · trigger dispute_count {arb.trigger_dispute_count} · {formatDate(arb.triggered_at)}</div>
        </div>
        <span className="pill" style={{ borderColor: statusColor, color: statusColor }}>{arb.status}</span>
      </div>
      <div className="admin-card-body">
        <div className="admin-detail" style={{ fontSize: 12 }}>
          <div><span className="k">Position deadline</span><div className="v">{formatDate(arb.position_deadline)}</div></div>
          <div><span className="k">Client position</span><div className="v" style={{ color: arb.client_position_submitted_at ? "var(--ok)" : "var(--muted)" }}>{arb.client_position_submitted_at ? "✓ " + formatDate(arb.client_position_submitted_at) : "未提交"}</div></div>
          <div><span className="k">Worker position</span><div className="v" style={{ color: arb.worker_position_submitted_at ? "var(--ok)" : "var(--muted)" }}>{arb.worker_position_submitted_at ? "✓ " + formatDate(arb.worker_position_submitted_at) : "未提交"}</div></div>
          <div><span className="k">Trigger reason</span><div className="v">{arb.triggered_reason || "—"}</div></div>
        </div>
        {arb.client_position_text && (
          <div style={{ marginTop: 12, padding: 12, background: "var(--surface-2)", borderLeft: "3px solid var(--accent)", fontSize: 12, lineHeight: 1.7 }}>
            <div style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 10, marginBottom: 4 }}>CLIENT POSITION</div>
            {arb.client_position_text}
          </div>
        )}
        {arb.worker_position_text && (
          <div style={{ marginTop: 8, padding: 12, background: "var(--surface-2)", borderLeft: "3px solid var(--accent)", fontSize: 12, lineHeight: 1.7 }}>
            <div style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 10, marginBottom: 4 }}>WORKER POSITION</div>
            {arb.worker_position_text}
          </div>
        )}
        {arb.status === "resolved" && (
          <div style={{ marginTop: 12, padding: 12, background: "rgba(74,222,128,0.08)", borderLeft: "3px solid var(--ok)", fontSize: 12 }}>
            <div style={{ fontFamily: "var(--mono)", color: "var(--ok)", fontSize: 10, marginBottom: 4 }}>VERDICT</div>
            <div><strong>{arb.verdict_decision}</strong> {arb.verdict_percent != null && <span>({arb.verdict_percent}%)</span>} {arb.verdict_breach_multiplier != null && <span>· breach {arb.verdict_breach_multiplier}x</span>}</div>
            <div style={{ marginTop: 6, lineHeight: 1.7 }}>{arb.verdict_text}</div>
          </div>
        )}
        {arb.status !== "resolved" && (
          <div style={{ marginTop: 16, padding: 12, border: "1px dashed var(--line)", borderRadius: 6 }}>
            <div style={{ fontFamily: "var(--mono)", color: "var(--muted)", fontSize: 10, marginBottom: 8 }}>ADMIN VERDICT</div>
            <select value={verdict} onChange={(e) => setVerdict(e.target.value)} style={{ width: "100%", padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--text)", fontSize: 12, marginBottom: 8 }}>
              <option value="worker_redo">worker_redo (接案者再做一次 . attempts 不再加)</option>
              <option value="partial_pay">partial_pay (部分釋款 + 終止)</option>
              <option value="contract_terminate">contract_terminate (全退款 + 違約金)</option>
            </select>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input placeholder="釋款 %" value={verdictPercent} onChange={(e) => setVerdictPercent(e.target.value)} style={{ flex: 1, padding: "6px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--text)", fontSize: 12 }} />
              <input placeholder="違約倍率 (1.5/2/3)" value={breachMult} onChange={(e) => setBreachMult(e.target.value)} style={{ flex: 1, padding: "6px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--text)", fontSize: 12 }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input placeholder="最終付款 NT$" value={paymentNtd} onChange={(e) => setPaymentNtd(e.target.value)} style={{ flex: 1, padding: "6px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--text)", fontSize: 12 }} />
              <input placeholder="違約金 NT$" value={breachNtd} onChange={(e) => setBreachNtd(e.target.value)} style={{ flex: 1, padding: "6px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--text)", fontSize: 12 }} />
            </div>
            <textarea placeholder="判定理由 (寫進存證副本)" value={verdictText} onChange={(e) => setVerdictText(e.target.value)} style={{ width: "100%", minHeight: 80, padding: 10, background: "var(--surface-2)", border: "1px solid var(--line)", color: "var(--text)", fontSize: 12, marginBottom: 8 }} />
            <button className="admin-btn primary" onClick={submitVerdict} disabled={busy} style={{ fontSize: 11 }}>{busy ? "送出中…" : "送出判定 . 寄存證副本"}</button>
            {msg && msg.ok && <span style={{ marginLeft: 12, color: "var(--ok)", fontSize: 11 }}>{msg.ok}</span>}
            {msg && msg.err && <span style={{ marginLeft: 12, color: "var(--err, #d94a4a)", fontSize: 11 }}>{msg.err}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// Phase 3+ 2026-05-28 calcifer . MilestoneDeliverablesInline (admin show deliverables count for a milestone)
function MilestoneDeliverablesInline({ milestoneId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      const r = await window.bpAdmin.listMilestoneDeliverables(milestoneId);
      if (!r.error) setData(r.data);
    })();
  }, [milestoneId]);
  if (!data) return null;
  if (data.files.length === 0 && data.links.length === 0) return null;
  return (
    <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)", marginBottom: 6, paddingLeft: 8, borderLeft: "2px solid var(--accent-line)" }}>
      {data.files.length} 檔案 / {data.links.length} 外部連結 / max v{data.maxVersion}
    </div>
  );
}


// ============================================================
// 2026-05-28 calcifer . ContractCommissionPanel . 金流對帳
// ============================================================
function ContractCommissionPanel({ contract, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function loadRecords() {
    setLoading(true);
    setErr(null);
    const r = await window.bpAdmin.listCommissionRecords(contract.id);
    if (r.error) setErr(r.error.message || "Unknown");
    else setRecords(r.data || []);
    setLoading(false);
  }
  useEffect(function () { if (open) loadRecords(); }, [open]);

  async function markEvent(eventType, defaultAmount, methodPrompt) {
    const amtStr = window.prompt("金額 NT$ (整數) . " + eventType, String(defaultAmount || ""));
    if (amtStr === null) return;
    const amt = parseInt(amtStr, 10);
    if (isNaN(amt) || amt <= 0) { window.alert("金額無效"); return; }
    let method = null;
    if (methodPrompt) {
      method = window.prompt("付款方式 . ecpay_credit / atm_transfer / manual", "atm_transfer");
      if (method === null) return;
    }
    const ref = window.prompt("對帳參考號 (綠界訂單號 / ATM 後 5 碼)", "") || null;
    const notes = window.prompt("備註", "") || null;
    setBusy(true);
    const r = await window.bpAdmin.markCommissionEvent({
      contract_id: contract.id,
      event_type: eventType,
      amount_ntd: amt,
      payment_method: method,
      reference_number: ref,
      notes: notes,
    });
    setBusy(false);
    if (r.error) {
      window.alert("失敗 . " + (r.error.message || "Unknown"));
    } else {
      if (r.data && r.data.warnings && r.data.warnings.length > 0) {
        window.alert("已記錄 . 但有警告:\n" + r.data.warnings.join("\n"));
      }
      loadRecords();
      if (onRefresh) onRefresh();
    }
  }

  async function sendInvoice() {
    const wEmail = (contract.contract_snapshot && contract.contract_snapshot.worker_email) || "?";
    if (!window.confirm("寄抽佣請款單 PDF + email 給接案者 (" + wEmail + ") ?")) return;
    setBusy(true);
    const r = await window.bpAdmin.sendCommissionInvoice(contract.id);
    setBusy(false);
    if (r.error) {
      window.alert("寄送失敗 . " + (r.error.message || "Unknown"));
    } else {
      const invNo = (r.data && r.data.invoice_no) || "?";
      const amt = (r.data && r.data.amount_ntd) ? r.data.amount_ntd.toLocaleString() : "?";
      window.alert("已寄送 . Invoice " + invNo + " . NT$ " + amt);
      loadRecords();
      if (onRefresh) onRefresh();
    }
  }

  const c = contract;
  const total = c.project_budget_ntd || 0;
  const commission = c.commission_amount_ntd || 0;
  const workerNet = c.worker_net_amount_ntd || 0;
  const paid = c.client_paid_total_ntd || 0;
  const collected = c.commission_collected_total_ntd || 0;
  const paidPct = total ? Math.round(paid / total * 100) : 0;
  const collPct = commission ? Math.round(collected / commission * 100) : 0;

  if (!commission) {
    return (
      <div style={{ marginTop: 12, borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>
          ◆ 金流對帳 . 此合約無抽佣資料 (建合約時未填 project_budget_ntd)
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12, borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
      <button className="admin-btn" onClick={function () { setOpen(!open); }} style={{ fontSize: 12 }}>
        {open ? "▼ " : "▶ "}金流對帳 . Commission Tracking
        <span style={{ marginLeft: 8, color: "var(--accent)", fontFamily: "var(--mono)" }}>
          客戶 {paidPct}% / 抽佣 {collPct}%
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 12 }}>
            <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: 4 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>客戶總付</div>
              <div style={{ fontSize: 16, color: "var(--text)", fontFamily: "var(--mono)" }}>NT$ {total.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "var(--accent)" }}>已付 NT$ {paid.toLocaleString()} ({paidPct}%)</div>
            </div>
            <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: 4 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>接案者實收</div>
              <div style={{ fontSize: 16, color: "var(--accent)", fontFamily: "var(--mono)" }}>NT$ {workerNet.toLocaleString()}</div>
            </div>
            <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: 4 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>平台抽佣</div>
              <div style={{ fontSize: 16, color: "var(--gold, #c7841a)", fontFamily: "var(--mono)" }}>NT$ {commission.toLocaleString()} ({c.commission_rate || 0}%)</div>
              <div style={{ fontSize: 11, color: "var(--ok, #4ade80)" }}>已收 NT$ {collected.toLocaleString()} ({collPct}%)</div>
            </div>
            <div style={{ padding: 10, background: "var(--surface-2)", borderRadius: 4 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>合約類型</div>
              <div style={{ fontSize: 14, color: "var(--text)" }}>{c.contract_type || "one_off"}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            <button className="admin-btn primary" disabled={busy} onClick={function () { markEvent("client_paid", total - paid, true); }} style={{ fontSize: 11 }}>標客戶已付</button>
            <button className="admin-btn primary" disabled={busy} onClick={function () { markEvent("worker_paid_out", workerNet, true); }} style={{ fontSize: 11 }}>標接案者已轉</button>
            <button className="admin-btn" disabled={busy} onClick={function () { markEvent("commission_collected", commission - collected, true); }} style={{ fontSize: 11 }}>標抽佣已收回</button>
            <button className="admin-btn" disabled={busy} onClick={sendInvoice} style={{ fontSize: 11, background: "var(--accent-soft)" }}>✉ 寄抽佣請款單</button>
          </div>

          {loading && <div style={{ fontSize: 12, color: "var(--muted)" }}>載入金流紀錄…</div>}
          {err && <div className="admin-error" style={{ fontSize: 12 }}>{err}{err.indexOf("commission_records") >= 0 && <div>(請先跑 migration 20260528_commission_records.sql)</div>}</div>}
          {!loading && !err && records.length === 0 && (
            <div style={{ fontSize: 12, color: "var(--muted)", padding: 10, background: "var(--surface-2)" }}>
              尚無金流紀錄 . 按上方按鈕標記事件
            </div>
          )}
          {!loading && !err && records.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {records.map(function (rec) {
                const evtLabel = {
                  client_paid: { lbl: "客戶已付", color: "var(--accent)" },
                  worker_paid_out: { lbl: "接案者已轉", color: "var(--info, #6cb6ff)" },
                  commission_collected: { lbl: "抽佣已收回", color: "var(--ok, #4ade80)" },
                  invoice_issued: { lbl: "發票已開", color: "var(--gold, #c7841a)" },
                }[rec.event_type] || { lbl: rec.event_type, color: "var(--muted)" };
                return (
                  <div key={rec.id} style={{ padding: 8, background: "var(--surface-2)", borderRadius: 4, fontSize: 12, display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 10, alignItems: "center" }}>
                    <span className="pill" style={{ borderColor: evtLabel.color, color: evtLabel.color, fontSize: 10 }}>{evtLabel.lbl}</span>
                    <span>{rec.payment_method || "—"} {rec.reference_number ? "· " + rec.reference_number : ""} {rec.notes ? "· " + rec.notes.slice(0, 40) : ""}</span>
                    <span style={{ fontFamily: "var(--mono)" }}>NT$ {(rec.amount_ntd || 0).toLocaleString()}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{new Date(rec.paid_at || rec.created_at).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 10, padding: 10, background: "oklch(0.82 0.16 75 / 0.08)", borderLeft: "3px solid var(--warn)", fontSize: 11, color: "var(--text-2)", lineHeight: 1.7 }}>
            <strong>PMF 金流流程 (個人戶代收代付)</strong>:
            [1] 客戶刷卡入平台個人綠界戶 → [2] 7-14 天綠界放款 → [3] 按 標客戶已付 → [4] 銀行轉接案者淨額 → [5] 按 標接案者已轉 → [6] 按 寄抽佣請款單 (系統寄 PDF + email) → [7] 接案者匯回抽佣 → [8] 按 標抽佣已收回 → [9] 合約 completed
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 2026-05-28 calcifer . PaymentIntentsPanel . 綠界自動付款連結管理
// admin 在 Contracts > 此 panel 產綠界付款連結 + 看狀態 (polling 30s)
// ============================================================
function PaymentIntentsPanel({ contract, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [intents, setIntents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("all");
  const [customerEmail, setCustomerEmail] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const snap = contract.contract_snapshot || {};

  async function loadIntents() {
    setLoading(true);
    setErr(null);
    const r = await window.bpAdmin.listPaymentIntents({ contractId: contract.id });
    if (r.error) setErr(r.error.message || "Unknown");
    else setIntents(r.data || []);
    setLoading(false);
  }

  useEffect(function () { if (open) loadIntents(); }, [open]);

  useEffect(function () {
    if (!open) return;
    const hasPending = intents.some(function (i) { return i.status === "pending"; });
    if (!hasPending) return;
    const t = setInterval(function () { loadIntents(); }, 30000);
    return function () { clearInterval(t); };
  }, [open, intents]);

  useEffect(function () {
    if (createOpen && !customerEmail && snap.client_email) setCustomerEmail(snap.client_email);
  }, [createOpen]);

  async function handleCreate() {
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) { window.alert("金額需為正整數"); return; }
    if (!customerEmail || customerEmail.indexOf("@") < 0) { window.alert("客戶 email 無效"); return; }
    if (amt > 200000) {
      if (!window.confirm("金額 " + amt.toLocaleString() + " > 個人戶月上限 NT$ 200,000 . 綠界端可能擋下 . 仍要建立？")) return;
    }
    setCreating(true);
    const body = {
      contractId: contract.id,
      amountNtd: amt,
      paymentType: paymentType,
      customerEmail: customerEmail,
    };
    if (milestoneId) body.milestoneId = milestoneId;
    const r = await window.bpAdmin.createEcpayPayment(body);
    setCreating(false);
    if (r.error) {
      window.alert("建立失敗 . " + (r.error.message || r.error.detail || "Unknown"));
      return;
    }
    setCreateOpen(false);
    setAmount("");
    setMilestoneId("");
    loadIntents();
    if (r.data && r.data.payment_url) {
      try {
        navigator.clipboard.writeText(r.data.payment_url);
        window.alert("付款連結已建立 + 寄 email 給客戶 + 複製到剪貼簿 ✓\n\n訂單號: " + r.data.merchant_trade_no + "\n金額: NT$ " + amt.toLocaleString() + "\nemail_sent: " + r.data.email_sent);
      } catch (_e) {
        window.alert("付款連結已建立 + 寄 email 給客戶 ✓\n訂單號: " + r.data.merchant_trade_no);
      }
    }
  }

  async function handleCancel(intent) {
    if (!window.confirm("確定取消此付款連結？\n訂單號: " + intent.ecpay_merchant_trade_no + "\n金額: NT$ " + intent.amount_ntd.toLocaleString())) return;
    const reason = window.prompt("取消原因 (可填空)", "admin 手動取消") || null;
    const r = await window.bpAdmin.cancelPaymentIntent({ paymentIntentId: intent.id, reason: reason });
    if (r.error) window.alert("取消失敗 . " + (r.error.message || "Unknown"));
    else loadIntents();
  }

  function copyUrl(url) {
    try {
      navigator.clipboard.writeText(url);
      window.alert("連結已複製 ✓");
    } catch (_e) {
      window.prompt("複製此連結", url);
    }
  }

  const statusColor = {
    pending: "var(--warn, #f5a623)",
    paid: "var(--ok, #4ade80)",
    failed: "var(--danger, #d94a4a)",
    expired: "var(--muted)",
    cancelled: "var(--muted)",
  };
  const statusLabel = {
    pending: "Pending . 待付款",
    paid: "✓ 已付款",
    failed: "✗ 失敗",
    expired: "逾期",
    cancelled: "已取消",
  };
  const typeLabel = {
    credit_card: "信用卡",
    atm: "ATM",
    cvs: "超商代碼",
    all: "全部",
  };

  return (
    <div style={{ marginTop: 12, borderTop: "1px dashed var(--line)", paddingTop: 12 }}>
      <button className="admin-btn" onClick={function () { setOpen(!open); }} style={{ fontSize: 12 }}>
        {open ? "▼ " : "▶ "}綠界自動付款 . Payment Intents {intents.length > 0 ? "(" + intents.length + ")" : ""}
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          {loading && <div style={{ fontSize: 12, color: "var(--muted)" }}>載入中…</div>}
          {err && (
            <div className="admin-error" style={{ fontSize: 12 }}>
              {err}
              {err.indexOf("payment_intents") >= 0 && (
                <div style={{ marginTop: 6 }}>(請先跑 migration 20260528_payment_intents.sql)</div>
              )}
            </div>
          )}
          {!loading && !err && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                  自動付款連結 . 綠界 AIO V5 . CheckMacValue HMAC-SHA256 . 客戶刷卡後 webhook 自動標 paid + 寄收據
                </div>
                <button className="admin-btn primary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={function () { setCreateOpen(true); }}>+ 產綠界付款連結</button>
              </div>
              {intents.length === 0 && (
                <div style={{ padding: 10, background: "var(--surface-2)", fontSize: 12, color: "var(--muted)" }}>尚無付款意圖紀錄</div>
              )}
              {intents.map(function (intent) {
                return (
                  <div key={intent.id} style={{ padding: 10, background: "var(--surface-2)", marginBottom: 8, fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>{intent.ecpay_merchant_trade_no}</span>
                      <span className="pill" style={{ borderColor: statusColor[intent.status], color: statusColor[intent.status] }}>{statusLabel[intent.status] || intent.status}</span>
                    </div>
                    <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 11 }}>
                      NT$ {intent.amount_ntd.toLocaleString()} · {typeLabel[intent.payment_type] || intent.payment_type} · {intent.customer_email}
                    </div>
                    <div style={{ marginTop: 4, color: "var(--muted)", fontSize: 10, fontFamily: "var(--mono)" }}>
                      建立 {new Date(intent.created_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
                      {intent.paid_at && <span style={{ color: "var(--ok, #4ade80)", marginLeft: 8 }}>付款 {new Date(intent.paid_at).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</span>}
                      {intent.payment_method_detail && <span style={{ marginLeft: 8 }}>· {intent.payment_method_detail}</span>}
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {intent.payment_url && (
                        <button className="admin-btn" style={{ fontSize: 10, padding: "2px 8px" }} onClick={function () { copyUrl(intent.payment_url); }}>複製連結</button>
                      )}
                      {intent.payment_url && intent.status === "pending" && (
                        <a className="admin-btn" href={intent.payment_url} target="_blank" rel="noopener" style={{ fontSize: 10, padding: "2px 8px", textDecoration: "none" }}>↗ 開啟付款頁</a>
                      )}
                      {intent.status === "pending" && (
                        <button className="admin-btn" style={{ fontSize: 10, padding: "2px 8px", color: "var(--danger, #d94a4a)" }} onClick={function () { handleCancel(intent); }}>取消</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 2026-05-29 calcifer . doc 28 Part B . Admin 後台登入守門 (Gate 5 待沙利曼 audit)
// 現況問題: admin.html 之前無 auth gate . 任何人開 URL 就能看全部客戶資料 + 操作 = 上線阻擋級風險
// 做法: React mount 前包一層 auth gate . Google OAuth + email 白名單 (寫死 array . 不從 query/cookie 動態讀)
// 保守紀律: 既有 AdminApp / AdminConsole 內部完全不動 . 只在最外層加閘
// 註: 前端閘是 UX 防呆 . 真正資料防線是 RLS (admin sees all policy) + Edge Function caller check (Part C)
// ============================================================

// 白名單寫死在前端 . 改 admin = 改 code = git diff 留痕 (比 DB 改更可審計) . 不存 DB (POC 1 admin)
const ADMIN_EMAILS = ["edwardt0303@gmail.com"];

function AdminSignInGate() {
  const [signingIn, setSigningIn] = useState(false);
  const [err, setErr] = useState(null);
  async function handleGoogle() {
    setSigningIn(true);
    setErr(null);
    try {
      // redirectTo 回 admin.html (Edward 需在 Supabase Auth > URL Configuration 加此 Redirect URL)
      const redirectTo = window.location.origin + window.location.pathname;
      const { error } = await window.bpAuth.signInWithGoogle(redirectTo);
      if (error) { setErr(error.message || "登入失敗"); setSigningIn(false); }
      // 成功會跳轉去 Google . 不需 reset state
    } catch (e) {
      setErr(e && e.message ? e.message : String(e));
      setSigningIn(false);
    }
  }
  return (
    <div className="admin-shell">
      <div className="admin-top">
        <a className="admin-brand" href="landing.html" aria-label="BeyondPath">
          <span className="admin-mark"></span>
          <span className="admin-title">Beyond<span className="le-acc">Path</span><small>ADMIN CONSOLE</small></span>
        </a>
        <div className="admin-meta">INTERNAL</div>
      </div>
      <div className="admin-empty-state" style={{ maxWidth: 460, margin: "60px auto 0" }}>
        <div className="admin-empty-icon" aria-hidden="true">◆</div>
        <div className="admin-empty-title">這是私人後台</div>
        <div className="admin-empty-hint">請用授權帳號登入。此後台包含平台全部營運資料、僅限內部使用。</div>
        <div className="admin-empty-actions">
          <button className="admin-btn primary" onClick={handleGoogle} disabled={signingIn} style={{ minHeight: 40 }}>
            {signingIn ? "前往 Google 登入…" : "用 Google 登入"}
          </button>
        </div>
        {err && <div className="admin-error" style={{ marginTop: 14 }}>{err}</div>}
      </div>
    </div>
  );
}

function AdminForbidden() {
  const [signingOut, setSigningOut] = useState(false);
  async function handleSignOut() {
    setSigningOut(true);
    try { await window.bpAuth.signOut(); } catch (e) {}
    // 登出後 onAuthStateChange 會把 wrapper 切回 SignInGate
  }
  return (
    <div className="admin-shell">
      <div className="admin-top">
        <a className="admin-brand" href="landing.html" aria-label="BeyondPath">
          <span className="admin-mark"></span>
          <span className="admin-title">Beyond<span className="le-acc">Path</span><small>ADMIN CONSOLE</small></span>
        </a>
        <div className="admin-meta">INTERNAL</div>
      </div>
      <div className="admin-empty-state" style={{ maxWidth: 460, margin: "60px auto 0" }}>
        <div className="admin-empty-icon" aria-hidden="true" style={{ borderColor: "oklch(0.7 0.18 25 / 0.4)", color: "var(--err)", background: "var(--err-soft)", boxShadow: "none" }}>✕</div>
        <div className="admin-empty-title">無法存取</div>
        {/* 不顯示登入者 email . 避免洩漏給誤入者 (沙利曼 Gate 5 要求) */}
        <div className="admin-empty-hint">此後台為私人使用。若你需要協助、請聯絡 edwardt0303 [at] gmail [dot] com。</div>
        <div className="admin-empty-actions">
          <button className="admin-btn" onClick={handleSignOut} disabled={signingOut} style={{ minHeight: 40 }}>
            {signingOut ? "登出中…" : "登出"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminAuthWrapper() {
  const [authState, setAuthState] = useState("loading"); // loading | signin | forbidden | ok
  useEffect(function () {
    let mounted = true;
    function resolve(user) {
      if (!mounted) return;
      if (!user) { setAuthState("signin"); return; }
      if (ADMIN_EMAILS.indexOf(user.email) === -1) { setAuthState("forbidden"); return; }
      setAuthState("ok");
    }
    // 初次 getUser
    window.bpAuth.getUser().then(function (r) { resolve(r && r.user ? r.user : null); })
      .catch(function () { if (mounted) setAuthState("signin"); });
    // 監聽登入/登出 . OAuth redirect 回來時 detectSessionInUrl 會觸發 SIGNED_IN
    const sub = window.bpAuth.onAuthStateChange(function (event, session) {
      resolve(session && session.user ? session.user : null);
    });
    return function () {
      mounted = false;
      // cleanup unsubscribe (避免 memory leak)
      try {
        if (sub && sub.data && sub.data.subscription && typeof sub.data.subscription.unsubscribe === "function") {
          sub.data.subscription.unsubscribe();
        }
      } catch (e) {}
    };
  }, []);

  if (authState === "loading") {
    return <div className="admin-shell"><div className="admin-loading">驗證身分中…</div></div>;
  }
  if (authState === "signin") return <AdminSignInGate />;
  if (authState === "forbidden") return <AdminForbidden />;
  return <AdminApp />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AdminAuthWrapper />);
