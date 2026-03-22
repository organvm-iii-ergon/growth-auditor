"use client";

import React from "react";

export type IconType = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "neptune" | "hammer" | "key" | "eye";

interface CosmicIconProps {
  type: IconType;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

// Astronomical symbol SVG paths — hollow strokes, clean geometry
export const ICON_PATHS: Record<IconType, string> = {
  // Sun: circle with dot center and radiating lines
  sun: "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  // Moon: crescent
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  // Mercury: circle with cross below and horns above
  mercury: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 12v3m-3-1.5h6M8.5 5.5a4 4 0 0 1 7 0",
  // Venus: circle with cross below
  venus: "M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 14v5m-3-2.5h6",
  // Mars: circle with arrow upper-right
  mars: "M10 8a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm6-4h5v5m-.5-4.5L15 10",
  // Jupiter: stylized numeral 4 / thunderbolt
  jupiter: "M7 4v16m0-8h8m4 0a4 4 0 0 1-4 4",
  // Saturn: circle with ring
  saturn: "M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM4 12c0-2 3.5-3.5 8-3.5s8 1.5 8 3.5-3.5 3.5-8 3.5S4 14 4 12z",
  // Neptune: trident
  neptune: "M12 2v20m-6-14l6-6 6 6m-9-1v5a3 3 0 0 0 6 0V7",
  // Utility icons
  hammer: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l2.6-2.6a4 4 0 0 0-5.6-5.6L12 3.8l2.7 2.5zm-1.4 1.4L4 17l3 3 9.3-9.3",
  key: "M15 7a4 4 0 1 0-6.9 2.7L2 16v4h4l6.1-6.1A4 4 0 0 0 15 7zm1-1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zm11-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
};

// Gradient definitions for each celestial body
const PILLAR_GRADIENTS: Partial<Record<IconType, [string, string]>> = {
  sun: ["#ffa726", "#ffcc02"],
  moon: ["#b0bec5", "#e0e7ee"],
  mercury: ["#9b6dff", "#c8a0ff"],
  venus: ["#00b8e6", "#60efff"],
  mars: ["#ff3080", "#ff80a0"],
  jupiter: ["#ff6e40", "#ffab40"],
  saturn: ["#e6b800", "#ffe066"],
  neptune: ["#448aff", "#82b1ff"],
};

let gradientCounter = 0;

export default function CosmicIcon({ type, size = "100%", className, style, color }: CosmicIconProps) {
  const gradientId = `gradient-${type}-${++gradientCounter}`;
  const gradient = PILLAR_GRADIENTS[type];
  const useGradient = gradient && !color;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={useGradient ? `url(#${gradientId})` : (color || "currentColor")}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "100%", height: "100%", filter: useGradient ? `drop-shadow(0 0 8px ${gradient[0]}50)` : undefined }}
      >
        {useGradient && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        )}
        <path d={ICON_PATHS[type]} />
      </svg>
    </div>
  );
}
