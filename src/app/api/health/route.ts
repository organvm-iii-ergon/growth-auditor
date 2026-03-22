import { NextResponse } from "next/server";
import { getAudits } from "@/lib/db";

export async function GET() {
  const healthData = {
    status: "healthy",
    version: "d45444b",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      ai: "available",
    },
  };

  try {
    // Check DB
    await getAudits();
    healthData.services.database = "connected";
  } catch {
    healthData.services.database = "error";
    healthData.status = "degraded";
  }

  return NextResponse.json(healthData, { 
    status: healthData.status === "healthy" ? 200 : 500 
  });
}
