/* ============================================================
THEME — runs in <head>, before first paint.

Why <head> and not the bottom of <body> like app.js: anything at the end of
<body> runs AFTER the browser has painted once. A dark-mode user would see a
light flash on every page load (FOUC — flash of unstyled content). This file is
tiny and render-blocking on purpose.

Wrapped in an IIFE so nothing leaks into the global scope except the one
deliberate export, window.billycrmTheme.
============================================================ */
(function () {
  const KEY = 'billycrm-theme';                    // 'system' | 'light' | 'dark'
  const root = document.documentElement;

  function apply(choice) {
    if (choice === 'light' || choice === 'dark') {
      root.style.colorScheme = choice;              // inline style beats :root
    } else {
      root.style.removeProperty('color-scheme');    // back to CSS default: light dark
      choice = 'system';
    }
    root.dataset.themeChoice = choice;              // handy in DevTools / for Pendo
  }

  let saved = 'system';
  try {
    saved = localStorage.getItem(KEY) || 'system';
  } catch (e) {
    console.warn('[theme] localStorage unavailable, using system theme', e);
  }
  apply(saved);

  window.billycrmTheme = {
    get() {
      return root.dataset.themeChoice || 'system';
    },
    set(choice) {
      try { localStorage.setItem(KEY, choice); } catch (e) {}
      apply(choice);
    },
    // What's actually on screen right now. Differs from get() only when 'system'.
    resolved() {
      const c = this.get();
      if (c !== 'system') return c;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
  };
})();
