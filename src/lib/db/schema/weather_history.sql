-- CityPulse AI — weather_history table
-- BigQuery Standard SQL DDL
-- See docs/DATABASE_SCHEMA.md and docs/03_TRD.md §4

CREATE TABLE IF NOT EXISTS weather_history (
  id STRING DEFAULT GENERATE_UUID(),
  zone STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  temperature_c FLOAT64,
  humidity_pct FLOAT64,
  wind_kph FLOAT64,
  source_status STRING NOT NULL,        -- 'ok' | 'stale' | 'failed'
  raw_payload_uri STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(timestamp)
CLUSTER BY zone;
