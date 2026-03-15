import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSaveLead = vi.fn();

vi.mock("@/lib/db", () => ({
  saveLead: (...args: unknown[]) => mockSaveLead(...args),
}));

vi.mock("@/lib/rate-limit", () => {
  let callCount = 0;
  return {
    createRateLimiter: () => ({
      check: () => {
        callCount++;
        if (callCount > 10) {
          return { limited: true, remaining: 0, resetMs: 3600000 };
        }
        return { limited: false, remaining: 10 - callCount, resetMs: 3600000 };
      },
    }),
    getClientIP: () => "127.0.0.1",
  };
});

import { POST } from "./route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/leads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves a lead with valid email", async () => {
    mockSaveLead.mockResolvedValue(undefined);

    const res = await POST(makeRequest({ email: "test@example.com" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSaveLead).toHaveBeenCalledWith("test@example.com", undefined, "audit_gate");
  });

  it("saves a lead with auditId and source", async () => {
    mockSaveLead.mockResolvedValue(undefined);

    const res = await POST(
      makeRequest({ email: "test@example.com", auditId: "abc-123", source: "landing_page" })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSaveLead).toHaveBeenCalledWith("test@example.com", "abc-123", "landing_page");
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Email is required.");
    expect(mockSaveLead).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid email format", async () => {
    const res = await POST(makeRequest({ email: "not-an-email" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid email format.");
    expect(mockSaveLead).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    mockSaveLead.mockResolvedValue(undefined);

    // Exhaust the rate limit (calls 1-10 succeed, 11+ are limited)
    for (let i = 0; i < 10; i++) {
      await POST(makeRequest({ email: `user${i}@example.com` }));
    }

    const res = await POST(makeRequest({ email: "blocked@example.com" }));
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toContain("Too many requests");
  });
});
