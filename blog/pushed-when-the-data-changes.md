# Pushed when the data changes

An app that shows a price, a stock level or an order's status has two bad options for staying current. It can poll:
call the API every few seconds, mostly to hear that nothing changed, and still be a few seconds stale. Or it can be
told: and then someone has to build the telling - a websocket service, a queue, something listening to the
database - and, quietly, a second copy of the rules about who may see what.

QueryAPIGate 0.51 adds the second option without the second copy. It's called **live queries**, and it's
experimental.

## Subscribe to the query you already call

An app that calls `GET /q/product?id=1` subscribes to the same thing:

    curl -N 'localhost:5002/live/product?id=1' -H 'X-API-Key: <the app key>'

It gets the current result straight away, as a server-sent event. Then, each time the tables behind the query
change, QueryAPIGate runs the query again and sends the new result - only if it's different:

    event: result
    data: {"query": "product", "params": {"id": "1"}, "rows": [{"id": 1, "name": "Espresso machine",
           "price": 229.0, "stock": 11}], "truncated": false, "reason": "change", "refreshed_at": "..."}

Nothing about the saved query changes. No new endpoint to design, no new schema to publish, no new key to issue.

## A result, not a row

Most change-streaming tools send *rows*: this row was updated, here are its old and new values. That's the right
shape for replicating a database. It's the wrong shape for an app's screen, for two reasons.

The screen doesn't show a row. It shows the result of a query - a join, a count, a filter on the user's region. A
row change has to be turned back into that result somewhere, and that somewhere is code you write.

And a row stream has no idea who's listening. If the app's key may only see one region's orders, or a column is
masked for partners, a row stream either leaks or needs its own permission layer, kept in step with the API's.

So a live query doesn't send rows. Every result it sends is **an ordinary run of the saved query, as the
subscriber**: their grants, their `from_claim` row filter, their masking, their row limit, their quota. A key that
may not run the query gets the same `403` that `GET /q/` would give, before any stream opens. Each re-run counts
against the caller's rate limit and is recorded in run history, like any other run. If the key is revoked, the
stream closes within about a minute.

The push path isn't a side door. It's the same front door, opened again.

## How it knows something changed

A live query listens for **signals**: a connection and the names of tables that changed. Never row data. Signals come
from two places.

**QueryAPIGate's own writes.** A saved write query, ad-hoc SQL, an agent's approved write: each signals the tables it
touched. Nothing to set up.

**Debezium, for everything else.** Most data changes don't go through QueryAPIGate. Debezium Server reads the
database's change log and posts each batch of changes to QueryAPIGate, signed. QueryAPIGate keeps only the table
names and answers once that's stored. It's tested end to end against PostgreSQL, MySQL, MariaDB, MongoDB and SQL
Server, and the PostgreSQL test runs against a real Debezium Server in CI.

Each Debezium Server is a *CDC source* in the Console: QueryAPIGate generates its signing secret, shows it once with
the lines to paste into Debezium's configuration, rotates it with a grace period, and shows when it last heard from
Debezium - so a source that has gone quiet is easy to spot.

The same signals also keep the **response cache** honest. A cached `GET /q/` answer that reads a changed table becomes
a miss, so a long cache lifetime no longer means stale reads - even for callers that never subscribe.

## Bounded by design

A busy table can change thousands of times a second. A live query doesn't re-run thousands of times a second:

- Streams with the same caller, query and parameters **share one run**. A thousand screens on the same product are
  one query.
- A query runs again **at most once a second** (configurable), however many changes arrive. A 1,000-row `UPDATE` is
  one new result per stream.
- A re-run over the caller's rate limit is **postponed, not dropped**: when the limit allows, the stream gets the
  newest result, with every change made meanwhile.
- There's no backlog to replay. A live query is a state, not a log: a client that reconnects simply gets the current
  result first.

## Measured

We measured it on one laptop, each part on its own CPU cores, against PostgreSQL 16. The harness posted the changes
itself, so these numbers are QueryAPIGate's share; Debezium adds its own 0.5-1.7 seconds, mostly polling the change
log.

- **Delivery:** 1,000 streams on 100 queries. One `UPDATE` changes all 100 rows. From the commit to each stream's new
  result: **51 ms median, 86 ms p99**. Every stream, every round.
- **Cost:** one re-run takes **0.75 ms** of the events server's CPU and **0.12 ms** of the database's.
- **Scale:** **1,000 live queries**, each changing every second, kept fresh on **0.75 of one core** - about 1,300
  re-runs a second before the events server's one core runs out. Past that, run another events server.
- **No side effects:** ordinary `GET /q/` latency didn't move while re-runs happened. p50 8.19 against 8.24 ms, p99
  13.24 against 13.24 ms.
- **Ingest:** 1,200-1,470 Debezium posts a second, in batches of 200 changes, on two workers - two orders of
  magnitude above what Debezium sends.

The full method and every round are in
[the results](https://github.com/AnanthaRajuC/QueryAPIGate/blob/main/benchmarks/results/live-2026-11-16/README.md).

## Experimental, on purpose

Before it shipped, live queries had a security review, rate limits, real Debezium in CI, a how-to guide, and the
measurements above - everything QueryAPIGate asks of a feature before it graduates. It ships **experimental** for one
release anyway: the route, its events and its settings may still change in a minor release, and any change will be
in the changelog. It's off unless you set `QUERYAPIGATE_LIVE_QUERIES=1`, and it runs in the events server,
`queryapigate events`, beside the main one.

## Try it

[Guide 67](https://github.com/AnanthaRajuC/QueryAPIGate/blob/main/how-to/67-push-new-results-when-the-data-changes.md)
takes 30 minutes with Docker: PostgreSQL, Debezium Server, a saved query, and a product screen that updates 0.8
seconds after an `UPDATE` made straight in the database. The design is in
[ADR 0033](https://github.com/AnanthaRajuC/QueryAPIGate/blob/main/documentation/adr/0033-live-queries.md).
