import { db } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';
import crypto from 'crypto';

async function seed() {
  console.log('Seeding SQLite database...');

  // Mock AQI
  await db.insert(schema.aqiHistory).values([
    {
      id: crypto.randomUUID(),
      zone: 'Zone A',
      timestamp: new Date().toISOString(),
      aqiValue: 45,
      sourceStatus: 'ok',
    },
    {
      id: crypto.randomUUID(),
      zone: 'Zone B',
      timestamp: new Date().toISOString(),
      aqiValue: 182,
      sourceStatus: 'ok',
    },
  ]);

  // Mock Weather
  await db.insert(schema.weatherHistory).values([
    {
      id: crypto.randomUUID(),
      zone: 'Zone A',
      timestamp: new Date().toISOString(),
      temperatureC: 22,
      humidityPct: 55,
      windKph: 12,
      sourceStatus: 'ok',
    },
    {
      id: crypto.randomUUID(),
      zone: 'Zone B',
      timestamp: new Date().toISOString(),
      temperatureC: 35,
      humidityPct: 80,
      windKph: 5,
      sourceStatus: 'ok',
    },
  ]);

  // Mock Complaints
  await db.insert(schema.complaintsHistory).values([
    {
      id: crypto.randomUUID(),
      zone: 'Zone B',
      timestamp: new Date().toISOString(),
      rawText: 'Severe breathing difficulty, need inhaler refill ASAP',
      category: 'respiratory',
      severity: 'severe',
      isSimulated: true,
    },
  ]);

  console.log('Database seeded successfully!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
