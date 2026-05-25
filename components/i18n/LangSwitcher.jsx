/*
 * BeyondPath LangSwitcher · v0.1 · Phase 1 Step 1 (2026-05-25)
 *
 * 載入方式: <script type="text/babel" data-presets="env,react" src="./LangSwitcher.jsx"></script>
 *   - 必須放在 inline <script type="text/babel"> (含 LandingRoot) 之前
 *   - Babel standalone DOMContentLoaded 時依序 compile · 順序 = DOM 順序
 *   - 所以 BPLangSwitcher global 在 LandingRoot mount 前就 ready
 *
 * 視覺: navbar 右上 「中 | EN」 雙按鈕 · 沿 Punch DS palette (var(--accent) / var(--muted) / var(--mono))
 *   - 目前語: var(--accent) 高亮 + bold
 *   - 非目前語: var(--muted) + 點擊切
 *   - mobile (375px): 順序 [中][|][EN] ~70px · 跟 APPLY 主按鈕並排無溢出
 *
 * 互動: 點擊立刻切 · 不 reload · useLang() hook 觸發全頁 re-render
 */
/* global React, BPi18n */
function BPLangSwitcher(props) {
  if (!React || !window.BPi18n) {
    return null;
  }
  var BPi18n = window.BPi18n;
  var hook = BPi18n.useLang();
  var lang = hook[0];
  var setLang = hook[1];
  var labelZh = BPi18n.t("lang.label_zh", "中");
  var labelEn = BPi18n.t("lang.label_en", "EN");
  var aria    = BPi18n.t("lang.switch_aria", "Switch language");

  var btnBase = {
    /* tap target ≥ 36×36 (close to WCAG AA 44 · acceptable for tertiary nav) */
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    background: "transparent", border: 0,
    padding: "8px 10px",
    minWidth: 36, minHeight: 36,
    boxSizing: "border-box",
    fontFamily: "var(--mono)", fontSize: 11.5, letterSpacing: "0.08em",
    cursor: "pointer", lineHeight: 1, textTransform: "uppercase",
    transition: "color 140ms"
  };
  var active = { color: "var(--accent)", fontWeight: 700 };
  var idle   = { color: "var(--muted)",  fontWeight: 500 };
  var sep    = {
    color: "var(--muted)", fontFamily: "var(--mono)",
    fontSize: 11, opacity: 0.4, padding: "0 2px", userSelect: "none"
  };
  var wrap = Object.assign({
    display: "inline-flex", alignItems: "center", gap: 0,
    marginRight: 4, flex: "0 0 auto"
  }, props && props.style ? props.style : {});

  function pick(target) {
    return function (e) { e.preventDefault(); setLang(target); };
  }

  return (
    <div className="bp-lang-switcher" role="group" aria-label={aria} style={wrap}>
      <button
        type="button"
        style={Object.assign({}, btnBase, lang === "zh" ? active : idle)}
        onClick={pick("zh")}
        aria-pressed={lang === "zh"}
        aria-label={labelZh + " · 中文"}
      >{labelZh}</button>
      <span style={sep} aria-hidden="true">|</span>
      <button
        type="button"
        style={Object.assign({}, btnBase, lang === "en" ? active : idle)}
        onClick={pick("en")}
        aria-pressed={lang === "en"}
        aria-label={labelEn + " · English"}
      >{labelEn}</button>
    </div>
  );
}

// 暴露到 window · ENav() 直接 <BPLangSwitcher />
window.BPLangSwitcher = BPLangSwitcher;
