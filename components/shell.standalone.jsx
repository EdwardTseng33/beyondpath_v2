// BeyondPath · BP_AppShell — 全局 role switcher（Client ⇄ Worker）
// 模擬真實產品：同一個 header，切換 role 整個 body 換掉

const { useState: uSS, useEffect: uES, useRef: uRS } = React;
const BP_ROLE_KEY = "bp-active-role";
const BP_VERSION = "v1.0.0";

const BP_USERS = {
  client: { name: "Edward", email: "edward@lumine.tw", img: window.__resources.avEdward, color: "#4285F4" },
  worker: { name: "Edward", email: "edward@beyondpath.io", img: window.__resources.avEdward, color: "#0F9D58" },
};

function BP_AppShell() {
  const [role, setRole] = uSS(() => {
    try { return localStorage.getItem(BP_ROLE_KEY) || "client"; } catch { return "client"; }
  });
  const [menuOpen, setMenuOpen] = uSS(false);
  const menuRef = uRS(null);
  uES(() => { try { localStorage.setItem(BP_ROLE_KEY, role); } catch {} }, [role]);
  uES(() => {
    if (!menuOpen) return;
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);
  const u = BP_USERS[role];
  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      if (window.bpAuth && window.bpAuth.signOut) {
        await window.bpAuth.signOut();
      }
    } catch (e) {
      console.warn("[BP] signOut error", e);
    }
    try {
      localStorage.removeItem(BP_ROLE_KEY);
      localStorage.removeItem("bp-worker-onboarding");
      localStorage.removeItem("bp-journey-step");
      sessionStorage.removeItem("bp-disc-closed");
    } catch (e) {}
    window.location.href = "landing.html";
  };

  return (
    <div className="bp-shell">
      <div className="bp-shell-top">
        <a
          href="landing.html"
          className="bp-shell-brand"
          style={{ textDecoration: "none", cursor: "pointer" }}
          aria-label="BeyondPath · back to home"
          title="Back to home"
        >
          <span className="bp-shell-mark"></span>
          Beyond<span className="le-acc">Path</span>
          <small>{role === "client" ? "CLIENT · INTAKE OS" : "WORKER · CONSOLE"}</small>
        </a>

        <div className="bp-shell-meta" ref={menuRef}>
          <span className="bp-shell-ver">{BP_VERSION}</span>
          <button
            className={"bp-shell-acct " + (menuOpen ? "open" : "")}
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title={u.email}
          >
            <span className="bp-shell-avatar"><img src={u.img} alt={u.name} /></span>
            <span className="bp-shell-name">
              <span className="n">{u.name}</span>
              <span className="e">{u.email}</span>
            </span>
            <svg className="caret" viewBox="0 0 24 24" width="12" height="12"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {menuOpen && (
            <div className="bp-shell-menu" role="menu">
              <div className="bp-shell-menu-head">
                <span className="bp-shell-avatar lg"><img src={u.img} alt={u.name} /></span>
                <div>
                  <div className="n">{u.name}</div>
                  <div className="e">{u.email}</div>
                </div>
              </div>

              <div className="bp-shell-menu-roles">
                <div className="bp-shell-menu-roles-lbl">身分切換 · ROLE</div>
                <div className="bp-shell-menu-roles-grid">
                  <button
                    className={"bp-shell-menu-role " + (role === "client" ? "active" : "")}
                    onClick={() => { setRole("client"); setMenuOpen(false); }}
                  >
                    <span className="ic">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 18l5-12h6l5 12M9 18h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="11" r="2.2" fill="currentColor"/></svg>
                    </span>
                    <div className="lbl">
                      <div className="en">Client</div>
                      <div className="zh">我要發案</div>
                    </div>
                    {role === "client" && <span className="chk">✓</span>}
                  </button>
                  <button
                    className={"bp-shell-menu-role " + (role === "worker" ? "active" : "")}
                    onClick={() => { try { localStorage.removeItem("bp-worker-onboarding"); } catch {} setRole("worker"); setMenuOpen(false); }}
                  >
                    <span className="ic">
                      <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M16.5 4.5l1.5 1.5-3 3-1.5-1.5z" fill="currentColor"/></svg>
                    </span>
                    <div className="lbl">
                      <div className="en">Worker</div>
                      <div className="zh">我要接案</div>
                    </div>
                    {role === "worker" && <span className="chk">✓</span>}
                  </button>
                </div>
              </div>
              <div className="bp-shell-menu-sep"></div>

              <button className="bp-shell-menu-item" onClick={() => setMenuOpen(false)}>
                <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                帳戶設定 <span className="kb">⌘ ,</span>
              </button>
              <button className="bp-shell-menu-item" onClick={() => setMenuOpen(false)}>
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M12 8v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                通知與訂閱
              </button>
              <button className="bp-shell-menu-item" onClick={() => setMenuOpen(false)}>
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                我的方案 <span className="kb">Pro</span>
              </button>
              <div className="bp-shell-menu-sep"></div>
              <button className="bp-shell-menu-item" onClick={() => setMenuOpen(false)}>
                <svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M9.5 9a2.5 2.5 0 015 0c0 1.7-2.5 2-2.5 4M12 17.5h.01" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                說明與支援
              </button>
              <button className="bp-shell-menu-item danger" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4M16 17l5-5-5-5M21 12H9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                登出回到產品頁
              </button>
              <div className="bp-shell-menu-foot">
                BeyondPath <b>{BP_VERSION}</b> · session <b>0xC3F4</b>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bp-shell-body">
        {role === "client" && <window.BP_Journey inShell={true} />}
        {role === "worker" && <window.BP_WorkerRoot inShell={true} />}
      </div>
    </div>
  );
}

window.BP_AppShell = BP_AppShell;
