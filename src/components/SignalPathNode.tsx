"use client";

import { useState } from "react";
import CosmicIcon, { IconType } from "./CosmicIcons";

interface PathNodeProps {
  pathNumber: number;
  title: string;
  description: string;
  buttonText: string;
  isPrimary?: boolean;
  icon: IconType;
  color: string;
}

export default function SignalPathNode({ 
  pathNumber, 
  title, 
  description, 
  buttonText, 
  isPrimary,
  icon,
  color
}: PathNodeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="form-group" style={{ width: "100%" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="card"
        style={{
          padding: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          borderColor: isOpen ? color : "var(--glass-border)",
          borderWidth: "1px",
          textAlign: "left",
          width: "100%",
          cursor: "pointer",
          transition: "all 0.3s ease",
          background: isOpen ? "rgba(255,255,255,0.05)" : "var(--glass-bg)"
        }}
      >
        {/* CUT-OUT ICON FOR PATH NODES */}
        <div style={{ 
          width: "50px", 
          height: "50px", 
          position: "relative",
          display: "flex",
          alignItems: "center", 
          justifyContent: "center",
          background: "white",
          borderRadius: "50%",
          flexShrink: 0
        }}>
          <div style={{ 
            width: "100%", 
            height: "100%", 
            background: "black", 
            position: "absolute",
            top: 0, left: 0,
            zIndex: 1,
            mixBlendMode: "destination-out" as unknown as React.CSSProperties["mixBlendMode"]
          }}>
             <CosmicIcon type={icon} size="60%" style={{ margin: "20%" }} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 800, color: color, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>
            Alignment Node 0{pathNumber}
          </div>
          <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#fff", fontWeight: 700 }}>{title}</h3>
        </div>
        <div style={{ 
          fontSize: "1rem", 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
          transition: "transform 0.3s",
          color: "var(--text-muted)",
          opacity: 0.5
        }}>
          ↓
        </div>
      </button>

      {isOpen && (
        <div 
          className="card" 
          style={{ 
            marginTop: "-0.5rem", 
            borderTopLeftRadius: 0, 
            borderTopRightRadius: 0,
            padding: "2rem 1.5rem 1.5rem",
            animation: "fadeIn 0.3s ease-out",
            borderTop: "none",
            borderColor: color,
            borderWidth: "1px",
            background: "rgba(0,0,0,0.3)"
          }}
        >
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: "1.6", fontSize: "0.95rem" }}>{description}</p>
          <button className="btn" style={{ background: isPrimary ? color : "rgba(255,255,255,0.05)", boxShadow: isPrimary ? `0 0 20px ${color}44` : "none" }}>
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
}
