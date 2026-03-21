"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import ProBadge from "@/components/ProBadge";

const RESOURCES = [
  {
    pillar: "Mercury (Communication)",
    title: "evocative Copywriting Framework",
    description: "The exact framework we use to turn boring service descriptions into cosmic manifestations.",
    content: "1. The Hook (The Void)\n2. The Problem (The Alignment)\n3. The Solution (The Manifestation)..."
  },
  {
    pillar: "Venus (Aesthetic)",
    title: "Visual Harmony Guide",
    description: "How to use color theory and layout to reduce visual friction and increase Venusian attraction.",
    content: "1. 60-30-10 Color Rule\n2. The Golden Ratio in Layouts\n3. Glassmorphism implementation..."
  },
  {
    pillar: "Mars (Drive)",
    title: "High-Performance CTA Blueprint",
    description: "Action-oriented verbs and placement strategies to maximize conversion energy.",
    content: "1. Above the fold alignment\n2. Contrast ratios for buttons\n3. Power verbs list..."
  },
  {
    pillar: "Saturn (Structure)",
    title: "Technical SEO Checklist",
    description: "The foundational structure required to maintain a high-ranking digital presence.",
    content: "1. Schema.org markup\n2. Semantic HTML5\n3. Core Web Vitals optimization..."
  }
];

export default function VaultPage() {
  const { data: session } = useSession();
  const isPro = (session?.user as any)?.isPro || (session?.user as any)?.isAdmin;

  if (!isPro) {
    return (
      <main className="main">
        <div className="card" style={{ textAlign: "center", padding: "5rem" }}>
          <h2>The Vault is Locked</h2>
          <p style={{ margin: "1rem 0 2rem", color: "var(--text-muted)" }}>
            Unlock proprietary strategy guides and templates by ascending to Pro.
          </p>
          <Link href="/pricing" className="btn">View Pricing</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">
          <span aria-hidden="true">✦</span>
          Proprietary Knowledge
        </div>
        <h1>The Growth Vault <ProBadge /></h1>
        <p>Your library of advanced strategies and implementation blueprints.</p>
      </div>

      <div className="container" style={{ maxWidth: "1000px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "2rem", marginBottom: "6rem" }}>
          {RESOURCES.map((res) => (
            <div key={res.title} className="card" style={{ padding: "2.5rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, marginBottom: "0.5rem", textTransform: "uppercase" }}>
                {res.pillar}
              </div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{res.title}</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{res.description}</p>
              
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "8px", borderLeft: "4px solid var(--primary)" }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "#ddd" }}>
                  {res.content}
                </pre>
              </div>
              
              <button className="btn btn-secondary" style={{ marginTop: "2rem", width: "auto" }}>Download Template</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
