import { NextResponse } from "next/server";

export async function GET() {
  try {
    const gpuServiceUrl = process.env.GPU_SERVICE_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${gpuServiceUrl}/benchmark`, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`GPU service responded with status: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Benchmark API failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch benchmark results", details: error.message },
      { status: 500 }
    );
  }
}
