import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TrendSparkline } from "./TrendSparkline";

describe("TrendSparkline", () => {
  it("renders nothing when values has fewer than 2 items", () => {
    const { container } = render(<TrendSparkline values={[]} />);
    expect(container.querySelector("svg")).toBeNull();

    const { container: c2 } = render(<TrendSparkline values={[50]} />);
    expect(c2.querySelector("svg")).toBeNull();
  });

  it("renders an SVG with a polyline for 2+ values", () => {
    const { container } = render(<TrendSparkline values={[20, 40, 60]} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "120");
    expect(svg).toHaveAttribute("height", "32");

    const polyline = container.querySelector("polyline");
    expect(polyline).toBeInTheDocument();

    const points = polyline!.getAttribute("points")!;
    // 3 values should produce 3 coordinate pairs separated by spaces
    expect(points.trim().split(" ").length).toBe(3);
  });

  it("renders a gradient fill polygon", () => {
    const { container } = render(<TrendSparkline values={[10, 90, 50, 70]} />);
    const polygon = container.querySelector("polygon");
    expect(polygon).toBeInTheDocument();
  });
});
