import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("saves and persists Gemini API key", async ({ page }) => {
    await page.goto("/settings");

    const input = page.locator("#gemini");
    await input.fill("AIzaSyTestKey123");
    await page.getByRole("button", { name: /Save Configuration/i }).click();

    // Verify success feedback
    await expect(page.getByRole("button", { name: /Key Saved/i })).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    await expect(input).toHaveValue("AIzaSyTestKey123");
  });
});
