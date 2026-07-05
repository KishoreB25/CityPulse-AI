import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { appGraph } from '../src/lib/orchestrator/graph';
import crypto from 'crypto';

async function testResource() {
  const zone = "Zone-A";
  const threadId = crypto.randomUUID();
  console.log("Triggering orchestrator directly for Zone-A...");

  try {
    const result = await appGraph.invoke(
      { zone, decisionId: crypto.randomUUID() },
      { configurable: { thread_id: threadId } }
    );

    console.log("=== RESOURCE AGENT RESULT ===");
    console.log(JSON.stringify(result.resourceResult, null, 2));
    
    console.log("\n=== DECISION AGENT RESULT ===");
    console.log(JSON.stringify(result.decisionResult, null, 2));
  } catch (err) {
    console.error("Graph execution failed:", err);
  }
}

testResource();
