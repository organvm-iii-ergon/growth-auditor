import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmailGate from "./EmailGate";

const mockSessionStorage: Record<string, string> = {};

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key]);

  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => mockSessionStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockSessionStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockSessionStorage[key];
    },
  });

  vi.stubGlobal("fetch", vi.fn());
});

describe("EmailGate", () => {
  it("shows gate overlay when no session and no email captured", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );

    render(
      <EmailGate>
        <p>Secret audit content</p>
      </EmailGate>
    );

    await waitFor(() => {
      expect(screen.getByTestId("email-gate-overlay")).toBeInTheDocument();
    });

    expect(screen.getByText("Unlock Your Full Cosmic Audit")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("shows children directly when email_captured is set in sessionStorage", async () => {
    mockSessionStorage["email_captured"] = "true";

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), { status: 200 })
    );

    render(
      <EmailGate>
        <p>Secret audit content</p>
      </EmailGate>
    );

    await waitFor(() => {
      expect(screen.getByText("Secret audit content")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("email-gate-overlay")).not.toBeInTheDocument();
  });

  it("shows children directly when user has authenticated session", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: "audit-1" }]), { status: 200 })
    );

    render(
      <EmailGate>
        <p>Secret audit content</p>
      </EmailGate>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("email-gate-overlay")).not.toBeInTheDocument();
    });
  });

  it("submits email and unlocks content", async () => {
    // First call: /api/history returns empty
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      // Second call: /api/leads returns success
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    render(
      <EmailGate auditId="test-audit-id">
        <p>Secret audit content</p>
      </EmailGate>
    );

    await waitFor(() => {
      expect(screen.getByTestId("email-gate-overlay")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(input, { target: { value: "user@test.com" } });
    fireEvent.click(screen.getByText("Unlock Audit"));

    await waitFor(() => {
      expect(screen.queryByTestId("email-gate-overlay")).not.toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@test.com", auditId: "test-audit-id" }),
    });

    expect(mockSessionStorage["email_captured"]).toBe("true");
  });

  it("shows error when lead submission fails", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Failed to save lead." }), { status: 500 })
      );

    render(
      <EmailGate>
        <p>Secret audit content</p>
      </EmailGate>
    );

    await waitFor(() => {
      expect(screen.getByTestId("email-gate-overlay")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(input, { target: { value: "user@test.com" } });
    fireEvent.submit(screen.getByText("Unlock Audit").closest("form")!);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to save lead.");
    });

    // Gate should still be visible
    expect(screen.getByTestId("email-gate-overlay")).toBeInTheDocument();
  });
});
