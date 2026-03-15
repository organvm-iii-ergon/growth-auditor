import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DeltaBadge } from "./DeltaBadge";

describe("DeltaBadge", () => {
  it("shows positive delta with green color and up arrow", () => {
    render(<DeltaBadge current={80} previous={60} />);
    const badge = screen.getByTestId("delta-badge");
    expect(badge.textContent).toContain("+20");
    expect(badge.textContent).toContain("\u2191");
    expect(badge.style.color).toBe("rgb(34, 197, 94)");
  });

  it("shows negative delta with red color and down arrow", () => {
    render(<DeltaBadge current={40} previous={55} />);
    const badge = screen.getByTestId("delta-badge");
    expect(badge.textContent).toContain("-15");
    expect(badge.textContent).toContain("\u2193");
    expect(badge.style.color).toBe("rgb(239, 68, 68)");
  });

  it("shows dash for zero delta", () => {
    render(<DeltaBadge current={50} previous={50} />);
    const badge = screen.getByTestId("delta-badge");
    // mdash renders as \u2014
    expect(badge.textContent).toBe("\u2014");
    expect(badge.style.color).toBe("rgb(136, 136, 136)");
  });
});
