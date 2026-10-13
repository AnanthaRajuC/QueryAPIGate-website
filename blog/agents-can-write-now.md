# Agents can write now. A person approves each write.

QueryAPIGate 0.21 lets an AI agent write through a saved query, under rules its author set and with a person in the loop. It is experimental, and labelled as such in the product and the changelog.

## What changed

Until 0.21 the MCP server only ever read. Saved queries that write were not listed as tools, and since 0.20.1 a call naming one is refused before it runs. That rule still holds for every query not explicitly opened to agents.

A saved query's author can now mark it `agent_writes`. It must be a single INSERT, UPDATE or DELETE; DDL is never allowed. Marked that way, it becomes a write tool for callers whose grant allows the write.

Two modes:

- **`"approval"`** – the agent's first call does not run anything. It creates a write request with the exact SQL and the exact arguments. An administrator with the `writes.approve` capability sees it on the Console's new **Approvals** screen (or at `/api/v1/write-requests`), approves or rejects it, and the agent's second call runs it once, with exactly the approved arguments. Change an argument and the approval no longer matches.
- **`"insert"`** – an INSERT runs at once, with an idempotency key, for the cases where opening a ticket by itself is the point.

## The guard rails

Every agent write runs in a transaction and is rolled back if it touches more rows than the query's `max_affected_rows`. The credential that asked can never approve its own request (`own_write`). An agent cannot pile up more than 100 waiting writes. The audit log records the argument names and a hash, never the values. Whatever a write returns through `RETURNING` is masked like any read.

A `writes_awaiting_approval` alert and the Agents screen's write counts keep the queue visible.

## Why a person, not a policy

A policy can say which rows an agent may change. It cannot say whether this particular change, right now, is the one you meant. For writes that matter, the approval step gives you that, with the SQL and arguments in front of you, and leaves both decisions in the audit log.

Supported on PostgreSQL, MySQL, SQLite and DuckDB. [Guide 49](Guide.dc.html?g=49-let-an-agent-write-with-a-person-approving-each-write) walks through it end to end.
