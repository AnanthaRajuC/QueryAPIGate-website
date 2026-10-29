"""Build the site's search index and the llms.txt files from the documents, how-to guides and pages in this repo.

Writes, at the site root:
  search-index.json  one entry per heading section (documents, guides) and one per site page; read by search.js
  llms.txt           a short index of every document and guide, for AI tools that read it
  llms-full.txt      every document and guide in full, one file
  sitemap.xml        every page, use case, document, guide and blog post, for search engines
  feed.xml           an Atom feed of the blog posts in guides.js, newest first
  robots.txt         allows everything and points at the sitemap

Run by tools/sync-upstream.py after each sync, or by hand: python3 tools/search_index.py
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://anantharajuc.github.io/QueryAPIGate-website/'
SKIP_PAGES = {'Guide.dc.html', 'QueryAPIGate Architecture.dc.html'}


def load_js_export(src, name):
    m = re.search(r'export const ' + name + r' = (\[.*?\]);\n', src, re.S)
    return json.loads(m.group(1)) if m else []


def slug(text):
    """The heading id scheme Guide.dc.html uses: lower-case, runs of anything but a-z0-9 become one dash."""
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', text.lower()))


def inline_text(md):
    """Markdown inline syntax to plain text, close to what the rendered heading's textContent would be."""
    t = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', md)
    t = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', t)
    t = re.sub(r'<[^>]+>', '', t)
    t = t.replace('`', '').replace('**', '').replace('__', '')
    t = re.sub(r'(?<!\w)[*_](\S[^*_]*?)[*_](?!\w)', r'\1', t)
    return html.unescape(re.sub(r'\s+', ' ', t)).strip()


def sections(md):
    """Split a markdown document into (level, heading, body) sections; the body before any heading has heading ''."""
    out, level, head, buf = [], 0, '', []
    fence = False
    for line in md.splitlines():
        if line.startswith('```') or line.startswith('~~~'): fence = not fence
        m = None if fence else re.match(r'^(#{1,3})\s+(.+?)\s*#*\s*$', line)
        if m:
            out.append((level, head, '\n'.join(buf)))
            level, head, buf = len(m.group(1)), inline_text(m.group(2)), []
        else:
            buf.append(line)
    out.append((level, head, '\n'.join(buf)))
    return [(l, h, b) for l, h, b in out if h or b.strip()]


def body_text(md, limit=1400):
    t = re.sub(r'^\s*\|?\s*:?-{2,}.*$', '', md, flags=re.M)           # table rules
    t = re.sub(r'^(```|~~~).*$', '', t, flags=re.M)                   # fence markers, keep the code
    t = re.sub(r'^\s*[-*+]\s+|^\s*\d+\.\s+|^>\s?', '', t, flags=re.M)  # list and quote markers
    t = inline_text(t)
    return t[:limit]


def md_entries(kind, title, url, cat, md):
    """One entry per section; h3 sections keep their h2 as context in the heading."""
    out, h2 = [], ''
    for level, head, body in sections(md):
        if level == 1 or (level == 0 and not head):
            if body.strip(): out.append({'k': kind, 't': title, 'h': '', 'u': url, 'c': cat, 'x': body_text(body)})
            continue
        if level == 2: h2 = head
        label = head if level == 2 or not h2 else h2 + ' › ' + head
        out.append({'k': kind, 't': title, 'h': label, 'u': url + '#' + slug(head), 'c': cat, 'x': body_text(body)})
    return out


def page_entries():
    out = []
    for name in sorted(os.listdir(ROOT)):
        if not name.endswith('.dc.html') or name in SKIP_PAGES: continue
        src = open(os.path.join(ROOT, name), encoding='utf-8').read()
        title = re.search(r'<title>(.*?)</title>', src, re.S)
        title = html.unescape(title.group(1)).replace(' - QueryAPIGate', '').strip() if title else name
        desc = re.search(r'<meta name="description" content="([^"]*)"', src)
        body = src[src.find('<body'):]
        body = re.sub(r'<(script|style|helmet|nav|footer)\b.*?</\1>', ' ', body, flags=re.S | re.I)
        body = re.sub(r'\{\{.*?\}\}', ' ', body)
        heads = [inline_text(h) for h in re.findall(r'<h[1-3][^>]*>(.*?)</h[1-3]>', body, flags=re.S)]
        text = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', body))).strip()
        out.append({'k': 'page', 't': title, 'h': '', 'u': name, 'c': 'Page',
                    'x': ((desc.group(1) + ' ') if desc else '') + ' · '.join(h for h in heads if h)[:400] + ' ' + text[:900]})
        # One entry per section with an id, so what a page says further down can be found too: the section's heading, the
        # headings and bold lead-ins inside it, then the start of its text.
        for sid, sec in re.findall(r'<section\b[^>]*\bid="([^"]+)"[^>]*>(.*?)</section>', body, flags=re.S):
            shs = [inline_text(h) for h in re.findall(r'<h[2-4][^>]*>(.*?)</h[2-4]>', sec, flags=re.S)]
            if not shs: continue
            leads = [inline_text(b) for b in re.findall(r'<b\b[^>]*>(.*?)</b>', sec, flags=re.S)]
            keys = ' · '.join(dict.fromkeys(k for k in shs[1:] + leads if k and len(k) < 80))
            stext = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', sec))).strip()
            out.append({'k': 'page', 't': title, 'h': shs[0], 'u': name + '#' + sid, 'c': 'Page', 'x': (keys[:400] + ' ' + stext[:300]).strip()})
    for f in sorted(os.listdir(os.path.join(ROOT, 'use-cases'))):
        if not f.endswith('.dc.html'): continue
        src = open(os.path.join(ROOT, 'use-cases', f), encoding='utf-8').read()
        title = re.search(r'<title>(.*?)</title>', src, re.S)
        title = html.unescape(title.group(1)).replace(' - QueryAPIGate', '').strip() if title else f
        desc = re.search(r'<meta name="description" content="([^"]*)"', src)
        body = re.sub(r'<(script|style|helmet|nav|footer)\b.*?</\1>', ' ', src[src.find('<body'):], flags=re.S | re.I)
        text = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', re.sub(r'\{\{.*?\}\}', ' ', body)))).strip()
        out.append({'k': 'page', 't': title, 'h': '', 'u': 'use-cases/' + f, 'c': 'Use case', 'x': ((desc.group(1) + ' ') if desc else '') + text[:900]})
    return out


def build():
    gjs = open(os.path.join(ROOT, 'guides.js'), encoding='utf-8').read()
    guides, docs, posts = load_js_export(gjs, 'guides'), load_js_export(gjs, 'docs'), load_js_export(gjs, 'posts')
    entries, full, short = [], [], []
    for d in docs:
        p = os.path.join(ROOT, d['path'])
        if not os.path.exists(p): continue
        md = open(p, encoding='utf-8').read()
        url = 'Guide.dc.html?d=' + d['slug']
        entries += md_entries('doc', d['title'], url, 'Documentation · ' + d['cat'], md)
        short.append(f"- [{d['title']}]({SITE}{url}): documentation, {d['cat']}")
        full.append(f"# {d['title']}\nSource: {SITE}{url}\n\n{md.strip()}\n")
    for g in guides:
        p = os.path.join(ROOT, 'how-to', g['slug'] + '.md')
        if not os.path.exists(p): continue
        md = open(p, encoding='utf-8').read()
        url = 'Guide.dc.html?g=' + g['slug']
        entries += md_entries('guide', g['title'], url, 'Guide ' + g['num'] + ' · ' + g['cat'], md)
        short.append(f"- [Guide {g['num']}: {g['title']}]({SITE}{url}): how-to, {g['cat']}")
        full.append(f"# Guide {g['num']}: {g['title']}\nSource: {SITE}{url}\n\n{md.strip()}\n")
    for b in posts:
        p = os.path.join(ROOT, 'blog', b['slug'] + '.md')
        if b.get('href') or not os.path.exists(p): continue
        md = open(p, encoding='utf-8').read()
        url = 'Guide.dc.html?p=' + b['slug']
        entries += md_entries('post', b['title'], url, 'Blog · ' + b['cat'], md)
        short.append(f"- [{b['title']}]({SITE}{url}): blog, {b['cat']}, {b['date']}")
        full.append(f"# {b['title']}\nSource: {SITE}{url}\n\n{md.strip()}\n")
    entries += page_entries()
    changed = []
    def write(rel, data):
        p = os.path.join(ROOT, rel)
        old = open(p, encoding='utf-8').read() if os.path.exists(p) else None
        if old != data:
            open(p, 'w', encoding='utf-8').write(data); changed.append(rel)
    write('search-index.json', json.dumps(entries, ensure_ascii=False, separators=(',', ':')))
    intro = ('# QueryAPIGate\n\n> One governed gate between your databases and everything that asks them for data: '
             'saved SQL published as REST endpoints, MCP tools for AI agents, live events and scheduled exports, '
             'with identity, grants, parameter validation, masking and an audit record on every call. Self-hosted, Python, Apache-2.0.\n\n'
             f'Site: {SITE}\nRepository: https://github.com/AnanthaRajuC/QueryAPIGate\nEverything below in one file: {SITE}llms-full.txt\n\n')
    # The glossary page's terms, as plain text, so AI tools reading these files get the vocabulary right.
    gl, gl_md = os.path.join(ROOT, 'Glossary.dc.html'), ''
    if os.path.exists(gl):
        src = open(gl, encoding='utf-8').read()
        terms = re.findall(r'<div class="gl-term" id="([^"]+)"[^>]*><dt>.*?</a>(.*?)</dt><dd><p>(.*?)</p>', src, re.S)
        if terms:
            gl_md = '\n## Glossary\n\n' + '\n'.join(f'- **{inline_text(n)}**: {inline_text(d)} ({SITE}Glossary.dc.html#{i})' for i, n, d in terms) + '\n'
    write('llms.txt', intro + '## Documentation, guides and blog posts\n\n' + '\n'.join(short) + '\n' + gl_md)
    write('llms-full.txt', intro + '\n\n'.join(full) + ('\n\n# Glossary\n' + gl_md.split('## Glossary', 1)[1] if gl_md else ''))
    # sitemap.xml and robots.txt: every page, use case, document and guide, so search engines needn't crawl to find them.
    from urllib.parse import quote
    urls = [n for n in sorted(os.listdir(ROOT)) if n.endswith('.dc.html') and n not in SKIP_PAGES]
    urls += ['use-cases/' + f for f in sorted(os.listdir(os.path.join(ROOT, 'use-cases'))) if f.endswith('.dc.html')]
    urls += ['Guide.dc.html?d=' + d['slug'] for d in docs if os.path.exists(os.path.join(ROOT, d['path']))]
    urls += ['Guide.dc.html?g=' + g['slug'] for g in guides if os.path.exists(os.path.join(ROOT, 'how-to', g['slug'] + '.md'))]
    live = [b for b in posts if not b.get('href') and os.path.exists(os.path.join(ROOT, 'blog', b['slug'] + '.md'))]
    urls += ['Guide.dc.html?p=' + b['slug'] for b in live]
    loc = lambda u: html.escape(SITE + quote(u, safe='/?=&'))
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
          + ''.join(f'  <url><loc>{loc(u)}</loc></url>\n' for u in urls) + '</urlset>\n')
    # feed.xml: the blog as Atom, so readers can follow new posts. A post's date is its update time, at noon UTC.
    stamp = lambda d: (d + '-01' if len(d) == 7 else d) + 'T12:00:00Z'
    items = [b for b in posts if b.get('href') or b in live]
    ent = ''.join(
        f'  <entry>\n    <title>{html.escape(b["title"])}</title>\n'
        f'    <link href="{loc(b.get("href") or "Guide.dc.html?p=" + b["slug"])}"/>\n'
        f'    <id>{loc("Guide.dc.html?p=" + b["slug"])}</id>\n    <updated>{stamp(b["date"])}</updated>\n'
        f'    <category term="{html.escape(b["cat"])}"/>\n    <summary>{html.escape(b.get("summary", ""))}</summary>\n  </entry>\n' for b in items)
    write('feed.xml', '<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n'
          f'  <title>QueryAPIGate blog</title>\n  <subtitle>Release notes, design notes and performance reports.</subtitle>\n'
          f'  <link href="{SITE}Blog.dc.html"/>\n  <link rel="self" href="{SITE}feed.xml"/>\n  <id>{SITE}Blog.dc.html</id>\n'
          f'  <updated>{max((stamp(b["date"]) for b in items), default="2026-01-01T12:00:00Z")}</updated>\n  <author><name>QueryAPIGate</name></author>\n'
          + ent + '</feed>\n')
    write('robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {SITE}sitemap.xml\n')
    return len(entries), changed


if __name__ == '__main__':
    n, changed = build()
    print(f'search index: {n} entries' + (' · written: ' + ', '.join(changed) if changed else ' · unchanged'))
    sys.exit(0)
