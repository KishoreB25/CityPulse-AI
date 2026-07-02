-- CityPulse AI — notifications_log table
-- BigQuery Standard SQL DDL
-- See docs/DATABASE_SCHEMA.md and docs/03_TRD.md §4

CREATE TABLE IF NOT EXISTS notifications_log (
  id STRING DEFAULT GENERATE_UUID(),
  decision_id STRING NOT NULL,
  zone STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  target_audience STRING NOT NULL,      -- 'schools' | 'hospital' | 'transit' | 'citizens'
  message STRING NOT NULL,
  approved_by STRING,
  dispatch_status STRING DEFAULT 'simulated', -- 'simulated' | 'sent' | 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY zone;
