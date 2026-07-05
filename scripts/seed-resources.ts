import { db } from "../src/lib/db";
import { hospitalStatus, transitStatus } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function seedResources() {
  console.log("🌱 Seeding initial resource data...");
  const zones = ["Zone-A", "Zone-B", "Zone-C", "Zone-D", "Zone-E"];
  const now = new Date().toISOString();

  for (const zone of zones) {
    // Delete existing
    await db.delete(hospitalStatus).where(eq(hospitalStatus.zone, zone));
    await db.delete(transitStatus).where(eq(transitStatus.zone, zone));

    // For Manual Test 12, Zone-A is specifically mentioned as a target for 0 beds.
    const beds = zone === "Zone-A" ? 5 : 200; 

    // Insert Hospital Status
    await db.insert(hospitalStatus).values({
      zone,
      totalBeds: 500,
      availableBeds: beds,
      lastUpdated: now,
    });

    // Insert Transit Status
    await db.insert(transitStatus).values({
      zone,
      availableUnits: zone === "Zone-A" ? 15 : 45,
      status: "operational",
      lastUpdated: now,
    });
  }

  console.log("✅ Resource seeding complete.");
}

seedResources().catch(console.error);
