/*
 * BeyondPath i18n · v0.1 · Phase 1 Step 1 (2026-05-25)
 *
 * 純 JS、無外部依賴、無 ES module（landing.html 用 Babel standalone、走 window-attached pattern）
 *
 * 載入順序（在 landing.html <head> 或 <body> 早段）:
 *   1. components/i18n/index.js          (本檔 · 建 window.BPi18n)
 *   2. components/i18n/dict.zh.js        (掛 BPi18n.dicts.zh)
 *   3. components/i18n/dict.en.js        (掛 BPi18n.dicts.en)
 *   4. React + ReactDOM + Babel standalone
 *   5. components/i18n/LangSwitcher.jsx  (data-presets="env,react" · 掛 window.BPLangSwitcher)
 *
 * Public API:
 *   BPi18n.t(key, fallback?)        - 取翻譯 · key 形如 "nav.cta_join_beta"
 *   BPi18n.getLang()                - 'en' | 'zh'
 *   BPi18n.setLang(lang)            - 切語 · 不 reload · 觸發 i18n:change event
 *   BPi18n.detectLang()             - 偵測初始語（URL > localStorage > navigator）
 *   BPi18n.useLang()                - React hook · return [lang, setLang]（LangSwitcher.jsx 內用）
 *
 * Event:
 *   document 上 dispatch CustomEvent('i18n:change', { detail: { lang } })
 */

(function (global) {
  'use strict';

  var LS_KEY = 'beyondpath_lang';
  var DEFAULT_LANG = 'zh';
  var SUPPORTED = ['zh', 'en'];

  // 內部狀態
  var currentLang = null;

  function isSupported(lang) {
    return SUPPORTED.indexOf(lang) >= 0;
  }

  function normalizeLang(raw) {
    if (!raw) return null;
    var lower = String(raw).toLowerCase();
    if (lower.indexOf('zh') === 0) return 'zh';
    if (lower.indexOf('en') === 0) return 'en';
    return null;
  }

  function getFromURL() {
    try {
      var params = new URLSearchParams(window.location.search);
      var v = params.get('lang');
      if (!v) return null;
      var norm = normalizeLang(v);
      return isSupported(norm) ? norm : null;
    } catch (e) { return null; }
  }

  function getFromLS() {
    try {
      var v = window.localStorage.getItem(LS_KEY);
      return isSupported(v) ? v : null;
    } catch (e) { return null; }
  }

  function getFromNavigator() {
    try {
      var langs = (navigator.languages && navigator.languages.length)
        ? navigator.languages
        : [navigator.language || navigator.userLanguage || ''];
      for (var i = 0; i < langs.length; i++) {
        var norm = normalizeLang(langs[i]);
        if (norm) return norm;
      }
    } catch (e) { /* noop */ }
    return null;
  }

  function detectLang() {
    return getFromURL() || getFromLS() || getFromNavigator() || DEFAULT_LANG;
  }

  function getLang() {
    if (currentLang) return currentLang;
    currentLang = detectLang();
    return currentLang;
  }

  function setLang(lang) {
    var next = isSupported(lang) ? lang : DEFAULT_LANG;
    if (next === currentLang) return;
    currentLang = next;
    // 寫 localStorage
    try { window.localStorage.setItem(LS_KEY, next); } catch (e) { /* private mode */ }
    // 更新 URL ?lang= (不 reload)
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('lang', next);
      window.history.replaceState({}, '', url.toString());
    } catch (e) { /* noop */ }
    // 同步 <html lang="">
    try { document.documentElement.setAttribute('lang', next === 'en' ? 'en' : 'zh-Hant'); } catch (e) { /* noop */ }
    // 廣播 event
    try {
      document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang: next } }));
    } catch (e) {
      // IE11 fallback (不太可能用到、但保險)
      var ev = document.createEvent('CustomEvent');
      ev.initCustomEvent('i18n:change', true, true, { lang: next });
      document.dispatchEvent(ev);
    }
  }

  /**
   * t(key, fallback?)
   *   - key 走 dot-path: "nav.cta_join_beta"
   *   - 找不到時：先 fallback 參數 → 再回中文字典同 key → 再回 key 字面
   *   - 英文版若為 placeholder "[EN] ..." 也直接 return（讓 Edward 看得到哪些待翻）
   */
  function t(key, fallback) {
    if (!key) return fallback || '';
    var lang = getLang();
    var dict = BPi18n.dicts && BPi18n.dicts[lang];
    var zh = BPi18n.dicts && BPi18n.dicts.zh;
    var value = lookup(dict, key);
    if (value == null && lang !== 'zh') {
      // 英文找不到、退回中文 (避免破版)
      value = lookup(zh, key);
    }
    if (value == null) value = fallback != null ? fallback : key;
    return value;
  }

  function lookup(obj, key) {
    if (!obj) return null;
    var parts = key.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== 'object') return null;
      cur = cur[parts[i]];
    }
    return cur == null ? null : cur;
  }

  // React hook (在 LangSwitcher.jsx 與其他 JSX component 內可用)
  function useLang() {
    // 注意：必須在 React 載入後才能呼叫
    var R = global.React;
    if (!R) throw new Error('[BPi18n.useLang] React not loaded');
    var state = R.useState(getLang());
    var lang = state[0];
    var setState = state[1];

    R.useEffect(function () {
      function handler(e) {
        setState(e && e.detail ? e.detail.lang : getLang());
      }
      document.addEventListener('i18n:change', handler);
      return function () { document.removeEventListener('i18n:change', handler); };
    }, []);

    return [lang, setLang];
  }

  // 初始化：第一次讀就 lock 並同步 <html lang>
  function init() {
    var lang = getLang();
    try { document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-Hant'); } catch (e) { /* noop */ }
  }

  var BPi18n = {
    t: t,
    getLang: getLang,
    setLang: setLang,
    detectLang: detectLang,
    useLang: useLang,
    dicts: {}, // dict.zh.js / dict.en.js 會掛上來
    _init: init,
    _version: '0.1.0'
  };

  global.BPi18n = BPi18n;

  // DOM ready 後 init (lang attr sync)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
