"use client";

interface PresetData {
  businessType: string;
  goals: string;
}

interface AuditPresetsProps {
  onSelect: (preset: PresetData) => void;
}

const PRESETS = [
  { label: "SaaS", icon: "\u{1F4BB}", businessType: "SaaS / Software", goals: "Increase trial signups, reduce churn, improve onboarding conversion" },
  { label: "E-commerce", icon: "\u{1F6D2}", businessType: "E-commerce / Retail", goals: "Increase average order value, reduce cart abandonment, improve product discovery" },
  { label: "Agency", icon: "\u{1F3A8}", businessType: "Creative Agency", goals: "Generate inbound leads, showcase portfolio effectively, build authority" },
  { label: "Creator", icon: "\u2726", businessType: "Content Creator / Influencer", goals: "Grow audience, increase engagement, monetize content effectively" },
  { label: "Local", icon: "\u{1F4CD}", businessType: "Local Business", goals: "Increase foot traffic, improve local SEO, build community trust" },
];

export default function AuditPresets({ onSelect }: AuditPresetsProps) {
  return (
    <div
      data-testid="audit-presets"
      style={{
        display: "flex",
        gap: "0.5rem",
        overflowX: "auto",
        padding: "0.25rem 0",
        marginBottom: "1.5rem",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}
    >
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onSelect({ businessType: preset.businessType, goals: preset.goals })}
          data-testid={`preset-${preset.label.toLowerCase()}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.5rem 1rem",
            background: "var(--glass-bg, rgba(255, 255, 255, 0.05))",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.1))",
            borderRadius: "100px",
            color: "var(--foreground, #fff)",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <span aria-hidden="true">{preset.icon}</span>
          {preset.label}
        </button>
      ))}
    </div>
  );
}
