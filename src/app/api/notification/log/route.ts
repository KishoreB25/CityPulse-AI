import { NextResponse } from "next/server";
import { sqlite } from "@/lib/db";
import type { NotificationEntry } from "@/lib/types/agent-schemas";

export async function GET() {
  try {
    // Fetch all notifications from the log
    const notifications = (await sqlite.execute({sql: "SELECT * FROM notifications_log ORDER BY timestamp DESC", args: []})).rows as any[];
    
    const entries: NotificationEntry[] = notifications.map(n => ({
      id: n.id,
      decision_id: n.decision_id,
      zone: n.zone,
      timestamp: n.timestamp,
      target_audience: n.target_audience,
      message: n.message,
      approved_by: n.approved_by,
      dispatch_status: n.dispatch_status
    }));

    return NextResponse.json(entries);
  } catch (error: any) {
    console.error("Notification Log API failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification logs", details: error.message },
      { status: 500 }
    );
  }
}
