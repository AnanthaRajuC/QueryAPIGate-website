repo: AnanthaRajuC/QueryAPIGate
branch: main

## Last sync
date: 2026-10-13T00:00:00Z (repo at 0.32.0)
### Updated in this project
- Copied how-to guides 51-59 and refreshed every guide and doc; added documentation/DATA_PROTECTION.md; guides.js and the Guides page list 59 guides and 13 docs
- Changelog entries 0.23.0-0.32.0; Roadmap, Home and Security show 0.23-0.32 as shipped and 1.0.0-rc1 as next; footer version 0.32
- Features: limits, quotas, rotation, new alerts, operations cards and a Prove section; Use Cases: compliance and platform-team sections, corrected code samples
- Install shown three ways (pip, Docker, Helm) on Home, Docs and the nav button
- New pages: Trust (trust center), Deploy (reference architectures, measured performance, production checklist), Support (compatibility, versions, upgrades)
- Every page: title, description, Open Graph tags and favicon in the static head; nav adds Deploy and Trust; four-column footer
- Tech stack moved from Home to its own page, Stack.dc.html ("Built with"), updated for 0.23-0.32
- Use Cases: twelve sections in five audience groups (new: customer analytics, controlled writes, self-serve data, legacy databases)
- Integrations on Home redrawn as a hub; nav fits one line; removed empty data-dc-script blocks that made the framework show an error banner
- Features: Connect and Developers groups, administrators and SSO, MCP OAuth and agent usage, experimental labels, all 25 alert kinds; Console screenshots retaken at 0.32.0 into images/console/*.webp (example APIs, named admins, a partner key with a quota)
- Removed claims of key-level "row filters" (the product binds values with from_claim parameters instead)

## Sync history
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
