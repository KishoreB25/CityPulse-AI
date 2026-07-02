-- CityPulse AI — aqi_history table
-- BigQuery Standard SQL DDL
-- See docs/DATABASE_SCHEMA.md and docs/03_TRD.md §4

CREATE TABLE IF NOT EXISTS aqi_history (
  id STRING DEFAULT GENERATE_UUID(),
  zone STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  aqi_value FLOAT64 NOT NULL,
  source_status STRING NOT NULL,        -- 'ok' | 'stale' | 'failed'
  confidence_penalty FLOAT64 DEFAULT 0.0,
  raw_payload_uri STRING,               -- pointer to Cloud Storage raw object
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY zone;
