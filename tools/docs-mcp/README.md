# The documentation MCP server

A Cloudflare Worker that lets AI agents search QueryAPIGate's documentation, how-to guides, blog posts and site pages,
and read any page as markdown. Read-only, no sign-in, MCP over Streamable HTTP at `/mcp`; `/` says how to connect.

| Tool | What it does |
|---|---|
| `search_docs` | The best-matching sections for a question, each with its page, section id, link and a snippet |
| `get_page` | A page as markdown, or one section of it; a page over 40k characters comes back as its contents |
| `list_pages` | Every document, guide and post, by kind and category |

## Where its answers come from

- **Search** uses `search-index.json` (one entry per heading section) and `pages.json` (every page and its markdown),
  both written by `tools/search_index.py`. They're built into the Worker when it's deployed, so a request only searches
  them, well inside the free plan's 10 ms of CPU a request.
- **Pages** are fetched from the site when asked for (cached for 10 minutes), so they're always the live version.

So search is as current as the last deploy. The daily sync workflow (`.github/workflows/sync-upstream.yml`) deploys
again whenever it changes the index, once these two repository secrets are set: `CLOUDFLARE_API_TOKEN` (a token from
the "Edit Cloudflare Workers" template) and `CLOUDFLARE_ACCOUNT_ID`.

## Run it, deploy it

```
cd tools/docs-mcp && npm install
npx wrangler dev                 # http://127.0.0.1:8787/mcp, no account needed
npx wrangler login               # once, in a browser
npx wrangler deploy              # https://queryapigate-docs.<your-subdomain>.workers.dev/mcp
```

Check it with the MCP Inspector:
`npx @modelcontextprotocol/inspector --cli http://127.0.0.1:8787/mcp --transport http --method tools/list`
