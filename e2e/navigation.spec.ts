import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads with form", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Growth Auditor AI")).toBeVisible();
    await expect(page.locator("#link")).toBeVisible();
    await expect(page.locator("#business")).toBeVisible();
    await expect(page.locator("#goals")).toBeVisible();
    await expect(page.getByRole("button", { name: /Generate Cosmic Audit/i })).toBeVisible();
  });

  test("nav links work", async ({ page }) => {
    await page.goto("/");

    await page.click('a[href="/about"]');
    await expect(page.getByText("The Four Pillars of Alignment")).toBeVisible();

    await page.click('a[href="/examples"]');
    await expect(page.getByText("Cosmic Growth in Action")).toBeVisible();

    await page.click('a[href="/settings"]');
    await expect(page.getByText("Settings")).toBeVisible();
    await expect(page.locator("#gemini")).toBeVisible();
  });

  test("about page has all four pillars", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText("Mercury (Communication)")).toBeVisible();
    await expect(page.getByText("Venus (Aesthetic)")).toBeVisible();
    await expect(page.getByText("Mars (Drive)")).toBeVisible();
    await expect(page.getByText("Saturn (Structure)")).toBeVisible();
  });

  test("examples page shows case studies", async ({ page }) => {
    await page.goto("/examples");
    await expect(page.getByText("Acme Corp SaaS")).toBeVisible();
    await expect(page.getByText("Zenith Creatives")).toBeVisible();
  });
});
