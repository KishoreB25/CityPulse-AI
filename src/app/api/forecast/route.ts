import { NextRequest, NextResponse } from "next/server";
import { queryForecasts } from "@/lib/db/bigquery-client";
import { forecastWhatIf } from "@/lib/agents/forecast-agent";
import type { ForecastRequest } from "@/lib/types/agent-schemas";

export async function GET(request: NextRequest) {
  try {
    const zone = request.nextUrl.searchParams.get("zone") || undefined;
    let data = await queryForecasts(zone);

    // If database is empty, generate an initial forecast to ensure the API responds with data
    if (data.length === 0) {
      const activeZone = zone || "Zone-A";
      const freshForecast = await forecastWhatIf(activeZone, 1.0);
      data = [freshForecast];
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "QUERY_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ForecastRequest;
    
    if (!body.zone) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing required field: zone" } },
        { status: 400 }
      );
    }

    const multiplier = body.traffic_multiplier ?? 1.0;
    const result = await forecastWhatIf(body.zone, multiplier, body.override_features);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: "FORECAST_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
