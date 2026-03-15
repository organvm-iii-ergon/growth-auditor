"use client";

import { useState, useEffect } from "react";

interface EmailGateProps {
  children: React.ReactNode;
  auditId?: string;
}

export default function EmailGate({ children, auditId }: EmailGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Check sessionStorage first
      if (sessionStorage.getItem("email_captured")) {
        setUnlocked(true);
        setChecking(false);
        return;
      }

      // Check if user has an authenticated session
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data) && data.length > 0) {
            setUnlocked(true);
            setChecking(false);
            return;
          }
        }
      } catch {
        // Not authenticated, continue to gate
      }

      setChecking(false);
    };

    checkAccess();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, auditId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        return;
      }

      sessionStorage.setItem("email_captured", "true");
      setUnlocked(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return <>{children}</>;
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        aria-hidden="true"
        style={{
          filter: "blur(8px)",
          overflow: "hidden",
          maxHeight: "200px",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {children}
      </div>

      <div
        data-testid="email-gate-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom, rgba(5,10,21,0.6), rgba(5,10,21,0.95))",
          borderRadius: "1rem",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "420px" }}>
          <h3
            style={{
              fontSize: "1.5rem",
              marginBottom: "0.75rem",
              color: "var(--secondary, #f0c040)",
              letterSpacing: "-0.02em",
            }}
          >
            Unlock Your Full Cosmic Audit
          </h3>
          <p style={{ color: "var(--text-muted, #aaa)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            Enter your email to reveal the complete growth strategy.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                fontSize: "1rem",
                outline: "none",
              }}
            />
            {error && (
              <p role="alert" style={{ color: "var(--accent, #ff6b6b)", fontSize: "0.85rem", margin: 0 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn"
              style={{
                width: "100%",
                padding: "0.75rem",
                cursor: submitting ? "wait" : "pointer",
              }}
            >
              {submitting ? "Unlocking..." : "Unlock Audit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
