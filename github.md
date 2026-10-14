repo: AnanthaRajuC/QueryAPIGate
branch: main

## Last sync
date: 2026-10-14T00:00:00Z (repo at 0.34.2)
### Updated in this project
- Copied the guides and docs that changed upstream (how-to 04, 28, 29, 30, 32, 34, 56; API, DATABASE_CONNECTION_CONFIGURATION, DATA_PROTECTION, DEPLOYMENT, THREAT_MODEL)
- Changelog entries 0.33.0-0.34.2; Roadmap and Home show 0.30-0.34 as shipped; footer version 0.34; install commands pin 0.34.2
- Live events and secrets from files and Vault shown as stable; AWS secrets, tracing, H2, JDBC and MongoDB still experimental; live-event payload sample updated to `query.run`
- Review fixes: SQL guard described as a classifier (sqlglot only for allow-lists), signing "since 0.31", backup wording, licence on the architecture diagram, three broken guide links, Deploy install pins a version and sets an API key, error codes match API.md, eight steps match across pages
- Layout: Home comparison table is two columns, mobile architecture summary, Docs mobile overflow and sidebar, AA contrast for secondary text, lang on every page, per-guide titles in the reader

## Sync history
- 2026-10-13T00:00:00Z — synced at 0.32.0: guides 51-59, DATA_PROTECTION, Trust, Deploy, Support and Stack pages, four-column footer, Console screenshots at 0.32.0
- 2026-10-11T15:02:53Z — copied documentation, SECURITY, CONTRIBUTING, CODE_OF_CONDUCT; four blog posts; live GitHub and PyPI data on Home
- 2026-10-11T14:54:01Z — copied the 50 how-to guides; in-site reader
- 2026-10-11T14:41:30Z — added Changelog, Roadmap, Compare and Guides pages; version bumped to 0.22
- 2026-10-11T13:16:35Z — built Home, Features, Docs, Security, Blog, About; copied Console screenshots

## Screen map
| Screen | Repo files |
|---|---|
| Home.dc.html | LANDING.md, README.md, pyproject.toml, BACKLOG.md |
| Features.dc.html | LANDING.md, documentation/API.md, documentation/DATABASE_CONNECTION_CONFIGURATION.md, queryapigate/alerts.py, images/console/*.webp (captured from the 0.32.0 Console) |
| Docs.dc.html | documentation/INSTALLATION_AND_SETUP.md, SECURITY.md, pyproject.toml |
| Guides.dc.html | how-to/*.md |
| Guide.dc.html | how-to/*.md, documentation/*.md, SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md (copied into project), blog/*.md |
| Compare.dc.html | LANDING.md, BACKLOG.md |
| Roadmap.dc.html | BACKLOG.md, CHANGELOG.md |
| Changelog.dc.html | CHANGELOG.md |
| Security.dc.html | SECURITY.md, documentation/THREAT_MODEL.md, documentation/DATA_PROTECTION.md |
| Blog.dc.html | CHANGELOG.md, documentation/INSTALLATION_AND_SETUP.md |
| About.dc.html | LANDING.md, pyproject.toml, LICENSE |
| Deploy.dc.html | documentation/DEPLOYMENT.md, benchmarks/README.md, benchmarks/results/*.md, deploy/helm/queryapigate |
| Trust.dc.html | documentation/DATA_PROTECTION.md, SECURITY.md, documentation/THREAT_MODEL.md, documentation/adr/ |
| Support.dc.html | CHANGELOG.md (Versioning and compatibility), SECURITY.md, documentation/DATABASE_CONNECTION_CONFIGURATION.md, .github/workflows/ci.yml |
| Stack.dc.html | frontend/package.json, pyproject.toml, documentation/TECHNOLOGY_STACK.MD, .github/workflows/ci.yml |
| QueryAPIGate Architecture.dc.html | LANDING.md (uploaded artifact) |
