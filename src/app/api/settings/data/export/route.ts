import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAudits, getScheduledAudits, getIntegrations } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [audits, schedules, integrations] = await Promise.all([
      getAudits(session.user.email),
      getScheduledAudits(session.user.email),
      getIntegrations(session.user.email),
    ]);

    const exportData = {
      user: session.user,
      audits,
      schedules,
      integrations,
      exportedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="growth-auditor-data-${session.user.email}.json"`,
      },
    });
  } catch (error: unknown) {
    console.error("Data Export Error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
