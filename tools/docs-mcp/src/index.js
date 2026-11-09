// The QueryAPIGate documentation MCP server: a Cloudflare Worker that lets AI agents search the site's documentation,
// how-to guides and blog posts, and read any of them as markdown.
//
//   POST /mcp   MCP over Streamable HTTP, stateless: JSON-RPC in, JSON out, no sessions
//   GET  /      what this is and how to connect a client
//
// The search index (search-index.json, one entry per heading section) and the list of pages (pages.json) are built into
// the Worker when it is deployed, so a request only searches them; pages themselves are fetched from the site when asked
// for, so they are always the live version. Both files are written by tools/search_index.py; see README.md here.

import INDEX from '../../../search-index.json';
import PAGES from '../../../pages.json';

const SITE = 'https://anantharajuc.github.io/QueryAPIGate-website/';
const VERSION = '1.0.0';
const PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const BIG = 40000; // a page longer than this comes back as its contents, to ask for one section of it

// ---- the index, prepared once when the Worker starts ----
const KIND = { doc: 'documentation', guide: 'how-to', post: 'blog', page: 'site' };
const ENTRIES = INDEX.map(e => {
  const [path, anchor = ''] = e.u.split('#');
  const key = path.startsWith('Guide.dc.html?') ? path.slice('Guide.dc.html?'.length) : path;
  return { e, key, anchor, kind: KIND[e.k] || 'site', weight: /(^| › )(next steps|see also|related|further reading)\b/i.test(e.h) ? 0.5 : 1, head: (e.t + ' ' + e.h).toLowerCase(), text: e.x.toLowerCase(), words: e.x.split(' ').length + 1 };
});
const AVG = ENTRIES.reduce((n, d) => n + d.words, 0) / ENTRIES.length;
const BY_KEY = new Map(PAGES.map(p => [p.key, p]));
const STOP = new Set('a an and are as at be by can do does for from how i in into is it its me my of on or the to what when where which who why with you your'.split(' '));

const count = (s, w) => { let n = 0; for (let i = s.indexOf(w); i !== -1; i = s.indexOf(w, i + w.length)) n++; return n; };

// BM25 over each section's text, with a match in the page title or heading counting three times; a section matching
// only some of the words scores in proportion, and a "Next steps" or "See also" section (links to other pages, full of
// their words) counts half. At most two sections per page, so one long page can't fill the results.
function search(query, kind, limit) {
  const terms = [...new Set(query.toLowerCase().match(/[a-z0-9_]+/g) || [])].filter(w => w.length > 1 && !STOP.has(w));
  if (!terms.length) return { terms, hits: [] };
  const pool = kind && kind !== 'any' ? ENTRIES.filter(d => d.kind === kind) : ENTRIES;
  const tf = terms.map(w => pool.map(d => count(d.text, w) + 3 * count(d.head, w)));
  const idf = tf.map(col => { const df = col.reduce((n, f) => n + (f ? 1 : 0), 0); return Math.log(1 + (ENTRIES.length - df + 0.5) / (df + 0.5)); });
  const scored = [];
  pool.forEach((d, i) => {
    let s = 0, hit = 0;
    for (let j = 0; j < terms.length; j++) { const f = tf[j][i]; if (f) { hit++; s += idf[j] * f * 2.2 / (f + 1.2 * (0.25 + 0.75 * d.words / AVG)); } }
    if (s) scored.push({ s: s * d.weight * hit / terms.length, d });
  });
  scored.sort((a, b) => b.s - a.s);
  const per = new Map(), hits = [];
  for (const x of scored) {
    const n = (per.get(x.d.key) || 0) + 1; per.set(x.d.key, n);
    if (n > 2) continue;
    hits.push(x.d); if (hits.length >= limit) break;
  }
  return { terms, hits };
}

// a stretch of the section's text around the first word of the query that it contains
function snippet(d, terms, size = 280) {
  const at = Math.min(...terms.map(w => d.text.indexOf(w)).filter(i => i >= 0), Infinity);
  const x = d.e.x;
  if (!isFinite(at) || at < size / 2) return x.length > size ? x.slice(0, size).replace(/\s+\S*$/, '') + ' …' : x;
  const from = x.lastIndexOf(' ', at - size / 3) + 1, to = x.indexOf(' ', from + size);
  return '… ' + x.slice(from, to === -1 ? undefined : to) + (to === -1 ? '' : ' …');
}

// ---- pages as markdown ----
// The heading ids Guide.dc.html gives a rendered page (and search-index.json uses): the heading's text, lower-cased,
// with each run of anything but a-z and 0-9 as one dash.
const inlineText = md => md.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, '')
  .replace(/`|\*\*|__/g, '').replace(/(^|\W)[*_](\S[^*_]*?)[*_](?!\w)/g, '$1$2').replace(/\s+/g, ' ').trim();
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function headings(md) {
  const out = []; let fence = false;
  md.split('\n').forEach((line, i) => {
    if (/^(```|~~~)/.test(line)) fence = !fence;
    const m = !fence && line.match(/^(#{1,4})\s+(.+?)\s*#*\s*$/);
    if (m) out.push({ line: i, level: m[1].length, text: inlineText(m[2]), id: slug(inlineText(m[2])) });
  });
  return out;
}

// one section: its heading and everything under it, up to the next heading of the same or a higher level
function section(md, id) {
  const lines = md.split('\n'), hs = headings(md), at = hs.findIndex(h => h.id === id);
  if (at === -1) return null;
  const end = hs.slice(at + 1).find(h => h.level <= hs[at].level);
  return lines.slice(hs[at].line, end ? end.line : lines.length).join('\n').trim();
}

function contents(md) {
  return headings(md).filter(h => h.level >= 2 && h.level <= 3).map(h => (h.level === 3 ? '    ' : '') + `- ${h.text}  (section: ${h.id})`).join('\n');
}

const pageUrl = (key, anchor) => SITE + (/^[dgp]=/.test(key) ? 'Guide.dc.html?' + key : key) + (anchor ? '#' + anchor : '');

// what someone passed as `page`: a key (g=…, d=…, p=…), an address on the site, or the slug on its own
function resolve(input) {
  let s = String(input || '').trim(), anchor = '';
  try { if (/^https?:/.test(s)) { const u = new URL(s); anchor = u.hash.slice(1); s = u.search ? u.search.slice(1) : u.pathname.split('/').pop(); } } catch (e) {}
  if (s.includes('#')) [s, anchor] = s.split('#');
  s = s.replace(/^\?/, '').replace(/\.md$/i, '');
  if (BY_KEY.has(s)) return { page: BY_KEY.get(s), anchor };
  const bySlug = PAGES.filter(p => p.key.slice(2).toLowerCase() === s.toLowerCase() || p.md.replace(/\.md$/i, '').toLowerCase().endsWith('/' + s.toLowerCase()) || p.md.replace(/\.md$/i, '').toLowerCase() === s.toLowerCase());
  if (bySlug.length === 1) return { page: bySlug[0], anchor };
  if (ENTRIES.some(d => d.key === s)) return { site: s, anchor };
  return null;
}

async function fetchMd(path) {
  const r = await fetch(SITE + path, { cf: { cacheTtl: 600, cacheEverything: true } });
  if (!r.ok) throw new Error(`the site answered ${r.status} for ${path}`);
  return (await r.text()).replace(/^﻿/, '');
}

// ---- the tools ----
const KINDS = ['any', 'documentation', 'how-to', 'blog', 'site'];
const TOOLS = [
  {
    name: 'search_docs', title: 'Search the QueryAPIGate documentation',
    description: 'Search QueryAPIGate\'s documentation, how-to guides, blog posts and site pages. Returns the best-matching sections, each with its page and section id for get_page, a link to it on the site, and a snippet. Ask in plain words, e.g. "rate-limit an API key" or "mask a column for a partner".',
    inputSchema: { type: 'object', properties: {
      query: { type: 'string', description: 'What to look for, in plain words.' },
      kind: { type: 'string', enum: KINDS, description: 'Only this kind of page: documentation (reference), how-to (step-by-step guides), blog, or site (the website\'s own pages). Default any.' },
      limit: { type: 'integer', minimum: 1, maximum: 20, description: 'How many sections to return. Default 8.' },
    }, required: ['query'], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'get_page', title: 'Read a page as markdown',
    description: `Read a QueryAPIGate documentation page, how-to guide or blog post as markdown: the whole page, or one section of it. Pass the page from a search_docs result (e.g. "g=17-rate-limit-a-key" or "d=MCP"), or its address on the site. A page over ${BIG / 1000}k characters comes back as its contents; ask again with one of its sections.`,
    inputSchema: { type: 'object', properties: {
      page: { type: 'string', description: 'The page: its key from search_docs or list_pages (d=…, g=…, p=…), or its address on the site.' },
      section: { type: 'string', description: 'Optional: one section of the page, by the id search_docs or the contents give (e.g. "a-limit-for-one-key").' },
    }, required: ['page'], additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'list_pages', title: 'List the documentation',
    description: 'List every QueryAPIGate documentation page, how-to guide and blog post, by kind and category, with the key get_page takes.',
    inputSchema: { type: 'object', properties: {
      kind: { type: 'string', enum: ['any', 'documentation', 'how-to', 'blog'], description: 'Only this kind. Default any.' },
    }, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

class ToolError extends Error {}

async function callTool(name, args) {
  args = args || {};
  if (name === 'search_docs') {
    const query = String(args.query || '').trim();
    if (!query) throw new ToolError('query is empty: say what to look for, e.g. "rate-limit an API key".');
    if (args.kind && !KINDS.includes(args.kind)) throw new ToolError(`kind must be one of ${KINDS.join(', ')}.`);
    const limit = Math.max(1, Math.min(20, parseInt(args.limit, 10) || 8));
    const { terms, hits } = search(query, args.kind, limit);
    if (!hits.length) return `Nothing in the QueryAPIGate documentation matches "${query}". Try other words, or list_pages to see everything there is.`;
    return `${hits.length} section${hits.length === 1 ? '' : 's'} for "${query}", best first. Read one with get_page, passing its page and section.\n\n` + hits.map((d, i) =>
      `${i + 1}. ${d.e.t}${d.e.h ? ' › ' + d.e.h : ''}  (${d.e.c})\n   page: ${d.key}${d.anchor ? `  section: ${d.anchor}` : ''}\n   ${pageUrl(d.key, d.anchor)}\n   ${snippet(d, terms)}`).join('\n\n');
  }
  if (name === 'get_page') {
    const r = resolve(args.page);
    if (!r) throw new ToolError(`No page "${args.page}". Pass a page from search_docs or list_pages, e.g. "g=17-rate-limit-a-key" or "d=MCP".`);
    const want = String(args.section || r.anchor || '').trim().replace(/^#/, '');
    if (r.site) {
      // one of the website's own pages: HTML, not markdown, so what the index holds about it
      const parts = ENTRIES.filter(d => d.key === r.site && (!want || d.anchor === want));
      if (!parts.length) throw new ToolError(`The page ${r.site} has no section "${want}".`);
      return `# ${parts[0].e.t}\nSource: ${pageUrl(r.site, want)}\n(A page of the website, not a document: this is its text as the site's search index holds it.)\n\n` +
        parts.map(d => (d.e.h ? `## ${d.e.h}\n` : '') + d.e.x).join('\n\n');
    }
    const p = r.page, md = await fetchMd(p.md);
    const head = `# ${p.title}\nSource: ${pageUrl(p.key, want)}\nMarkdown: ${SITE}${p.md}\n`;
    if (want) {
      const sec = section(md, want);
      if (!sec) throw new ToolError(`"${p.title}" has no section "${want}". Its sections:\n${contents(md)}`);
      return head + `Section: ${want}\n\n${sec}`;
    }
    if (md.length > BIG) return head + `\nThis page is ${Math.round(md.length / 1000)}k characters. Ask get_page again with one of its sections:\n\n${contents(md)}`;
    return head + '\n' + md.trim();
  }
  if (name === 'list_pages') {
    const kind = args.kind && args.kind !== 'any' ? args.kind : null;
    const groups = new Map();
    for (const p of PAGES) { if (kind && p.kind !== kind) continue; const g = `${p.kind} · ${p.cat}`; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(p); }
    return [...groups].map(([g, ps]) => `## ${g}\n` + ps.map(p => `- ${p.title}  (page: ${p.key}${p.date ? ', ' + p.date : ''})`).join('\n')).join('\n\n');
  }
  return null;
}

// ---- MCP over Streamable HTTP ----
const INSTRUCTIONS = 'Answers questions about QueryAPIGate, a self-hosted gateway that publishes saved SQL as REST endpoints and MCP tools, with grants, masking and an audit record on every call. Use search_docs first, then get_page with the page and section of the best result to read it in full. Cite the link each result gives.';

async function handle(msg) {
  const isObj = msg && typeof msg === 'object' && !Array.isArray(msg);
  if (isObj && ('result' in msg || 'error' in msg) && !('method' in msg)) return null; // a client's response: nothing to answer
  if (!isObj || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') return { jsonrpc: '2.0', id: isObj && 'id' in msg ? msg.id : null, error: { code: -32600, message: 'Invalid request' } };
  if (!('id' in msg)) return null; // a notification: nothing to answer
  const ok = result => ({ jsonrpc: '2.0', id: msg.id, result });
  const err = (code, message) => ({ jsonrpc: '2.0', id: msg.id, error: { code, message } });
  switch (msg.method) {
    case 'initialize': {
      const asked = msg.params && msg.params.protocolVersion;
      return ok({ protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0], capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'queryapigate-docs', title: 'QueryAPIGate documentation', version: VERSION }, instructions: INSTRUCTIONS });
    }
    case 'ping': return ok({});
    case 'tools/list': return ok({ tools: TOOLS });
    case 'tools/call': {
      const name = msg.params && msg.params.name;
      if (!TOOLS.some(t => t.name === name)) return err(-32602, `Unknown tool: ${name}`);
      try { return ok({ content: [{ type: 'text', text: await callTool(name, msg.params.arguments) }] }); }
      catch (e) { return ok({ content: [{ type: 'text', text: e instanceof ToolError ? e.message : 'Something went wrong: ' + e.message }], isError: true }); }
    }
    default: return err(-32601, `Method not found: ${msg.method}`);
  }
}

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id' };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

async function mcp(request) {
  if (request.method === 'GET') return new Response('This MCP server does not open a server-to-client stream; send JSON-RPC requests with POST.', { status: 405, headers: { Allow: 'POST', ...CORS } });
  if (request.method === 'DELETE') return new Response(null, { status: 405, headers: { Allow: 'POST', ...CORS } });
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST', ...CORS } });
  let body;
  try { body = await request.json(); } catch (e) { return json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error: the body is not JSON' } }, 400); }
  if (Array.isArray(body)) {
    if (!body.length) return json({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid request: empty batch' } }, 400);
    const out = (await Promise.all(body.map(handle))).filter(Boolean);
    return out.length ? json(out) : new Response(null, { status: 202, headers: CORS });
  }
  const out = await handle(body);
  return out ? json(out) : new Response(null, { status: 202, headers: CORS });
}

function home(origin) {
  const url = origin + '/mcp';
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>QueryAPIGate documentation MCP server</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:760px;margin:48px auto;padding:0 20px;color:#17201d;background:#f3f5f4}
h1{font-size:28px;line-height:1.2}code,pre{font-family:ui-monospace,monospace;font-size:13.5px}pre{background:#10201b;color:#e6efeb;padding:12px 14px;border-radius:8px;overflow:auto}a{color:#1f8a6e}</style></head><body>
<h1>QueryAPIGate documentation MCP server</h1>
<p>Lets AI agents search <a href="${SITE}">QueryAPIGate</a>'s documentation, ${PAGES.filter(p => p.kind === 'how-to').length} how-to guides and blog posts, and read any page as markdown. No sign-in, read-only.</p>
<p>Server address: <code>${url}</code> (MCP over Streamable HTTP)</p>
<h2>Claude Code</h2><pre>claude mcp add --transport http queryapigate-docs ${url} --scope user</pre>
<h2>Codex</h2><pre>codex mcp add queryapigate-docs --url ${url}</pre>
<h2>Cursor, Claude Desktop, Windsurf</h2><pre>{ "mcpServers": { "queryapigate-docs": { "command": "npx", "args": ["-y", "mcp-remote", "${url}"] } } }</pre>
<p>Tools: <code>search_docs</code>, <code>get_page</code>, <code>list_pages</code>. Server version ${VERSION}; ${ENTRIES.length} indexed sections across ${PAGES.length} pages.</p>
</body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS } });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
    if (url.pathname === '/mcp' || url.pathname === '/mcp/') return mcp(request);
    if (url.pathname === '/' && request.method === 'GET') return home(url.origin);
    return new Response('Not found. The MCP server is at /mcp.', { status: 404, headers: CORS });
  },
};
