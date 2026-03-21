import { describe, it, expect, vi } from "vitest";
import { POST } from "./route";

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: any, init?: any) => new Response(JSON.stringify(body), { ...init, headers: { 'Content-Type': 'application/json' } }),
  },
}));

// Mock auth
vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { email: "test@example.com" } }),
}));

// Mock puppeteer
vi.mock("puppeteer", () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        setContent: vi.fn().mockResolvedValue(undefined),
        pdf: vi.fn().mockResolvedValue(Buffer.from("mock-pdf-content")),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe("PDF API Route", () => {
  it("returns 401 if unauthorized", async () => {
    const { auth } = await import("@/auth");
    (auth as any).mockResolvedValue(null);

    const req = new Request("http://localhost/api/pdf", {
      method: "POST",
      body: JSON.stringify({ html: "<h1>Test</h1>" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 if HTML is missing", async () => {
    const { auth } = await import("@/auth");
    (auth as any).mockResolvedValue({ user: { email: "test@example.com" } });

    const req = new Request("http://localhost/api/pdf", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing HTML content");
  });

  it("returns a PDF buffer on success", async () => {
    const { auth } = await import("@/auth");
    (auth as any).mockResolvedValue({ user: { email: "test@example.com" } });

    const req = new Request("http://localhost/api/pdf", {
      method: "POST",
      body: JSON.stringify({ html: "<h1>Test</h1>" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    
    const buffer = await res.arrayBuffer();
    expect(new TextDecoder().decode(buffer)).toBe("mock-pdf-content");
  });
});
