import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  description: "The Four Pillars of Cosmic Alignment: Mercury, Venus, Mars, and Saturn. How Growth Auditor AI decodes digital bottlenecks.",
};

const PILLARS = [
  { name: "Mercury", glyph: "☿", color: "#7000ff", label: "Communication", desc: "How clearly does your website communicate its value? We analyze copy density and messaging alignment." },
  { name: "Venus", glyph: "♀", color: "#00d4ff", label: "Aesthetic", desc: "Does your brand possess visual magnetism? We evaluate color psychology and design harmony." },
  { name: "Mars", glyph: "♂", color: "#ff0070", label: "Drive", desc: "Are your actions aggressive enough? We find where momentum stalls in the conversion journey." },
  { name: "Saturn", glyph: "♄", color: "#ffcc00", label: "Structure", desc: "Is your technical foundation solid? We pull PageSpeed and Core Web Vitals to ensure stability." },
];

export default function AboutPage() {
  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">✦ Strategic Foundation</div>
        <h1>The Cosmic Pillars</h1>
        <p>Four primary signals that define your digital presence.</p>
      </div>

      <div className="container" style={{ maxWidth: "900px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem", marginBottom: "6rem" }}>
          {PILLARS.map(p => (
            <div key={p.name} className="card" style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ fontSize: "4rem", color: p.color, marginBottom: "1.5rem", textShadow: `0 0 30px ${p.color}44` }}>{p.glyph}</div>
              <h2 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "0.25rem" }}>{p.name}</h2>
              <div style={{ fontSize: "0.8rem", color: p.color, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>{p.label}</div>
              <p style={{ color: "var(--text-muted)", lineHeight: "1.6" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
