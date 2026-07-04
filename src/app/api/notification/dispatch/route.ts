import { NextRequest, NextResponse } from "next/server";
import { notify } from "@/lib/agents/notification-agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { decision_id } = body;

    if (!decision_id) {
      return NextResponse.json({ error: "decision_id parameter is required" }, { status: 400 });
    }

    // Call the Notification Agent
    // It will structurally enforce the approval_status === 'approved' check internally
    const notifications = await notify(decision_id);
    
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error("Notification Dispatch API failed:", error);
    
    // If it failed because it wasn't approved, return a 403 Forbidden
    if (error.message.includes("Forbidden:")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to dispatch notification", details: error.message },
      { status: 500 }
    );
  }
}
