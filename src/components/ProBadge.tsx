"use client";

export default function ProBadge() {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.25rem",
      backgroundColor: "var(--primary)",
      color: "#000",
      padding: "0.15rem 0.5rem",
      borderRadius: "4px",
      fontSize: "0.7rem",
      fontWeight: 800,
      letterSpacing: "0.05em",
      marginLeft: "0.5rem",
      verticalAlign: "middle",
      boxShadow: "0 0 10px var(--primary-glow)"
    }}>
      <span style={{ fontSize: "0.8rem" }}>✦</span> PRO
    </div>
  );
}
