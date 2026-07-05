import { db } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';
import crypto from 'crypto';

async function injectConflict() {
  console.log('Injecting conflicting data for Zone-A...');
  const now = new Date().toISOString();

  // 1. Mock low AQI to trick Forecast Agent into a 'Low' risk prediction
  await db.insert(schema.aqiHistory).values([
    {
      id: crypto.randomUUID(),
      zone: 'Zone-A',
      timestamp: now,
      aqiValue: 25, // Very good air quality
      sourceStatus: 'ok',
    },
  ]);

  // 2. Mock several Severe citizen complaints for the exact same zone to trick Triage Agent
  const complaints = [];
  for (let i = 0; i < 6; i++) {
    complaints.push({
      id: crypto.randomUUID(),
      zone: 'Zone-A',
      timestamp: now,
      rawText: 'Severe smog, multiple children coughing and asthma attacks at the playground!',
      category: 'respiratory',
      severity: 'very_high',
      isSimulated: true,
    });
  }
  await db.insert(schema.complaintsHistory).values(complaints);

  console.log('Conflicting data injected. Now triggering the orchestrator...');

  try {
    const res = await fetch('http://localhost:3000/api/orchestrator/run?zone=Zone-A');
    const result = await res.json();
    console.log('Orchestrator result:', JSON.stringify(result, null, 2));
    console.log('\n✅ Conflict test complete!');
    console.log('Check the dashboard at http://localhost:3000/dashboard (Select Zone-A) to see the conflict and approval queue!');
  } catch (err) {
    console.error('Failed to run orchestrator:', err);
  }
}

injectConflict().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
