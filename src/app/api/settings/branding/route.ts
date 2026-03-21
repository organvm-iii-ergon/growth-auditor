import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSubscription, updateBranding } from "@/lib/db";
import { BrandingSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sub = await getSubscription(session.user.email);
    if (!sub) return NextResponse.json({});

    return NextResponse.json({
      plan: sub.plan,
      status: sub.status,
      customLogoUrl: sub.customLogoUrl,
    });
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

    const body = await request.json();
    const validation = BrandingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid branding data.", details: validation.error.format() }, { status: 400 });
    }

    await updateBranding(session.user.email, validation.data.logoUrl);
    return NextResponse.json({ message: "Branding updated successfully" });
  } catch (error: unknown) {
    console.error("POST Branding Error:", error);
    return NextResponse.json({ error: "Failed to update branding" }, { status: 500 });
  }
}
