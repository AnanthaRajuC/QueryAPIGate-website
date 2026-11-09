/* Light and dark theme. Loaded synchronously in <head> on every page so the theme is set before first paint.
   The pages use the palette through CSS variables defined here; the dark values are applied when
   <html data-theme="dark">. The choice is kept in localStorage ('qag-theme'); without one the site is light. */
(function () {
  var KEY = 'qag-theme', root = document.documentElement;
  // where this script is, so links from any page (including use-cases/) reach the site's root
  var SITE_ROOT = (function () { try { return new URL('.', document.currentScript.src).href; } catch (e) { return ''; } })();
  function stored() { try { var t = localStorage.getItem(KEY); return t === 'dark' || t === 'light' ? t : null; } catch (e) { return null; } }
  function apply(t) { root.setAttribute('data-theme', t); root.style.colorScheme = t; }
  apply(stored() || 'light');   // light unless the reader has chosen dark with the toggle

  // A small outline icon as a CSS mask, so it takes the text's colour in either theme.
  function ico(d) { return 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>') + '")'; }
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
    '.rs-theme{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-width:28px;height:28px;padding:0;border:0;background:none;color:var(--ink-2);cursor:pointer;flex:none;font:inherit;transition:color .2s}',
    '.rs-theme:hover{color:var(--accent-ink)}.rs-theme:focus-visible{outline:2px solid var(--accent-ink);outline-offset:3px;border-radius:6px}.rs-theme-t{display:none}',
    '@media (max-width:1180px){.rs-nav .rs-theme{width:100%;justify-content:flex-start;height:auto;padding:11px 4px;font-size:16px;color:var(--ink)}.rs-nav .rs-theme-t{display:inline}}',
    '.rs-theme svg{display:block}.rs-theme .rs-moon{display:none}',
    ':root[data-theme=dark] .rs-theme .rs-sun{display:none}:root[data-theme=dark] .rs-theme .rs-moon{display:block}',
    '@media (max-width:640px){.rs-actions{gap:6px !important}.rs-mcp-t,.rs-mcp .rs-caret{display:none}.rs-mcp{padding:6px 8px !important}}',
    ':where(p,li,td,dd,summary,figcaption) code:not(pre code),code.qx{font-family:\'JetBrains Mono\',monospace;font-size:0.88em;background:oklch(0.52 0.11 170 / 0.08);border:1px solid oklch(0.52 0.11 170 / 0.16);border-radius:5px;padding:0.05em 0.35em;-webkit-box-decoration-break:clone;box-decoration-break:clone}',
    '.rs-mega-foot{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 22px;padding-top:8px;margin-top:4px;border-top:1px solid var(--line-soft)}.rs-mega-foot .rs-mega-more{border-top:0;padding-top:0;margin-top:0}.rs-mega-foot .rs-mega-more:first-child{margin-right:auto}',
    '.rs-mega-inner .rs-mega-grid.rs-mega-grid5{grid-template-columns:repeat(4,minmax(0,1fr)) !important}',
    '.rs-mega-inner .rs-mega-grid.rs-mega-grid3{grid-template-columns:repeat(3,minmax(0,1fr)) !important}',
    '@media (max-width:1180px){.rs-dd.rs-mega-deploy .rs-dd-panel{display:none !important}}',
    // Guides menu: reading paths, topics and a "new here" card, with the architecture chips in the footer row.
    '.rs-gm{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,0.85fr) minmax(0,0.9fr);gap:28px}',
    '.rs-gm-col{display:grid;gap:2px;align-content:start}.rs-gm-h{font-family:\'JetBrains Mono\',monospace;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-3);margin:0 0 6px 10px}',
    '.rs-gm-path{display:grid;grid-template-columns:28px minmax(0,1fr);gap:12px;align-items:start;padding:8px 10px;border-radius:9px;color:var(--ink);text-decoration:none;transition:background .15s}.rs-gm-path:hover{background:var(--bg);color:var(--ink);text-decoration:none}',
    '.rs-gm-path>span:last-child{display:grid;gap:1px;min-width:0}.rs-gm-path b{font-size:14px;font-weight:600}.rs-gm-path>span>span{font-size:12.5px;color:var(--ink-2);line-height:1.4}.rs-gm-path small{font-family:\'JetBrains Mono\',monospace;font-size:10.5px;color:var(--ink-3);margin-top:2px}',
    '.rs-gm-topics a.rs-doc{display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:9px;font-size:13.5px;font-weight:500;color:var(--ink);text-decoration:none;transition:background .15s}.rs-gm-topics a.rs-doc:hover{background:var(--bg);color:var(--ink);text-decoration:none}',
    '.rs-gm-t{flex:1}.rs-gm-topics em{font-style:normal;font-family:\'JetBrains Mono\',monospace;font-size:11px;color:var(--ink-3);background:var(--surface-3);border-radius:999px;padding:1px 8px}',
    '.rs-gm-new{display:grid;gap:8px;align-content:start;align-self:start;padding:20px;border-radius:14px;background:#10201b;color:#e6efeb;position:relative;overflow:hidden}',
    '.rs-gm-new::before{content:\'\';position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 0% 0%,oklch(0.62 0.13 170 / 0.28),transparent 70%);pointer-events:none}.rs-gm-new>*{position:relative}',
    '.rs-gm-new small{font-family:\'JetBrains Mono\',monospace;font-size:10.5px;letter-spacing:0.04em;color:oklch(0.8 0.11 170)}.rs-gm-new b{font-family:\'Schibsted Grotesk\',sans-serif;font-size:19px;font-weight:700;line-height:1.2;color:#fff}.rs-gm-new>span{font-size:13px;line-height:1.5;color:#9fb3ac}',
    '.rs-gm-go{justify-self:start;margin-top:6px;font-size:13px;font-weight:600;color:#10201b;background:#e6efeb;border-radius:999px;padding:7px 13px;text-decoration:none;transition:background .2s}.rs-gm-go:hover{background:#fff;color:#10201b;text-decoration:none}',
    '.rs-gm-alt{font-size:12.5px;font-weight:600;color:oklch(0.8 0.11 170);text-decoration:none}.rs-gm-alt:hover{color:#e6efeb;text-decoration:none}',
    '.rs-gm-foot{align-items:center;gap:8px 14px}.rs-gm-fh{font-family:\'JetBrains Mono\',monospace;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-3)}.rs-gm-foot .rs-mega-arch{grid-column:auto}',
    '@media (max-width:1400px){.rs-gm{grid-template-columns:minmax(0,1.3fr) minmax(0,0.9fr) minmax(0,0.9fr);gap:20px}}',
    '.rs-progress{position:fixed;left:0;top:0;height:4px;width:100%;z-index:40;pointer-events:none;background:var(--accent-ink);transform-origin:0 50%;transform:scaleX(0)}',
    '.rs-top{position:fixed;right:24px;bottom:24px;z-index:40;width:46px;height:46px;padding:0;border:0;border-radius:50%;background:var(--surface);color:var(--ink);cursor:pointer;display:grid;place-items:center;box-shadow:0 10px 28px -12px rgba(16,32,27,0.45);opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .25s,transform .25s,visibility .25s}',
    '.rs-top.on{opacity:1;visibility:visible;transform:none}.rs-top:hover{color:var(--accent-ink)}.rs-top:focus-visible{outline:2px solid var(--accent-ink);outline-offset:3px}',
    '.rs-top svg{grid-area:1/1;display:block}.rs-top .rs-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}',
    '.rs-top .rs-ring circle{fill:none;stroke-width:3}.rs-top .rs-ring .bg{stroke:var(--line)}.rs-top .rs-ring .fg{stroke:var(--accent-ink);stroke-linecap:round}',
    '@media (max-width:640px){.rs-top{right:16px;bottom:calc(16px + env(safe-area-inset-bottom));width:42px;height:42px}}',
    '@media (prefers-reduced-motion:reduce){.rs-top{transition:none}}',
    '.rs-pg{display:inline-flex;align-items:center;gap:6px;color:var(--ink-2);text-decoration:none;transition:color .2s}.rs-pg:hover,.rs-pg[aria-current=page]{color:var(--accent-ink);text-decoration:none}',
    '.rs-pg-ico{display:block;overflow:visible}.rs-pg-t{display:none}',
    '.rs-pg-caret{animation:rs-pg-blink 1.1s steps(1) infinite}@keyframes rs-pg-blink{50%{opacity:0}}',
    '.rs-pg-live{transform-box:fill-box;transform-origin:center;animation:rs-pg-pulse 2s ease-in-out infinite}@keyframes rs-pg-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.35);opacity:.55}}',
    '.rs-pg:hover .rs-pg-ico{animation:rs-pg-nudge .5s ease}@keyframes rs-pg-nudge{40%{transform:translateY(-2px)}}',
    '@media (max-width:1180px){.rs-pg-t{display:inline}.rs-nav a.rs-pg{display:flex !important;align-items:center;gap:10px}}',
    '@media (prefers-reduced-motion:reduce){.rs-pg-caret,.rs-pg-live,.rs-pg:hover .rs-pg-ico{animation:none}}',
    '.uc-back{display:inline-grid;place-items:center;width:24px;height:24px;margin-right:2px;color:var(--ink-2);text-decoration:none;flex:none;transition:color .2s,transform .2s}.uc-back:hover{color:var(--accent-ink);transform:translateX(-2px);text-decoration:none}.uc-back svg{display:block}',
    // The top nav spans the whole bar on desktop: the links centred between the brand and the icons. The menus keep the
    // width of the page's content, centred, rather than stretching with the bar.
    '@media (min-width:1181px){.rs-navbar{max-width:none !important;padding-left:clamp(24px,3vw,56px) !important;padding-right:clamp(24px,3vw,56px) !important}',
    '.rs-nav{flex:1 1 auto}.rs-nav>:first-child{margin-left:auto}.rs-nav>.rs-pg{margin-left:auto}',
    '.rs-mega .rs-dd-panel{left:max(24px,calc(50% - 620px)) !important;right:max(24px,calc(50% - 620px)) !important}}',
    // The section rail stays under the sticky nav (z-index 20), so an open menu is never drawn under it.
    '.rail{z-index:19 !important}',
    // The MCP menu: the pages as cards, the agent guides beside them, and the clients that connect along the bottom.
    // The card and link styles are the other menus'; only the layout is its own.
    '.rs-mcp-body{display:grid;grid-template-columns:minmax(0,2.2fr) minmax(0,1fr);gap:28px}',
    '.rs-mcp-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;align-content:start}',
    '.rs-mcp-side{display:grid;gap:2px;align-content:start;padding-left:28px;border-left:1px solid var(--line-soft)}',
    '.rs-mcp-side small{font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink-3);margin:0 0 6px 10px}',
    '.rs-mcp-side .rs-mega-more{margin:8px 0 0 10px}',
    '.rs-mcp-side a.rs-doc{display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:9px;font-size:13.5px;font-weight:500;color:var(--ink);text-decoration:none;transition:background .15s}',
    '.rs-mcp-side a.rs-doc:hover{background:var(--bg);color:var(--ink);text-decoration:none}',
    '.rs-mcp-side .rs-doc-ico{flex:none;width:28px;height:28px;border-radius:7px;background:oklch(0.52 0.11 170 / 0.09);position:relative}',
    '.rs-mcp-side .rs-doc-ico::after{content:"";position:absolute;inset:7px;background:var(--accent-ink);-webkit-mask:var(--ico) center/contain no-repeat;mask:var(--ico) center/contain no-repeat}',
    '.rs-mcp-foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding-top:14px;border-top:1px solid var(--line-soft);font-size:12.5px;color:var(--ink-3)}',
    '.rs-mcp-foot>span:first-child{margin-right:4px}',
    '.rs-mcp-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid var(--line);border-radius:999px;background:var(--surface);font-size:12.5px;font-weight:500;color:var(--ink-2)}',
    '.rs-mcp-chip i{flex:none;width:13px;height:13px;background:currentColor;-webkit-mask:var(--m) center/contain no-repeat;mask:var(--m) center/contain no-repeat}',
    '@media (max-width:1400px){.rs-mcp-body{grid-template-columns:minmax(0,1.9fr) minmax(0,1fr)}.rs-mcp-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    // The GitHub link: the repository's name over its latest release, stars and forks, as the documentation site shows
    // it. Between 1181 and 1519px, where the bar has no room for it, it keeps to the mark and the star count.
    '.rs-ghn{gap:9px !important;text-decoration:none !important;line-height:1.2}.rs-ghn:hover .rs-ghn-repo{color:var(--accent-ink)}',
    '.rs-ghn-txt{display:grid;gap:3px;min-width:0}',
    '.rs-ghn-repo{font-size:13px;font-weight:500;color:var(--ink);white-space:nowrap;transition:color .2s}',
    '.rs-ghn-facts{display:flex;align-items:center;gap:9px;min-height:14px;font-family:"JetBrains Mono",monospace;font-size:11.5px;color:var(--ink-3);white-space:nowrap}',
    '.rs-ghn-f{display:inline-flex;align-items:center;gap:3px}.rs-ghn-f:empty{display:none}',
    '.rs-ghn-f::before{content:"";flex:none;width:11px;height:11px;background:currentColor;-webkit-mask:var(--i) center/contain no-repeat;mask:var(--i) center/contain no-repeat}',
    '.rs-ghn-tag{--i:' + ico('<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1"/>') + '}',
    '.rs-ghn-star{--i:' + ico('<path d="M11.5 2.3a.5.5 0 0 1 1 0l2.3 4.7a2.1 2.1 0 0 0 1.6 1.2l5.2.7a.5.5 0 0 1 .3.9l-3.8 3.7a2.1 2.1 0 0 0-.6 1.9l.9 5.1a.5.5 0 0 1-.8.6l-4.6-2.4a2.1 2.1 0 0 0-2 0L6.4 21a.5.5 0 0 1-.8-.6l.9-5.1a2.1 2.1 0 0 0-.6-1.9L2.2 9.8a.5.5 0 0 1 .3-.9l5.2-.7a2.1 2.1 0 0 0 1.6-1.2z"/>') + '}',
    '.rs-ghn-fork{--i:' + ico('<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9M12 12v3"/>') + '}',
    '@media (min-width:1181px) and (max-width:1519px){.rs-ghn{gap:6px !important}.rs-ghn-repo,.rs-ghn-tag,.rs-ghn-fork{display:none !important}.rs-ghn-facts{min-height:0;font-size:12px}.rs-ghn-star::before{display:none}}',
    // "Use these docs with AI": a round button above Back to top (in its place until that appears) that opens how to
    // connect an AI tool to the documentation MCP server (tools/docs-mcp). Never printed.
    '.rs-ai{position:fixed;right:24px;bottom:24px;z-index:41;transition:transform .25s}.rs-ai.up{transform:translateY(-58px)}',
    '.rs-ai-btn{position:relative;width:46px;height:46px;padding:0;border:0;border-radius:50%;background:var(--surface);color:var(--ink);cursor:pointer;display:grid;place-items:center;box-shadow:0 10px 28px -12px rgba(16,32,27,0.45),0 0 0 1px var(--line)}',
    '.rs-ai-btn:hover,.rs-ai-btn[aria-expanded=true]{color:var(--accent-ink)}.rs-ai-btn:focus-visible{outline:2px solid var(--accent-ink);outline-offset:3px}.rs-ai-btn svg{display:block;grid-area:1/1}',
    // the book (the docs) and sparkles (AI) take turns, every 4 seconds; held still on hover, focus or while open, and
    // never moving for a reader who asks for reduced motion (then the book shows, with its AI badge)
    '.rs-ai-i1{animation:rs-ai-a 8s ease-in-out infinite}.rs-ai-i2{animation:rs-ai-b 8s ease-in-out infinite}',
    '@keyframes rs-ai-a{0%,42%{opacity:1;transform:none}50%,92%{opacity:0;transform:scale(.55) rotate(-25deg)}100%{opacity:1;transform:none}}',
    '@keyframes rs-ai-b{0%,42%{opacity:0;transform:scale(.55) rotate(25deg)}50%,92%{opacity:1;transform:none}100%{opacity:0;transform:scale(.55) rotate(25deg)}}',
    '.rs-ai-btn:hover svg,.rs-ai-btn:focus-visible svg,.rs-ai-btn[aria-expanded=true] svg{animation-play-state:paused}',
    // the Home page's checklist pill effect (.pill-beam): a streak of light travels around the border, a soft glow behind it
    '@property --rs-ai-beam{syntax:"<angle>";initial-value:0deg;inherits:false}',
    '.rs-ai-btn::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:2px;pointer-events:none;background:conic-gradient(from var(--rs-ai-beam),transparent 0deg 200deg,oklch(0.62 0.13 170 / 0.35) 270deg,oklch(0.86 0.14 170) 340deg,#fff 352deg,transparent 360deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);animation:rs-ai-beam 3.2s linear infinite}',
    '.rs-ai-btn::after{content:"";position:absolute;inset:-6px;border-radius:inherit;pointer-events:none;z-index:-1;background:conic-gradient(from var(--rs-ai-beam),transparent 0deg 260deg,oklch(0.62 0.13 170 / 0.55) 340deg,transparent 360deg);filter:blur(10px);animation:rs-ai-beam 3.2s linear infinite}',
    '.rs-ai-btn:hover::before,.rs-ai-btn:hover::after{animation-duration:1.6s}',
    '@keyframes rs-ai-beam{to{--rs-ai-beam:360deg}}',
    // the badge: white on the brand's near-black green (about 16:1), or near-black on its bright green in dark mode (about 6:1)
    '.rs-ai-badge{position:absolute;top:-5px;right:-7px;font:800 11px/1 "Instrument Sans",system-ui,sans-serif;letter-spacing:.03em;padding:3px 5px 3px;border-radius:999px;background:#10201b;color:#fff;box-shadow:0 0 0 2px var(--bg)}',
    ':root[data-theme=dark] .rs-ai-badge{background:#22a58c;color:#0b100f}',
    '.rs-ai-panel{box-sizing:border-box;position:absolute;right:0;bottom:calc(100% + 12px);width:min(370px,calc(100vw - 32px));display:grid;gap:12px;padding:16px;border-radius:14px;background:var(--surface);color:var(--ink);border:1px solid var(--line);box-shadow:0 24px 48px -20px rgba(16,32,27,0.45);font:14px/1.5 "Instrument Sans",system-ui,sans-serif;text-align:left}',
    '.rs-ai-panel::after{content:"";position:absolute;left:0;right:0;top:100%;height:14px}',
    '.rs-ai-panel[hidden]{display:none}.rs-ai-head{display:flex;align-items:center;gap:10px}.rs-ai-head b{font:700 15.5px/1.3 "Schibsted Grotesk",sans-serif;margin-right:auto}',
    '.rs-ai-x{border:0;background:none;color:var(--ink-3);cursor:pointer;font-size:20px;line-height:1;padding:2px 4px;border-radius:6px}.rs-ai-x:hover{color:var(--ink)}',
    '.rs-ai-panel p{margin:0;color:var(--ink-2);font-size:13.5px}.rs-ai-panel small{color:var(--ink-3);font-size:12.5px;line-height:1.45}.rs-ai-panel a{color:var(--accent-ink)}',
    '.rs-ai-tools{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}',
    '.rs-ai-tool{display:grid;justify-items:center;gap:5px;padding:9px 2px 7px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink) !important;cursor:pointer;font:inherit;text-decoration:none !important;transition:border-color .15s,background .15s}',
    '.rs-ai-tool:hover,.rs-ai-tool:focus-visible{border-color:var(--accent-ink);background:var(--bg);outline:none}.rs-ai-tool svg,.rs-ai-tool img{display:block;width:22px;height:22px}',
    '.rs-ai-tool span{font-size:11px;font-weight:600;line-height:1.2;color:var(--ink-2);text-align:center}',
    '.rs-ai-hint{min-height:2.9em;margin:0;font-size:12.5px !important;color:var(--ink-2) !important}',
    '.rs-ai-more{font-weight:600;font-size:13.5px}',
    '@media (max-width:640px){.rs-ai{right:16px;bottom:calc(16px + env(safe-area-inset-bottom))}.rs-ai.up{transform:translateY(-54px)}.rs-ai-btn{width:42px;height:42px}}',
    '@media (prefers-reduced-motion:reduce){.rs-ai{transition:none}.rs-ai-i1,.rs-ai-i2{animation:none}.rs-ai-i2{opacity:0}.rs-ai-btn::before,.rs-ai-btn::after{animation:none}.rs-ai-btn::before{background:oklch(0.62 0.13 170 / 0.6)}}',
    '@media print{.rs-ai{display:none !important}}',
  ].join('');
  var style = document.createElement('style'); style.id = 'qag-theme'; style.textContent = css;
  (document.head || root).appendChild(style);

  // A thin bar along the top edge shows how far down the page the reader is.
  var bar, pending = false;
  var top, ring, ai, C = 2 * Math.PI * 21;
  function progress() {
    pending = false;
    var doc = document.documentElement, max = doc.scrollHeight - window.innerHeight;
    var f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = 'scaleX(' + f + ')';
    if (top) { ring.style.strokeDashoffset = String(C * (1 - f)); top.classList.toggle('on', window.scrollY > window.innerHeight * 0.9); if (ai) ai.classList.toggle('up', top.classList.contains('on')); }
  }
  function tick() { if (!pending) { pending = true; requestAnimationFrame(progress); } }
  // The documentation MCP server, from any page: one button per AI tool, by its logo. Where the tool has an install link
  // (Cursor, VS Code, LM Studio: their documented formats), one click installs; for Claude it copies the address and
  // opens Connectors; for the rest it copies the command or config to run. Logos: Simple Icons (CC0), drawn in the text
  // colour; VS Code's is Microsoft's own icon, unaltered, in images/brands/ (its brand rules: "<action> in VS Code");
  // OpenAI asked for its logo to be withheld, so Codex gets a plain terminal icon.
  var DOCS_MCP = 'https://queryapigate-docs.queryapigate-docs-mcp.workers.dev/mcp';
  var LOGO = {
    claude: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>',
    cursor: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"/></svg>',
    lmstudio: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.025 0c3.492 0 5.237 0 6.571.68a6.24 6.24 0 0 1 2.725 2.724C24 4.738 24 6.484 24 9.975v4.05c0 3.492 0 5.237-.68 6.571a6.24 6.24 0 0 1-2.724 2.725c-1.334.679-3.08.679-6.571.679h-4.05c-3.492 0-5.237 0-6.571-.68A6.24 6.24 0 0 1 .68 20.597C0 19.262 0 17.516 0 14.025v-4.05c0-3.492 0-5.237.68-6.571A6.23 6.23 0 0 1 3.404.68C4.738 0 6.484 0 9.975 0zM7.688 16.313a1.313 1.313 0 0 0 0 2.625h11.625a1.313 1.313 0 0 0 0-2.625zm-3-3.75a1.313 1.313 0 0 0 0 2.624h11.625a1.313 1.313 0 0 0 0-2.624zm3-3.75a1.313 1.313 0 0 0 0 2.624h11.625a1.313 1.313 0 0 0 0-2.624zm-3-3.75a1.313 1.313 0 0 0 0 2.625h11.625a1.313 1.313 0 0 0 0-2.625z"/></svg>',
    windsurf: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.55 5.067c-1.2038-.002-2.1806.973-2.1806 2.1765v4.8676c0 .972-.8035 1.7594-1.7597 1.7594-.568 0-1.1352-.286-1.4718-.7659l-4.9713-7.1003c-.4125-.5896-1.0837-.941-1.8103-.941-1.1334 0-2.1533.9635-2.1533 2.153v4.8957c0 .972-.7969 1.7594-1.7596 1.7594-.57 0-1.1363-.286-1.4728-.7658L.4076 5.1598C.2822 4.9798 0 5.0688 0 5.2882v4.2452c0 .2147.0656.4228.1884.599l5.4748 7.8183c.3234.462.8006.8052 1.3509.9298 1.3771.313 2.6446-.747 2.6446-2.0977v-4.893c0-.972.7875-1.7593 1.7596-1.7593h.003a1.798 1.798 0 0 1 1.4718.7658l4.9723 7.0994c.4135.5905 1.05.941 1.8093.941 1.1587 0 2.1515-.9645 2.1515-2.153v-4.8948c0-.972.7875-1.7594 1.7596-1.7594h.194a.22.22 0 0 0 .2204-.2202v-4.622a.22.22 0 0 0-.2203-.2203Z"/></svg>',
    gemini: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"/></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>'
  };
  function mountAi() {
    var b64 = function (o) { return encodeURIComponent(btoa(JSON.stringify(o))); };
    var run = 'Command copied: run it in a terminal.';
    var TOOLS = [
      { name: 'Claude', logo: LOGO.claude, label: 'Add to Claude', open: 'https://claude.ai/customize/connectors', copy: DOCS_MCP,
        tip: 'Claude, on the web and the desktop app: copies the address and opens Connectors.', done: 'Address copied. In Connectors, click Add custom connector, paste it, then Add.' },
      { name: 'Claude Code', logo: LOGO.claude, label: 'Copy the Claude Code command', copy: 'claude mcp add --transport http queryapigate-docs ' + DOCS_MCP + ' --scope user',
        tip: 'Claude Code: copies the command to run in a terminal.', done: run },
      { name: 'Cursor', logo: LOGO.cursor, label: 'Add to Cursor', href: 'cursor://anysphere.cursor-deeplink/mcp/install?name=queryapigate-docs&config=' + b64({ url: DOCS_MCP }),
        tip: 'Add to Cursor: one click, then confirm in Cursor.', done: 'Opening Cursor. Nothing happened? Cursor isn\'t installed here.' },
      { name: 'VS Code', logo: '<img src="' + SITE_ROOT + 'images/brands/vscode.svg" alt="" width="22" height="22">', label: 'Install in VS Code',
        href: 'vscode:mcp/install?' + encodeURIComponent(JSON.stringify({ name: 'queryapigate-docs', type: 'http', url: DOCS_MCP })),
        tip: 'Install in VS Code: one click, then confirm in VS Code.', done: 'Opening VS Code. Nothing happened? VS Code isn\'t installed here.' },
      { name: 'LM Studio', logo: LOGO.lmstudio, label: 'Add to LM Studio', href: 'lmstudio://add_mcp?name=queryapigate-docs&config=' + b64({ url: DOCS_MCP }),
        tip: 'Add to LM Studio: one click, then confirm in LM Studio.', done: 'Opening LM Studio. Nothing happened? LM Studio isn\'t installed here.' },
      { name: 'Windsurf', logo: LOGO.windsurf, label: 'Copy the Windsurf config',
        copy: JSON.stringify({ mcpServers: { 'queryapigate-docs': { command: 'npx', args: ['-y', 'mcp-remote', DOCS_MCP] } } }, null, 2),
        tip: 'Windsurf: copies the config for its settings file.', done: 'Config copied: add it to ~/.codeium/windsurf/mcp_config.json.' },
      { name: 'Gemini CLI', logo: LOGO.gemini, label: 'Copy the Gemini CLI command', copy: 'gemini mcp add --transport http queryapigate-docs ' + DOCS_MCP,
        tip: 'Gemini CLI: copies the command to run in a terminal.', done: run },
      { name: 'Codex', logo: LOGO.terminal, label: 'Copy the Codex command', copy: 'codex mcp add queryapigate-docs --url ' + DOCS_MCP,
        tip: 'Codex: copies the command to run in a terminal.', done: run }
    ];
    var HINT = 'Pick your tool: one click installs it, or copies what to run.';
    var esc = function (t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var tiles = TOOLS.map(function (t, i) {
      var attrs = ' class="rs-ai-tool" data-tool="' + i + '" aria-label="' + esc(t.label) + '" title="' + esc(t.label) + '"';
      var inner = t.logo + '<span>' + esc(t.name) + '</span>';
      if (t.href) return '<a href="' + esc(t.href) + '"' + attrs + '>' + inner + '</a>';
      if (t.open) return '<a href="' + esc(t.open) + '" target="_blank" rel="noopener noreferrer"' + attrs + '>' + inner + '</a>';
      return '<button type="button"' + attrs + '>' + inner + '</button>';
    }).join('');
    ai = document.createElement('div'); ai.className = 'rs-ai';
    ai.innerHTML = '<div class="rs-ai-panel" id="rs-ai-panel" role="dialog" aria-label="Use these docs with AI" hidden>'
      + '<div class="rs-ai-head"><b>Use these docs with AI</b><button type="button" class="rs-ai-x" aria-label="Close">×</button></div>'
      + '<p>Connect your AI tool to QueryAPIGate\'s documentation MCP server: it searches the docs, guides and blog, and reads any page. Read-only, no sign-in.</p>'
      + '<div class="rs-ai-tools">' + tiles + '</div>'
      + '<p class="rs-ai-hint" aria-live="polite">' + HINT + '</p>'
      + '<a class="rs-ai-more" href="' + SITE_ROOT + 'Docs.dc.html#ai">Other tools, and the full setup →</a>'
      + '<small>It answers questions about QueryAPIGate. To give agents your own data, QueryAPIGate itself is the <a href="' + SITE_ROOT + 'MCP.dc.html">MCP server</a>.</small></div>'
      + '<button type="button" class="rs-ai-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="rs-ai-panel" aria-label="Use these docs with AI" title="Use these docs with AI">'
      + '<svg class="rs-ai-i1" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>'
      + '<svg class="rs-ai-i2" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>'
      + '<span class="rs-ai-badge" aria-hidden="true">AI</span></button>';
    var btn = ai.querySelector('.rs-ai-btn'), panel = ai.querySelector('.rs-ai-panel'), hint = ai.querySelector('.rs-ai-hint'), said = null;
    // A mouse resting on the button opens the panel, and it closes a moment after the mouse leaves both. A click (a tap,
    // Enter) pins it open until a second click, a click outside, the × or Escape: the only way on touch screens.
    var pinned = false, openT, closeT;
    function show(open) { panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (!open) pinned = false; }
    ai.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(closeT); if (panel.hidden) openT = setTimeout(function () { show(true); }, 150);
    });
    ai.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(openT); if (!pinned) closeT = setTimeout(function () { show(false); }, 350);
    });
    btn.addEventListener('click', function () {
      clearTimeout(openT); clearTimeout(closeT);
      if (!panel.hidden && pinned) { show(false); return; }
      show(true); pinned = true;
    });
    ai.querySelector('.rs-ai-x').addEventListener('click', function () { show(false); btn.focus(); });
    function say(text, keep) { hint.textContent = text; clearTimeout(said); if (keep) said = setTimeout(function () { hint.textContent = HINT; said = null; }, 4000); }
    ai.querySelectorAll('.rs-ai-tool').forEach(function (el) {
      var t = TOOLS[+el.dataset.tool];
      var tip = function () { if (!said) say(t.tip); }, untip = function () { if (!said) say(HINT); };
      el.addEventListener('pointerenter', tip); el.addEventListener('focus', tip);
      el.addEventListener('pointerleave', untip); el.addEventListener('blur', untip);
      el.addEventListener('click', function () {
        if (t.copy) { try { navigator.clipboard && navigator.clipboard.writeText(t.copy); } catch (e) {} }
        pinned = true; say(t.done, true);
      });
    });
    document.addEventListener('click', function (e) { if (!panel.hidden && !ai.contains(e.target)) show(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { show(false); btn.focus(); } });
    document.body.appendChild(ai);
  }
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
    mountAi();
    window.addEventListener('scroll', tick, { passive: true }); window.addEventListener('resize', tick); progress();
    var tries = 0, t = setInterval(function () { progress(); if (++tries > 20) clearInterval(t); }, 250);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  // Pages render their content after load, so the browser's own jump to #section finds nothing and stays at the top.
  // Once the target exists and the layout has settled, scroll to it; give up if the reader has started scrolling.
  (function () {
    var h = location.hash; if (!h || h.length < 2 || h.indexOf('=') >= 0) return;
    var id; try { id = decodeURIComponent(h.slice(1)); } catch (e) { return; }
    var tries = 0, lastH = -1, steady = 0, moved = false;
    window.addEventListener('wheel', function () { moved = true; }, { passive: true, once: true });
    window.addEventListener('touchmove', function () { moved = true; }, { passive: true, once: true });
    var t = setInterval(function () {
      var el = document.getElementById(id), H = document.documentElement.scrollHeight;
      steady = (H === lastH) ? steady + 1 : 0; lastH = H;
      if (moved || ++tries > 60) return clearInterval(t);
      if (el && steady >= 2) { clearInterval(t); el.scrollIntoView({ block: 'start' }); }
    }, 100);
  })();

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-theme-toggle]'); if (!b) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next); try { localStorage.setItem(KEY, next); } catch (err) {}
  });
})();
