# Phase 0 — Foundations

**Window:** Hours 0–3 · **Team:** whole team, split into 4 parallel tracks below
**Source:** `DATABASE_SCHEMA.md` (full doc), `ENDPOINT_OVERVIEW.md` (full doc)

## Objective
Ship a schema and a fully-stubbed API surface so every later phase has a stable contract to build against. Per `DATABASE_SCHEMA.md`: *"no live database connection is required yet"* — this phase produces files, not live infrastructure, except for GCP account setup which needs lead time.

## Prerequisites
- GitHub repo created, all 5 team members with write access
- Node.js + npm/pnpm installed for all contributors
- Decide now: Drizzle ORM or Prisma (`DATABASE_SCHEMA.md` recommends Drizzle for type-safe access from Next.js API routes, but states either works)

## Track A — Database schema (1 person)

**Step 1.** Create `src/lib/db/schema/*.sql` and commit the seven BigQuery DDL tables exactly as specified in `DATABASE_SCHEMA.md`:
- `aqi_history` — partitioned by `DATE(timestamp)`, clustered by `zone`
- `weather_history` — same partition/cluster pattern
- `complaints_history` — includes `is_simulated BOOL DEFAULT TRUE` (required per the project's data honesty statement in `01_OVERVIEW.md`)
- `forecasts` — note: this table is **not** in the original TRD §4 list; `DATABASE_SCHEMA.md` adds it explicitly because Forecast Agent output needs persistence for the timeline and what-if comparisons
- `agent_decisions_log` — described as "the most important table," backs the audit trail and the Agent Activity Timeline UI
- `decisions` — separate from the log; holds the actual recommendation objects with `approval_status`
- `reflections` — one row per Reflection Agent review, FK-equivalent to `decisions.id`
- `notifications_log` — `dispatch_status` defaults to `'simulated'`

Copy each `CREATE TABLE` statement verbatim from `DATABASE_SCHEMA.md` — do not paraphrase the DDL, the field names are load-bearing for every later phase.

**Step 2.** Set up the local-dev SQLite/Postgres equivalent via Drizzle or Prisma, mapping types per the doc's conversion table:
- `JSON` columns → SQLite `TEXT` (serialized)
- `TIMESTAMP` → SQLite `DATETIME`/ISO string
- `GENERATE_UUID()` → `crypto.randomUUID()` at the application layer
- Partitioning/clustering → dropped entirely in local dev (BigQuery-only performance feature)

**Step 3.** Write `scripts/seed.ts` populating a handful of plausible rows per table so Phase 0 stub endpoints return realistic data instead of empty arrays.

**Step 4.** Create `bigquery-client.ts` as a **typed stub only**. Function signatures should match what Phase 1 will need, but the implementation should throw a clear `"not implemented until Phase 1"` error if actually called. This is intentional — it makes it obvious if a later phase's code accidentally reaches this before BigQuery is wired up.

## Track B — API route stubs (1–2 people)

Scaffold every route from `ENDPOINT_OVERVIEW.md` under `/api` in the Next.js app. Full list, exactly as specified:

| Method | Path |
|---|---|
| GET/POST | `/api/ingestion/aqi` |
| GET | `/api/ingestion/weather` |
| GET/POST | `/api/ingestion/citizen-reports` |
| GET/POST | `/api/forecast` |
| GET | `/api/triage` |
| GET | `/api/decision` |
| POST | `/api/decision/resolve-conflict` |
| GET | `/api/reflection` |
| GET | `/api/approval/pending` |
| POST | `/api/approval` |
| GET | `/api/notification/log` |
| POST | `/api/notification/dispatch` |
| POST | `/api/whatif` |
| GET | `/api/timeline` |
| GET | `/api/benchmark` |

Conventions to enforce from hour 1 (stated exactly in `ENDPOINT_OVERVIEW.md`):
- All responses JSON, `Content-Type: application/json`
- All timestamps ISO 8601
- Mutating endpoints return the created/updated resource, not just a status code
- Errors follow `{ "error": { "code": "string", "message": "string" } }` with appropriate HTTP status (400/404/409/500)
- **Every Phase 0 stub response must include `"_mock": true`** — this is explicitly required so later-phase debugging can immediately tell stub responses from real ones

Request/response bodies must match the schemas in `03_TRD.md` §2 exactly — `ENDPOINT_OVERVIEW.md` is explicit that this document only maps schemas to routes, it does not redefine new shapes.

## Track C — GCP / Vertex AI account setup (1 person, start immediately, runs in parallel)

- Create GCP project, enable BigQuery, Cloud Storage, Vertex AI APIs
- Provision service account credentials for local dev (`.env.local`, never committed)
- Enable Gemini access via Vertex AI

> **Verify Before Building:** I am not certain how long GCP project creation, billing setup, and Vertex AI/Gemini API enablement take on a fresh account — propagation delays for API enablement are a plausible multi-hour blocker I cannot estimate confidently. Start this track immediately and in parallel with everything else; if it's not done by hour 3, it becomes the critical path for Phase 2.
> **Verify Before Building:** confirm current Vertex AI / Gemini API authentication method (service account key vs. Application Default Credentials vs. API key) against Google's current docs — I cannot confirm which is current without checking, and this affects how `.env.local` should be structured.

## Track D — Next.js scaffold + repo structure (1 person)

- `create-next-app` with TypeScript, App Router
- Folder structure: `src/app/api/...` (routes), `src/lib/db/...` (Track A), `src/lib/agents/...` (empty stubs for Phase 1+), `gpu-service/` (empty placeholder — real Python service arrives Phase 2 per `ENDPOINT_OVERVIEW.md`)
- CI basics: lint + typecheck on push (optional but cheap insurance)

## Deliverables checklist
- [ ] 7 DDL files committed under `src/lib/db/schema/`
- [ ] Drizzle/Prisma local schema working, `npm run dev` runs with zero GCP credentials
- [ ] `scripts/seed.ts` populates plausible rows
- [ ] `bigquery-client.ts` stub throws correctly if called
- [ ] All 15 routes from the table above respond with `"_mock": true` mock data matching TRD §2 schemas
- [ ] GCP project live, Vertex AI/Gemini enabled, credentials in `.env.local` (untracked)
- [ ] Repo structure supports Phase 1 without restructuring

## Milestone check (hour 3)
A teammate who joined the call cold can run `npm run dev`, hit any of the 15 endpoints, and get back schema-correct mock JSON with `"_mock": true`. If this isn't true, do not start Phase 1.

## Common pitfalls
- Skipping the `"_mock": true` field feels like a shortcut but costs you debugging time in Phase 2–3 when you can't tell if a bug is in the real agent or a leftover stub.
- Letting schema decisions happen ad hoc inside Phase 1 code instead of here — `DATABASE_SCHEMA.md` explicitly warns this causes Phase 3–4 rewrites.
