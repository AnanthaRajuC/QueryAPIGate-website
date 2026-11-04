// Builds the "Download as PDF" files offered on every guide, doc and blog post (Guide.dc.html):
//   pdf/guides/<slug>.pdf, pdf/docs/<slug>.pdf, pdf/blog/<slug>.pdf  - one per page
//   pdf/manifest.json                                                - what was built from what; Guide.dc.html reads it
//
// Each PDF is the real page, rendered by Guide.dc.html in headless Chromium and printed with print.css,
// so it has the site's callouts, tables and charts. Only pages that changed are rebuilt: a page is built
// again when its markdown changes, when this script or print.css changes, or when its PDF is missing.
// PDFs of pages no longer in guides.js are removed.
//
// Usage (from the repository root):
//   cd tools/pdf && npm install && ./node_modules/.bin/playwright-core install --only-shell chromium && cd ../..
//   node tools/pdf/build.mjs                    # build what changed
//   node tools/pdf/build.mjs --dry-run          # list what would be built, build nothing
//   node tools/pdf/build.mjs g=02-connect-a-database d=API   # rebuild these pages
//   node tools/pdf/build.mjs --all              # rebuild every page (after changing how Guide.dc.html renders)
//   node tools/pdf/build.mjs --preview /tmp/x g=13-set-up-a-scoped-api-key d=API
//                                               # build these into /tmp/x only: pdf/ and the manifest stay as they are
//
// Each PDF says which release it is current as of: the latest QueryAPIGate release on GitHub, looked up once
// per run (with GITHUB_TOKEN if set). If GitHub can't answer, say it with --release v0.49.0.
//
// Uses the Chromium that Playwright installs (the install above); set CHROMIUM_PATH to use another. Needs the internet for
// the page's fonts, its markdown renderer and its images.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { join, dirname, extname, normalize, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://anantharajuc.github.io/QueryAPIGate-website/';
const MANIFEST = 'pdf/manifest.json';
const PARALLEL = 4;

const USAGE = 'usage: node tools/pdf/build.mjs [--all] [--dry-run] [--preview <dir>] [--release <tag>] [g=<slug> d=<slug> p=<slug> ...]';
const args = process.argv.slice(2), ONLY = new Set();
let ALL = false, DRY = false, PREVIEW = null, RELEASE = null;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--all') ALL = true; else if (a === '--dry-run') DRY = true;
  else if (a === '--preview' || a === '--release') { const v = args[++i]; if (!v) { console.error(`${a} needs a value\n${USAGE}`); process.exit(2); } if (a === '--preview') PREVIEW = v; else RELEASE = v; }
  else if (/^[gdp]=/.test(a)) ONLY.add(a);
  else { console.error(`unknown argument ${a}\n${USAGE}`); process.exit(2); }
}
if (PREVIEW && !ONLY.size) { console.error(`--preview needs the pages to build, e.g. g=02-connect-a-database\n${USAGE}`); process.exit(2); }

const sha = s => createHash('sha256').update(s).digest('hex');
// the markdown as the page's fetch().text() sees it, so Guide.dc.html can hash it and get the same answer
const readMd = rel => readFileSync(join(ROOT, rel), 'utf8').replace(/^﻿/, '');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---- what there is to build ----
const { guides, docs, posts } = await import(pathToFileURL(join(ROOT, 'guides.js')).href);
const PAGES = [
  ...guides.map(g => ({ key: 'g=' + g.slug, src: 'how-to/' + g.slug + '.md', file: 'pdf/guides/' + g.slug + '.pdf', title: g.title, label: 'Guide ' + g.num, kind: 'How-to guide ' + g.num, cat: g.cat })),
  ...docs.map(d => ({ key: 'd=' + d.slug, src: d.path, file: 'pdf/docs/' + d.slug + '.pdf', title: d.title, label: 'Documentation', kind: 'Documentation', cat: d.cat })),
  // a post with an href (a roundup that links to the Changelog) has no page of its own
  ...posts.filter(p => !p.href).map(p => ({ key: 'p=' + p.slug, src: 'blog/' + p.slug + '.md', file: 'pdf/blog/' + p.slug + '.pdf', title: p.title, label: 'Blog', kind: 'Blog', cat: p.cat, summary: p.summary, date: p.date })),
];
// what to read next, as on the page itself: the next guide, document or (older) post
PAGES.forEach((p, i) => { const n = PAGES[i + 1]; if (n && n.key[0] === p.key[0]) p.next = n; });
for (const k of ONLY) if (!PAGES.some(p => p.key === k)) { console.error(`no page ${k} in guides.js`); process.exit(2); }

// what the PDFs look like: this script (its comment lines don't count) and print.css
const DESIGN = sha(readFileSync(fileURLToPath(import.meta.url), 'utf8').replace(/^\s*\/\/.*\n/gm, '') + readFileSync(join(ROOT, 'print.css')));
const manifest = existsSync(join(ROOT, MANIFEST)) ? JSON.parse(readFileSync(join(ROOT, MANIFEST), 'utf8')) : { pages: {} };

const todo = [], reasons = {};
for (const p of PAGES) {
  if (!existsSync(join(ROOT, p.src))) { console.warn(`skip ${p.key}: ${p.src} is missing`); continue; }
  p.sha256 = sha(readMd(p.src));
  const e = manifest.pages[p.key];
  const why = ALL ? 'all' : ONLY.size ? (ONLY.has(p.key) ? 'asked' : null)
    : !e ? 'new' : !existsSync(join(ROOT, e.file)) ? 'missing' : e.sha256 !== p.sha256 ? 'changed' : e.design !== DESIGN ? 'design' : null;
  if (why) { todo.push(p); reasons[p.key] = why; }
}
const orphans = ONLY.size ? [] : Object.keys(manifest.pages).filter(k => !PAGES.some(p => p.key === k));

if (PREVIEW) { orphans.length = 0; }
if (DRY || (!todo.length && !orphans.length)) {
  for (const p of todo) console.log(`would build ${p.key} (${reasons[p.key]})`);
  for (const k of orphans) console.log(`would remove ${manifest.pages[k].file} (${k} is no longer in guides.js)`);
  console.log(todo.length || orphans.length ? `${todo.length} to build, ${orphans.length} to remove` : `all ${PAGES.length} PDFs are up to date`);
  process.exit(0);
}

// ---- the release these PDFs are current as of ----
if (!RELEASE) {
  const r = await fetch('https://api.github.com/repos/AnanthaRajuC/QueryAPIGate/releases/latest', { headers: { 'User-Agent': 'queryapigate-website-pdf', ...(process.env.GITHUB_TOKEN ? { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN } : {}) } }).catch(e => ({ ok: false, status: e.message }));
  const tag = r.ok ? (await r.json()).tag_name : null;
  if (!tag) { console.error(`could not look up the latest release on GitHub (${r.status}); say which with --release v0.49.0`); process.exit(1); }
  RELEASE = tag;
}
if (!/^v/.test(RELEASE)) RELEASE = 'v' + RELEASE;

// ---- the site, served locally so Guide.dc.html can fetch its markdown ----
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.md': 'text/markdown', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.jpg': 'image/jpeg' };
const server = createServer((req, res) => {
  const rel = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  const path = join(ROOT, rel);
  if (!path.startsWith(ROOT + sep) || !existsSync(path) || !statSync(path).isFile()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': (TYPES[extname(path).toLowerCase()] || 'application/octet-stream') + '; charset=utf-8' }).end(readFileSync(path));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const LOCAL = `http://127.0.0.1:${server.address().port}/`;

const exe = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const context = await browser.newContext({ colorScheme: 'light', viewport: { width: 1280, height: 900 } });
const today = new Date().toISOString().slice(0, 10);
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = iso => { const [y, m, d] = iso.split('-').map(Number); return d ? `${d} ${MON[m - 1]} ${y}` : m ? `${MON[m - 1]} ${y}` : String(y); };
const todayLong = longDate(today);
const urlText = u => u.replace(/^https:\/\//, '');
// the mark from the site's nav: a dark tile with the gate in it
const LOGO = size => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 32 32" style="flex:none;display:block"><rect width="32" height="32" rx="7" fill="#10201b"/><path d="M9.5 24V10.5h13V24" fill="none" stroke="#22a58c" stroke-width="3" stroke-linejoin="round"/><path d="M13.5 17.5h5" stroke="#e6efeb" stroke-width="3" stroke-linecap="round"/></svg>`;

// Page 1 opens with a masthead (the brand, what kind of page this is, its title, the release it is current as of,
// and where the latest version is); the last page closes with what to read next and where to ask.
function masthead(p, live) {
  const meta = [p.date ? 'Published ' + longDate(p.date) : null, `Current as of QueryAPIGate <b>${esc(RELEASE)}</b>`, 'PDF made ' + todayLong].filter(Boolean).join(' · ');
  return `<header class="pdf-mast">
    <div class="pdf-band">${LOGO(22)}<span class="pdf-word">Query<b>API</b>Gate</span><span class="pdf-kind">${esc(p.kind)} · ${esc(p.cat)}</span></div>
    <h1>${esc(p.title)}</h1>
    ${p.summary ? `<p class="pdf-dek">${esc(p.summary)}</p>` : ''}
    <p class="pdf-meta">${meta}</p>
    <p class="pdf-meta">Latest version: <a href="${live}">${esc(urlText(live))}</a></p>
  </header>`;
}
function closing(p, live) {
  const next = p.next ? `<div><small>Read next</small><a href="${SITE}Guide.dc.html?${p.next.key}">${esc(p.next.title)}</a></div>` : `<div><small>More</small><a href="${SITE}${p.key[0] === 'p' ? 'Blog' : p.key[0] === 'd' ? 'Docs' : 'Guides'}.dc.html">${p.key[0] === 'p' ? 'Every post on the blog' : p.key[0] === 'd' ? 'All the documentation' : 'All the how-to guides'}</a></div>`;
  return `<footer class="pdf-end">
    <div class="pdf-end-grid">
      ${next}
      <div><small>Questions or problems</small><span><a href="https://discord.gg/DjhmNdNPr">Discord</a> · <a href="https://github.com/AnanthaRajuC/QueryAPIGate/issues">GitHub issues</a></span></div>
      <div><small>Latest version of this page</small><a href="${live}">${esc(urlText(live))}</a></div>
    </div>
    <div class="pdf-social"><small>Follow QueryAPIGate</small><span class="pdf-social-icons"></span>
      <span class="pdf-social-text">@queryapigate on X, Bluesky, Mastodon and YouTube · r/queryapigate on Reddit · github.com/AnanthaRajuC/QueryAPIGate</span></div>
    <p class="pdf-legal">${LOGO(14)}<span><b>QueryAPIGate</b> · one governed gate between your databases and everything that asks them for data · self-hosted, Apache-2.0 · © ${today.slice(0, 4)} QueryAPIGate</span></p>
  </footer>`;
}

async function build(p) {
  const page = await context.newPage();
  try {
    await page.goto(LOCAL + 'Guide.dc.html?' + p.key, { waitUntil: 'load' });
    await page.waitForFunction(slug => {
      const el = document.querySelector('#guide-body');
      if ([...document.querySelectorAll('article p')].some(x => x.textContent.startsWith('This guide could not be loaded'))) throw new Error('the page could not load its markdown');
      return el && el.dataset.rendered === slug;
    }, p.key.slice(2), { timeout: 30000 });
    const live = SITE + 'Guide.dc.html?' + p.key;
    await page.evaluate(async ({ site, top, end }) => {
      // links point at the live site, not this local server; in-page anchors stay in the PDF
      document.querySelectorAll('article a[href]').forEach(a => { const h = a.getAttribute('href'); if (!h.startsWith('#')) a.href = new URL(h, site + 'Guide.dc.html').href; });
      // the PDF's own masthead replaces the page's header (print.css, under html.pdf-build); the closing strip follows the body
      document.documentElement.classList.add('pdf-build');
      // a spine in the brand green at the left edge of the paper, top to bottom: drawn in the page's margin boxes,
      // which only an @page rule can reach, so it is added here rather than in print.css (a page printed from the browser has none)
      const spine = 'content:"";border-left:3px solid #22a58c';
      document.head.insertAdjacentHTML('beforeend', `<style>@page{@top-left-corner{${spine}}@left-top{${spine}}@left-middle{${spine}}@left-bottom{${spine}}@bottom-left-corner{${spine}}}</style>`);
      document.querySelector('article').insertAdjacentHTML('afterbegin', top);
      document.querySelector('#guide-body').insertAdjacentHTML('afterend', end);
      // the social links and icons are the site footer's own, so the PDF follows the site
      const icons = document.querySelector('.pdf-social-icons');
      document.querySelectorAll('.ft-badges a[aria-label]').forEach(a => {
        const svg = a.querySelector('svg'), name = (a.getAttribute('aria-label').match(/ on ([\w ]+?)(?: \(|$)/) || [])[1];
        if (!svg || !name) return;
        icons.insertAdjacentHTML('beforeend', `<a href="${a.href}">${svg.outerHTML}<span>${name}</span></a>`);
      });
      // every image loaded before printing, not just the ones that would have scrolled into view
      await Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.complete ? null : new Promise(r => { img.onload = img.onerror = r; setTimeout(r, 15000); }); }));
      await document.fonts.ready;
    }, { site: SITE, top: masthead(p, live), end: closing(p, live) });
    const pdf = await page.pdf({
      format: 'A4', preferCSSPageSize: true, printBackground: true, scale: 0.8, outline: true, tagged: true,
      displayHeaderFooter: true,
      // one running line, at the top of every page: the brand, what this is, and the page
      headerTemplate: `<div style="font:8px Arial,sans-serif;color:#7c8783;width:100%;padding:0 14mm;display:flex;justify-content:space-between;align-items:center;gap:24px"><span style="display:flex;align-items:center;gap:6px;min-width:0;white-space:nowrap;overflow:hidden">${LOGO(11)}<b style="color:#17201d;font-weight:700">QueryAPIGate</b><span>·</span><span>${esc(p.label)}</span><span>·</span><span style="overflow:hidden;text-overflow:ellipsis">${esc(p.title)}</span></span><span style="white-space:nowrap">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
      footerTemplate: '<span></span>',
    });
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?![a-z])/g) || []).length;
    if (PREVIEW) { const out = join(PREVIEW, p.file.replace(/^pdf\//, '').replace(/\//g, '-')); mkdirSync(PREVIEW, { recursive: true }); writeFileSync(out, pdf); console.log(`previewed ${out} (${pages} pages, ${Math.round(pdf.length / 1024)} KB)`); return; }
    mkdirSync(join(ROOT, dirname(p.file)), { recursive: true });
    writeFileSync(join(ROOT, p.file), pdf);
    manifest.pages[p.key] = { file: p.file, source: p.src, sha256: p.sha256, design: DESIGN, built: today, pages, bytes: pdf.length };
    console.log(`built ${p.file} (${reasons[p.key]}, ${pages} pages, ${Math.round(pdf.length / 1024)} KB)`);
  } finally { await page.close(); }
}

const failed = [];
const queue = [...todo];
await Promise.all(Array.from({ length: Math.min(PARALLEL, queue.length) }, async () => {
  for (let p; (p = queue.shift());) { try { await build(p); } catch (e) { failed.push(p.key); console.error(`FAILED ${p.key}: ${e.message.split('\n')[0]}`); } }
}));
await browser.close();
server.close();

if (PREVIEW) process.exit(failed.length ? 1 : 0);
for (const k of orphans) { rmSync(join(ROOT, manifest.pages[k].file), { force: true }); console.log(`removed ${manifest.pages[k].file} (${k} is no longer in guides.js)`); delete manifest.pages[k]; }

manifest.pages = Object.fromEntries(Object.entries(manifest.pages).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(ROOT, MANIFEST), JSON.stringify(manifest, null, 1) + '\n');
console.log(`${todo.length - failed.length} built, ${PAGES.length - todo.length} unchanged, ${orphans.length} removed` + (failed.length ? `, ${failed.length} failed: ${failed.join(' ')}` : ''));
process.exit(failed.length ? 1 : 0);
