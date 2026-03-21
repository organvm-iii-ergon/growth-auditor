import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveFeedback } from "@/lib/db";
import { FeedbackSchema } from "@/lib/schemas";

/**
 * FEEDBACK API (ICEBERG TIP)
 * Implements the Reflector Loop covenant.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    
    const validation = FeedbackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid feedback data." }, { status: 400 });
    }

    const { auditId, section, score, comment } = validation.data;

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
    return NextResponse.json({ error: "Failed to record feedback." }, { status: 500 });
  }
}
