# CityPulse AI — Build Plan Index

**Source of truth:** These phase files are derived from your uploaded `01_OVERVIEW.md`, `02_PRD.md`, `03_TRD.md`, `04_ARCHITECTURE.md`, `05_TECH_STACK.md`, `DATABASE_SCHEMA.md`, and `ENDPOINT_OVERVIEW.md`. Every technical claim below cites the source doc/section it comes from. Where a phase adds sequencing, team splits, or extension ideas not stated verbatim in your docs, it is labeled **[PLAN — not in source docs]** so you always know what's specified vs. constructed.

**Context assumed:** 2-day hackathon, 4–5 person team, judged primarily on a working end-to-end demo (per your stated priorities). GPU/GCP provisioning status is unconfirmed — flagged again in Phase 2.

## File list

| File | Covers | Est. hours |
|---|---|---|
| `01_PHASE0_FOUNDATIONS.md` | Repo, schema, API stubs, GCP setup | 0–3 |
| `02_PHASE1_INGESTION.md` | Live AQI/weather ingestion, citizen-report simulator, failure handling | 3–10 |
| `03_PHASE2_FORECAST_TRIAGE.md` | Forecast Agent, Triage Agent, GPU service, cudf/cuML | 10–20 |
| `04_PHASE3_DECISION_AGENT.md` | Conflict detection, supplementary-data round-trip, recommendations | 18–26 |
| `05_PHASE4_REFLECTION_APPROVAL_NOTIFICATION.md` | Reflection Agent, human approval gate, notification dispatch | 24–32 |
| `06_PHASE5_DASHBOARD_WHATIF.md` | Dashboard/Looker, agent activity timeline, what-if slider | 26–40 |
| `07_PHASE6_BENCHMARK.md` | pandas vs. cudf.pandas/cuML benchmark | 36–44 |
| `08_PHASE7_RESILIENCE_DEMO.md` | Forced-failure test, conflict test, demo rehearsal | 40–48 |
| `09_EXTENSIONS.md` | Optional stretch features to strengthen judging position | anytime after core loop works |
| `10_ARCHITECTURE_DIAGRAM.md` | Full system diagram (Mermaid + ASCII), reproduced/expanded from `04_ARCHITECTURE.md` §1 | reference |

## 5-Day Sprint Plan Mapping (Mentor Guidelines)

To align with the 5-day hackathon sprint structure provided by the mentor, the phases map to the following days:

| Day | Goal | Associated Phases |
|---|---|---|
| **Day 1** | Lock user story + decision moment. Set up DB schema, Cloud Storage + BigQuery with real data. | Phase 0 & Phase 1 |
| **Day 2** | Build cuDF processing pipeline. Run benchmark vs pandas. Screenshot timing. | Phase 2 & Phase 6 |
| **Day 3** | Wire Gemini for decision intelligence (the "should we issue an alert?" reasoning layer). | Phase 3 |
| **Day 4** | Looker Studio dashboard OR React frontend. Make it clickable and demo-able. Apply "Mission Control" UI rules. | Phase 4 & Phase 5 |
| **Day 5** | Demo video, README, architecture diagram, acceleration benchmark slide. | Phase 6 & Phase 7 |

## How to use these files
1. Do not start a phase until the previous phase's "Milestone check" passes. A partially-working Decision Agent built on top of a broken Ingestion Agent wastes more time than it saves.
2. Every phase file has a **Verify Before Building** box — items I am not fully certain about (library syntax, API contracts, timing estimates) that you should check against current documentation before your team commits time to them.
3. Extensions (file 09) are explicitly sequenced *after* the core loop, not interleaved — a working core system beats a partial system with bonus features.
