# Phase 3 — Decision Agent + Conflict Resolution

**Window:** Hours 18–26 (overlaps end of Phase 2) · **Team:** 2 people, ideally the Phase 2 owners
**Source:** `03_TRD.md` §2.5; `04_ARCHITECTURE.md` §2 principle 3, §4 (conflict/escalation data flow); `02_PRD.md` FR-9 to FR-12, success metric "100% of seeded conflicts caught"

## Objective
This is explicitly your project's differentiator. `04_ARCHITECTURE.md` principle 3 states it directly: *"Disagreement is surfaced, not averaged away."* Do not let this become a simple weighted-average function — the conflict round-trip is what makes this a "genuine multi-agent system" rather than a pipeline, per `01_OVERVIEW.md`'s "what a judge should walk away believing" list, item 2.

## Step-by-step

### 1. Inputs
Decision Agent consumes three things, per TRD §2.5:
- Forecast Agent output (Phase 2)
- Triage Agent output (Phase 2)
- Relevant shared-memory trend (query `aqi_history`/`complaints_history` for "today vs. N-day trailing window," per TRD §2.4)

### 2. Conflict detection logic — implement exactly as specified
TRD is precise here, not vague: *"if Forecast risk classification and Triage severity signal diverge by more than one risk tier, mark `conflict: true`."*

This requires you to define a shared risk-tier ordering both agents' outputs map onto, e.g.:
```
low < medium < high < severe/very_high
```
Forecast's `predicted_aqi` needs a mapping function to a risk tier (this mapping itself isn't specified in your docs — you'll need to define AQI-value-to-tier breakpoints; standard AQI category breakpoints exist publicly, but I do not have a verified, current source for exact breakpoint numbers, so confirm against an authoritative AQI reference before hardcoding thresholds). Triage's `severity_signal` already comes as a tier (`low | medium | high | very_high`) per its Phase 2 schema.

**[PLAN — not in source docs]** Concrete comparison logic: convert both signals to a numeric tier index (0–3), flag conflict if `abs(forecast_tier - triage_tier) > 1`.

### 3. On conflict: the supplementary-data round-trip
This is explicitly **not** a static branch — TRD says "this is a real second round-trip." `04_ARCHITECTURE.md` §4 spells out the exact 5-step sequence:
1. Triage Agent detects a spike, escalates directly to Decision Agent (already wired in Phase 2 via `agent_decisions_log`)
2. Decision Agent compares against the most recent Forecast output, finds conflict
3. Decision Agent **requests supplementary data from the Ingestion Agent** — e.g. a nearby sensor zone's current reading
4. Ingestion Agent fetches and returns it (this means Decision Agent needs to call back into Phase 1's ingestion logic, not just read cached BigQuery rows)
5. Decision Agent re-evaluates with the new evidence and produces an updated, conflict-resolved recommendation

Implement `POST /api/decision/resolve-conflict` (already stubbed in Phase 0 per `ENDPOINT_OVERVIEW.md`) to trigger this exact round-trip, returning the updated Decision Agent object with `conflict_detected: false` if resolved.

### 4. Output schema — exactly per TRD §2.5
```json
{
  "zone": "string",
  "risk_level": "low | medium | high | severe",
  "overall_confidence": 0.0,
  "conflict_detected": false,
  "recommendations": [
    {"target": "schools", "action": "string"},
    {"target": "hospital", "action": "string"},
    {"target": "transit", "action": "string"},
    {"target": "citizens", "action": "string"}
  ],
  "rationale": "string"
}
```
Persist to the `decisions` table from Phase 0's schema.

### 5. Role-targeted recommendation content
Per PRD FR-11 and user stories §5.4–5.6, recommendations must be **specific**, not generic risk labels:
- Schools: e.g. "Zone B schools: postpone outdoor sports"
- Hospital: e.g. "Hospital respiratory ward: prepare for ~18% higher load" — note the "~18%" figure in your PRD is an *illustrative example* in the source document, not a fixed constant; your Decision Agent needs actual logic to compute a load-impact estimate from the current risk signals, or you should present it as an estimate range rather than a fabricated precise percentage
- Transit: e.g. "Transit authority: issue air-quality warning"
- Citizens: personalized-guidance-style message, not just the raw AQI number (per PRD §1 problem statement's explicit complaint about "raw AQI number, no personalized guidance")

### 6. Rationale generation via Gemini — with an important constraint
TRD is explicit: *"Gemini explains a decision that was computed, it does not compute the decision itself."* Practically: compute `risk_level`, `conflict_detected`, and `recommendations` with your own deterministic/rule-based logic first, **then** pass those already-computed values to Gemini as grounding context for generating the natural-language `rationale` string. This ordering matters — it's a defensible answer if a judge asks "how do you prevent the LLM from hallucinating a risk score," and it directly satisfies FR-12 (confidence score + rationale) without making risk classification LLM-dependent.

### 7. Wire the endpoints
- `GET /api/decision` returns real Decision Agent output per zone
- `POST /api/decision/resolve-conflict` triggers the round-trip described above

## Team split suggestion
- 1 person: conflict detection + tier-mapping logic + supplementary-data round-trip
- 1 person: recommendation generation + Gemini rationale integration

## Deliverables checklist
- [ ] Risk-tier mapping defined and documented for both Forecast and Triage signals
- [ ] Conflict detection fires correctly when tiers diverge by more than one level
- [ ] Supplementary-data round-trip actually calls back into Ingestion Agent (not a stub)
- [ ] Recommendations are role-specific and derived from computed risk, not generic
- [ ] Rationale generated via Gemini, grounded in already-computed structured values
- [ ] `decisions` table populated correctly, `/api/decision` and `/api/decision/resolve-conflict` both functional

## Milestone check (hour 26)
Seed a deliberately conflicting scenario (Forecast = Medium, Triage = Very High for one zone) and confirm: `conflict_detected: true` fires, the supplementary-data round-trip executes and logs to `agent_decisions_log`, and a final resolved recommendation is produced with the conflict visible in the rationale text.

## Common pitfalls
- Silently averaging Forecast and Triage signals into a blended score instead of implementing real divergence detection — this is the single most likely way to accidentally undermine your project's stated core differentiator.
- Letting Gemini generate the risk_level itself rather than only the rationale — breaks the "Gemini explains, doesn't compute" principle your TRD states explicitly, and is a fragile answer under judge questioning.
