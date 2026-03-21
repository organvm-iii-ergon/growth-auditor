import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAudits } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const link = searchParams.get("link");

    if (!link) {
      return NextResponse.json({ error: "Link parameter is required" }, { status: 400 });
    }

    const allAudits = await getAudits(session.user.email);
    const linkAudits = allAudits
      .filter((a) => a.link === link)
      .map((a) => ({
        date: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
        scores: JSON.parse(a.scores),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(linkAudits);
  } catch (error: unknown) {
    console.error("GET Trends Error:", error);
    return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}
