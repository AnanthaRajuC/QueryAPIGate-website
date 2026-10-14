// Builds the downloadable security pack linked from Enterprise.dc.html:
//   security-pack/queryapigate-security-pack-<version>.pdf  - every document in one PDF
//   security-pack/queryapigate-security-pack-<version>.zip  - the same documents as Markdown
//
// Usage (from the repository root):
//   cd tools/security-pack && npm install && cd ../..
//   node tools/security-pack/build.mjs 0.34.2
//
// Uses the Chromium that Playwright installs; set CHROMIUM_PATH to use another.
// Rebuild whenever the documents below change, and when the site moves to a new release.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { Marked } from 'marked';
import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VERSION = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(VERSION || '')) { console.error('usage: node tools/security-pack/build.mjs <version>'); process.exit(2); }

const REPO = 'https://github.com/AnanthaRajuC/QueryAPIGate/blob/main/';
const DOCS = [
  { slug: 'ARCHITECTURE', src: 'security-pack/ARCHITECTURE.md', title: 'Architecture overview' },
  { slug: 'QUESTIONNAIRE', src: 'security-pack/QUESTIONNAIRE.md', title: 'Security questionnaire answers' },
  { slug: 'THREAT_MODEL', src: 'documentation/THREAT_MODEL.md', title: 'Threat model' },
  { slug: 'DATA_PROTECTION', src: 'documentation/DATA_PROTECTION.md', title: 'Where data goes' },
  { slug: 'SECURITY', src: 'SECURITY.md', title: 'Security policy' },
  { slug: 'DEPLOYMENT', src: 'documentation/DEPLOYMENT.md', title: 'Production deployment' },
  { slug: 'SBOM', src: 'security-pack/SBOM.md', title: 'SBOM and release verification' },
];
const SLUGS = new Set(DOCS.map(d => d.slug));
const OUT = join(ROOT, 'security-pack');
const NAME = `queryapigate-security-pack-${VERSION}`;

const read = d => readFileSync(join(ROOT, d.src), 'utf8');
const anchor = s => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&(#\d+|[a-z]+);/g, '').replace(/[^a-z0-9 _-]/g, '').trim().replace(/\s+/g, '-');

// A link inside one document, rewritten for the pack: to another pack document, to a heading in this PDF, or to GitHub.
function rewrite(href, d) {
  if (/^(https?:|mailto:)/.test(href)) return { href };
  const [path, frag] = href.split('#');
  if (!path) return { href: `#${d.slug}--${frag}` };
  const base = path.replace(/^(\.\.\/|\.\/)+/, '').replace(/^documentation\//, '').replace(/\.md$/i, '');
  if (SLUGS.has(base)) return { href: frag ? `#${base}--${frag}` : `#${base}`, md: `${base}.md${frag ? '#' + frag : ''}` };
  // anything else is a file in the product repository, relative to where this document lives there
  const dir = d.src.startsWith('documentation/') ? 'documentation/' : '';
  const clean = path.startsWith('../') ? path.replace(/^(\.\.\/)+/, '') : dir + path.replace(/^\.\//, '');
  return { href: REPO + clean + (frag ? '#' + frag : '') };
}

// ---- Markdown zip: pack documents side by side, with an index ----
const stage = join(tmpdir(), NAME);
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
for (const d of DOCS) {
  const md = read(d).replace(/\]\(([^)\s]+)\)/g, (m, href) => {
    const r = rewrite(href, d);
    return `](${r.md || (r.href.startsWith('#') ? href : r.href)})`;
  });
  writeFileSync(join(stage, `${d.slug}.md`), md);
}
writeFileSync(join(stage, 'README.md'), `# QueryAPIGate ${VERSION} security pack

Documents for an architecture or vendor-risk review of QueryAPIGate ${VERSION}, a self-hosted, source-available
(FSL-1.1-MIT) gateway that serves saved SQL queries as governed REST endpoints, MCP tools, live events and exports.

${DOCS.map((d, i) => `${i + 1}. [${d.title}](${d.slug}.md)`).join('\n')}

Built from the documentation in the repositories at ${VERSION}. Source: https://github.com/AnanthaRajuC/QueryAPIGate
`);
const zipPath = join(OUT, `${NAME}.zip`);
rmSync(zipPath, { force: true });
execFileSync('zip', ['-q', '-X', '-r', zipPath, '.'], { cwd: stage });

// ---- PDF: a cover, a contents page, then each document from a new page ----
const sections = DOCS.map(d => {
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(text, depth) {
        const id = depth === 1 ? d.slug : `${d.slug}--${anchor(text)}`;
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      link(href, title, text) {
        const r = rewrite(href, d);
        return `<a href="${r.href}"${title ? ` title="${title}"` : ''}>${text}</a>`;
      },
    },
  });
  return `<section class="doc">${marked.parse(read(d))}</section>`;
}).join('\n');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>QueryAPIGate ${VERSION} security pack</title>
<style>
@page { size: A4; margin: 18mm 16mm 20mm; }
body { font: 10.5pt/1.5 "Helvetica Neue", Arial, sans-serif; color: #17201d; }
h1, h2, h3, h4 { color: #10201b; line-height: 1.25; break-after: avoid; }
h1 { font-size: 22pt; margin: 0 0 10pt; padding-bottom: 6pt; border-bottom: 2px solid #1f8a73; }
h2 { font-size: 14pt; margin: 18pt 0 6pt; } h3 { font-size: 11.5pt; margin: 14pt 0 4pt; } h4 { font-size: 10.5pt; }
a { color: #0f6e5c; text-decoration: none; }
code { font: 8.8pt/1.4 "DejaVu Sans Mono", Menlo, monospace; background: #eef2f0; padding: 0 2pt; border-radius: 2pt; overflow-wrap: anywhere; }
pre { background: #10201b; color: #e6efeb; padding: 8pt 10pt; border-radius: 4pt; white-space: pre-wrap; overflow-wrap: anywhere; break-inside: avoid; }
pre code { background: none; color: inherit; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 9pt; }
th, td { border: 1px solid #c3cdc9; padding: 4pt 6pt; text-align: left; vertical-align: top; }
th { background: #eef2f0; } tr { break-inside: avoid; }
blockquote { margin: 8pt 0; padding: 4pt 10pt; border-left: 3px solid #1f8a73; color: #4a5652; }
.doc { break-before: page; }
.cover { height: 250mm; display: flex; flex-direction: column; justify-content: space-between; }
.cover .mark { font: 600 13pt "DejaVu Sans Mono", monospace; color: #10201b; }
.cover .mark b { color: #1f8a73; font-weight: 600; }
.cover h1 { font-size: 34pt; border: 0; margin: 0 0 12pt; }
.cover p { font-size: 12pt; color: #4a5652; max-width: 140mm; }
.toc { break-before: page; } .toc ol { font-size: 12pt; line-height: 2; } .toc li span { color: #626d69; font-size: 10pt; }
</style></head><body>
<div class="cover">
  <div class="mark">Query<b>API</b>Gate</div>
  <div><h1>Security pack</h1>
  <p>QueryAPIGate ${VERSION}: architecture, threat model, data protection, security policy, deployment, release verification and answers to a security questionnaire, for an architecture or vendor-risk review.</p>
  <p>QueryAPIGate is self-hosted software, source-available under FSL-1.1-MIT. It runs inside your network; nothing is sent to the project.</p></div>
  <p style="font-size:10pt">Built from the documentation at ${VERSION}. The latest documents: github.com/AnanthaRajuC/QueryAPIGate</p>
</div>
<div class="toc"><h1>Contents</h1><ol>${DOCS.map(d => `<li><a href="#${d.slug}">${d.title}</a></li>`).join('')}</ol></div>
${sections}
</body></html>`;

const htmlPath = join(stage, '..', `${NAME}.html`);
writeFileSync(htmlPath, html);
const exe = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'load' });
await page.pdf({
  path: join(OUT, `${NAME}.pdf`), format: 'A4', printBackground: true, displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: `<div style="font:8px Arial,sans-serif;color:#626d69;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>QueryAPIGate ${VERSION} security pack</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' },
});
await browser.close();
console.log(`wrote security-pack/${NAME}.pdf and security-pack/${NAME}.zip`);
