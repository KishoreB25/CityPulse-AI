-- CityPulse AI — agent_decisions_log table
-- BigQuery Standard SQL DDL
-- See docs/DATABASE_SCHEMA.md and docs/03_TRD.md §4
-- This is the most important table — backs the audit trail, conflict/escalation
-- record, and the Agent Activity Timeline UI.

CREATE TABLE IF NOT EXISTS agent_decisions_log (
  id STRING DEFAULT GENERATE_UUID(),
  agent_name STRING NOT NULL,           -- 'ingestion' | 'forecast' | 'triage' | 'decision' | 'reflection' | 'human' | 'notification'
  zone STRING,
  timestamp TIMESTAMP NOT NULL,
  action STRING NOT NULL,               -- short human-readable action description
  input_ref STRING,                     -- id/reference to the input this agent acted on
  output_json JSON,                     -- full structured output for this agent step
  conflict_flag BOOL DEFAULT FALSE,
  escalation_flag BOOL DEFAULT FALSE,
  confidence FLOAT64,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY agent_name, zone;
