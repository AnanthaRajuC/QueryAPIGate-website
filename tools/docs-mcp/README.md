# The documentation MCP server

A Cloudflare Worker that lets AI agents search QueryAPIGate's documentation, how-to guides, blog posts and site pages,
and read any page as markdown. Read-only, no sign-in, MCP over Streamable HTTP.

- **Address:** `https://queryapigate-docs.queryapigate-docs-mcp.workers.dev/mcp` (`/` says how to connect a client)
- **Built:** November 2026, modelled on ClickHouse's documentation MCP server
- **Not to be confused with** QueryAPIGate's own MCP server, which gives agents *your* data. This one only answers
  questions *about* QueryAPIGate.

| Tool | What it does |
|---|---|
| `search_docs` | The best-matching sections for a question, each with its page, section id, link and a snippet. Optional `kind` (documentation, how-to, blog, site) and `limit` (1-20, default 8) |
| `get_page` | A page as markdown, or one section of it. Takes a key from a search result (`g=17-rate-limit-a-key`, `d=MCP`, `p=…`), an address on the site, or a bare slug. A page over 40k characters comes back as its contents with section ids, to ask again for one section |
| `list_pages` | Every document, guide and post, by kind and category, with the key `get_page` takes |

Setup for each client (Claude Code, Codex, Cursor, Claude Desktop, Windsurf) is on the Docs page, "Use these docs with
AI" (`Docs.dc.html#ai`). The MCP page (end of "Ten minutes to your first governed tool") and the Connect page (end of
"Connect a client") point to it, and `llms.txt` names the server at the top.

## Why it exists

The site has a lot of documentation, and AI tools couldn't use it well:

- `llms-full.txt` is about 1.26 MB, several hundred thousand tokens: far too much to hand an agent in one go. A server
  lets the agent ask a question and get back the few sections that answer it.
- Every page on the site is rendered by JavaScript (`Guide.dc.html?g=…`), so a tool that fetches one gets the nav and
  nothing of the page. That's also why `llms.txt` now links each entry to its markdown (see below).
- QueryAPIGate is a product about giving AI agents governed access, so a docs server for agents fits.

## How it works

```
agent ──POST /mcp──▶ Worker ──search──▶ search-index.json + pages.json  (built into the Worker at deploy)
                            ──get_page─▶ the page's .md on the site     (fetched live, cached 10 minutes)
```

- **Search** runs over `search-index.json`: one entry per heading section of every doc, guide, post and site page (1,252
  entries), each with up to 1,400 characters of plain text. Scoring is BM25 over the section text. A match in the page
  title or heading counts three times. A section matching only some of the query's words scores in proportion. "Next
  steps", "See also" and similar sections (lists of links to other pages, full of their words) count half. At most two
  sections per page are returned, so one long page can't fill the results.
- **Pages** come from `pages.json`, which maps each key to its markdown file (some docs live outside `documentation/`,
  e.g. `security-pack/ARCHITECTURE.md`). The Worker fetches the markdown from the site, so it's always the live version.
- **Sections** use the same heading ids as the rendered page (`Guide.dc.html`) and the index (`tools/search_index.py`):
  the heading's text, lower-cased, each run of anything but a-z and 0-9 as one dash. Every section id the index gives
  resolves in `get_page`; all 944 were checked when the server was built. If either side's slug or heading-text rules
  change, change both.
- **Website pages** (`MCP.dc.html` and so on) are HTML, not markdown, so `get_page` returns what the index holds about
  them, and says so.
- **Protocol:** stateless Streamable HTTP. JSON-RPC in, JSON out, no sessions and no server-to-client stream (`GET /mcp`
  answers 405, which the spec allows). Batches are accepted. It negotiates protocol versions 2025-06-18, 2025-03-26 and
  2024-11-05. CORS is open. No dependencies beyond wrangler: the protocol is implemented in `src/index.js` directly.

Both index files are written by `tools/search_index.py`, which the daily sync runs, so they follow the docs.

## Decisions, and what was ruled out

- **GitMCP** (a free hosted service that turns a GitHub repo or Pages site into an MCP server) was tried first, on both
  the product repo and this one. Its search found nothing relevant for any test question and fell back to returning
  20-46 KB of README or `llms.txt`. Not good enough.
- **Hosting.** GitHub Pages can't run a server. The options were: a remote server on Cloudflare Workers (chosen: a
  one-line `claude mcp add --transport http …` setup, and it works as a connector in web clients too); a local package
  run with `uvx` (no hosting, but desktop clients only, and needs publishing to PyPI); or QueryAPIGate serving its own
  docs as saved queries (the strongest demo, but a public instance to run and secure, so it's an idea for later).
- **The index is built in, not fetched.** The free plan allows 10 ms of CPU per request. Parsing and preparing the 1.2 MB
  index took about 9 ms in Node, and a search 1-5 ms, so doing both on a cold request could exceed the limit. Code at
  the Worker's top level runs at start-up, which has its own, much larger, limit. So the index is imported, and each
  request only searches it. The cost: search is as current as the last deploy (pages are always live).
- **Measured on Cloudflare** (31 real requests via `wrangler tail`): median 1 ms of CPU, max 7 ms, all succeeded.
  Start-up 12 ms. The upload is about 1.2 MB (360 KB gzipped).

## Keeping it current

Search lags the site until the next deploy. The daily sync workflow (`.github/workflows/sync-upstream.yml`) deploys
again whenever the sync changes `search-index.json` or `pages.json`. It does nothing until two repository secrets are
set (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN`: create one in the Cloudflare dashboard, My Profile → API Tokens, "Edit Cloudflare Workers" template
- `CLOUDFLARE_ACCOUNT_ID`: shown by `npx wrangler whoami`

Until then, deploy by hand after a sync, or after any change that touches the index (a new page section, a doc edit):
`cd tools/docs-mcp && npx wrangler deploy`. Check the live server's index count on its home page ("… indexed
sections"); it should match `python3 -c "import json; print(len(json.load(open('search-index.json'))))"`.

## Run it, deploy it, check it

```
cd tools/docs-mcp && npm install
npx wrangler dev                 # http://127.0.0.1:8787/mcp, no account needed
npx wrangler login               # once: opens a browser; click Allow within about two minutes or it times out
npx wrangler whoami              # which Cloudflare account it's signed in to
npx wrangler deploy              # https://queryapigate-docs.<subdomain>.workers.dev/mcp
npx wrangler tail queryapigate-docs --format json   # live requests, with cpuTime per request
```

Check it with the official MCP Inspector, against the local or the live address:

```
npx @modelcontextprotocol/inspector --cli http://127.0.0.1:8787/mcp --transport http --method tools/list
npx @modelcontextprotocol/inspector --cli <address>/mcp --transport http --method tools/call \
  --tool-name search_docs --tool-arg 'query=rate-limit an API key'
```

Good test questions, and what should come first: "rate-limit an API key" (guide 17), "mask an email column for a partner"
(guide 45), "connect to snowflake" (guide 03, generic JDBC), "MCP write approval" (the MCP doc, guide 49), "helm chart
kubernetes install" (guide 54), "send audit log to splunk" (guide 53).

## Things to know

- **The address.** The first deploy registered the account's `workers.dev` subdomain automatically
  (`queryapigate-docs-mcp`), which is why the address repeats itself. Changing it (Cloudflare dashboard → Workers →
  Subdomain) breaks every client already set up, and the address is published in `tools/search_index.py` (`DOCS_MCP`,
  which writes `llms.txt`), `Docs.dc.html` (the section and the copy snippets in its script), `MCP.dc.html` and
  `MCP-Connect.dc.html`: change them all together.
- **The account.** It runs on the free plan of the Cloudflare account wrangler is signed in to (`npx wrangler
  whoami`), about 100,000 requests a day.
- **`wrangler dev` leaves local state** in `tools/docs-mcp/.wrangler/`. It's in `.gitignore`; it was committed by
  accident once and removed before it was pushed.
- **Weak spot:** questions asking for a definition ("what is a collection") rank how-to guides above the glossary.

## Ideas not built

- **A chat window on the site** ("Ask AI"). It needs a language model to write the answers; this server only finds
  them. The plan: a `/chat` route on this Worker that calls the Claude API with the MCP connector pointed at this
  server, streams the answer back, keeps the API key as a Worker secret, and sits behind a monthly spend limit in the
  Anthropic Console, Cloudflare Turnstile, and per-visitor limits. Estimated per question: about $0.002 on Claude
  Haiku 5.5, $0.04 on Sonnet 5.5, $0.07 on Opus 5.5 (to be measured). Set aside in November 2026.
- **QueryAPIGate serving its own docs**, as described under Decisions.
