import { NextRequest, NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
import { insertTimelineEntry } from "@/lib/db/bigquery-client";
import type { ApprovalResponse } from "@/lib/types/agent-schemas";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { decision_id, approved, reviewer_id, notes } = body;

    if (!decision_id || approved === undefined || !reviewer_id) {
      return NextResponse.json(
        { error: "decision_id, approved, and reviewer_id parameters are required" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const status = approved ? "approved" : "rejected";

    // Check if decision exists
    const decision = sqlite.prepare("SELECT * FROM decisions WHERE id = ?").get(decision_id) as any;
    if (!decision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 });
    }

    // Update decision approval status
    sqlite.prepare(`
      UPDATE decisions 
      SET approval_status = ?, reviewer_id = ?, reviewed_at = ?
      WHERE id = ?
    `).run(status, reviewer_id, timestamp, decision_id);

    // Log to Timeline
    await insertTimelineEntry({
      id: crypto.randomUUID(),
      agent_name: "human",
      zone: decision.zone,
      timestamp,
      action: `Human reviewer ${reviewer_id} ${status} decision ${decision_id}. ${notes ? 'Notes: ' + notes : ''}`,
      input_ref: decision_id,
      output_json: { approval_status: status, reviewer_id, notes },
      conflict_flag: false,
      escalation_flag: false,
      confidence: 1.0,
    });

    const response: ApprovalResponse = {
      decision_id,
      approval_status: status,
      reviewer_id,
      reviewed_at: timestamp,
      notes
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Approval API failed:", error);
    return NextResponse.json(
      { error: "Failed to process approval", details: error.message },
      { status: 500 }
    );
  }
}
