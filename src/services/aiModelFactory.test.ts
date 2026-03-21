import { describe, it, expect } from "vitest";
import { createAIModel, type AIProvider } from "./aiModelFactory";

describe("aiModelFactory service", () => {
  const fakeKey = "test-key"; // allow-secret

  it("returns a model for gemini", () => {
    const model = createAIModel("gemini", fakeKey); // allow-secret
    expect(model).toBeDefined();
  });

  it("returns a model for openai", () => {
    const model = createAIModel("openai", fakeKey); // allow-secret
    expect(model).toBeDefined();
  });

  it("returns a model for claude", () => {
    const model = createAIModel("claude", fakeKey); // allow-secret
    expect(model).toBeDefined();
  });

  it("returns a default model for unknown provider", () => {
    const model = createAIModel("unknown" as AIProvider, fakeKey); // allow-secret
    expect(model).toBeDefined();
  });
});
