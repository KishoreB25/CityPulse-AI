-- CityPulse AI — reflections table
-- BigQuery Standard SQL DDL
-- See docs/DATABASE_SCHEMA.md

CREATE TABLE IF NOT EXISTS reflections (
  id STRING DEFAULT GENERATE_UUID(),
  decision_id STRING NOT NULL,
  validated BOOL NOT NULL,
  requires_human_review BOOL NOT NULL,
  flags JSON,                           -- array of strings, e.g. ["low_confidence", "stale_weather_data"]
  notes STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
CLUSTER BY decision_id;
