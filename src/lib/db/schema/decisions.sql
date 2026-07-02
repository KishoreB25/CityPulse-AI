-- CityPulse AI — decisions table
-- BigQuery Standard SQL DDL
-- See docs/DATABASE_SCHEMA.md
-- Persists Decision Agent recommendation objects (separate from agent_decisions_log
-- which records every agent step — this table is specifically the recommendation
-- records that flow into approval/notification)

CREATE TABLE IF NOT EXISTS decisions (
  id STRING DEFAULT GENERATE_UUID(),
  zone STRING NOT NULL,
  generated_at TIMESTAMP NOT NULL,
  risk_level STRING NOT NULL,           -- 'low' | 'medium' | 'high' | 'severe'
  overall_confidence FLOAT64 NOT NULL,
  conflict_detected BOOL DEFAULT FALSE,
  recommendations JSON NOT NULL,        -- array of { target, action }
  rationale STRING,
  reflection_id STRING,                 -- FK-equivalent reference to reflections.id
  approval_status STRING DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  reviewer_id STRING,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(generated_at)
CLUSTER BY zone;
