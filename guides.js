export const guides = [
 {
  "num": "01",
  "slug": "01-turn-your-first-sql-query-into-a-rest-api",
  "title": "Turn your first SQL query into a REST API",
  "cat": "Start",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A real HTTP endpoint, backed by your own SQL, with typed/validated parameters - callable with curl, from a browser, or from any HTTP client - and no controller, router or serialization code written by hand."
 },
 {
  "num": "02",
  "slug": "02-connect-a-database",
  "title": "Connect to PostgreSQL, MySQL, SQLite, DuckDB, ClickHouse or H2",
  "cat": "Start",
  "time": "5–15 min",
  "timeMin": 5,
  "outcome": "A real, active connection you can query through QueryAPIGate - the admin UI's schema browser will list its tables, and the API Designer will run real SQL against it."
 },
 {
  "num": "03",
  "slug": "03-connect-via-generic-jdbc",
  "title": "Connect to anything else via generic JDBC",
  "cat": "Start",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "A working connection to a database QueryAPIGate has no native driver for - Oracle, SQL Server, DB2, Snowflake, or anything else with a JDBC driver - running saved queries and ad-hoc SQL, with a clear list of what doesn't work on it."
 },
 {
  "num": "04",
  "slug": "04-connect-to-mongodb",
  "title": "Connect to MongoDB",
  "cat": "Start",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A find()-based saved query - with bound parameters, projection and sort - callable as a versioned, validated REST endpoint, exactly like a SQL one."
 },
 {
  "num": "05",
  "slug": "05-try-the-built-in-example-apis",
  "title": "Try it without any setup, using the built-in example APIs",
  "cat": "Start",
  "time": "2 min",
  "timeMin": 2,
  "outcome": "Four realistic, fully-worked example APIs - reporting, a live dashboard, a bulk export, and a partner integration - each with its own scoped key, running against a small generated database. No external database, no config file to write by hand."
 },
 {
  "num": "06",
  "slug": "06-use-bound-parameters-safely",
  "title": "Use bound parameters safely",
  "cat": "Queries",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A saved query whose parameters are typed, validated, and documented - rejecting bad input before it ever reaches your database, with every rule enforced server-side, not left to whoever's calling it."
 },
 {
  "num": "07",
  "slug": "07-group-queries-into-a-collection",
  "title": "Group related queries into a collection",
  "cat": "Queries",
  "time": "5 min",
  "timeMin": 5,
  "outcome": "Several saved queries filed under one collection name, and a scoped API key that can reach every query in it - present and future - without naming them one by one."
 },
 {
  "num": "08",
  "slug": "08-cache-a-saved-query",
  "title": "Cache a saved query's response",
  "cat": "Queries",
  "time": "5 min",
  "timeMin": 5,
  "outcome": "A saved query that skips the database entirely on a repeat call within its TTL - verified here with a real, deliberately stale result, so \"cached\" isn't just taken on faith."
 },
 {
  "num": "09",
  "slug": "09-stream-a-large-export",
  "title": "Export a large result without running out of memory",
  "cat": "Queries",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A real, measured understanding of what ?stream=true actually buys you - not taken on faith. Every number below is from a real run against a real MySQL container with 500,000 and 1,000,000 real rows, memory sampled from the actual server process."
 },
 {
  "num": "10",
  "slug": "10-allow-a-saved-query-to-write-data",
  "title": "Allow a saved query to write data",
  "cat": "Queries",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A saved INSERT/UPDATE/DELETE query that actually runs - and a clear picture of the layered permission checks that have to agree before it does. Every scenario below is verified against a real server: the default-off state, the narrowing-never-widening rule, per-verb restriction, and a write grant scoped to exactly one query."
 },
 {
  "num": "11",
  "slug": "11-browse-a-connections-schema",
  "title": "Browse a connection's schema before writing a query",
  "cat": "Queries",
  "time": "5 min",
  "timeMin": 5,
  "outcome": "A quick way to see what tables/columns actually exist - and their types, nullability, primary and foreign keys - before guessing at column names in a query. Two ways to get there: the admin UI, or the same thing over the API."
 },
 {
  "num": "12",
  "slug": "12-export-a-postman-collection",
  "title": "Export a Postman collection for a set of APIs",
  "cat": "Queries",
  "time": "2 min",
  "timeMin": 2,
  "outcome": "A real, importable Postman Collection (v2.1) covering every saved query in a collection - correct URLs, example parameter values, and documentation per field - that you can hand to a teammate without them writing a single request by hand."
 },
 {
  "num": "13",
  "slug": "13-set-up-a-scoped-api-key",
  "title": "Set up your first scoped API key",
  "cat": "Access",
  "time": "5 min",
  "timeMin": 5,
  "outcome": "A key limited to exactly one connection, read-only by default - instead of handing out the admin key (which can manage connections, saved queries and other keys, in addition to running any SQL) to every integration that just needs to run queries."
 },
 {
  "num": "14",
  "slug": "14-give-a-partner-one-query-only",
  "title": "Give an external partner access to exactly one query",
  "cat": "Access",
  "time": "5 min",
  "timeMin": 5,
  "outcome": "An API key for someone outside your organisation that runs one saved query and nothing else - no other queries, no ad-hoc SQL, no schema browsing, not even on the same connection."
 },
 {
  "num": "15",
  "slug": "15-create-a-role",
  "title": "Create a role and stamp out several keys from it",
  "cat": "Access",
  "time": "5 min",
  "timeMin": 5,
  "outcome": "A named template of grants - a **role** - and several API keys created from it, plus a clear picture of what happens to those keys when the role changes later. (Short answer: nothing.)"
 },
 {
  "num": "16",
  "slug": "16-restrict-a-key-to-tables",
  "title": "Restrict a key to specific tables",
  "cat": "Access",
  "time": "5 min",
  "timeMin": 5,
  "outcome": "A key that can run SQL on a connection but touch only the tables you name - in ad-hoc SQL and saved queries alike, however the forbidden table is reached (a join, a subquery, a CTE)."
 },
 {
  "num": "17",
  "slug": "17-rate-limit-a-key",
  "title": "Rate-limit a key, or the whole server",
  "cat": "Access",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A quota on how often callers may hit your API - per API key, for the whole server, or both - and an understanding of the headers and errors a client sees."
 },
 {
  "num": "18",
  "slug": "18-restrict-a-key-to-ips",
  "title": "Restrict a key to specific source IPs",
  "cat": "Access",
  "time": "5 min",
  "timeMin": 5,
  "outcome": "A key that only works from the addresses you list - so if it leaks, it's useless from anywhere else."
 },
 {
  "num": "19",
  "slug": "19-give-a-key-an-expiry-date",
  "title": "Give a key an expiry date",
  "cat": "Access",
  "time": "3 min",
  "timeMin": 3,
  "outcome": "A key that stops working on its own after a set date - for a trial, a contractor, a partner engagement with a known end - with nobody having to remember to revoke it."
 },
 {
  "num": "20",
  "slug": "20-read-the-audit-log",
  "title": "Read the audit log to answer \"who changed this, and when\"",
  "cat": "Access",
  "time": "5 min",
  "timeMin": 5,
  "outcome": "The answer to \"who gave this key write access?\", \"when did that connection's password change?\" or \"why was that connection deleted?\" - and, if you need it, a permanent copy of every change outside QueryAPIGate."
 },
 {
  "num": "21",
  "slug": "21-verify-who-can-reach-what",
  "title": "Verify who can reach what",
  "cat": "Access",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A reliable answer to \"which keys can call this query?\" and \"what can this key call?\" - from the Console, from the API, and from first principles."
 },
 {
  "num": "22",
  "slug": "22-encrypt-passwords-at-rest",
  "title": "Keep connection passwords out of the store",
  "cat": "Access",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "No readable database password in queryapigate.db - either because the store only holds a reference to an environment variable, or because the password is encrypted with a key that lives somewhere else."
 },
 {
  "num": "23",
  "slug": "23-put-it-behind-a-reverse-proxy",
  "title": "Put QueryAPIGate behind a reverse proxy with real TLS",
  "cat": "Operate",
  "time": "20 min",
  "timeMin": 20,
  "outcome": "QueryAPIGate reachable only over HTTPS, through Caddy or nginx, with rate limits and IP allowlists seeing each caller's real address - and live events and large exports streaming through the proxy rather than piling up in it."
 },
 {
  "num": "24",
  "slug": "24-let-an-agent-call-your-queries-via-mcp",
  "title": "Let an AI agent call your saved queries via MCP",
  "cat": "Agents",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "Your saved queries exposed as MCP tools an AI agent can list and call directly - verified here with a real MCP client, not just a curl simulation."
 },
 {
  "num": "25",
  "slug": "25-mcp-ad-hoc-tools",
  "title": "Let an agent explore your schema and run ad-hoc SQL",
  "cat": "Agents",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "An AI agent that can look at a database's tables and ask its own read-only questions with SQL - limited to the connections and tables you choose, and recorded like every other run."
 },
 {
  "num": "26",
  "slug": "26-mcp-structured-results",
  "title": "Read structured MCP results properly",
  "cat": "Agents",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "An MCP client that reads QueryAPIGate's results as data - rows, truncation and error codes - instead of parsing text meant for an LLM."
 },
 {
  "num": "27",
  "slug": "27-check-the-mcp-server-from-the-console",
  "title": "Check whether your MCP server is running, from the Console",
  "cat": "Agents",
  "time": "3 min",
  "timeMin": 3,
  "outcome": "A quick answer to \"is the MCP server up, and what will agents see?\" - without installing an MCP client."
 },
 {
  "num": "28",
  "slug": "28-build-a-client-that-watches-queries-run",
  "title": "Build a client that watches your saved queries run in real time",
  "cat": "Events & exports",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "A standalone client - Python or browser JavaScript - that receives a live event the moment any saved query - or ad-hoc SQL - runs, with real reconnect-on-drop handling. Both examples below are verified against a real running server, including a real mid-stream server drop and reconnect."
 },
 {
  "num": "29",
  "slug": "29-per-key-live-feeds",
  "title": "Give each user of your app their own private activity feed",
  "cat": "Events & exports",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "A live stream per user - in a mobile app, say - showing that user's own queries completing, and nobody else's, verified with two users side by side."
 },
 {
  "num": "30",
  "slug": "30-schedule-an-export",
  "title": "Run a scheduled export with cron, systemd or a Kubernetes CronJob",
  "cat": "Events & exports",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "A saved query's full result written to a dated file on a schedule - a nightly CSV for finance, an hourly NDJSON feed for a data pipeline - with failures reported by the scheduler you already use."
 },
 {
  "num": "31",
  "slug": "31-get-the-cli-command-for-a-query",
  "title": "Get the exact CLI command for a saved query",
  "cat": "Events & exports",
  "time": "2 min",
  "timeMin": 2,
  "outcome": "A ready-to-run queryapigate export command for one saved query - its name, parameters and a dated output path filled in - copied from the Console instead of written by hand."
 },
 {
  "num": "32",
  "slug": "32-deploy-with-docker",
  "title": "Deploy with Docker for real",
  "cat": "Operate",
  "time": "30 min",
  "timeMin": 30,
  "outcome": "QueryAPIGate running in Docker Compose behind HTTPS, with its data on a persistent volume, secrets in an env file, a health check, and the commands for backups and upgrades."
 },
 {
  "num": "33",
  "slug": "33-back-up-and-restore",
  "title": "Back up and restore the store",
  "cat": "Operate",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "A consistent backup taken while the server runs, a restore you've actually tried, and a list of what the backup doesn't hold."
 },
 {
  "num": "34",
  "slug": "34-upgrade-safely",
  "title": "Upgrade to a new version safely",
  "cat": "Operate",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "A routine for upgrades - what to read first, what to back up, what to watch afterwards - and a way back if one goes wrong."
 },
 {
  "num": "35",
  "slug": "35-wire-up-prometheus-and-grafana",
  "title": "Wire up Prometheus and Grafana",
  "cat": "Operate",
  "time": "20 min",
  "timeMin": 20,
  "outcome": "QueryAPIGate's metrics collected by Prometheus, the bundled Grafana dashboard showing traffic, errors, latency and per-connection load, and a few alert rules worth starting with."
 },
 {
  "num": "36",
  "slug": "36-trace-a-request-in-the-logs",
  "title": "Read the logs and trace one request end to end",
  "cat": "Operate",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A way to go from \"a partner says their call failed\" - or a red run in the Console - to the exact log lines behind it, using the request ID that ties them together."
 },
 {
  "num": "37",
  "slug": "37-tune-the-connection-pool",
  "title": "Diagnose and tune the connection pool",
  "cat": "Operate",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "An understanding of how many connections QueryAPIGate opens to your database, numbers to check that against, and the two settings that change it."
 },
 {
  "num": "38",
  "slug": "38-allow-a-browser-frontend-cors",
  "title": "Allow a browser-based frontend to call the API directly",
  "cat": "Operate",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A web page on another origin - https://app.example.com calling https://api.example.com - that can call QueryAPIGate from the browser and read the responses, and an understanding of what that does and doesn't protect."
 },
 {
  "num": "39",
  "slug": "39-walk-through-the-example-apis",
  "title": "Read the example APIs as a template for your own",
  "cat": "Operate",
  "time": "20 min",
  "timeMin": 20,
  "outcome": "An understanding of *why* each of the 11 example queries, 4 collections and 5 roles is set up the way it is - and a recipe to copy for each kind of API you'll build."
 },
 {
  "num": "40",
  "slug": "40-read-the-threat-model",
  "title": "Use the threat model to decide how to expose QueryAPIGate",
  "cat": "Govern",
  "time": "20 min",
  "timeMin": 20,
  "outcome": "A decision about how far to expose QueryAPIGate - your laptop, an internal network, partners on the internet, a browser app, an AI agent - and the settings each step needs, based on what QueryAPIGate does and doesn't defend against."
 },
 {
  "num": "41",
  "slug": "41-publish-files-in-s3-as-an-api",
  "title": "Publish Parquet, CSV or JSON files in S3 as an API",
  "cat": "Events & exports",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "Files in a bucket - or on a web server, or a local disk - served as governed REST endpoints and MCP tools, with no database to load them into: DuckDB reads them where they are."
 },
 {
  "num": "42",
  "slug": "42-run-several-instances",
  "title": "Run several instances behind a load balancer",
  "cat": "Operate",
  "time": "30 min",
  "timeMin": 30,
  "outcome": "Three QueryAPIGate instances serving as one - with Docker Compose or Kubernetes - that share keys, saved queries, rate limits and the cache, keep serving when one goes down, and can be upgraded one at a time."
 },
 {
  "num": "43",
  "slug": "43-give-your-team-their-own-admin-access",
  "title": "Give your team their own admin access",
  "cat": "Govern",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "Everyone who manages QueryAPIGate signing in as themselves, with a role that fits what they do; CI on a token of its own; an audit log that says who changed what; and the shared QUERYAPIGATE_API_KEY retired to a break-glass key - or removed."
 },
 {
  "num": "44",
  "slug": "44-deliver-a-daily-file-to-a-partners-bucket",
  "title": "Deliver a daily file to a partner's bucket",
  "cat": "Events & exports",
  "time": "20 min",
  "timeMin": 20,
  "outcome": "A saved query delivered every day as a Parquet file to a bucket your partner reads from - only the rows that are new since the last delivery, with every run on record, an alert when one fails, and nothing ever written outside the prefix you allowed."
 },
 {
  "num": "45",
  "slug": "45-hide-personal-data-from-a-partner-or-an-ai-agent",
  "title": "Hide personal data from a partner or an AI agent",
  "cat": "Govern",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "One saved query - or a connection a partner or an AI agent may write SQL against - where the email addresses come back as stable codes and names as I***, whatever the SQL calls the columns; queries that masking can't follow refused rather than served; and a record of what was masked, for whom."
 },
 {
  "num": "46",
  "slug": "46-let-ai-clients-sign-in-through-your-identity-provider",
  "title": "Let AI clients sign in through your identity provider",
  "cat": "Agents",
  "time": "30 min",
  "timeMin": 30,
  "outcome": "An AI client - a connector in a hosted assistant, or your own agent - connecting to your MCP server by signing its user in through your identity provider, not with an API key you hand out: the user's role decides what the agent can reach, its masking rules apply, every run is recorded under the user's name, and a token issued for anything else is refused."
 },
 {
  "num": "47",
  "slug": "47-tell-agents-what-your-data-means-and-see-what-they-did",
  "title": "Tell AI agents what your data means, and see what they did",
  "cat": "Agents",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "An agent that is told what each table and column means - imported from your database's own comments, or written in the Console - and the joins and metric definitions to use, so it writes the right SQL; and, afterwards, a view of what every agent asked, read and was refused, with an alert when one suddenly reads far more than it usually does."
 },
 {
  "num": "48",
  "slug": "48-sign-in-to-the-console-through-your-identity-provider",
  "title": "Sign in to the Console through your identity provider",
  "cat": "Govern",
  "time": "30 min",
  "timeMin": 30,
  "outcome": "Administrators signing in to the Console through your identity provider (Keycloak, Entra ID, Okta, Google Workspace, ...) - with its MFA and policies - and their role coming from the groups they're in there; someone leaving, or moving team, changes their access at their next sign-in, without anyone touching QueryAPIGate. Administrators who had tokens keep their names and history."
 },
 {
  "num": "49",
  "slug": "49-let-an-agent-write-with-a-person-approving-each-write",
  "title": "Let an AI agent write - with a person approving each write",
  "cat": "Agents",
  "time": "20 min",
  "timeMin": 20,
  "outcome": "A support agent that opens tickets by itself, and closes one only when a person has approved that exact change - each write limited to the rows it may change, run once, and on record with who asked and who approved."
 },
 {
  "num": "50",
  "slug": "50-rotate-an-api-key-without-downtime",
  "title": "Rotate an API key without downtime",
  "cat": "Govern",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A partner's key on a new secret, with the old one working until they've switched, then stopped. Same key name, same grants, the same history."
 },
 {
  "num": "51",
  "slug": "51-see-queryapigate-in-your-traces",
  "title": "See QueryAPIGate in your traces",
  "cat": "Operate",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "One trace from your app, through QueryAPIGate, to the database - in Jaeger here, or any backend that takes OpenTelemetry (Tempo, Honeycomb, Datadog, Grafana Cloud) - showing where the time went."
 },
 {
  "num": "52",
  "slug": "52-give-a-partner-a-quota-and-a-concurrency-cap",
  "title": "Give a partner a quota and a concurrency cap",
  "cat": "Access",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "A partner's key that can run at most two queries at once, get at most 100 rows a call, and make 1,000 calls a day - enforced across every instance, with the partner told how much is left."
 },
 {
  "num": "53",
  "slug": "53-send-the-audit-log-to-your-siem",
  "title": "Send the audit log to your SIEM, and prove nobody edited it",
  "cat": "Govern",
  "time": "20 min",
  "timeMin": 20,
  "outcome": "Every administrative change signed into a hash chain, streamed over mutual TLS to your SIEM as it happens - and a check, in one command, that what QueryAPIGate holds, and what your SIEM received, is what was written."
 },
 {
  "num": "54",
  "slug": "54-install-on-kubernetes-with-helm",
  "title": "Install on Kubernetes with Helm",
  "cat": "Operate",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "QueryAPIGate installed by helm install - first one pod on SQLite with its store on a volume, then three pods on PostgreSQL and Redis with the events and MCP servers, changed while serving without a single failed request."
 },
 {
  "num": "55",
  "slug": "55-promote-a-setup-from-dev-to-prod-through-a-pull-request",
  "title": "Promote a setup from dev to prod through a pull request",
  "cat": "Operate",
  "time": "20 min",
  "timeMin": 20,
  "outcome": "Dev's connections, queries, roles and keys in a file in git; prod made to match it by CI after a reviewed pull request, all or nothing; and prod refusing changes made any other way."
 },
 {
  "num": "56",
  "slug": "56-use-short-lived-database-credentials-from-vault",
  "title": "Use short-lived database credentials from Vault",
  "cat": "Access",
  "time": "20 min",
  "timeMin": 20,
  "outcome": "QueryAPIGate with no database password anywhere - Vault makes a database user for each lease, QueryAPIGate moves to the next one before the last expires, and not one call fails while it does; when Vault is down, it keeps serving while it safely can, then fails closed."
 },
 {
  "num": "57",
  "slug": "57-answer-a-security-questionnaire-about-data-and-cryptography",
  "title": "Answer a security questionnaire about data and cryptography",
  "cat": "Govern",
  "time": "30 min",
  "timeMin": 30,
  "outcome": "Answers to the data-protection and cryptography sections of a vendor security questionnaire (SIG, CAIQ, or your customer's own) - each backed by what your QueryAPIGate deployment actually does, checked on it, not taken on trust."
 },
 {
  "num": "58",
  "slug": "58-keep-the-servers-own-secrets-and-metrics-in",
  "title": "Keep the server's own secrets, and its metrics, in",
  "cat": "Operate",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "Connections that can reference only the environment variables you list, never the server's own credentials, and /metrics readable by your Prometheus and your administrators and no one else - each checked on a running server."
 },
 {
  "num": "59",
  "slug": "59-verify-a-release-before-you-run-it",
  "title": "Verify a release before you run it",
  "cat": "Govern",
  "time": "20 min",
  "timeMin": 20,
  "outcome": "Proof that the image and chart you run were built by this repository's release workflow, from the commit it names - and a cluster that refuses anything else."
 },
 {
  "num": "60",
  "slug": "60-give-each-team-its-own-workspace",
  "title": "Give each team its own workspace",
  "cat": "Access",
  "time": "15 min",
  "timeMin": 15,
  "outcome": "One QueryAPIGate serving several teams, each managing its own connections, saved queries and API keys in a workspace of its own - its owner running it without reaching anyone else's, its apps calling it as if it were the only one, and you, the platform team, seeing all of it."
 },
 {
  "num": "61",
  "slug": "61-connect-to-trino",
  "title": "Connect to Trino",
  "cat": "Start",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "One connection that reaches every catalog behind a Trino endpoint - Hive, Iceberg, Delta, Kafka, object stores, other databases - each one a governed, saved REST and MCP query, with allowed_tables, masking and a real query time limit."
 },
 {
  "num": "62",
  "slug": "62-see-whats-being-used-from-the-console",
  "title": "See what's being used, from the Console",
  "cat": "Operate",
  "time": "10 min",
  "timeMin": 10,
  "outcome": "A clear read on which keys, connections, queries and tools are actually in use - which ones are busy, which are granted but never touched - without wiring up any external monitoring."
 }
];

export const docs = [
 {
  "slug": "INSTALLATION_AND_SETUP",
  "path": "documentation/INSTALLATION_AND_SETUP.md",
  "title": "Installation and setup",
  "cat": "Run it"
 },
 {
  "slug": "CONFIGURATION",
  "path": "documentation/CONFIGURATION.md",
  "title": "Configuration",
  "cat": "Run it"
 },
 {
  "slug": "DEPLOYMENT",
  "path": "documentation/DEPLOYMENT.md",
  "title": "Deployment",
  "cat": "Run it"
 },
 {
  "slug": "DATABASE_CONNECTION_CONFIGURATION",
  "path": "documentation/DATABASE_CONNECTION_CONFIGURATION.md",
  "title": "Database connections",
  "cat": "Run it"
 },
 {
  "slug": "API",
  "path": "documentation/API.md",
  "title": "API reference",
  "cat": "Reference"
 },
 {
  "slug": "MCP",
  "path": "documentation/MCP.md",
  "title": "MCP server",
  "cat": "Reference"
 },
 {
  "slug": "FEATURES",
  "path": "documentation/FEATURES.md",
  "title": "Features",
  "cat": "Reference"
 },
 {
  "slug": "EXAMPLES",
  "path": "documentation/EXAMPLES.md",
  "title": "Example APIs",
  "cat": "Reference"
 },
 {
  "slug": "QUERY_METADATA_MANAGEMENT",
  "path": "documentation/QUERY_METADATA_MANAGEMENT.md",
  "title": "Query metadata",
  "cat": "Reference"
 },
 {
  "slug": "SCREENSHOTS",
  "path": "documentation/SCREENSHOTS.md",
  "title": "A tour of the Console",
  "cat": "Reference"
 },
 {
  "slug": "PERFORMANCE_V3",
  "path": "documentation/PERFORMANCE_V3.md",
  "title": "Performance, v3: an OLTP benchmark on PostgreSQL",
  "cat": "Performance"
 },
 {
  "slug": "PERFORMANCE_V2",
  "path": "documentation/PERFORMANCE_V2.md",
  "title": "Performance, v2: an OLTP benchmark on PostgreSQL",
  "cat": "Performance"
 },
 {
  "slug": "PERFORMANCE",
  "path": "documentation/PERFORMANCE.md",
  "title": "Performance",
  "cat": "Performance"
 },
 {
  "slug": "THREAT_MODEL",
  "path": "documentation/THREAT_MODEL.md",
  "title": "Threat model",
  "cat": "Security"
 },
 {
  "slug": "DATA_PROTECTION",
  "path": "documentation/DATA_PROTECTION.md",
  "title": "Where data goes",
  "cat": "Security"
 },
 {
  "slug": "SECURITY",
  "path": "SECURITY.md",
  "title": "Security policy",
  "cat": "Security"
 },
 {
  "slug": "ARCHITECTURE",
  "path": "security-pack/ARCHITECTURE.md",
  "title": "Architecture overview",
  "cat": "Security",
  "repoUrl": "https://github.com/AnanthaRajuC/QueryAPIGate-website/blob/main/security-pack/ARCHITECTURE.md"
 },
 {
  "slug": "QUESTIONNAIRE",
  "path": "security-pack/QUESTIONNAIRE.md",
  "title": "Security questionnaire answers",
  "cat": "Security",
  "repoUrl": "https://github.com/AnanthaRajuC/QueryAPIGate-website/blob/main/security-pack/QUESTIONNAIRE.md"
 },
 {
  "slug": "SBOM",
  "path": "security-pack/SBOM.md",
  "title": "SBOM and release verification",
  "cat": "Security",
  "repoUrl": "https://github.com/AnanthaRajuC/QueryAPIGate-website/blob/main/security-pack/SBOM.md"
 },
 {
  "slug": "WHY",
  "path": "documentation/WHY.md",
  "title": "Why QueryAPIGate",
  "cat": "Project"
 },
 {
  "slug": "TECHNOLOGY_STACK",
  "path": "documentation/TECHNOLOGY_STACK.MD",
  "title": "Technology stack",
  "cat": "Project"
 },
 {
  "slug": "CONTRIBUTING",
  "path": "CONTRIBUTING.md",
  "title": "Contributing",
  "cat": "Project"
 },
 {
  "slug": "CODE_OF_CONDUCT",
  "path": "CODE_OF_CONDUCT.md",
  "title": "Code of conduct",
  "cat": "Project"
 }
];

/* Blog posts, newest first: the Blog page, each post's page, the search index, the sitemap and feed.xml all read this list.
   To publish: add blog/<slug>.md and an entry here, then run python3 tools/search_index.py.
   date: "YYYY-MM-DD" (or "YYYY-MM"). cat: Benchmark, Performance, Release, Design note or Migration; a new one gets a filter of its own.
   topic and version are optional labels. summary is the card text. featured: true puts a post in the large card at the top
   (otherwise the newest is). href sends the card somewhere other than blog/<slug>.md, such as the changelog. */
export const posts = [
 {
  "slug": "one-mysql-six-services",
  "title": "One MySQL server, six services, one gateway",
  "date": "2026-10-25",
  "cat": "Benchmark",
  "topic": "Operations",
  "summary": "Per-user queries joining across six microservice databases on one MySQL server, through QueryAPIGate: about 1.2 ms added a call, 580-780 calls a second per worker, a ping we didn't know we were paying for, why lookups want one thread, and the isolation gap to close before you rely on table allow-lists."
 },
 {
  "slug": "what-a-governed-call-costs",
  "title": "What a governed call costs",
  "date": "2026-10-24",
  "cat": "Benchmark",
  "topic": "Operations",
  "summary": "QueryAPIGate 0.42 on PostgreSQL, measured properly: masking and table allow-lists now cost about 7%, one worker serves 730-875 calls a second, and most of what's left is round trips. The full method, every result with its range, where the time goes, a sizing rule, and what our first two attempts got wrong."
 },
 {
  "slug": "thirteen-releases-to-1-0",
  "title": "Thirteen releases on the way to 1.0",
  "date": "2026-10",
  "cat": "Release",
  "topic": "Release roundup",
  "version": "0.22 – 0.34",
  "href": "Changelog.dc.html",
  "cta": "Read the changelog",
  "summary": "Tracing, security headers, per-key limits and quotas, a tamper-evident audit log streamed to your SIEM and a Helm chart. Configuration as code, secrets managers and short-lived credentials, FIPS-approved cryptography. Eight features graduated in 0.30, releases are signed from 0.31, and live events are stable from 0.34. 0.34.1 and 0.34.2 are security fixes for MongoDB connections: upgrade if you use one."
 },
 {
  "slug": "agents-can-write-now",
  "title": "Agents can write now. A person approves each write.",
  "date": "2026-10-11",
  "cat": "Release",
  "topic": "Agents",
  "version": "0.21",
  "summary": "MCP write tools stop being a flat no. An agent proposes a write; it queues in the Console with the exact statement, the key that asked, and the connection it would touch. An administrator approves or rejects it, and both decisions land in the audit log."
 },
 {
  "slug": "why-every-front-door-runs-the-same-eight-steps",
  "title": "Why every front door runs the same eight steps",
  "date": "2026-10-11",
  "cat": "Design note",
  "topic": "Architecture",
  "summary": "REST, MCP, server-sent events and the export CLI all call one engine. Identity, limits, grant, parameters, SQL guard, execution, masking, record: the order is fixed, and a step that fails stops the call with a typed error code."
 },
 {
  "slug": "one-worker-many-threads",
  "title": "One worker, many threads, and what Redis is actually for",
  "date": "2026-10-11",
  "cat": "Design note",
  "topic": "Operations",
  "summary": "/metrics is per process, so gunicorn runs one worker and scales with threads; capacity comes from more instances. Redis then gives you one response cache, one rate-limit budget and one event stream, and if it blinks, limits are never lifted."
 },
 {
  "slug": "sql2api-is-now-queryapigate",
  "title": "SQL2API is now QueryAPIGate",
  "date": "2026-10-11",
  "cat": "Migration",
  "topic": "Project",
  "summary": "The same project, renamed because sql2api was shared by a dozen unrelated projects. A clean break: package, command, environment variables, metrics prefix and Docker image all change, and a server that still finds a SQL2API_* variable refuses to start."
 }
];
