# Phase 1 — Real Ingestion + Live BigQuery

**Window:** Hours 3–10 · **Team:** 3–4 people
**Source:** `03_TRD.md` §2.1 (Ingestion Agent), §6 NFR-2; `02_PRD.md` FR-1 to FR-4; `04_ARCHITECTURE.md` §5 (degraded/recovery path); `DATABASE_SCHEMA.md` (Phase 1 note)

## Objective
Replace stub data with real live ingestion, and make `bigquery-client.ts` real. Per `DATABASE_SCHEMA.md`: *"Actually connecting to live BigQuery is not required until Phase 1, when the Ingestion Agent needs somewhere real to write."*

## Step-by-step

### 1. Wire up real BigQuery
- Replace the Phase 0 stub in `bigquery-client.ts` with a real client
- Point it at the 7 tables created in Phase 0's DDL
- Decide now (team-wide): does local dev keep using SQLite, with only the deployed demo environment using real BigQuery? Your docs support this — the DB doc's whole design is "connection-string change, not a schema rewrite." **[PLAN — not stated explicitly, but consistent with your docs' intent]**

> **Verify Before Building:** I cannot confirm the current BigQuery Node.js client's exact import/method names (e.g. whether it's `@google-cloud/bigquery` and what its insert/query method signatures look like this year) — check the current package docs before writing this, do not let me or your memory guess at the API surface.

### 2. AQI ingestion (`02_PRD.md` FR-1)
- Call OpenAQ (or equivalent) on a configurable interval
- Normalize to the Ingestion Agent output schema, exactly as defined in `03_TRD.md` §2.1:
```json
{
  "source": "aqi",
  "zone": "string",
  "timestamp": "ISO8601",
  "payload": {},
  "status": "ok | stale | failed",
  "confidence_penalty": 0.0
}
```
- Write raw API response to Cloud Storage
- Write normalized record to `aqi_history`

> **Verify Before Building:** OpenAQ's current endpoint URLs, auth requirements (API key vs. none), rate limits, and response shape may have changed since my training data — check OpenAQ's current documentation directly before building the parser. I do not have a verified, current source for their exact API contract.

### 3. Weather ingestion (`02_PRD.md` FR-2)
- Same pattern as AQI: call a public weather API, normalize, write to Cloud Storage + `weather_history`
- `05_TECH_STACK.md` names OpenWeatherMap as an example, not a mandate ("e.g. OpenWeatherMap or equivalent") — pick any live weather API your team can authenticate against quickly

> **Verify Before Building:** same caveat as OpenAQ — verify current auth/rate-limit/response-shape details for whichever weather API you choose before building against it.

### 4. Citizen-report simulator (`02_PRD.md` FR-3, `01_OVERVIEW.md` data honesty statement)
- Build a generator producing **statistically plausible** synthetic complaints, explicitly correlated with AQI spikes (not random noise) — this is a stated design requirement, not a nice-to-have, since PRD §8 risk table flags "citizen complaint data isn't real" and the mitigation is specifically that the simulation is "statistically plausible"
- Write to `complaints_history` with `is_simulated: TRUE` set (already the column default per the schema)
- Tag each record with `zone` and `timestamp` per FR-3

### 5. Failure handling — implement exactly, this is graded
`03_TRD.md` §2.1 and `04_ARCHITECTURE.md` §5 specify this precisely, not loosely:
1. On API failure, retry with **exponential backoff, max 3 attempts**
2. On continued failure: set `status: "stale"`, use the most recent valid cached value, set `confidence_penalty` to a nonzero value
3. **Notify the Decision Agent directly, bypassing the normal orchestrator flow** — this is explicit in the TRD ("notify Decision Agent directly (bypassing the normal flow)") so downstream confidence is correctly reduced rather than silently stale
4. This satisfies NFR-2: *"System must not silently fail on any single upstream data source outage — must degrade with explicit confidence reduction."*

Since the Decision Agent doesn't exist yet at this point in the build, implement this as: write the stale-status event to `agent_decisions_log` with `escalation_flag: true`, so Phase 3's Decision Agent can pick it up once it exists. Document this interface clearly for whoever builds Phase 3.

### 6. Wire real data into the stub routes
- `GET /api/ingestion/aqi`, `/weather`, `/citizen-reports` should now return real rows, not `"_mock": true` stubs
- `POST /api/ingestion/citizen-reports` should accept `{ zone, text, timestamp }` and create a real row (per `ENDPOINT_OVERVIEW.md`), used by the simulator

## Team split suggestion
- 1–2 people: Ingestion Agent core + retry/backoff logic
- 1 person: citizen-report simulator (statistical correlation logic)
- 1 person: BigQuery wiring + Cloud Storage raw payload writes

## Deliverables checklist
- [ ] Real BigQuery client replaces the Phase 0 stub
- [ ] Live AQI data flowing into `aqi_history` with raw payloads in Cloud Storage
- [ ] Live weather data flowing into `weather_history`
- [ ] Citizen-report simulator producing AQI-correlated synthetic complaints into `complaints_history`
- [ ] Retry/backoff (3 attempts) implemented and manually tested by forcing a failure
- [ ] Stale-data path sets `confidence_penalty` and logs an escalation event for the future Decision Agent
- [ ] `/api/ingestion/*` routes return real (non-mock) data

## Milestone check (hour 10)
Hit `/api/ingestion/aqi` and `/api/ingestion/weather` and get back real, current data. Manually kill network access to one API (or point it at a bad URL) and confirm the system falls back to cached data with `status: "stale"` instead of crashing or hanging.

## Common pitfalls
- Building the simulator as pure random noise instead of AQI-correlated — this directly undermines the PRD's stated risk mitigation and will look weak to judges who read your documentation.
- Forgetting the "notify Decision Agent directly, bypassing normal flow" requirement — if you only write to the normal queue, the degraded-path demo moment (a named strength in PRD §8) won't actually work later.
