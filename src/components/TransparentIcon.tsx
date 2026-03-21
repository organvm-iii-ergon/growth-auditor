"use client";

import React from "react";
import { ICON_PATHS, IconType } from "./CosmicIcons";

interface TransparentIconProps {
  type: IconType;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TRANSPARENT CUT-OUT ICON
 * Uses an SVG with a mask to create a "hole" through its parent container.
 * This reveals the animated p5.js background.
 */
export default function TransparentIcon({ type, size = "100%", className, style }: TransparentIconProps) {
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
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <mask id={`mask-${type}`}>
            {/* White reveals, Black hides (cuts out) */}
            <rect width="24" height="24" fill="white" />
            <path 
              d={ICON_PATHS[type]} 
              fill="black" 
              stroke="black" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </mask>
        </defs>
        
        {/* This rect is the "solid" part of the icon area, with the path cut out */}
        <rect 
          width="24" 
          height="24" 
          fill="currentColor" 
          mask={`url(#mask-${type})`} 
        />
      </svg>
    </div>
  );
}
