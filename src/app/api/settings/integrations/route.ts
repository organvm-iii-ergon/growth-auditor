import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveIntegration, getIntegrations, deleteIntegration } from "@/lib/db";
import { IntegrationSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integrations = await getIntegrations(session.user.email);
    return NextResponse.json(integrations);
  } catch (error: unknown) {
    console.error("GET Integrations Error:", error);
    return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = IntegrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid integration data.", details: validation.error.format() }, { status: 400 });
    }

    const { name, url, event } = validation.data;
    await saveIntegration(session.user.email, name, url, event);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("POST Integration Error:", error);
    return NextResponse.json({ error: "Failed to save integration" }, { status: 500 });
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
      return NextResponse.json({ error: "Missing integration ID" }, { status: 400 });
    }

    await deleteIntegration(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE Integration Error:", error);
    return NextResponse.json({ error: "Failed to delete integration" }, { status: 500 });
  }
}
