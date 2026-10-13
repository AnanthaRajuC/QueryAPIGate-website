# SQL2API is now QueryAPIGate

Same project, new name. The old one was shared by a dozen unrelated projects on PyPI, GitHub and Docker Hub, and the collisions were starting to cost people time.

## What changes

It is a clean break, on purpose. Package, command, Python import, environment variables, metrics prefix and Docker image all change:

| Before | After |
|---|---|
| `pip install sql2api` | `pip install queryapigate` |
| `sql2api serve` | `queryapigate serve` |
| `SQL2API_API_KEY` | `QUERYAPIGATE_API_KEY` |
| `sql2api_requests_total` | `queryapigate_requests_total` |
| `ghcr.io/anantharajuc/sql2api` | `ghcr.io/anantharajuc/queryapigate` |

The store format, saved queries, keys, roles and the audit log carry over unchanged.

## What does not silently happen

A server that still finds any `SQL2API_*` variable in its environment refuses to start and lists what to rename. The alternative would have been to run without an API key and hope someone noticed. Refusing is the safer failure.

## Why the break is clean

A compatibility shim that accepted both names would have doubled every place a name appears, and meant carrying the old one into 1.0's compatibility promise. One rename, done once, with a startup check that catches what was missed.

The step-by-step upgrade is in [Installation and setup](Guide.dc.html?d=INSTALLATION_AND_SETUP#upgrading-from-sql2api).
