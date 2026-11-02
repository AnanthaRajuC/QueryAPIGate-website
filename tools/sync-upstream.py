#!/usr/bin/env python3
"""Sync guides and documentation from the QueryAPIGate repository into this site.

What it does, in order:
  1. Downloads how-to/*.md, documentation/*.md (and documentation/screenshots/*), SECURITY.md,
     CONTRIBUTING.md and CODE_OF_CONDUCT.md from AnanthaRajuC/QueryAPIGate (main), writing only files that changed.
  2. Rebuilds the `guides` export in guides.js from upstream's how-to/how-to.md index: number, slug, title and
     section, plus each guide's "Time" and "You'll end up with" line. A guide already in guides.js keeps the
     category it was given here; a new one gets the category its upstream section maps to (SECTION_MAP).
     New top-level documents in documentation/ are added to the `docs` export, grouped by DOC_CAT (else Reference), titled from their H1.
  4. search-index.json, llms.txt and llms-full.txt are rebuilt from the documents, guides and pages (tools/search_index.py).
  3. Rewrites the guide count wherever a page states it ("All 59 guides", "59 how-to guides", the home-page stat).

Run it by hand (python3 tools/sync-upstream.py) or let .github/workflows/sync-upstream.yml run it daily.
Standard library only. Set GITHUB_TOKEN to raise the API rate limit; unauthenticated works for a daily run.
"""
import json, os, re, sys, urllib.request

REPO = 'AnanthaRajuC/QueryAPIGate'
BRANCH = 'main'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECTION_MAP = {  # upstream how-to.md section -> this site's category, for guides not yet in guides.js
    'Getting started': 'Start', 'Building and shaping an API': 'Queries', 'Security and access control': 'Access',
    'MCP (AI agent access)': 'Agents', 'Live updates (SSE)': 'Events & exports', 'Exporting and scheduling': 'Events & exports',
    'Files and data lakes': 'Events & exports', 'Operating in production': 'Operate', 'Scaling out': 'Operate',
    'Reference walkthroughs': 'Operate',
}
CATEGORY_ORDER = ['Start', 'Queries', 'Access', 'Agents', 'Events & exports', 'Operate', 'Govern']
DOC_CAT = {  # top-level documents whose group the site sets by hand; anything else new lands under Reference
    'INSTALLATION_AND_SETUP': 'Run it', 'CONFIGURATION': 'Run it', 'DEPLOYMENT': 'Run it', 'DATABASE_CONNECTION_CONFIGURATION': 'Run it',
    'API': 'Reference', 'MCP': 'Reference', 'FEATURES': 'Reference', 'EXAMPLES': 'Reference', 'QUERY_METADATA_MANAGEMENT': 'Reference', 'SCREENSHOTS': 'Reference',
    'THREAT_MODEL': 'Security', 'DATA_PROTECTION': 'Security', 'SECURITY': 'Security', 'ARCHITECTURE': 'Security', 'QUESTIONNAIRE': 'Security', 'SBOM': 'Security',
    'PERFORMANCE_V5': 'Performance', 'PERFORMANCE_V4': 'Performance', 'PERFORMANCE_MYSQL_V2': 'Performance', 'PERFORMANCE_V3': 'Performance', 'PERFORMANCE_MYSQL_V1': 'Performance', 'PERFORMANCE_V2': 'Performance', 'PERFORMANCE': 'Performance',
    'WHY': 'Project', 'TECHNOLOGY_STACK': 'Project', 'CONTRIBUTING': 'Project', 'CODE_OF_CONDUCT': 'Project',
}
DOC_GROUP_ORDER = ['Run it', 'Reference', 'Performance', 'Security', 'Project']


def doc_cat(slug, default='Reference'):
    """A document's group: set by hand in DOC_CAT, or Performance for any PERFORMANCE* report, else the default."""
    return DOC_CAT.get(slug) or ('Performance' if slug.upper().startswith('PERFORMANCE') else default)

def api(path):
    req = urllib.request.Request(f'https://api.github.com/repos/{REPO}/contents/{path}?ref={BRANCH}',
                                 headers={'Accept': 'application/vnd.github+json', 'User-Agent': 'queryapigate-website-sync',
                                          **({'Authorization': 'Bearer ' + os.environ['GITHUB_TOKEN']} if os.environ.get('GITHUB_TOKEN') else {})})
    with urllib.request.urlopen(req, timeout=60) as r: return json.load(r)

def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'queryapigate-website-sync'}), timeout=120) as r: return r.read()

def write_if_changed(rel, data):
    path = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(path), exist_ok=True)
    old = open(path, 'rb').read() if os.path.exists(path) else None
    if old == data: return False
    open(path, 'wb').write(data); return True

def sync_dir(path, keep=lambda n: True, recurse=()):
    changed, names = [], []
    for item in api(path):
        if item['type'] == 'dir' and item['name'] in recurse:
            c, n = sync_dir(path + '/' + item['name'], keep); changed += c; continue
        if item['type'] != 'file' or not keep(item['name']): continue
        names.append(item['name'])
        if write_if_changed(path + '/' + item['name'], fetch(item['download_url'])): changed.append(path + '/' + item['name'])
    return changed, names

def time_label(t):
    t = t.lower(); nums = re.findall(r'\d+', t)
    if not nums: return None, None
    if '-' in t.split('minute')[0] and len(nums) >= 2: return f'{nums[0]}–{nums[1]} min', int(nums[0])
    if 'hour' in t and 'minute' not in t: return f'{nums[0]} h', int(nums[0]) * 60
    return f'{nums[0]} min', int(nums[0])

def clean(t):
    t = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t); t = t.replace('`', ''); return re.sub(r'\s+', ' ', t).strip()

def guide_meta(slug):
    path = os.path.join(ROOT, 'how-to', slug + '.md')
    if not os.path.exists(path): return {}
    txt = open(path, encoding='utf-8').read()
    m = re.search(r"\*\*Time:\*\*\s*(.*?)\s*\*\*You'll end up with:\*\*\s*(.*?)(?:\n\s*\n|\Z)", txt, re.S)
    if not m: return {}
    tl, tm = time_label(m.group(1)); out = clean(m.group(2))
    return {'time': tl, 'timeMin': tm, 'outcome': out[:1].upper() + out[1:]}

def rebuild_index():
    gjs = os.path.join(ROOT, 'guides.js'); src = open(gjs, encoding='utf-8').read()
    def export(name): return json.loads(re.search(r'export const %s = (\[.*?\n\]);' % name, src, re.S).group(1))
    old_guides, docs, posts = export('guides'), export('docs'), export('posts')
    note = re.search(r'\n(/\*[^\n]*Blog posts.*?\*/\n)export const posts', src, re.S)   # the how-to-publish note above posts is kept
    posts_note = note.group(1) if note else ''
    known = {g['slug']: g for g in old_guides}
    index = open(os.path.join(ROOT, 'how-to', 'how-to.md'), encoding='utf-8').read()
    guides, section, unknown_sections = [], None, set()
    for line in index.split('\n'):
        h = re.match(r'^##\s+(.+?)\s*$', line)
        if h: section = h.group(1); continue
        m = re.match(r'^\s*(\d+)\.\s+\[\*\*(.+?)\*\*\]\(([^)]+)\.md\)', line)
        if not m: continue
        num, title, slug = m.group(1).zfill(2), clean(m.group(2)), m.group(3)
        prev = known.get(slug)
        cat = prev['cat'] if prev else SECTION_MAP.get(section)
        if not cat: unknown_sections.add(section); cat = 'Operate'
        guides.append({'num': num, 'slug': slug, 'title': title, 'cat': cat, **guide_meta(slug)})
    guides.sort(key=lambda g: int(g['num']))
    # new top-level documents
    have = {d['path'] for d in docs}
    for name in sorted(os.listdir(os.path.join(ROOT, 'documentation'))):
        if not name.lower().endswith('.md') or 'documentation/' + name in have: continue
        txt = open(os.path.join(ROOT, 'documentation', name), encoding='utf-8').read()
        h1 = re.search(r'^#\s+(.+?)\s*$', txt, re.M)
        docs.append({'slug': re.sub(r'\.md$', '', name, flags=re.I), 'path': 'documentation/' + name,
                     'title': clean(h1.group(1)) if h1 else name, 'cat': doc_cat(re.sub(r'\.md$', '', name, flags=re.I))})
    for d in docs: d['cat'] = doc_cat(d['slug'], d.get('cat', 'Reference'))
    docs.sort(key=lambda d: (DOC_GROUP_ORDER.index(d['cat']) if d['cat'] in DOC_GROUP_ORDER else 99, list(DOC_CAT).index(d['slug']) if d['slug'] in DOC_CAT else 99))
    new = ('export const guides = ' + json.dumps(guides, indent=1, ensure_ascii=False) + ';\n\n'
           'export const docs = ' + json.dumps(docs, indent=1, ensure_ascii=False) + ';\n\n'
           + posts_note + 'export const posts = ' + json.dumps(posts, indent=1, ensure_ascii=False) + ';\n')
    changed = new != src
    if changed: open(gjs, 'w', encoding='utf-8').write(new)
    return guides, changed, [g for g in guides if g['slug'] not in known], unknown_sections

def rewrite_counts(n):
    pages = [f for f in os.listdir(ROOT) if f.endswith('.dc.html')] + ['use-cases/' + f for f in os.listdir(os.path.join(ROOT, 'use-cases')) if f.endswith('.dc.html')]
    touched = []
    for rel in pages:
        path = os.path.join(ROOT, rel); s = open(path, encoding='utf-8').read(); o = s
        s = re.sub(r'All \d+ guides', f'All {n} guides', s)
        s = re.sub(r'\b(?:\d+|Fifty-nine|Sixty|Sixty-one|Sixty-two) how-to guides', f'{n} how-to guides', s)
        s = re.sub(r'>\d+</b><span([^>]*)>how-to guides<', f'>{n}</b><span\\1>how-to guides<', s)
        if s != o: open(path, 'w', encoding='utf-8').write(s); touched.append(rel)
    return touched

def main():
    changed = []
    c, _ = sync_dir('how-to', keep=lambda n: n.endswith('.md')); changed += c
    c, _ = sync_dir('documentation', keep=lambda n: n.lower().endswith('.md') or n.lower().endswith(('.png', '.jpg', '.webp', '.gif')), recurse=('screenshots',)); changed += c
    for name in ('SECURITY.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md'):
        if write_if_changed(name, fetch(f'https://raw.githubusercontent.com/{REPO}/{BRANCH}/{name}')): changed.append(name)
    guides, index_changed, new_guides, unknown = rebuild_index()
    touched = rewrite_counts(len(guides))
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import search_index
    n_entries, search_changed = search_index.build()
    print(f'files updated: {len(changed)}' + (' -> ' + ', '.join(changed) if changed else ''))
    print(f'guides.js: {"rewritten" if index_changed else "unchanged"} · {len(guides)} guides' + (' · new: ' + ', '.join(g["num"] + " " + g["title"] + " [" + g["cat"] + "]" for g in new_guides) if new_guides else ''))
    if touched: print('guide count rewritten in: ' + ', '.join(touched))
    print(f'search index: {n_entries} entries' + (' · written: ' + ', '.join(search_changed) if search_changed else ' · unchanged'))
    if unknown: print('WARNING: upstream sections without a category mapping (defaulted to Operate): ' + ', '.join(sorted(unknown))); return 2
    return 0

if __name__ == '__main__': sys.exit(main())
