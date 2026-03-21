import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { auth } from "@/auth";
import { createRateLimiter, getClientIP } from "@/lib/rate-limit";

const rateLimiter = createRateLimiter({ max: 10, windowMs: 60 * 60 * 1000 });

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = getClientIP(request);
    const { limited } = rateLimiter.check(ip);
    if (limited) {
      return NextResponse.json({ error: "Too many PDF requests. Try again later." }, { status: 429 });
    }

    const { html, filename = "audit-report.pdf" } = await request.json();

    if (!html) {
      return NextResponse.json({ error: "Missing HTML content" }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
      printBackground: true,
    });

    await browser.close();

    return new Response(pdfBuffer as Buffer & BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("PDF API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
