import { NextRequest, NextResponse } from "next/server";
import { resolveConflict } from "@/lib/agents/decision-agent";
import { insertDecision } from "@/lib/db/bigquery-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zone, conflict_id } = body;

    if (!zone || !conflict_id) {
      return NextResponse.json(
        { error: "zone and conflict_id parameters are required" },
        { status: 400 }
      );
    }

    // Call the Decision Agent to run the supplementary data round-trip
    const decision = await resolveConflict(zone, conflict_id);
    
    // Save the resolved decision to the database
    const decisionId = await insertDecision({
      ...decision,
    });

    return NextResponse.json({ ...decision, id: decisionId });
  } catch (error: any) {
    console.error("Resolve Conflict API failed:", error);
    return NextResponse.json(
      { error: "Failed to resolve conflict", details: error.message },
      { status: 500 }
    );
  }
}
