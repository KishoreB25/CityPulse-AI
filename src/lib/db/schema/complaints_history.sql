-- CityPulse AI — complaints_history table
-- BigQuery Standard SQL DDL
-- See docs/DATABASE_SCHEMA.md and docs/03_TRD.md §4

CREATE TABLE IF NOT EXISTS complaints_history (
  id STRING DEFAULT GENERATE_UUID(),
  zone STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  raw_text STRING NOT NULL,
  category STRING,                      -- e.g. 'respiratory', 'visibility', 'odor'
  severity STRING,                      -- 'low' | 'medium' | 'high' | 'very_high'
  cluster_id STRING,                    -- set by Triage Agent's cuML clustering step
  is_simulated BOOL DEFAULT TRUE,       -- explicit flag per the project's data honesty statement
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY zone;
