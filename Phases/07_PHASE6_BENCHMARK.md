# Phase 6 — Acceleration Benchmark (pandas vs. cudf.pandas/cuML)

> **NOTE:** This phase will be handled by the user's friends.

**Window:** Hours 36–44 · **Team:** 1–2 people (Assigned to friends)
**Source:** `05_TECH_STACK.md` §4 (full methodology, stated explicitly); `02_PRD.md` success metrics table (≥5x target); `ENDPOINT_OVERVIEW.md` (`/api/benchmark`, explicitly stubbed in Phase 0 "for shape consistency")

## Objective
Produce the specific evidence artifact judges are told to look for. This is not decorative — `01_OVERVIEW.md` item 4 states explicitly that judges should walk away believing *"NVIDIA acceleration is demonstrably responsible for a faster, more interactive decision experience, with a real before/after benchmark."* The word "real" is doing work there — a fabricated or hand-waved number undermines this specific claim.

## Step-by-step, exactly per `05_TECH_STACK.md` §4

**Step 1.** Generate a synthetic **stress-test dataset** of citizen reports — "tens of thousands of records," per the doc — explicitly separate from your smaller live-demo dataset. Reuse Phase 1's citizen-report simulator logic, just run it at higher volume into a separate table/dataset so you don't pollute your live demo data.

**Step 2.** Run the **identical** Triage Agent feature-engineering + clustering pipeline twice on this dataset:
- Once with standard `pandas` + `scikit-learn`
- Once with `cudf.pandas` + `cuML`
- "No other code changes" — this is the methodological integrity point; if your CPU and GPU code paths diverge in logic, not just backend, the comparison isn't honest and a technically-minded judge may probe this.

**Step 3.** Record wall-clock time for both runs.

**Step 4.** Present as a simple before/after table and chart on the dashboard.

**Step 5.** Tie the result back to product experience explicitly in your demo narrative: *"this is the reason the what-if simulation slider can re-run the pipeline in near real time during a live demo instead of requiring a multi-second wait."* Don't present the benchmark as an isolated number — connect it directly to the Phase 5 what-if latency figure you're already displaying.

## Wire the endpoint
`GET /api/benchmark` (already stubbed in Phase 0) should now return real measured values:
```json
{
  "pandas_ms": 0,
  "cudf_ms": 0,
  "speedup": 0,
  "dataset_size": 0,
  "last_run": "ISO8601"
}
```

## On the ≥5x target
PRD's success metrics table lists *"Demonstrated speedup, pandas vs. cudf.pandas on clustering/feature prep, ≥ 5x"* as a target. I have no way to confirm your actual measured speedup will hit this — it depends on your dataset size, GPU instance type, and how much of the pipeline is genuinely GPU-bound versus I/O-bound. Run the real benchmark and report the real number, even if it's below 5x; an honest 3x speedup with a clear methodology is a stronger answer under judge questioning than a claimed 5x+ you can't defend if asked to show the raw numbers.

## Fallback if GPU access never materialized (Phase 2's fallback path)
If you built the CPU-only fallback in Phase 2, this phase becomes: build the GPU path now for the first time, using the exact same interface, and run the comparison. If GPU access genuinely isn't available at all by this point, you cannot honestly claim a GPU speedup — in that case, be transparent about this limitation in your demo rather than fabricating numbers; judges evaluating an NVIDIA-sponsored track are likely to ask pointed technical questions here, and a defensible "we didn't have GPU access in time, here's our CPU baseline and architecturally where the GPU path plugs in" is safer than an indefensible claimed number.

## Team split suggestion
- 1 person: stress-test dataset generation + running both pipeline variants
- 1 person: `/api/benchmark` wiring + dashboard chart

## Deliverables checklist
- [ ] Stress-test dataset generated (tens of thousands of records), separate from live-demo data
- [ ] Identical pipeline logic run on both `pandas`/`scikit-learn` and `cudf.pandas`/`cuML`
- [ ] Wall-clock times recorded for both
- [ ] `/api/benchmark` returns real (non-mock) measured values
- [ ] Dashboard displays before/after chart
- [ ] Demo narrative explicitly connects this benchmark to the what-if slider's responsiveness

## Milestone check (hour 44)
`/api/benchmark` returns real numbers you can defend if a judge asks "how did you measure this," and the dashboard visibly displays the comparison.

## Common pitfalls
- Running the CPU and GPU pipelines with subtly different logic (e.g. different clustering parameters) — invalidates the comparison's honesty.
- Benchmarking on a dataset too small to show a meaningful gap — this is explicitly why your own PRD risk table calls for "tens of thousands" of records specifically for this step.
