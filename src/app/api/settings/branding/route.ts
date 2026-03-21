import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSubscription, updateBranding } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await getSubscription(session.user.email);
    return NextResponse.json(sub || {});
  } catch (error: unknown) {
    console.error("GET Branding Error:", error);
    return NextResponse.json({ error: "Failed to fetch branding" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isPro, isAdmin } = session.user as any;
    if (!isPro && !isAdmin) {
      return NextResponse.json({ error: "Pro subscription required for custom branding" }, { status: 403 });
    }

    const { logoUrl } = await request.json();
    if (!logoUrl) {
      return NextResponse.json({ error: "Logo URL is required" }, { status: 400 });
    }

    await updateBranding(session.user.email, logoUrl);
    return NextResponse.json({ message: "Branding updated successfully" });
  } catch (error: unknown) {
    console.error("POST Branding Error:", error);
    return NextResponse.json({ error: "Failed to update branding" }, { status: 500 });
  }
}
