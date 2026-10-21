/* Light and dark theme. Loaded synchronously in <head> on every page so the theme is set before first paint.
   The pages use the palette through CSS variables defined here; the dark values are applied when
   <html data-theme="dark">. The choice is kept in localStorage ('qag-theme'); without one the system setting is followed. */
(function () {
  var KEY = 'qag-theme', root = document.documentElement, mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function stored() { try { var t = localStorage.getItem(KEY); return t === 'dark' || t === 'light' ? t : null; } catch (e) { return null; } }
  function apply(t) { root.setAttribute('data-theme', t); root.style.colorScheme = t; }
  apply(stored() || (mq && mq.matches ? 'dark' : 'light'));
  if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { if (!stored()) apply(e.matches ? 'dark' : 'light'); });

  var css = [
    ':root{--bg:#f3f5f4;--bg-90:rgba(243,245,244,0.9);--surface:#fff;--surface-2:#f8faf9;--surface-3:#eef2f0;--tint:#f3f9f6;',
    '--line:#dbe2df;--line-soft:#e8edeb;--line-2:#c3cdc9;--dots:#b3bfba;',
    '--ink:#17201d;--ink-2:#4a5652;--ink-3:#626d69;--ink-4:#7c8783;--on-ink:#fff;',
    '--accent-ink:oklch(0.52 0.11 170);--accent-ink-2:oklch(0.42 0.11 170);--danger-ink:oklch(0.55 0.2 25);--warn-ink:oklch(0.6 0.13 75)}',
    ':root[data-theme=dark]{--bg:#0b100f;--bg-90:rgba(11,16,15,0.9);--surface:#121917;--surface-2:#171f1c;--surface-3:#1c2522;--tint:#152220;',
    '--line:#26312e;--line-soft:#1f2926;--line-2:#34413d;--dots:#3f4d49;',
    '--ink:#e6efeb;--ink-2:#b4c2bc;--ink-3:#8f9e98;--ink-4:#7d8c86;--on-ink:#0b100f;',
    '--accent-ink:oklch(0.78 0.11 170);--accent-ink-2:oklch(0.86 0.1 170);--danger-ink:oklch(0.76 0.16 25);--warn-ink:oklch(0.8 0.13 75)}',
    'html{background:var(--bg)}',
    ':root[data-theme=dark] img[src*="console/"]{filter:brightness(0.9)}',
    ':root[data-theme=dark] .rs-pill{border-color:var(--line)}',
    '.rs-theme{display:inline-grid;place-items:center;width:36px;height:36px;padding:0;border:1px solid var(--line-2);border-radius:999px;background:var(--surface);color:var(--ink-2);cursor:pointer;flex:none;transition:color .2s,border-color .2s}',
    '.rs-theme:hover{color:var(--ink);border-color:var(--ink)}',
    '.rs-theme svg{display:block}.rs-theme .rs-moon{display:none}',
    ':root[data-theme=dark] .rs-theme .rs-sun{display:none}:root[data-theme=dark] .rs-theme .rs-moon{display:block}',
    '@media (max-width:640px){.rs-theme{width:30px;height:30px}.rs-actions{gap:6px !important}.rs-mcp-t,.rs-mcp .rs-caret{display:none}.rs-mcp{padding:6px 8px !important}}'
  ].join('');
  var style = document.createElement('style'); style.id = 'qag-theme'; style.textContent = css;
  (document.head || root).appendChild(style);

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-theme-toggle]'); if (!b) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next); try { localStorage.setItem(KEY, next); } catch (err) {}
  });
})();
