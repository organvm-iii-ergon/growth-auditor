import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveFeedback } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const { auditId, section, score, comment } = await request.json();

    if (!auditId || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await saveFeedback({
      auditId,
      userEmail: session?.user?.email || undefined,
      section,
      score,
      comment,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Feedback API Error:", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}
