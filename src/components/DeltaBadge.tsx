"use client";

interface DeltaBadgeProps {
  current: number;
  previous: number;
}

export function DeltaBadge({ current, previous }: DeltaBadgeProps) {
  const delta = current - previous;

  if (delta === 0) {
    return (
      <span
        data-testid="delta-badge"
        style={{ color: "#888", fontSize: "0.85rem", fontWeight: 600 }}
      >
        &mdash;
      </span>
    );
  }

  const isPositive = delta > 0;

  return (
    <span
      data-testid="delta-badge"
      style={{
        color: isPositive ? "#22c55e" : "#ef4444",
        fontSize: "0.85rem",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.15rem",
      }}
    >
      {isPositive ? "\u2191" : "\u2193"}
      {isPositive ? `+${delta}` : delta}
    </span>
  );
}
