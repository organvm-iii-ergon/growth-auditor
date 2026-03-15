import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getAuditById } from "@/lib/db";

interface Scores {
  communication?: number;
  aesthetic?: number;
  drive?: number;
  structure?: number;
}

const SCORE_LABELS: { key: keyof Scores; label: string }[] = [
  { key: "communication", label: "Communication" },
  { key: "aesthetic", label: "Aesthetic" },
  { key: "drive", label: "Drive" },
  { key: "structure", label: "Structure" },
];

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    notFound();
  }

  const scores: Scores = JSON.parse(audit.scores || "{}");
  const avgScore = Math.round(
    ((scores.communication || 0) + (scores.aesthetic || 0) + (scores.drive || 0) + (scores.structure || 0)) / 4
  );

  const formattedDate = audit.createdAt
    ? new Date(audit.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date";

  return (
    <main style={{ minHeight: "80vh", padding: "2rem 0 6rem" }}>
      {/* Header */}
      <header
        style={{
          textAlign: "center",
          marginBottom: "3rem",
          animation: "fadeIn 0.8s ease-out",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: "rgba(112, 0, 255, 0.1)",
            border: "1px solid rgba(112, 0, 255, 0.2)",
            borderRadius: "100px",
            fontSize: "0.8rem",
            color: "#b080ff",
            marginBottom: "1.5rem",
          }}
        >
          Cosmic Growth Audit
        </div>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 3rem)",
            fontWeight: 900,
            marginBottom: "1rem",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            background: "linear-gradient(to bottom, #fff 40%, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {audit.link}
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          {audit.businessType} &middot; {formattedDate}
        </p>
        <p
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            background: "var(--ocean-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Overall Score: {avgScore}/100
        </p>
      </header>

      {/* Score Bars */}
      <section
        data-testid="score-bars"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--glass-border)",
          borderRadius: "24px",
          padding: "2rem",
          marginBottom: "2.5rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-muted)",
            marginBottom: "1.5rem",
          }}
        >
          Score Breakdown
        </h2>
        {SCORE_LABELS.map(({ key, label }) => {
          const value = scores[key] || 0;
          return (
            <div key={key} style={{ marginBottom: "1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{label}</span>
                <span style={{ color: "var(--secondary)", fontWeight: 700 }}>{value}/100</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  data-testid={`score-bar-${key}`}
                  style={{
                    width: `${value}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--primary), var(--secondary))",
                    borderRadius: "5px",
                    transition: "width 1s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* Full Audit Markdown */}
      <section
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--glass-border)",
          borderRadius: "24px",
          padding: "2.5rem",
          marginBottom: "3rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          lineHeight: 1.7,
          fontSize: "1.05rem",
          color: "var(--foreground)",
        }}
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  marginTop: "2rem",
                  marginBottom: "1rem",
                  background: "linear-gradient(to right, var(--primary), var(--secondary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginTop: "1.75rem",
                  marginBottom: "0.75rem",
                  color: "var(--secondary)",
                }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  marginTop: "1.5rem",
                  marginBottom: "0.5rem",
                  color: "var(--foreground)",
                }}
              >
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p style={{ marginBottom: "1rem", color: "var(--foreground)" }}>{children}</p>
            ),
            ul: ({ children }) => (
              <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>{children}</ul>
            ),
            li: ({ children }) => (
              <li style={{ marginBottom: "0.4rem", color: "var(--foreground)" }}>{children}</li>
            ),
            strong: ({ children }) => (
              <strong style={{ color: "var(--secondary)", fontWeight: 700 }}>{children}</strong>
            ),
            code: ({ children }) => (
              <code
                style={{
                  background: "rgba(0, 112, 243, 0.1)",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "4px",
                  fontSize: "0.9em",
                  color: "var(--secondary)",
                }}
              >
                {children}
              </code>
            ),
          }}
        >
          {audit.markdownAudit}
        </ReactMarkdown>
      </section>

      {/* CTA Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "3rem 0",
          animation: "fadeIn 1.2s ease-out",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 900,
            marginBottom: "1rem",
            letterSpacing: "-0.03em",
            background: "linear-gradient(to bottom, #fff 40%, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Want your own cosmic audit?
        </h2>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "1.1rem",
            marginBottom: "2rem",
            maxWidth: "500px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Get a personalized AI-powered growth audit for your website in seconds.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "1.25rem 3rem",
            background: "var(--ocean-gradient)",
            color: "#fff",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "1.1rem",
            textDecoration: "none",
            boxShadow: "var(--cosmic-glow)",
            transition: "all 0.3s",
          }}
        >
          Start Your Audit
        </Link>
      </footer>
    </main>
  );
}
