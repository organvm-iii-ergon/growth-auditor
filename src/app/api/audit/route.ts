import { generateText } from "ai";
import { NextResponse } from "next/server";
import { scrapeWebsite } from "@/services/scraper";
import { getCosmicAuditPrompt } from "@/services/promptTemplates";
import { captureScreenshot } from "@/services/vision";
import { getPageSpeedInsights } from "@/services/pagespeed";
import { saveAudit } from "@/lib/db";
import { sendAuditWebhook } from "@/services/webhook";
import crypto from "crypto";
import { auth } from "@/auth";
import { createRateLimiter, getClientIP } from "@/lib/rate-limit";
import { createAIModel, type AIProviderType } from "@/services/aiModelFactory";
import { evaluateAudit } from "@/services/evaluator";
import { z } from "zod";

const rateLimiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });

const auditSchema = z.object({
  link: z.string().url(),
  businessType: z.string().min(2),
  goals: z.string().min(5),
  teamId: z.string().optional(),
});

// export const runtime = "edge";

export async function POST(request: Request) {
  try {
    // 0. Rate limiting
    const ip = getClientIP(request);
    const { limited, remaining } = rateLimiter.check(ip);

    if (limited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before generating more audits." },
        { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
      );
    }

    void remaining;

    // 1. Extract API Key from Authorization header securely
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header. Please configure your API Key in Settings." }, { status: 401 });
    }

    const apiKey = authHeader.split(" ")[1]; // allow-secret

    // 2. Determine AI provider from header (defaults to gemini)
    const provider = (request.headers.get("X-AI-Provider") || "gemini") as AIProviderType;

    const body = await request.json();
    const validationResult = auditSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: "Invalid alignment data provided.", details: validationResult.error.format() }, { status: 400 });
    }

    const { link, businessType, goals, teamId } = validationResult.data;

    const session = await auth();
    const isPro = (session?.user as any)?.isPro || (session?.user as any)?.isAdmin;

    // 3. Fetch context in parallel to save time
    const [scrapedContent, screenshotBase64, seoData] = await Promise.all([
      scrapeWebsite(link, isPro ? 3 : 1),
      captureScreenshot(link).catch(() => null),
      getPageSpeedInsights(link).catch(() => null)
    ]);

    // 4. Build prompt and call AI via Vercel AI SDK (multi-provider)
    const model = createAIModel(provider, apiKey); // allow-secret
    const prompt = getCosmicAuditPrompt(link, businessType, goals, scrapedContent, seoData);

    const { text } = await generateText({
      model,
      messages: [{
        role: "user",
        content: [
          { type: "text" as const, text: prompt },
          ...(screenshotBase64 ? [{ type: "image" as const, image: screenshotBase64 }] : [])
        ],
      }],
    });

    let parsedResult;
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();
      parsedResult = JSON.parse(jsonText);
    } catch {
      console.error("Failed to parse AI JSON:", text);
      throw new Error("AI returned malformed JSON");
    }

    // 4.5 Evaluation Loop (LLM-as-a-Judge)
    const evaluation = await evaluateAudit(parsedResult.markdownAudit, provider, apiKey);
    if (!evaluation.passed) {
      const retryPrompt = `${prompt}\n\nREFINEMENT NEEDED: Your previous attempt was scored ${evaluation.score}/100. Feedback: ${evaluation.feedback}. Please improve the audit based on this feedback while maintaining the same JSON structure.`;
      
      const retryResult = await generateText({
        model,
        messages: [{
          role: "user",
          content: [{ type: "text", text: retryPrompt }],
        }],
      });

      const retryJsonMatch = retryResult.text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const retryJsonText = retryJsonMatch ? retryJsonMatch[1].trim() : retryResult.text.trim();
      parsedResult = JSON.parse(retryJsonText);
    }

    // 5. Save to database for Persistent History
    const auditId = crypto.randomUUID();

    try {
      await saveAudit({
        id: auditId,
        userEmail: session?.user?.email || undefined,
        teamId: teamId || undefined,
        link,
        businessType,
        goals,
        markdownAudit: parsedResult.markdownAudit,
        scores: JSON.stringify(parsedResult.scores || {})
      });
      sendAuditWebhook({
        id: auditId,
        link,
        businessType,
        goals,
        scores: parsedResult.scores || {},
        userEmail: session?.user?.email || undefined,
      }).catch(() => {});
    } catch (dbError) {
      console.error("Failed to save audit to DB:", dbError);
    }

    return NextResponse.json({
      id: auditId,
      audit: parsedResult.markdownAudit,
      scores: parsedResult.scores
    });
  } catch (error: unknown) {
    console.error("Audit Error:", error);
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("429") || errorMessage.includes("Quota")) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a moment." }, { status: 429 });
    }
    return NextResponse.json({ error: "An unexpected cosmic interference occurred." }, { status: 500 });
  }
}
