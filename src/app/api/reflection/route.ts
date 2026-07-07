import { NextRequest, NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
import { reflect } from "@/lib/agents/reflection-agent";
import type { DecisionOutput, ForecastOutput, TriageOutput } from "@/lib/types/agent-schemas";

export async function GET(request: NextRequest) {
  try {
    const decision_id = request.nextUrl.searchParams.get("decision_id");

    if (!decision_id) {
      return NextResponse.json({ error: "decision_id parameter is required" }, { status: 400 });
    }

    // Check if reflection already exists in db
    const existingReflection = (await sqlite.execute({sql: "SELECT * FROM reflections WHERE decision_id = ?", args: [decision_id]})).rows[0] as any;
    if (existingReflection) {
      return NextResponse.json({
        decision_id: existingReflection.decision_id,
        validated: Boolean(existingReflection.validated),
        requires_human_review: Boolean(existingReflection.requires_human_review),
        flags: JSON.parse(existingReflection.flags),
        notes: existingReflection.notes
      });
    }

    // Fetch the decision
    const decisionRecord = (await sqlite.execute({sql: "SELECT * FROM decisions WHERE id = ?", args: [decision_id]})).rows[0] as any;
    if (!decisionRecord) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }
    
    const decision: DecisionOutput = {
      zone: decisionRecord.zone,
      risk_level: decisionRecord.riskLevel, // Drizzle schema mapping (riskLevel)
      overall_confidence: decisionRecord.overallConfidence,
      conflict_detected: Boolean(decisionRecord.conflictDetected),
      recommendations: JSON.parse(decisionRecord.recommendations),
      rationale: decisionRecord.rationale
    };

    // We need Forecast and Triage outputs.
    const forecastRecord = (await sqlite.execute({sql: "SELECT * FROM aqi_forecasts WHERE zone = ? ORDER BY generated_at DESC LIMIT 1", args: [decision.zone]})).rows[0] as any;
    const forecastOutput: ForecastOutput = forecastRecord ? {
      zone: decision.zone,
      predicted_aqi: forecastRecord.predictedAqi,
      horizon_hours: forecastRecord.horizonHours,
      confidence: forecastRecord.confidence,
      reasoning: forecastRecord.reasoning
    } : { zone: decision.zone, predicted_aqi: 50, horizon_hours: 24, confidence: 1.0, reasoning: "" };

    const triageRecord = (await sqlite.execute({sql: "SELECT * FROM triage_results WHERE zone = ? ORDER BY generated_at DESC LIMIT 1", args: [decision.zone]})).rows[0] as any;
    const triageOutput: TriageOutput = triageRecord ? {
      zone: decision.zone,
      complaint_count: triageRecord.complaintCount,
      trend_vs_yesterday: triageRecord.trendVsYesterday,
      severity_signal: triageRecord.severitySignal,
      hotspot_detected: Boolean(triageRecord.hotspotDetected),
      summary: triageRecord.summary
    } : { zone: decision.zone, complaint_count: 0, trend_vs_yesterday: "flat", severity_signal: "low", hotspot_detected: false, summary: "" };

    // Execute Reflection
    const reflection = await reflect(decision, forecastOutput, triageOutput, decision_id);
    
    return NextResponse.json({ decision_id, ...reflection });
  } catch (error: any) {
    console.error("Reflection API failed:", error);
    return NextResponse.json(
      { error: "Failed to run reflection", details: error.message },
      { status: 500 }
    );
  }
}
