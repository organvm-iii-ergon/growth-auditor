import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getScheduledAudits,
  saveScheduledAudit,
  updateScheduledAudit,
  deleteScheduledAudit,
} from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(session.user as any).isPro && !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Pro subscription required for scheduled audits" }, { status: 403 });
    }

    const schedules = await getScheduledAudits(session.user.email);
    return NextResponse.json(schedules);
  } catch (error: unknown) {
    console.error("GET Schedules Error:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(session.user as any).isPro && !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Pro subscription required for scheduled audits" }, { status: 403 });
    }

    const body = await request.json();
    const { link, businessType, goals, frequency, teamId } = body;

    if (!link || !businessType || !goals || !frequency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = await saveScheduledAudit({
      userEmail: session.user.email,
      teamId: teamId || undefined,
      link,
      businessType,
      goals,
      frequency,
      enabled: true,
    });

    return NextResponse.json({ id, message: "Schedule created successfully" });
  } catch (error: unknown) {
    console.error("POST Schedule Error:", error);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing schedule ID" }, { status: 400 });
    }

    await updateScheduledAudit(id, updates);
    return NextResponse.json({ message: "Schedule updated successfully" });
  } catch (error: unknown) {
    console.error("PUT Schedule Error:", error);
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing schedule ID" }, { status: 400 });
    }

    await deleteScheduledAudit(id);
    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error: unknown) {
    console.error("DELETE Schedule Error:", error);
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}
