"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="main">
          <div className="card" style={{ textAlign: "center", padding: "4rem", maxWidth: "600px", margin: "4rem auto" }}>
            <h2 style={{ color: "#00d4ff", marginBottom: "1rem" }}>Cosmic Interference Detected</h2>
            <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
              Something went wrong. The stars are realigning.
            </p>
            <button className="btn" onClick={() => reset()}>
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
