/* Site search: a Ctrl+K palette over the documents, how-to guides and pages.
   The index (search-index.json) is built by tools/search_index.py and loaded on first open.
   No dependencies: ranking is prefix matching with field weights, which is enough for a few thousand sections. */
(function () {
  'use strict';
  var ROOT = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/search\.js(\?.*)?$/, '') : './';
  })();
  var SUGGESTED = [
    ['Quick start', 'Docs.dc.html#quickstart'], ['Install', 'Docs.dc.html#install'], ['MCP server for AI agents', 'Guide.dc.html?d=MCP'],
    ['API reference', 'Guide.dc.html?d=API'], ['60 how-to guides', 'Guides.dc.html'], ['Threat model', 'Guide.dc.html?d=THREAT_MODEL'],
  ];
  var KIND = { doc: 'Documentation', guide: 'Guides', page: 'Pages' };
  var index = null, loading = null, overlay = null, input = null, list = null, status = null, sel = 0, hits = [], lastQ = '';

  var css = [
    '.rs-search{font:inherit;display:inline-flex;align-items:center;gap:8px;height:34px;padding:0 10px 0 9px;border:1px solid #c3cdc9;border-radius:8px;background:#fff;color:#4a5652;cursor:pointer;font-size:13.5px;transition:border-color .15s,color .15s}',
    '.rs-search:hover{border-color:#17201d;color:#17201d}.rs-search svg{flex:none}.rs-search kbd{font-family:"JetBrains Mono",monospace;font-size:10.5px;color:#626d69;border:1px solid #dbe2df;border-radius:4px;padding:1px 5px;background:#f8faf9}',
    '@media (max-width:1400px){.rs-search span,.rs-search kbd{display:none}.rs-search{width:34px;padding:0;justify-content:center}}',
    '@media (max-width:1180px){.rs-search{width:auto;padding:0 10px 0 9px}.rs-search span{display:inline}}',
    '#qs{position:fixed;inset:0;z-index:200;display:flex;align-items:flex-start;justify-content:center;padding:9vh 16px 16px;background:rgba(16,32,27,.45);backdrop-filter:blur(2px)}',
    '#qs[hidden]{display:none}',
    '#qs .qs-box{width:min(760px,100%);max-height:82vh;display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;background:#fff;border-radius:14px;box-shadow:0 40px 80px -20px rgba(16,32,27,.5);overflow:hidden;font-family:"Instrument Sans",system-ui,sans-serif;color:#17201d}',
    '#qs .qs-head{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #e8edeb}',
    '#qs .qs-head>svg{flex:none;color:oklch(0.52 0.11 170)}',
    '#qs input{flex:1;min-width:0;font:inherit;font-size:17px;border:0;outline:0;background:none;color:#17201d}',
    '#qs .qs-count{font-family:"JetBrains Mono",monospace;font-size:11px;color:#626d69;white-space:nowrap;display:flex;gap:6px;align-items:center}',
    '#qs .qs-count i{width:6px;height:6px;border-radius:50%;background:oklch(0.62 0.13 170);display:block}',
    '#qs kbd{font-family:"JetBrains Mono",monospace;font-size:10.5px;color:#626d69;border:1px solid #dbe2df;border-radius:4px;padding:1px 6px;background:#f8faf9}',
    '#qs .qs-tabs{display:flex;gap:4px;padding:10px 16px 0}',
    '#qs .qs-tab{font:inherit;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:6px 10px;border-radius:6px;border:1px solid transparent;background:none;color:#626d69;cursor:default}',
    '#qs .qs-tab.on{background:#10201b;color:#e6efeb}',
    '#qs .qs-list{overflow:auto;padding:8px 8px 10px;overscroll-behavior:contain}',
    '#qs .qs-group{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#626d69;padding:10px 10px 4px}',
    '#qs .qs-item{display:grid;grid-template-columns:28px minmax(0,1fr);gap:10px;align-items:start;padding:9px 10px;border-radius:9px;text-decoration:none;color:#17201d}',
    '#qs .qs-item.on,#qs .qs-item:hover{background:#f3f5f4;text-decoration:none}',
    '#qs .qs-ico{width:28px;height:28px;border-radius:7px;background:oklch(0.52 0.11 170 / .09);display:grid;place-items:center;color:oklch(0.52 0.11 170);margin-top:1px}',
    '#qs .qs-t{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;font-size:14.5px;font-weight:600;line-height:1.3}',
    '#qs .qs-t small{font-family:"JetBrains Mono",monospace;font-size:10.5px;font-weight:400;color:#626d69}',
    '#qs .qs-h{font-size:13.5px;color:#4a5652;font-weight:500}#qs .qs-h:before{content:"› ";color:#9fb3ac}',
    '#qs .qs-x{font-size:12.5px;color:#626d69;line-height:1.45;margin-top:2px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
    '#qs mark{background:oklch(0.52 0.11 170 / .16);color:inherit;border-radius:2px;padding:0 1px}',
    '#qs .qs-empty{padding:28px 16px;text-align:center;color:#626d69;font-size:14px}',
    '#qs .qs-foot{display:flex;gap:16px;align-items:center;padding:10px 16px;border-top:1px solid #e8edeb;font-family:"JetBrains Mono",monospace;font-size:11px;color:#626d69;flex-wrap:wrap}',
    '#qs .qs-foot span{display:flex;gap:6px;align-items:center}',
    '@media (max-width:640px){#qs{padding:12px 10px}#qs .qs-box{max-height:88vh}#qs .qs-foot{display:none}}',
  ].join('\n');
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var ICONS = {
    doc: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>',
    guide: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
    page: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    go: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tokens(s) { return String(s).toLowerCase().split(/[^a-z0-9_]+/).filter(function (t) { return t.length > 1; }); }

  function prepare(entries) {
    return entries.map(function (e) {
      return { e: e, t: ' ' + tokens(e.t).join(' ') + ' ', h: ' ' + tokens(e.h).join(' ') + ' ', x: ' ' + tokens(e.x).join(' ') + ' ', raw: (e.t + ' ' + e.h + ' ' + e.x).toLowerCase() };
    });
  }
  function fieldScore(field, q, exactW, prefixW) {
    if (field.indexOf(' ' + q + ' ') >= 0) return exactW;
    if (field.indexOf(' ' + q) >= 0) return prefixW;
    return 0;
  }
  function search(q) {
    var qs = tokens(q); if (!qs.length) return [];
    var phrase = q.trim().toLowerCase();
    var out = [];
    for (var i = 0; i < index.length; i++) {
      var r = index[i], score = 0, matched = 0, titleHits = 0;
      for (var j = 0; j < qs.length; j++) {
        var ts = fieldScore(r.t, qs[j], 10, 6); if (ts) titleHits++;
        var s = ts + fieldScore(r.h, qs[j], 6, 4) + fieldScore(r.x, qs[j], 2, 1);
        if (s) matched++;
        score += s;
      }
      if (!matched) continue;
      if (matched < qs.length) score *= 0.25;                  // partial matches rank below full ones
      if (qs.length > 1 && r.raw.indexOf(phrase) >= 0) score += 8;
      if (r.e.k === 'page') score *= 0.8;
      if (!r.e.h) score += (matched === qs.length && titleHits === qs.length) ? 8 : 1;   // the opening section of a document whose title matches the whole query comes first
      out.push({ r: r, s: score });
    }
    out.sort(function (a, b) { return b.s - a.s; });
    // At most two sections per document, so one long guide cannot fill the list.
    var seen = {}, picked = [];
    for (var k = 0; k < out.length && picked.length < 30; k++) { var key = out[k].r.e.k + out[k].r.e.t; seen[key] = (seen[key] || 0) + 1; if (seen[key] <= 2) picked.push(out[k].r.e); }
    return picked;
  }
  function snippet(text, qs) {
    var low = text.toLowerCase(), at = -1;
    for (var i = 0; i < qs.length && at < 0; i++) at = low.indexOf(qs[i]);
    var start = at < 0 ? 0 : Math.max(0, at - 70), piece = text.slice(start, start + 180);
    if (start > 0) piece = '…' + piece;
    if (start + 180 < text.length) piece += '…';
    return mark(esc(piece), qs);
  }
  function mark(html, qs) {
    if (!qs.length) return html;
    var re = new RegExp('(' + qs.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi');
    return html.replace(re, '<mark>$1</mark>');
  }

  function build() {
    overlay = document.createElement('div'); overlay.id = 'qs'; overlay.hidden = true;
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', 'Search the documentation');
    overlay.innerHTML =
      '<div class="qs-box">' +
        '<div class="qs-head"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' +
        '<input type="search" placeholder="Search docs, guides and pages…" autocomplete="off" spellcheck="false" aria-label="Search">' +
        '<span class="qs-count"><i></i><b data-count>…</b></span><kbd data-close>esc</kbd></div>' +
        '<div class="qs-tabs"><span class="qs-tab on">Search</span></div>' +
        '<div class="qs-list" role="listbox"></div>' +
        '<div class="qs-foot"><span><kbd>↵</kbd> open</span><span><kbd>↑↓</kbd> navigate</span><span><kbd>esc</kbd> close</span><span style="margin-left:auto">documents, how-to guides and pages, updated daily</span></div>' +
      '</div>';
    document.body.appendChild(overlay);
    input = overlay.querySelector('input'); list = overlay.querySelector('.qs-list'); status = overlay.querySelector('[data-count]');
    overlay.addEventListener('click', function (e) { if (e.target === overlay || e.target.hasAttribute('data-close')) close(); });
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); var a = list.querySelector('.qs-item.on'); if (a) a.click(); }
    });
    list.addEventListener('mousemove', function (e) { var a = e.target.closest('.qs-item'); if (a) { var items = list.querySelectorAll('.qs-item'); for (var i = 0; i < items.length; i++) if (items[i] === a) { sel = i; paint(); } } });
  }
  function move(d) { var items = list.querySelectorAll('.qs-item'); if (!items.length) return; sel = (sel + d + items.length) % items.length; paint(); var a = items[sel]; if (a.scrollIntoView) a.scrollIntoView({ block: 'nearest' }); }
  function paint() { var items = list.querySelectorAll('.qs-item'); for (var i = 0; i < items.length; i++) items[i].classList.toggle('on', i === sel); }
  function item(e, qs) {
    var t = mark(esc(e.t), qs), h = e.h ? '<span class="qs-h">' + mark(esc(e.h), qs) + '</span>' : '';
    return '<a class="qs-item" href="' + esc(ROOT + e.u) + '" role="option"><span class="qs-ico">' + (ICONS[e.k] || ICONS.page) + '</span>' +
      '<span><span class="qs-t">' + t + h + '<small>' + esc(e.c) + '</small></span>' + (e.x ? '<span class="qs-x">' + snippet(e.x, qs) + '</span>' : '') + '</span></a>';
  }
  function render(q) {
    lastQ = q; sel = 0;
    if (!q.trim()) {
      list.innerHTML = '<div class="qs-group">Suggested</div>' + SUGGESTED.map(function (s) {
        return '<a class="qs-item" href="' + esc(ROOT + s[1]) + '" role="option"><span class="qs-ico">' + ICONS.go + '</span><span><span class="qs-t">' + esc(s[0]) + '</span></span></a>';
      }).join('');
      paint(); return;
    }
    if (!index) { list.innerHTML = '<div class="qs-empty">Loading the index…</div>'; return; }
    hits = search(q);
    if (!hits.length) { list.innerHTML = '<div class="qs-empty">Nothing matches "' + esc(q.trim()) + '". Try a shorter word, a setting name or a guide topic.</div>'; return; }
    // Groups in the order their best hit appears, each group's hits kept together.
    var qs = tokens(q), html = '', order = [], byKind = {};
    hits.forEach(function (e) { var g = KIND[e.k] || 'Pages'; if (!byKind[g]) { byKind[g] = []; order.push(g); } byKind[g].push(e); });
    order.forEach(function (g) { html += '<div class="qs-group">' + g + '</div>' + byKind[g].map(function (e) { return item(e, qs); }).join(''); });
    list.innerHTML = html; paint();
  }
  function load() {
    if (loading) return loading;
    loading = fetch(ROOT + 'search-index.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { index = prepare(data); status.textContent = data.length.toLocaleString('en-US') + ' sections'; if (lastQ) render(lastQ); })
      .catch(function () { status.textContent = 'index unavailable'; if (lastQ) list.innerHTML = '<div class="qs-empty">The search index could not be loaded.</div>'; });
    return loading;
  }
  function open() {
    if (!overlay) build();
    overlay.hidden = false; document.documentElement.style.overflow = 'hidden';
    render(input.value); load(); input.focus(); input.select();
  }
  function close() { if (!overlay || overlay.hidden) return; overlay.hidden = true; document.documentElement.style.overflow = ''; }

  document.addEventListener('click', function (e) { var b = e.target.closest('[data-search]'); if (b) { e.preventDefault(); open(); } });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); overlay && !overlay.hidden ? close() : open(); return; }
    if (e.key === 'Escape' && overlay && !overlay.hidden) { close(); return; }
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var t = e.target, tag = t && t.tagName; if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
      e.preventDefault(); open();
    }
  });
  window.QSearch = { open: open, close: close };
})();
