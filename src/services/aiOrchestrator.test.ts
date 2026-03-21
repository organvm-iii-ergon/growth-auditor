import { describe, it, expect, vi, beforeEach } from "vitest";
import { orchestrateCosmicAudit } from "./aiOrchestrator";
import { generateText } from "ai";
import * as evaluator from "./evaluator";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("./aiModelFactory", () => ({
  createAIModel: vi.fn().mockReturnValue({}),
}));

vi.mock("./evaluator", () => ({
  evaluateAudit: vi.fn(),
}));

vi.mock("./scraper", () => ({
  scrapeWebsite: vi.fn().mockResolvedValue("scraped"),
}));

vi.mock("./vision", () => ({
  captureScreenshot: vi.fn().mockResolvedValue("screenshot"),
}));

vi.mock("./pagespeed", () => ({
  getPageSpeedInsights: vi.fn().mockResolvedValue({}),
}));

describe("aiOrchestrator service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockReq: any = {
    link: "https://test.com",
    businessType: "SaaS",
    goals: "Growth",
    provider: "gemini",
    auth: "key", // allow-secret
    isPro: true,
  };

  it("orchestrates a successful audit flow in one iteration", async () => {
    (generateText as any).mockResolvedValue({
      text: JSON.stringify({ markdownAudit: "Audit", scores: { communication: 90 } }),
    });
    (evaluator.evaluateAudit as any).mockResolvedValue({ score: 90, passed: true });

    const result = await orchestrateCosmicAudit(mockReq);
    expect(result.iterations).toBe(1);
    expect(result.evaluationScore).toBe(90);
    expect(evaluator.evaluateAudit).toHaveBeenCalled();
  });

  it("regenerates once if initial evaluation fails", async () => {
    (generateText as any)
      .mockResolvedValueOnce({ text: JSON.stringify({ markdownAudit: "Bad", scores: {} }) })
      .mockResolvedValueOnce({ text: JSON.stringify({ markdownAudit: "Better", scores: {} }) });
    
    (evaluator.evaluateAudit as any).mockResolvedValue({ score: 40, passed: false, feedback: "Improve" });

    const result = await orchestrateCosmicAudit(mockReq);
    expect(result.iterations).toBe(2);
    expect(generateText).toHaveBeenCalledTimes(2);
  });
});
