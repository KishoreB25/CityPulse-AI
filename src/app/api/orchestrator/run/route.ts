import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/orchestrator";
import crypto from "crypto";
import { db } from "@/lib/db";
import { decisions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Optional: Get the zone from query params, otherwise default to "Delhi"
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get("zone") || "Delhi";
    
    // Optional: Get lat and lng from query params for custom locations
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const lat = latParam ? parseFloat(latParam) : null;
    const lng = lngParam ? parseFloat(lngParam) : null;

    // Cache Implementation (10 minutes)
    if (zone !== "Custom") {
      const latestDecision = await db.query.decisions.findFirst({
        where: eq(decisions.zone, zone),
        orderBy: [desc(decisions.generatedAt)]
      });

      if (latestDecision) {
        const lastRunTime = new Date(latestDecision.generatedAt).getTime();
        const now = Date.now();
        const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

        if (now - lastRunTime < CACHE_TTL_MS) {
          console.log(`[API] Cache hit for ${zone}, skipping pipeline execution. TTL valid.`);
          return NextResponse.json({
            success: true,
            cached: true,
            message: `Returned cached data for ${zone}`,
            data: latestDecision,
          });
        }
      }
    }

    // Generate a unique Thread ID for the LangGraph checkpointer
    const threadId = crypto.randomUUID();

    console.log(`[API] Triggering LangGraph orchestrator for zone: ${zone}, thread: ${threadId}`);
    
    // Invoke the entire Multi-Agent LangGraph flow
    const finalState = await runPipeline(zone, threadId, lat, lng);

    return NextResponse.json({
      success: true,
      message: `LangGraph pipeline executed successfully for ${zone}`,
      data: finalState,
    });
  } catch (error: any) {
    console.error("[API] Orchestrator failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}
