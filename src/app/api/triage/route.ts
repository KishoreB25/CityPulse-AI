import { NextRequest, NextResponse } from "next/server";
import { triage } from "@/lib/agents/triage-agent";

const DEFAULT_ZONES = ["Zone-A", "Zone-B", "Zone-C", "Zone-D"];

export async function GET(request: NextRequest) {
  try {
    const zone = request.nextUrl.searchParams.get("zone");
    
    if (zone) {
      const result = await triage(zone);
      return NextResponse.json([result]);
    } else {
      // Run triage for all default zones in parallel
      const results = await Promise.all(
        DEFAULT_ZONES.map((z) => triage(z).catch((err) => {
          console.error(`Failed to triage ${z}: ${err.message}`);
          return {
            zone: z,
            complaint_count: 0,
            trend_vs_yesterday: "flat" as const,
            severity_signal: "low" as const,
            hotspot_detected: false,
            summary: `Triage execution failed: ${err.message}`,
          };
        }))
      );
      return NextResponse.json(results);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "TRIAGE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
