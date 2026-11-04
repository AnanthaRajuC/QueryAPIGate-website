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

const args = process.argv.slice(2);
const ALL = args.includes('--all'), DRY = args.includes('--dry-run');
const ONLY = new Set(args.filter(a => /^[gdp]=/.test(a)));
const unknownArg = args.find(a => !/^[gdp]=/.test(a) && a !== '--all' && a !== '--dry-run');
if (unknownArg) { console.error(`unknown argument ${unknownArg}\nusage: node tools/pdf/build.mjs [--all] [--dry-run] [g=<slug> d=<slug> p=<slug> ...]`); process.exit(2); }

const sha = s => createHash('sha256').update(s).digest('hex');
// the markdown as the page's fetch().text() sees it, so Guide.dc.html can hash it and get the same answer
const readMd = rel => readFileSync(join(ROOT, rel), 'utf8').replace(/^﻿/, '');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---- what there is to build ----
const { guides, docs, posts } = await import(pathToFileURL(join(ROOT, 'guides.js')).href);
const PAGES = [
  ...guides.map(g => ({ key: 'g=' + g.slug, src: 'how-to/' + g.slug + '.md', file: 'pdf/guides/' + g.slug + '.pdf', title: g.title, label: 'Guide ' + g.num })),
  ...docs.map(d => ({ key: 'd=' + d.slug, src: d.path, file: 'pdf/docs/' + d.slug + '.pdf', title: d.title, label: 'Documentation' })),
  // a post with an href (a roundup that links to the Changelog) has no page of its own
  ...posts.filter(p => !p.href).map(p => ({ key: 'p=' + p.slug, src: 'blog/' + p.slug + '.md', file: 'pdf/blog/' + p.slug + '.pdf', title: p.title, label: 'Blog' })),
];
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

if (DRY || (!todo.length && !orphans.length)) {
  for (const p of todo) console.log(`would build ${p.key} (${reasons[p.key]})`);
  for (const k of orphans) console.log(`would remove ${manifest.pages[k].file} (${k} is no longer in guides.js)`);
  console.log(todo.length || orphans.length ? `${todo.length} to build, ${orphans.length} to remove` : `all ${PAGES.length} PDFs are up to date`);
  process.exit(0);
}

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
const todayLong = (([y, m, d]) => `${+d} ${MON[m - 1]} ${y}`)(today.split('-'));

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
    await page.evaluate(async ({ site, live, when }) => {
      // links point at the live site, not this local server; in-page anchors stay in the PDF
      document.querySelectorAll('article a[href]').forEach(a => { const h = a.getAttribute('href'); if (!h.startsWith('#')) a.href = new URL(h, site + 'Guide.dc.html').href; });
      // where the live page is, and when this copy was made, under the title
      const head = document.querySelector('article > header');
      head.insertAdjacentHTML('beforeend', `<p class="pdf-source">The latest version is at <a href="${live}">${live.replace(/^https:\/\//, '')}</a>. This copy was made on ${when}.</p>`);
      // every image loaded before printing, not just the ones that would have scrolled into view
      await Promise.all([...document.images].map(img => { img.loading = 'eager'; return img.complete ? null : new Promise(r => { img.onload = img.onerror = r; setTimeout(r, 15000); }); }));
      await document.fonts.ready;
    }, { site: SITE, live, when: todayLong });
    const pdf = await page.pdf({
      format: 'A4', preferCSSPageSize: true, printBackground: true, scale: 0.8, outline: true, tagged: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="font:8px Arial,sans-serif;color:#7c8783;width:100%;padding:0 14mm;display:flex;justify-content:space-between;gap:24px"><span style="white-space:nowrap">QueryAPIGate · ${esc(p.label)}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.title)}</span></div>`,
      footerTemplate: `<div style="font:8px Arial,sans-serif;color:#7c8783;width:100%;padding:0 14mm;display:flex;justify-content:space-between"><span>${esc(live.replace(/^https:\/\//, ''))}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    });
    mkdirSync(join(ROOT, dirname(p.file)), { recursive: true });
    writeFileSync(join(ROOT, p.file), pdf);
    const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page(?![a-z])/g) || []).length;
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

for (const k of orphans) { rmSync(join(ROOT, manifest.pages[k].file), { force: true }); console.log(`removed ${manifest.pages[k].file} (${k} is no longer in guides.js)`); delete manifest.pages[k]; }

manifest.pages = Object.fromEntries(Object.entries(manifest.pages).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(join(ROOT, MANIFEST), JSON.stringify(manifest, null, 1) + '\n');
console.log(`${todo.length - failed.length} built, ${PAGES.length - todo.length} unchanged, ${orphans.length} removed` + (failed.length ? `, ${failed.length} failed: ${failed.join(' ')}` : ''));
process.exit(failed.length ? 1 : 0);
