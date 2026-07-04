import { NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
import type { ApprovalPendingItem, DecisionOutput, ReflectionOutput } from "@/lib/types/agent-schemas";

export async function GET() {
  try {
    // Fetch all decisions with approval_status = 'pending'
    const pendingDecisions = sqlite.prepare("SELECT * FROM decisions WHERE approval_status = 'pending' ORDER BY generated_at DESC").all();
    
    const items: ApprovalPendingItem[] = pendingDecisions.map((d: any) => {
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
      const reflectionRecord = sqlite.prepare("SELECT * FROM reflections WHERE decision_id = ?").get(d.id) as any;
      
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

      return { decision, reflection };
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Pending Approvals API failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending approvals", details: error.message },
      { status: 500 }
    );
  }
}
