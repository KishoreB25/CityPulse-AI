# Phase 7 — Resilience Verification + Demo Rehearsal

**Window:** Hours 40–48 (final stretch, buffer included) · **Team:** whole team
**Source:** `04_ARCHITECTURE.md` §4 and §5 (conflict/degraded paths); `02_PRD.md` §7 success metrics, §8 risks; `01_OVERVIEW.md` "what a judge should walk away believing"

## Objective
No new features. Verify the specific behaviors your documentation claims as strengths, and rehearse presenting them.

## Part A — Verify the degraded/recovery path

Per `04_ARCHITECTURE.md` §5, deliberately force one live data source to fail during a test run:
1. Point the AQI or weather ingestion at an invalid URL or revoke the API key temporarily
2. Confirm retry-with-backoff fires (max 3 attempts, per Phase 1 spec)
3. Confirm fallback to cached data with `status: "stale"` and a nonzero `confidence_penalty`
4. Confirm the Decision Agent is notified directly (bypassing normal flow) and applies a confidence penalty
5. Confirm the Reflection Agent flags `stale_weather_data` (or equivalent) so it's visible to the human approver

PRD §8 explicitly frames this as a **demo moment**, not just a risk to mitigate silently: *"the FR-4 graceful degradation path doubles as a demo moment."* Consider deliberately triggering this live during your presentation rather than only pre-testing it — showing a judge the system survive a forced failure is more convincing than describing it.

## Part B — Verify the conflict/escalation path

Per `04_ARCHITECTURE.md` §4, seed a scenario where Forecast and Triage genuinely disagree by more than one tier for one zone:
1. Confirm `conflict_detected: true` fires correctly
2. Confirm the supplementary-data round-trip actually executes (a real second call to Ingestion Agent, not a stub)
3. Confirm the final recommendation reflects the resolved conflict, with the conflict visible in both the rationale text and the agent activity timeline

PRD's success metrics table target: **100% of seeded conflicts caught** in your test scenarios. Run this test multiple times with different seeded values to build confidence in the detection logic before demo day, not just once.

## Part C — Verify the human-approval bypass block (from Phase 4)

Re-run the negative test from Phase 4: attempt to call `/api/notification/dispatch` directly on a decision with `approval_status: 'pending'`. Confirm it fails. This satisfies PRD's stated metric: **"Human-approval step present before every dispatch, 100% (no bypass path)."**

## Part D — Demo script, structured against your own documentation

`01_OVERVIEW.md` lists exactly five things a judge should walk away believing. Structure your live demo to hit each one explicitly, in this order:

1. **Named user, named decision** — open with the district health officer persona and the specific decision (advisory issue/withhold) from PRD §2, not an abstract "AI for air quality" pitch
2. **Genuinely multi-agent** — show the agent activity timeline live, and deliberately trigger the conflict scenario from Part B so agents visibly "disagree" on camera
3. **Human meaningfully in the loop** — show the approval UI with reflection flags, approve a recommendation live, then attempt (and fail) the bypass call from Part C to prove it's structural, not cosmetic
4. **NVIDIA acceleration demonstrably responsible for responsiveness** — show the what-if slider live with `compute_time_ms` visible, then show the Phase 6 before/after benchmark chart
5. **Coherent GCP + NVIDIA tool combination** — briefly name-check BigQuery (shared memory), Cloud Storage (raw payload durability), Gemini (classification + rationale), Looker/dashboard (presentation), cudf.pandas + cuML (acceleration) — tie each to the specific job it does, per `05_TECH_STACK.md`'s "load-bearing, not decorative" framing, rather than just listing logos

## Part E — Rehearsal logistics

- Rehearse at least twice, full run-through, with a timer
- Assign one person as the presenter, one as the "chaos agent" who triggers the forced-failure and conflict scenarios live on cue
- Prepare a fallback: if live APIs are rate-limited or down during the actual judging slot, have a known-good cached dataset ready to demo against (PRD §8 explicitly names this as the mitigation for "live API rate limits/outages during demo")

## Deliverables checklist
- [ ] Degraded-path test passes, confidence penalty visible end-to-end to the human approver
- [ ] Conflict-path test passes reliably across multiple seeded scenarios
- [ ] Bypass-block test confirmed failing correctly (i.e., the block works)
- [ ] Demo script written, mapped explicitly to the 5-item judge belief list
- [ ] At least 2 full rehearsals completed
- [ ] Cached fallback dataset ready in case live APIs are unavailable during judging

## Milestone check (hour 48 / demo time)
Every item in the checklist above is checked, and the team can execute the demo script within your allotted presentation time without needing to explain away a bug live.

## Common pitfalls
- Treating this phase as buffer time for unfinished features instead of verification — per the original plan, no new features belong here.
- Rehearsing only the happy path and never actually triggering the degraded/conflict scenarios before demo day — if you haven't tested it live, don't promise it live.
