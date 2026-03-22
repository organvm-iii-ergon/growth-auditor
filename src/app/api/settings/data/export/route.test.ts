import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { GET } from "./route";
import { auth } from "@/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getAudits: vi.fn().mockResolvedValue([]),
  getScheduledAudits: vi.fn().mockResolvedValue([]),
  getIntegrations: vi.fn().mockResolvedValue([]),
}));

describe("Data Export API", () => {
  const mockEmail = "test@example.com";

  beforeEach(() => {
    vi.resetAllMocks();
    (auth as unknown as Mock).mockResolvedValue({ user: { email: mockEmail } });
  });

  it("returns a JSON file download", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Content-Disposition")).toContain(`${mockEmail}.json`);
    
    const data = await res.json();
    expect(data.user.email).toBe(mockEmail);
    expect(data).toHaveProperty("exportedAt");
  });

  it("returns 401 if unauthorized", async () => {
    (auth as unknown as Mock).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
