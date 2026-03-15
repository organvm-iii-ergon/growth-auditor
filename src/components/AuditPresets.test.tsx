import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AuditPresets from "./AuditPresets";

describe("AuditPresets Component", () => {
  it("renders all five preset buttons", () => {
    const onSelect = vi.fn();
    render(<AuditPresets onSelect={onSelect} />);

    expect(screen.getByTestId("preset-saas")).toBeInTheDocument();
    expect(screen.getByTestId("preset-e-commerce")).toBeInTheDocument();
    expect(screen.getByTestId("preset-agency")).toBeInTheDocument();
    expect(screen.getByTestId("preset-creator")).toBeInTheDocument();
    expect(screen.getByTestId("preset-local")).toBeInTheDocument();
  });

  it("renders preset labels", () => {
    const onSelect = vi.fn();
    render(<AuditPresets onSelect={onSelect} />);

    expect(screen.getByText("SaaS")).toBeInTheDocument();
    expect(screen.getByText("E-commerce")).toBeInTheDocument();
    expect(screen.getByText("Agency")).toBeInTheDocument();
    expect(screen.getByText("Creator")).toBeInTheDocument();
    expect(screen.getByText("Local")).toBeInTheDocument();
  });

  it("calls onSelect with SaaS preset data when SaaS is clicked", () => {
    const onSelect = vi.fn();
    render(<AuditPresets onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId("preset-saas"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({
      businessType: "SaaS / Software",
      goals: "Increase trial signups, reduce churn, improve onboarding conversion",
    });
  });

  it("calls onSelect with E-commerce preset data when E-commerce is clicked", () => {
    const onSelect = vi.fn();
    render(<AuditPresets onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId("preset-e-commerce"));

    expect(onSelect).toHaveBeenCalledWith({
      businessType: "E-commerce / Retail",
      goals: "Increase average order value, reduce cart abandonment, improve product discovery",
    });
  });

  it("calls onSelect with Local preset data when Local is clicked", () => {
    const onSelect = vi.fn();
    render(<AuditPresets onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId("preset-local"));

    expect(onSelect).toHaveBeenCalledWith({
      businessType: "Local Business",
      goals: "Increase foot traffic, improve local SEO, build community trust",
    });
  });
});
