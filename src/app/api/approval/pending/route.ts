import { NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
import type { ApprovalPendingItem, DecisionOutput, ReflectionOutput } from "@/lib/types/agent-schemas";

export async function GET() {
  try {
    // Fetch all decisions with approval_status = 'pending'
    const pendingDecisions = (await sqlite.execute({sql: "SELECT * FROM decisions WHERE approval_status = 'pending' ORDER BY generated_at DESC", args: []})).rows;
    
    const items: ApprovalPendingItem[] = await Promise.all(pendingDecisions.map(async (d: any) => {
      // Map Decision
      const decision: DecisionOutput & { id: string; generated_at: string } = {
        id: d.id,
        zone: d.zone,
        risk_level: d.risk_level,
        overall_confidence: d.overall_confidence,
        conflict_detected: Boolean(d.conflict_detected),
        recommendations: JSON.parse(d.recommendations),
        rationale: d.rationale,
        generated_at: d.generated_at
      };

      // Fetch paired reflection if it exists
      const reflectionRecord = (await sqlite.execute({sql: "SELECT * FROM reflections WHERE decision_id = ?", args: [d.id]})).rows[0] as any;
      
      let reflection: ReflectionOutput;
      if (reflectionRecord) {
        reflection = {
          validated: Boolean(reflectionRecord.validated),
          requires_human_review: Boolean(reflectionRecord.requiresHumanReview),
          flags: JSON.parse(reflectionRecord.flags),
          notes: reflectionRecord.notes
        };
      } else {
        reflection = {
          validated: false,
          requires_human_review: true,
          flags: ["reflection_pending"],
          notes: "Reflection Agent has not processed this decision yet."
        };
      }
      
      // Fetch underlying signals (Tier 1.3 Conflict View)
      const latestForecastLog = (await sqlite.execute({sql: "SELECT output_json FROM agent_decisions_log WHERE agent_name = 'forecast' AND zone = ? AND timestamp <= ? ORDER BY timestamp DESC LIMIT 1", args: [d.zone, d.generated_at]})).rows[0] as any;
      const latestTriageLog = (await sqlite.execute({sql: "SELECT output_json FROM agent_decisions_log WHERE agent_name = 'triage' AND zone = ? AND timestamp <= ? ORDER BY timestamp DESC LIMIT 1", args: [d.zone, d.generated_at]})).rows[0] as any;

      const underlying_signals = {
        forecast: latestForecastLog ? JSON.parse(latestForecastLog.output_json) : null,
        triage: latestTriageLog ? JSON.parse(latestTriageLog.output_json) : null
      };

      return { decision, reflection, underlying_signals };
    }));

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Pending Approvals API failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending approvals", details: error.message },
      { status: 500 }
    );
  }
}
