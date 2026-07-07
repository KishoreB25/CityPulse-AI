/**
 * CityPulse AI — Notification Agent
 *
 * Responsibility: Format and simulate-dispatch approved recommendations
 * to target audiences (schools, hospitals, transit, citizens).
 *
 * CRITICAL RULE: Fails closed if the decision is not marked 'approved'.
 */

import { sqlite } from "../db/index";
import { insertTimelineEntry, insertNotification } from "../db/bigquery-client";
import type {
  DecisionOutput,
  NotificationEntry,
  TargetAudience,
} from "@/lib/types/agent-schemas";
import crypto from "crypto";

/**
 * Format a notification message for a specific target audience.
 */
export function formatMessage(
  decision: DecisionOutput,
  target: TargetAudience,
): string {
  const rec = decision.recommendations.find(r => r.target === target);
  
  if (!rec) return `No specific advisory for ${target}.`;

  const header = `[CityPulse ${decision.risk_level.toUpperCase()} ALERT for ${decision.zone}]`;
  const body = rec.action;
  
  return `${header} ${body}`;
}

/**
 * Format and dispatch notifications for an approved decision.
 */
export async function notify(
  decisionId: string
): Promise<NotificationEntry[]> {
  const timestamp = new Date().toISOString();

  // 1. HARD PRECONDITION CHECK
  // We explicitly fetch the decision from the database to check its approval status.
  // We do not trust the caller. This is a structural block.
  const decisionRecord = (await sqlite.execute({sql: "SELECT * FROM decisions WHERE id = ?", args: [decisionId]})).rows[0] as any;
  
  if (!decisionRecord) {
    throw new Error(`Decision ${decisionId} not found.`);
  }

  if (decisionRecord.approval_status !== "approved") {
    // Failing closed!
    throw new Error(`Forbidden: Decision must be approved before dispatch. Current status: '${decisionRecord.approval_status}'`);
  }

  // Parse decision to use in formatting
  const decision: DecisionOutput = {
    zone: decisionRecord.zone,
    risk_level: decisionRecord.risk_level,
    overall_confidence: decisionRecord.overall_confidence,
    conflict_detected: Boolean(decisionRecord.conflict_detected),
    recommendations: typeof decisionRecord.recommendations === 'string' ? JSON.parse(decisionRecord.recommendations) : decisionRecord.recommendations,
    rationale: decisionRecord.rationale,
  };

  const approvedBy = decisionRecord.reviewer_id || "unknown_reviewer";
  const audiences: TargetAudience[] = ["schools", "hospital", "transit", "citizens"];
  const notifications: NotificationEntry[] = [];

  // 2. Format and Save Notifications
  for (const audience of audiences) {
    const message = formatMessage(decision, audience);
    const notificationId = crypto.randomUUID();
    
    const entry: NotificationEntry = {
      id: notificationId,
      decision_id: decisionId,
      zone: decision.zone,
      timestamp,
      target_audience: audience,
      message,
      approved_by: approvedBy,
      dispatch_status: "simulated"
    };

    await insertNotification(entry);

    notifications.push(entry);
  }

  // 3. Log to Timeline
  await insertTimelineEntry({
    id: crypto.randomUUID(),
    agent_name: "notification",
    zone: decision.zone,
    timestamp,
    action: `Simulated dispatch of ${notifications.length} notifications for decision ${decisionId}.`,
    input_ref: decisionId,
    output_json: { notifications },
    conflict_flag: false,
    escalation_flag: false,
    confidence: 1.0,
  });

  return notifications;
}
