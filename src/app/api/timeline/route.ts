import { NextRequest, NextResponse } from "next/server";
import { queryTimeline } from "@/lib/db/bigquery-client";
import { sqlite } from "@/lib/db"; // fallback for SQLite specific fixes if needed, but we can try queryTimeline

export async function GET(request: NextRequest) {
  try {
    const zone = request.nextUrl.searchParams.get("zone") || undefined;
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    // Use the existing shared DB layer
    // It returns latest first by default, which is what the frontend expects
    const data = await queryTimeline(zone, limit);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Timeline API failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline", details: error.message },
      { status: 500 }
    );
  }
}
