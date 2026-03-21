import { NextResponse } from "next/server";
import { getAudits, saveAudit, getScheduledAudits, updateScheduledAudit, getSubscription, getTeamMembers } from "@/lib/db";
import { scrapeWebsite } from "@/services/scraper";
import { getCosmicAuditPrompt } from "@/services/promptTemplates";
import { captureScreenshot } from "@/services/vision";
import { getPageSpeedInsights } from "@/services/pagespeed";
import { generateText } from "ai";
import { createAIModel } from "@/services/aiModelFactory";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY || "re_test_placeholder");

async function generateMonthlyAudit(
  link: string,
  businessType: string,
  goals: string,
  userEmail: string,
  teamId?: string
): Promise<void> {
  // Use server key for cron
  const apiKey = process.env.GEMINI_API_KEY; // allow-secret
  if (!apiKey) {
    console.error("GEMINI_API_KEY not set for monthly audit");
    return;
  }

  // Check Pro status
  const sub = await getSubscription(userEmail);
  const isPro = sub?.plan === "pro" && sub?.status === "active";

  const [scrapedContent, screenshotBase64, seoData] = await Promise.all([
    scrapeWebsite(link, isPro ? 3 : 1).catch(() => ""),
    captureScreenshot(link).catch(() => null),
    getPageSpeedInsights(link).catch(() => null),
  ]);

  const model = createAIModel("gemini", apiKey);
  const prompt = getCosmicAuditPrompt(link, businessType, goals, scrapedContent, seoData);

  const { text } = await generateText({
    model,
    messages: [{
      role: "user",
      content: [
        { type: "text", text: prompt },
        ...(screenshotBase64 ? [{ type: "image" as const, image: screenshotBase64, mimeType: "image/jpeg" as const }] : [])
      ],
    }],
  });

  let parsedResult;
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonText = jsonMatch ? jsonMatch[1].trim() : text.trim();
    parsedResult = JSON.parse(jsonText);
  } catch {
    console.error("Failed to parse AI JSON in cron:", text);
    return;
  }

  const auditId = crypto.randomUUID();
  await saveAudit({
    id: auditId,
    userEmail,
    teamId,
    link,
    businessType,
    goals,
    markdownAudit: parsedResult.markdownAudit,
    scores: JSON.stringify(parsedResult.scores || {}),
  });

  // Notify user and team members
  const recipients = [userEmail];
  if (teamId) {
    const members = await getTeamMembers(teamId);
    members.forEach(m => {
      if (!recipients.includes(m.email)) recipients.push(m.email);
    });
  }

  if (resend) {
    const scores = parsedResult.scores || {};
    try {
      await resend.emails.send({
        from: "Growth Auditor <hello@growthauditor.ai>",
        to: recipients,
        subject: "Your Cosmic Alignment Has Evolved ✦",
        html: `
          <h1>Growth Strategy Updated</h1>
          <p>The cosmic cycle has completed. We've generated a new audit for <strong>${link}</strong>.</p>
          <div style="background: #0a0a1a; color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Current Alignment Scores:</strong></p>
            <ul>
              <li>Mercury (Communication): ${scores.communication}/100</li>
              <li>Venus (Aesthetic): ${scores.aesthetic}/100</li>
              <li>Mars (Drive): ${scores.drive}/100</li>
              <li>Saturn (Structure): ${scores.structure}/100</li>
            </ul>
          </div>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/history">View full evolution in your archive.</a></p>
          <p>Stay cosmic,</p>
          <p>The Growth Auditor Team</p>
        `,
      });
    } catch (e) {
      console.error("Failed to send cron emails:", e);
    }
  }
}

function isDue(frequency: "weekly" | "monthly", lastRunAt?: string): boolean {
  if (!lastRunAt) return true;

  const last = new Date(lastRunAt).getTime();
  const now = Date.now();
  const daysSinceLast = (now - last) / (1000 * 60 * 60 * 24);

  if (frequency === "weekly") return daysSinceLast >= 7;
  return daysSinceLast >= 30;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const expectedSecret = `Bearer ${process.env.CRON_SECRET || "dev_cron_secret"}`;

    if (authHeader !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let processed = 0;

    // Primary path: use scheduled_audits table
    const schedules = await getScheduledAudits();
    const enabledSchedules = schedules.filter((s) => s.enabled);

    if (enabledSchedules.length > 0) {
      for (const schedule of enabledSchedules) {
        if (!isDue(schedule.frequency, schedule.lastRunAt)) {
          continue;
        }

        try {
          await generateMonthlyAudit(
            schedule.link,
            schedule.businessType,
            schedule.goals,
            schedule.userEmail,
            schedule.teamId
          );
          await updateScheduledAudit(schedule.id, {
            lastRunAt: new Date().toISOString(),
          });
          processed++;
        } catch (e) {
          console.error(`Failed to process scheduled audit ${schedule.id} for ${schedule.userEmail}:`, e);
        }
      }

      return NextResponse.json({ success: true, processedSchedules: processed });
    }

    // Fallback: re-audit all users' most recent audit (legacy behavior)
    const allAudits = await getAudits();
    const uniqueUserAudits = new Map<string, (typeof allAudits)[0]>();

    for (const audit of allAudits) {
      if (audit.userEmail && !uniqueUserAudits.has(audit.userEmail)) {
        uniqueUserAudits.set(audit.userEmail, audit);
      }
    }

    for (const [, audit] of uniqueUserAudits) {
      try {
        await generateMonthlyAudit(
          audit.link,
          audit.businessType,
          audit.goals,
          audit.userEmail
        );
        processed++;
      } catch (e) {
        console.error(`Failed to process audit for ${audit.userEmail}:`, e);
      }
    }

    return NextResponse.json({ success: true, processedUsers: processed, fallback: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cron Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
