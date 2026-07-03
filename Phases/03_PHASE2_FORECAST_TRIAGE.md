# Phase 2 — Forecast Agent, Triage Agent, GPU Service

**Window:** Hours 10–20 · **Team:** 3–4 people
**Source:** `03_TRD.md` §2.2, §2.3, §5; `04_ARCHITECTURE.md` §2 principle 6, §3; `05_TECH_STACK.md` §2, §4; `ENDPOINT_OVERVIEW.md` (gpu-service note)

## Objective
Build the two parallel analysis agents and stand up the GPU-backed Python service they (partly) run on. `ENDPOINT_OVERVIEW.md` states explicitly: the `gpu-service/` Python service is "introduced in Phase 2," called *by* Next.js API routes internally — the frontend never talks to it directly, and the `/api/triage` / `/api/forecast` contract does not change.

## ⚠️ Critical go/no-go check before starting this phase
This phase is the first point GPU access is actually exercised.

> **Verify Before Building — high priority:** confirm whether GPU/GCP provisioning (NVIDIA GPU-backed VM or GKE node pool, per `04_ARCHITECTURE.md` §6) is actually available to your team *right now*. This was flagged as unconfirmed in earlier planning and I have no way to verify it from here. If it is not confirmed working by the start of this phase, build the CPU fallback path described in the "GPU risk fallback" section below and treat the RAPIDS swap as Phase 6 work — `04_ARCHITECTURE.md` principle 6 makes acceleration additive to the pipeline, not load-bearing for the pipeline to function at all.

## Part A — Forecast Agent (`03_TRD.md` §2.2)

**Step 1.** Input: historical + current AQI/weather records from BigQuery.

**Step 2.** Model: TRD explicitly says *"lightweight time-series model (e.g. gradient-boosted regressor or Prophet-style seasonal model) — kept intentionally simple for a hackathon timeline, swappable later."* Do not over-engineer this. A simple moving-average-plus-trend model or a small gradient-boosted regressor (e.g. via `scikit-learn` or `xgboost`) is explicitly sanctioned by your own TRD as sufficient.

> **Verify Before Building:** if you choose Prophet, confirm current install/import syntax (`prophet` package name and API have changed across versions historically) — do not assume the syntax from memory is current.

**Step 3.** Output schema, exactly per TRD:
```json
{
  "zone": "string",
  "predicted_aqi": 0,
  "horizon_hours": 24,
  "confidence": 0.0,
  "reasoning": "string"
}
```
Persist to the `forecasts` table (added in `DATABASE_SCHEMA.md` beyond the original TRD §4 list, specifically to support the timeline and what-if comparisons).

**Step 4.** Build this agent so it can be **re-invoked on demand with adjusted input features** (e.g. a traffic multiplier) — this is required now even though the what-if UI doesn't arrive until Phase 5, because `forecasts.is_whatif` and `forecasts.whatif_params` columns already exist in your Phase 0 schema expecting this.

## Part B — Triage Agent (`03_TRD.md` §2.3)

**Step 1.** Input: raw citizen report text from `complaints_history`.

**Step 2.** Gemini call for classification — symptom category + severity language. This is your first live Gemini integration.

> **Verify Before Building:** I cannot confirm the current Vertex AI Gemini SDK's exact call syntax (model name string, client initialization, request/response object shape) without checking current docs — these have changed across Vertex AI SDK versions. Verify before writing this integration, do not copy remembered syntax as fact.

**Step 3.** Feature engineering over geo + time + category features, using `cudf.pandas` per TRD §5.

**Step 4.** Clustering via `cuML` (DBSCAN or KMeans) to detect spatial/temporal hotspots.

**Step 5.** Output schema, exactly per TRD:
```json
{
  "zone": "string",
  "complaint_count": 0,
  "trend_vs_yesterday": "up | down | flat",
  "severity_signal": "low | medium | high | very_high",
  "hotspot_detected": true,
  "summary": "string"
}
```

**Step 6.** Escalation path: TRD states the Triage Agent "can independently call the orchestrator to escalate directly to the Decision Agent if `complaint_count` spikes beyond a threshold ahead of the next scheduled cycle." Since Decision Agent arrives in Phase 3, implement this now as a write to `agent_decisions_log` with `escalation_flag: true` and `agent_name: 'triage'`, same pattern as Phase 1's stale-data escalation — Phase 3 will consume both.

## Part C — GPU service scaffold

- New `gpu-service/` Python service (FastAPI recommended, matching TRD §3's orchestrator language choice)
- Hosts the `cudf.pandas`/`cuML`-dependent code: Triage's feature engineering + clustering, Forecast's historical-window feature prep
- Next.js `/api/triage` and `/api/forecast` routes proxy to this service via internal HTTP call — contract unchanged from `ENDPOINT_OVERVIEW.md`

RAPIDS enablement, exactly as stated in TRD §5:
```python
import cudf.pandas
cudf.pandas.install()
```
(or `%load_ext cudf.pandas` in a notebook context)

> **Verify Before Building:** this exact syntax is stated in your own TRD, so it likely reflects what your team already validated — but RAPIDS library APIs do shift across versions, so confirm it against current RAPIDS documentation before your team builds around it. I cannot independently confirm this is the current syntax from memory.

## GPU risk fallback (if GPU access is not confirmed)
Build Forecast/Triage using plain `pandas` + `scikit-learn` clustering (`sklearn.cluster.DBSCAN` or `KMeans`) now. The interface (function signatures, output schema) should be identical whether the backend is `pandas`/`scikit-learn` or `cudf.pandas`/`cuML` — this is exactly what makes Phase 6's benchmark methodology work (TRD §5: "identical pipeline code run twice"). This isn't wasted work; it's the CPU half of your required benchmark regardless of whether GPU access comes through.

## Team split suggestion
- 1–2 people: Forecast Agent + model
- 1–2 people: Triage Agent + Gemini integration + clustering
- 1 person: `gpu-service/` scaffold + Next.js proxy wiring

## Deliverables checklist
- [ ] Forecast Agent produces schema-correct output, persisted to `forecasts`
- [ ] Forecast Agent re-runnable with adjusted parameters (traffic multiplier stub is fine for now)
- [ ] Triage Agent classifies real complaint text via Gemini
- [ ] Triage Agent clusters and detects hotspots (GPU or CPU path per the go/no-go check above)
- [ ] `gpu-service/` stood up, proxied correctly from `/api/triage` and `/api/forecast`
- [ ] Escalation events write to `agent_decisions_log` correctly for Phase 3 to consume

## Milestone check (hour 20)
`/api/forecast` and `/api/triage` both return real, schema-correct output for at least one zone, computed from real Phase 1 data — not mocks.

## Common pitfalls
- Discovering at hour 15 that GPU access isn't actually working — this is why the go/no-go check above is placed at the top of this file, not the bottom.
- Writing Forecast/Triage logic that's tightly coupled to `cudf`/`cuML`-specific APIs in a way that can't fall back to `pandas`/`scikit-learn` — keep the interface swap-friendly from the start.
