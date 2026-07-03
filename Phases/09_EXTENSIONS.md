# Extensions — Stretch Features for a Stronger Judging Position

**[PLAN — none of this file is stated in your source docs]**. Everything below is my own construction, built to extend the *existing* architecture without contradicting it. None of it should be started until every checklist item in Phases 0–7 is complete and verified — a working core system with zero extensions beats a partial system with impressive-sounding add-ons, especially since your team explicitly prioritized "working end-to-end demo" as the top judging factor.

Only attempt these if you finish Phase 7's checklist with meaningful time remaining. Ordered roughly by effort-to-impact ratio for a judging audience, cheapest first.

## Tier 1 — Low effort, direct reinforcement of existing judging criteria

**1. Real-time push updates (WebSocket or Server-Sent Events)**
Instead of polling `/api/timeline`, push new agent activity log entries live to the dashboard as they happen. Directly strengthens item 2 of `01_OVERVIEW.md`'s judge-belief list ("agents disagree, escalate... not just pass data downstream") by making the multi-agent handoffs visibly *live* during the demo rather than a static list you refresh.

**2. Confidence-weighted visual encoding**
On the dashboard, encode `overall_confidence` and `confidence_penalty` visually (opacity, border style) rather than just as a number. Cheap to build, reinforces FR-12's "confidence score + rationale" requirement in a way judges notice without reading text.

**3. Explicit "why this and not that" comparison view**
When a conflict is resolved (Phase 3), show a before/after split: what Forecast alone said, what Triage alone said, what the resolved decision says, and why. This is a UI-only addition on top of data you already compute — no new agent logic needed.

## Tier 2 — Moderate effort, extends architecture without contradicting it

**4. Multi-zone comparative view**
Your architecture is already zone-scoped throughout (per `01_OVERVIEW.md`'s "Note: All data is mapped to specific city 'zones'"). A side-by-side multi-zone risk comparison view is a natural, low-risk extension — no new agent, just an aggregation query over existing `decisions` rows.

**5. Historical "what would we have recommended" backtesting**
Run the Decision Agent's logic against yesterday's actual data and compare to what a human official actually did (simulate this via a second synthetic dataset). Gives you a concrete "if this system had existed yesterday, here's the time saved" number for PRD Goal 1 ("reduce time-to-decision from hours to minutes") — currently a qualitative claim in your docs, this would make it quantitative.

**6. Escalation notification for the human approver**
If a decision sits in `pending` approval status beyond a configurable threshold, surface a visual urgency indicator. Extends the human-approval requirement (FR-14) toward a more production-realistic pattern without changing its core "no bypass" guarantee.

## Tier 3 — Higher effort, meaningfully extends scope (only if very ahead of schedule)

**7. Second data-source conflict scenario**
Your architecture's conflict logic (TRD §2.5) currently compares Forecast vs. Triage. Extending it to also detect conflict against the supplementary sensor data fetched in the round-trip (TRD §2.5's "nearby sensor readings") would demonstrate a second, independent conflict-resolution pathway using the same architectural pattern — reinforcing genuine multi-agent negotiation rather than a single hardcoded rule.

**8. Multi-city architecture stub (not full implementation)**
PRD §4 explicitly lists multi-city support as a non-goal for this submission. Do not build this. But adding a `city_id` column to your existing schema (unused for now) and mentioning in your demo narrative "the schema is already multi-city-ready" is a cheap, honest way to answer a judge's "does this scale beyond one city" question without doing the actual work — this is a documentation/schema-design point, not a feature.

**9. Cost/impact estimate on the hospital recommendation**
PRD's example "prepare for ~18% higher respiratory load" is illustrative in your source doc, not a computed figure (flagged in Phase 3's file). If time allows, build an actual lightweight regression from historical `complaints_history` severity trends to a load-impact percentage, replacing the illustrative placeholder with a genuinely computed estimate — this closes a gap between what your docs describe as an example and what your system currently computes.

## Explicitly out of scope, even as extensions
Per PRD §4 non-goals, do not build during the hackathon regardless of remaining time: real SMS/email/webhook dispatch, a mobile app, full identity/auth for approval, or genuine multi-city support. Building these would contradict your own documented scope and risks diluting focus from Phase 7's verified core loop.

## A note on judging strategy
`01_OVERVIEW.md`'s five-item judge-belief list is your actual rubric, as far as your own docs are concerned. Every extension above was chosen because it reinforces one of those five items rather than adding an unrelated feature. If you're deciding between two extension ideas under time pressure, prefer whichever ties more directly back to that list.
