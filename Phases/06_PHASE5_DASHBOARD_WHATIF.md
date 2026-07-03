# Phase 5 — Dashboard, Agent Activity Timeline, What-If Simulation

**Window:** Hours 26–40 (overlaps Phase 4) · **Team:** 2–3 people
**Source:** `02_PRD.md` FR-16, FR-17, success metrics table; `03_TRD.md` NFR-1; `05_TECH_STACK.md` §1 (Looker), §4; `ENDPOINT_OVERVIEW.md` (what-if section, explicitly placed in "Phase 5")

## Objective
Build the presentation layer judges will actually watch. This phase directly targets `01_OVERVIEW.md`'s "what a judge should walk away believing" items 2 and 4 (genuine multi-agent visibility, and demonstrable responsiveness from acceleration).

## Part A — Dashboard core (PRD FR-16)

Required views, stated explicitly:
- Zone-level current risk (map or grid — your docs specify "risk map" but don't mandate a literal geographic map; a zone grid with color-coded risk levels satisfies this for a hackathon timeline if a real map integration is too slow)
- Historical trend charts, reading from `aqi_history`/`weather_history`/`complaints_history`
- Agent activity timeline (Part B below)
- What-if simulation control (Part C below)

**Looker vs. native dashboard — a real tradeoff, not specified in your docs:**
`05_TECH_STACK.md` names Looker as the presentation layer, and it's listed as a "load-bearing" tool in the "why this satisfies two-or-more Google Cloud tools" justification. That said, your docs don't specify Looker embedding mechanics, and Looker setup/auth/embedding time is genuinely unknown to me.

> **Verify Before Building:** I cannot estimate how long Looker Studio/Looker embedding setup takes for your specific GCP project tier — this is a real unknown, not something I'm being falsely cautious about. Given your 2-day window, I'd suggest: build the dashboard natively in your Next.js app first (guaranteed to work, fully controllable for a live demo), and treat a real Looker embed as an added-value item only if time permits — since Looker is explicitly claimed as a used tool in `05_TECH_STACK.md`'s tool-count justification, dropping it entirely does weaken that specific claim, so flag this tradeoff to your team explicitly rather than silently deciding for them.

## Part B — Agent Activity Timeline (PRD FR-15, `05_TECH_STACK.md` Looker row)

**Step 1.** Wire `GET /api/timeline?zone=&limit=` (already stubbed Phase 0) to return `agent_decisions_log` entries, newest first, exactly per `ENDPOINT_OVERVIEW.md`.

**Step 2.** UI: a chronological feed showing `agent_name`, `action`, `timestamp`, and whether `conflict_flag`/`escalation_flag` were set. This is explicitly called out in `01_OVERVIEW.md` as evidence the system is "genuinely multi-agent... not just pass data downstream in a straight line" — make conflict/escalation events visually distinct (e.g. a colored badge) so they're legible to a judge glancing at the screen during a live demo.

**Step 3.** This view is your best answer to PRD user story 7: *"As a judge/evaluator, I want to see the system's internal agent reasoning and handoffs, not just a final answer."* Prioritize this over pure visual polish elsewhere if you're short on time.

## Part C — What-If Simulation (PRD FR-17, TRD NFR-1)

**Step 1.** Build a UI control (slider or input) for at least one adjustable parameter — PRD's example is "traffic +X%."

**Step 2.** Wire `POST /api/whatif` exactly per `ENDPOINT_OVERVIEW.md`:
- Request: `{ zone, traffic_multiplier, other_overrides? }`
- Response: `{ forecast: ForecastOutput, decision: DecisionOutput, compute_time_ms: number }`
- Critically: this reruns Forecast → Decision **without persisting as a real decision** — do not write to the `decisions` table for what-if runs, only to `forecasts` with `is_whatif: true` (per your Phase 0 schema's `forecasts.is_whatif` and `forecasts.whatif_params` columns, which exist specifically for this)

**Step 3.** Surface `compute_time_ms` in the UI — this is your direct evidence for PRD's stated success metric: *"What-if slider response time (with GPU acceleration) < 2 seconds."* Displaying the actual millisecond figure live during a demo is more convincing than claiming the number verbally.

> **Verify Before Building:** the "< 2 seconds" target is stated in your own PRD as a target, not something I can independently confirm your specific pipeline will hit — actual latency depends on your model complexity, GPU instance type, and network overhead between Next.js and `gpu-service/`. Measure it for real; don't assert the number without having actually run it.

## Team split suggestion
- 1–2 people: dashboard core (risk view + trends)
- 1 person: agent activity timeline UI
- 1 person: what-if endpoint + slider UI + latency display

## Deliverables checklist
- [ ] Zone-level risk view functional, reading real data
- [ ] Historical trend charts functional
- [ ] Agent activity timeline shows real `agent_decisions_log` entries with conflict/escalation events visually distinct
- [ ] What-if slider triggers `/api/whatif`, does not persist to `decisions`
- [ ] `compute_time_ms` displayed live in the UI
- [ ] Decision made and documented on Looker vs. native dashboard scope

## Milestone check (hour 40)
Drag the what-if slider during a mock run-through and confirm: the Forecast and Decision outputs visibly update, the timeline reflects the new (non-persisted) what-if run distinctly from real decisions, and the displayed compute time is consistent with your NFR-1 target.

## Common pitfalls
- Letting what-if runs pollute the `decisions` table — this breaks the audit trail's integrity (a what-if exploration is not a real recommendation that was ever reviewed) and could confuse the approval queue.
- Spending disproportionate time on Looker embedding at the expense of the timeline/what-if views, which are explicitly the two elements your source docs tie directly to "what a judge should walk away believing."
