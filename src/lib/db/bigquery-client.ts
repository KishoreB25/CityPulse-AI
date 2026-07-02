/**
 * CityPulse AI — BigQuery Client Stub
 *
 * This file defines the typed interface for BigQuery operations.
 * No real connection is established in Phase 0.
 * All methods throw a descriptive error if accidentally called.
 *
 * Phase 1 will implement these against the real BigQuery API.
 * Phase 0 API routes use mock data directly, not this client.
 */

import type {
  IngestionOutput,
  ForecastOutput,
  DecisionOutput,
  ReflectionOutput,
  TimelineEntry,
  NotificationEntry,
} from "@/lib/types/agent-schemas";

class NotImplementedError extends Error {
  constructor(method: string) {
    super(
      `BigQuery client method "${method}" is not implemented until Phase 1. ` +
        `Phase 0 uses mock data in API route stubs. ` +
        `If you are seeing this error, something is incorrectly trying to use a real database connection.`,
    );
    this.name = "NotImplementedError";
  }
}

// =============================================================================
// Query methods (read)
// =============================================================================

export async function queryAqiHistory(
  _zone?: string,
  _since?: string,
): Promise<IngestionOutput[]> {
  throw new NotImplementedError("queryAqiHistory");
}

export async function queryWeatherHistory(
  _zone?: string,
  _since?: string,
): Promise<IngestionOutput[]> {
  throw new NotImplementedError("queryWeatherHistory");
}

export async function queryComplaintsHistory(
  _zone?: string,
  _since?: string,
): Promise<IngestionOutput[]> {
  throw new NotImplementedError("queryComplaintsHistory");
}

export async function queryForecasts(_zone?: string): Promise<ForecastOutput[]> {
  throw new NotImplementedError("queryForecasts");
}

export async function queryDecisions(_zone?: string): Promise<DecisionOutput[]> {
  throw new NotImplementedError("queryDecisions");
}

export async function queryReflection(_decisionId: string): Promise<ReflectionOutput | null> {
  throw new NotImplementedError("queryReflection");
}

export async function queryTimeline(
  _zone?: string,
  _limit?: number,
): Promise<TimelineEntry[]> {
  throw new NotImplementedError("queryTimeline");
}

export async function queryNotifications(
  _zone?: string,
  _since?: string,
): Promise<NotificationEntry[]> {
  throw new NotImplementedError("queryNotifications");
}

// =============================================================================
// Insert methods (write)
// =============================================================================

export async function insertAqiRecord(_record: IngestionOutput): Promise<string> {
  throw new NotImplementedError("insertAqiRecord");
}

export async function insertWeatherRecord(_record: IngestionOutput): Promise<string> {
  throw new NotImplementedError("insertWeatherRecord");
}

export async function insertComplaint(_record: IngestionOutput): Promise<string> {
  throw new NotImplementedError("insertComplaint");
}

export async function insertForecast(_record: ForecastOutput): Promise<string> {
  throw new NotImplementedError("insertForecast");
}

export async function insertDecision(_record: DecisionOutput): Promise<string> {
  throw new NotImplementedError("insertDecision");
}

export async function insertReflection(_record: ReflectionOutput): Promise<string> {
  throw new NotImplementedError("insertReflection");
}

export async function insertTimelineEntry(_entry: TimelineEntry): Promise<string> {
  throw new NotImplementedError("insertTimelineEntry");
}

export async function insertNotification(_entry: NotificationEntry): Promise<string> {
  throw new NotImplementedError("insertNotification");
}

// =============================================================================
// Update methods
// =============================================================================

export async function updateDecisionApproval(
  _decisionId: string,
  _approved: boolean,
  _reviewerId: string,
): Promise<void> {
  throw new NotImplementedError("updateDecisionApproval");
}
