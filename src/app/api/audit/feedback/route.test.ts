import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import * as db from "@/lib/db";
import { auth } from "@/auth";
import crypto from "crypto";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  saveFeedback: vi.fn(),
}));

describe("Audit Feedback API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const validAuditId = crypto.randomUUID();

  it("returns 400 if required fields are missing", async () => {
    const req = new Request("http://localhost/api/audit/feedback", {
      method: "POST",
      body: JSON.stringify({ auditId: validAuditId }), // Missing score
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("saves feedback successfully", async () => {
    (auth as any).mockResolvedValue({ user: { email: "test@example.com" } });
    const payload = { auditId: validAuditId, score: 1, comment: "Great audit!" };
    
    const req = new Request("http://localhost/api/audit/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(db.saveFeedback).toHaveBeenCalledWith({
      ...payload,
      userEmail: "test@example.com",
    });
  });
});
