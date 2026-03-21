"use client";

import React from "react";

export type IconType = "mercury" | "venus" | "mars" | "saturn" | "hammer" | "key" | "eye";

interface CosmicIconProps {
  type: IconType;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CosmicIcon({ type, size = "100%", className, style }: CosmicIconProps) {
  const icons: Record<IconType, React.ReactNode> = {
    mercury: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-7a3 3 0 0 0-3 3c0 .34.05.67.14 1h5.72c.09-.33.14-.66.14-1a3 3 0 0 0-3-3zm0 19v3m-4-1.5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    venus: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4a6 4 0 1 0 0 12 6 4 0 0 0 0-12zM12 16v6m-3-3h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    mars: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm6-6h6m-3-3v6m-3-3 3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    saturn: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm-9 4c0-2 4-4 9-4s9 2 9 4-4 4-9 4-9-2-9-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    hammer: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="m12 15 9-9-3-3-9 9v3h3zM2 22l5-5m3-1 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    key: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm3 0 11 10-3 3-2-2-2 2-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    eye: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
    )
  };

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
      {icons[type]}
    </div>
  );
}
