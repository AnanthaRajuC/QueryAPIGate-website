"""Build the site's search index and the llms.txt files from the documents, how-to guides and pages in this repo.

Writes, at the site root:
  search-index.json  one entry per heading section (documents, guides) and one per site page; read by search.js
  llms.txt           a short index of every document and guide, for AI tools that read it
  llms-full.txt      every document and guide in full, one file

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
    guides, docs = load_js_export(gjs, 'guides'), load_js_export(gjs, 'docs')
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
    write('llms.txt', intro + '## Documentation and guides\n\n' + '\n'.join(short) + '\n')
    write('llms-full.txt', intro + '\n\n'.join(full))
    return len(entries), changed


if __name__ == '__main__':
    n, changed = build()
    print(f'search index: {n} entries' + (' · written: ' + ', '.join(changed) if changed else ' · unchanged'))
    sys.exit(0)
