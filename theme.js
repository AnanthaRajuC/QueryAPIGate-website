/* Light and dark theme. Loaded synchronously in <head> on every page so the theme is set before first paint.
   The pages use the palette through CSS variables defined here; the dark values are applied when
   <html data-theme="dark">. The choice is kept in localStorage ('qag-theme'); without one the site is light. */
(function () {
  var KEY = 'qag-theme', root = document.documentElement;
  function stored() { try { var t = localStorage.getItem(KEY); return t === 'dark' || t === 'light' ? t : null; } catch (e) { return null; } }
  function apply(t) { root.setAttribute('data-theme', t); root.style.colorScheme = t; }
  apply(stored() || 'light');   // light unless the reader has chosen dark with the toggle

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
    '@media (max-width:640px){.rs-theme{width:30px;height:30px}.rs-actions{gap:6px !important}.rs-mcp-t,.rs-mcp .rs-caret{display:none}.rs-mcp{padding:6px 8px !important}}',
    ':where(p,li,td,dd,summary,figcaption) code:not(pre code),code.qx{font-family:\'JetBrains Mono\',monospace;font-size:0.88em;background:oklch(0.52 0.11 170 / 0.08);border:1px solid oklch(0.52 0.11 170 / 0.16);border-radius:5px;padding:0.05em 0.35em;-webkit-box-decoration-break:clone;box-decoration-break:clone}',
    '.rs-progress{position:fixed;left:0;top:0;height:4px;width:100%;z-index:40;pointer-events:none;background:var(--accent-ink);transform-origin:0 50%;transform:scaleX(0)}',
    '.rs-top{position:fixed;right:24px;bottom:24px;z-index:40;width:46px;height:46px;padding:0;border:0;border-radius:50%;background:var(--surface);color:var(--ink);cursor:pointer;display:grid;place-items:center;box-shadow:0 10px 28px -12px rgba(16,32,27,0.45);opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .25s,transform .25s,visibility .25s}',
    '.rs-top.on{opacity:1;visibility:visible;transform:none}.rs-top:hover{color:var(--accent-ink)}.rs-top:focus-visible{outline:2px solid var(--accent-ink);outline-offset:3px}',
    '.rs-top svg{grid-area:1/1;display:block}.rs-top .rs-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}',
    '.rs-top .rs-ring circle{fill:none;stroke-width:3}.rs-top .rs-ring .bg{stroke:var(--line)}.rs-top .rs-ring .fg{stroke:var(--accent-ink);stroke-linecap:round}',
    '@media (max-width:640px){.rs-top{right:16px;bottom:calc(16px + env(safe-area-inset-bottom));width:42px;height:42px}}',
    '@media (prefers-reduced-motion:reduce){.rs-top{transition:none}}',
    '.uc-back{display:inline-grid;place-items:center;width:24px;height:24px;margin-right:2px;color:var(--ink-2);text-decoration:none;flex:none;transition:color .2s,transform .2s}.uc-back:hover{color:var(--accent-ink);transform:translateX(-2px);text-decoration:none}.uc-back svg{display:block}'
  ].join('');
  var style = document.createElement('style'); style.id = 'qag-theme'; style.textContent = css;
  (document.head || root).appendChild(style);

  // A thin bar along the top edge shows how far down the page the reader is.
  var bar, pending = false;
  var top, ring, C = 2 * Math.PI * 21;
  function progress() {
    pending = false;
    var doc = document.documentElement, max = doc.scrollHeight - window.innerHeight;
    var f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = 'scaleX(' + f + ')';
    if (top) { ring.style.strokeDashoffset = String(C * (1 - f)); top.classList.toggle('on', window.scrollY > window.innerHeight * 0.9); }
  }
  function tick() { if (!pending) { pending = true; requestAnimationFrame(progress); } }
  function mount() {
    if (bar || !document.body) return;
    bar = document.createElement('div'); bar.className = 'rs-progress'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
    // Back to top, bottom right: shown after the first screen; its ring fills as the page is read.
    top = document.createElement('button'); top.type = 'button'; top.className = 'rs-top'; top.setAttribute('aria-label', 'Back to top'); top.title = 'Back to top';
    top.innerHTML = '<svg class="rs-ring" viewBox="0 0 46 46" aria-hidden="true"><circle class="bg" cx="23" cy="23" r="21"/><circle class="fg" cx="23" cy="23" r="21" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/></svg>'
      + '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    ring = top.querySelector('.fg');
    top.addEventListener('click', function () {
      var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
      var t = document.querySelector('a[href], button, input'); if (t && t.focus) try { t.focus({ preventScroll: true }); } catch (e) {}
    });
    document.body.appendChild(top);
    window.addEventListener('scroll', tick, { passive: true }); window.addEventListener('resize', tick); progress();
    var tries = 0, t = setInterval(function () { progress(); if (++tries > 20) clearInterval(t); }, 250);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-theme-toggle]'); if (!b) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next); try { localStorage.setItem(KEY, next); } catch (err) {}
  });
})();
