"use client";

import { AuditRecord } from "@/lib/db";
import { DeltaBadge } from "./DeltaBadge";

interface Scores {
  communication?: number;
  aesthetic?: number;
  drive?: number;
  structure?: number;
}

const PILLARS: { key: keyof Scores; label: string }[] = [
  { key: "communication", label: "Communication" },
  { key: "aesthetic", label: "Aesthetic" },
  { key: "drive", label: "Drive" },
  { key: "structure", label: "Structure" },
];

interface AuditCompareProps {
  audit1: AuditRecord;
  audit2: AuditRecord;
  onClose: () => void;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.8rem",
          marginBottom: "0.3rem",
        }}
      >
        <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{label}</span>
        <span style={{ color: "var(--secondary)", fontWeight: 700 }}>{value}</span>
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: "linear-gradient(90deg, var(--primary), var(--secondary))",
            borderRadius: "4px",
          }}
        />
      </div>
    </div>
  );
}

function AuditColumn({ audit, scores }: { audit: AuditRecord; scores: Scores }) {
  const date = audit.createdAt
    ? new Date(audit.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          marginBottom: "0.25rem",
        }}
      >
        {date}
      </p>
      <p
        style={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "var(--secondary)",
          marginBottom: "1rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {audit.link}
      </p>
      {PILLARS.map(({ key, label }) => (
        <ScoreBar key={key} label={label} value={scores[key] || 0} />
      ))}
    </div>
  );
}

export function AuditCompare({ audit1, audit2, onClose }: AuditCompareProps) {
  const scores1: Scores = JSON.parse(audit1.scores || "{}");
  const scores2: Scores = JSON.parse(audit2.scores || "{}");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--glass-bg, #1a1a2e)",
          border: "1px solid var(--glass-border, rgba(255,255,255,0.1))",
          borderRadius: "24px",
          padding: "2rem",
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
            Audit Comparison
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "1.5rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Close comparison"
          >
            &times;
          </button>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
          <AuditColumn audit={audit1} scores={scores1} />

          {/* Delta column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "3.5rem",
              gap: "1.85rem",
              flexShrink: 0,
              minWidth: "50px",
            }}
          >
            {PILLARS.map(({ key }) => (
              <DeltaBadge
                key={key}
                current={scores2[key] || 0}
                previous={scores1[key] || 0}
              />
            ))}
          </div>

          <AuditColumn audit={audit2} scores={scores2} />
        </div>
      </div>
    </div>
  );
}
