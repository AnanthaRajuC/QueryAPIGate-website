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
    '.rs-ai-code{background:#10201b;border-radius:10px;overflow:hidden}.rs-ai-code-bar{display:flex;align-items:center;padding:6px 8px 6px 12px;border-bottom:1px solid #1b2f29;font:11px "JetBrains Mono",monospace;color:#7c8f88}',
    '.rs-ai-code-bar button{margin-left:auto;font:500 11px "JetBrains Mono",monospace;color:#c5d3cd;background:#1b2f29;border:1px solid #2a3d37;border-radius:6px;padding:3px 9px;cursor:pointer}.rs-ai-code-bar button:hover{background:#24403a;color:#e6efeb}',
    '.rs-ai-code code{display:block;padding:10px 12px;font:12px/1.6 "JetBrains Mono",monospace;color:#e6efeb;overflow-wrap:anywhere}',
    '.rs-ai-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rs-ai-row a{display:flex;align-items:center;justify-content:center;padding:8px 10px;border-radius:9px;border:1px solid var(--line-2);color:var(--ink) !important;font-weight:600;font-size:13.5px;text-decoration:none !important}.rs-ai-row a:hover{border-color:var(--accent-ink);color:var(--accent-ink) !important}',
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
  // The documentation MCP server, from any page: the Claude Code command to copy, one-click installs for Cursor and
  // VS Code (their documented install-link formats), and the full setup on the Docs page.
  var DOCS_MCP = 'https://queryapigate-docs.queryapigate-docs-mcp.workers.dev/mcp';
  function mountAi() {
    var cmd = 'claude mcp add --transport http queryapigate-docs ' + DOCS_MCP + ' --scope user';
    var cursor = 'cursor://anysphere.cursor-deeplink/mcp/install?name=queryapigate-docs&config=' + encodeURIComponent(btoa(JSON.stringify({ url: DOCS_MCP })));
    var vscode = 'vscode:mcp/install?' + encodeURIComponent(JSON.stringify({ name: 'queryapigate-docs', type: 'http', url: DOCS_MCP }));
    var esc = function (t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    ai = document.createElement('div'); ai.className = 'rs-ai';
    ai.innerHTML = '<div class="rs-ai-panel" id="rs-ai-panel" role="dialog" aria-label="Use these docs with AI" hidden>'
      + '<div class="rs-ai-head"><b>Use these docs with AI</b><button type="button" class="rs-ai-x" aria-label="Close">×</button></div>'
      + '<p>Connect your AI tool to QueryAPIGate\'s documentation MCP server: it searches the docs, guides and blog, and reads any page. Read-only, no sign-in.</p>'
      + '<div class="rs-ai-code"><div class="rs-ai-code-bar">claude code<button type="button" class="rs-ai-copy">Copy</button></div><code>' + esc(cmd) + '</code></div>'
      + '<div class="rs-ai-row"><a href="' + esc(cursor) + '">Add to Cursor</a><a href="' + esc(vscode) + '">Add to VS Code</a></div>'
      + '<a class="rs-ai-more" href="' + SITE_ROOT + 'Docs.dc.html#ai">Codex, Claude Desktop, Windsurf →</a>'
      + '<small>It answers questions about QueryAPIGate. To give agents your own data, QueryAPIGate itself is the <a href="' + SITE_ROOT + 'MCP.dc.html">MCP server</a>.</small></div>'
      + '<button type="button" class="rs-ai-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="rs-ai-panel" aria-label="Use these docs with AI" title="Use these docs with AI">'
      + '<svg class="rs-ai-i1" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>'
      + '<svg class="rs-ai-i2" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>'
      + '<span class="rs-ai-badge" aria-hidden="true">AI</span></button>';
    var btn = ai.querySelector('.rs-ai-btn'), panel = ai.querySelector('.rs-ai-panel'), copy = ai.querySelector('.rs-ai-copy');
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
    copy.addEventListener('click', function () {
      try { navigator.clipboard && navigator.clipboard.writeText(cmd); } catch (e) {}
      copy.textContent = 'Copied'; clearTimeout(copy._t); copy._t = setTimeout(function () { copy.textContent = 'Copy'; }, 1400);
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
