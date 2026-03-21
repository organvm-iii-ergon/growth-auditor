"use client";

import React from "react";

export type IconType = "mercury" | "venus" | "mars" | "saturn" | "hammer" | "key" | "eye";

interface CosmicIconProps {
  type: IconType;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const ICON_PATHS: Record<IconType, string> = {
  mercury: "M12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-7a3 3 0 0 0-3 3c0 .34.05.67.14 1h5.72c.09-.33.14-.66.14-1a3 3 0 0 0-3-3zm0 19v3m-4-1.5h8",
  venus: "M12 4a6 4 0 1 0 0 12 6 4 0 0 0 0-12zM12 16v6m-3-3h6",
  mars: "M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm6-6h6m-3-3v6m-3-3 3.5-3.5",
  saturn: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-9 4c0-2 4-4 9-4s9 2 9 4-4 4-9 4-9-2-9-4z",
  hammer: "m12 15 9-9-3-3-9 9v3h3zM2 22l5-5m3-1 2 2",
  key: "M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm3 0 11 10-3 3-2-2-2 2-4-4",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
};

export default function CosmicIcon({ type, size = "100%", className, style }: CosmicIconProps) {
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "100%", height: "100%" }}>
        <path d={ICON_PATHS[type]} />
      </svg>
    </div>
  );
}
