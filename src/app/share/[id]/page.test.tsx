import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockNotFound = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: (...args: unknown[]) => {
    mockNotFound(...args);
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("@/lib/db", () => ({
  getAuditById: vi.fn(),
}));

// react-markdown is ESM; provide a simple mock that renders children
vi.mock("react-markdown", () => ({
  default: function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>;
  },
}));

import { getAuditById } from "@/lib/db";

const mockGetAuditById = vi.mocked(getAuditById);

async function renderAsync(ui: Promise<React.JSX.Element>) {
  const resolved = await ui;
  return render(resolved);
}

describe("SharePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders audit content when found", async () => {
    mockGetAuditById.mockResolvedValueOnce({
      id: "abc-123",
      link: "https://example.com",
      businessType: "SaaS",
      goals: "Grow traffic",
      markdownAudit: "# Great Audit\n\nYou are doing well.",
      scores: JSON.stringify({ communication: 80, aesthetic: 70, drive: 90, structure: 60 }),
      createdAt: "2026-01-15T12:00:00Z",
    });

    const { default: SharePage } = await import("./page");
    await renderAsync(SharePage({ params: Promise.resolve({ id: "abc-123" }) }));

    expect(screen.getByText("https://example.com")).toBeInTheDocument();
    expect(screen.getByText(/SaaS/)).toBeInTheDocument();
    expect(screen.getByText("Overall Score: 75/100")).toBeInTheDocument();
    expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
    expect(screen.getByText("Want your own cosmic audit?")).toBeInTheDocument();
  });

  it("displays score bars with correct values", async () => {
    mockGetAuditById.mockResolvedValueOnce({
      id: "abc-456",
      link: "test.dev",
      businessType: "E-commerce",
      goals: "Increase sales",
      markdownAudit: "Audit content here",
      scores: JSON.stringify({ communication: 85, aesthetic: 42, drive: 67, structure: 91 }),
      createdAt: "2026-02-20T08:00:00Z",
    });

    const { default: SharePage } = await import("./page");
    await renderAsync(SharePage({ params: Promise.resolve({ id: "abc-456" }) }));

    const commBar = screen.getByTestId("score-bar-communication");
    const aestheticBar = screen.getByTestId("score-bar-aesthetic");
    const driveBar = screen.getByTestId("score-bar-drive");
    const structureBar = screen.getByTestId("score-bar-structure");

    expect(commBar).toHaveStyle({ width: "85%" });
    expect(aestheticBar).toHaveStyle({ width: "42%" });
    expect(driveBar).toHaveStyle({ width: "67%" });
    expect(structureBar).toHaveStyle({ width: "91%" });

    expect(screen.getByText("85/100")).toBeInTheDocument();
    expect(screen.getByText("42/100")).toBeInTheDocument();
    expect(screen.getByText("67/100")).toBeInTheDocument();
    expect(screen.getByText("91/100")).toBeInTheDocument();
  });

  it("calls notFound when audit does not exist", async () => {
    mockGetAuditById.mockResolvedValueOnce(undefined);

    const { default: SharePage } = await import("./page");

    await expect(
      SharePage({ params: Promise.resolve({ id: "nonexistent" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mockNotFound).toHaveBeenCalled();
  });
});
