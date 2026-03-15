import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ShareButtons from "./ShareButtons";

describe("ShareButtons Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("renders all three share buttons", () => {
    render(<ShareButtons url="https://example.com/share/123" title="Test Audit" score={85} />);

    expect(screen.getByTestId("copy-link-button")).toBeInTheDocument();
    expect(screen.getByTestId("twitter-share-button")).toBeInTheDocument();
    expect(screen.getByTestId("linkedin-share-button")).toBeInTheDocument();
  });

  it("copy button shows 'Copied!' after click and resets after 2 seconds", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ShareButtons url="https://example.com/share/123" title="Test Audit" />);

    const copyButton = screen.getByTestId("copy-link-button");
    expect(copyButton).toHaveTextContent("Copy Link");

    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(writeText).toHaveBeenCalledWith("https://example.com/share/123");
    expect(copyButton).toHaveTextContent("Copied!");

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(copyButton).toHaveTextContent("Copy Link");
  });

  it("twitter link includes score in tweet text when provided", () => {
    render(<ShareButtons url="https://example.com/share/123" title="Test Audit" score={85} />);

    const twitterLink = screen.getByTestId("twitter-share-button");
    const href = twitterLink.getAttribute("href")!;
    expect(href).toContain("twitter.com/intent/tweet");
    expect(href).toContain(encodeURIComponent("Just scored 85/100"));
    expect(href).toContain(encodeURIComponent("https://example.com/share/123"));
  });

  it("twitter link uses fallback text when no score", () => {
    render(<ShareButtons url="https://example.com/share/123" title="Test Audit" />);

    const twitterLink = screen.getByTestId("twitter-share-button");
    const href = twitterLink.getAttribute("href")!;
    expect(href).toContain(encodeURIComponent("Check out this cosmic growth audit:"));
  });

  it("linkedin link includes the share URL", () => {
    render(<ShareButtons url="https://example.com/share/123" title="Test Audit" />);

    const linkedInLink = screen.getByTestId("linkedin-share-button");
    const href = linkedInLink.getAttribute("href")!;
    expect(href).toContain("linkedin.com/sharing/share-offsite");
    expect(href).toContain(encodeURIComponent("https://example.com/share/123"));
  });

  it("share links open in new tab", () => {
    render(<ShareButtons url="https://example.com/share/123" title="Test Audit" />);

    expect(screen.getByTestId("twitter-share-button")).toHaveAttribute("target", "_blank");
    expect(screen.getByTestId("linkedin-share-button")).toHaveAttribute("target", "_blank");
  });
});
