"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApiKeyInline from "@/components/ApiKeyInline";
import AuditPresets from "@/components/AuditPresets";
import { getStoredApiKey } from "@/services/aiProvider";
import { useSession } from "next-auth/react";
import CosmicIcon, { IconType } from "@/components/CosmicIcons";
import type { TeamRecord } from "@/lib/db";

const PILLARS: { name: string; icon: IconType; desc: string; color: string }[] = [
  { name: "Mercury", icon: "mercury", desc: "Communication", color: "#7000ff" },
  { name: "Venus", icon: "venus", desc: "Aesthetic", color: "#00d4ff" },
  { name: "Mars", icon: "mars", desc: "Drive", color: "#ff0070" },
  { name: "Saturn", icon: "saturn", desc: "Structure", color: "#ffcc00" },
];

function getMoonPhase() {
  const LUNAR_MONTH = 29.53058867;
  const KNOWN_NEW_MOON = new Date("2024-01-11T11:57:00Z").getTime();
  const now = Date.now();
  const diff = now - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  const phase = days % LUNAR_MONTH;
  if (phase < 1.84) return "New Moon";
  if (phase < 5.53) return "Waxing Crescent";
  if (phase < 9.22) return "First Quarter";
  if (phase < 12.91) return "Waxing Gibbous";
  if (phase < 16.61) return "Full Moon";
  if (phase < 20.30) return "Waning Gibbous";
  if (phase < 23.99) return "Last Quarter";
  return "Waning Crescent";
}

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ link: "", businessType: "", goals: "", teamId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [planetaryWindow, setPlanetaryWindow] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    setPlanetaryWindow(getMoonPhase());
    if (session?.user?.email) {
      fetch("/api/teams").then(res => res.json()).then(data => setTeams(data)).catch(() => {});
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const apiKey = getStoredApiKey(); // allow-secret
    if (!apiKey) {
      setError("Please configure your AI key in Settings.");
      setLoading(false);
      return;
    }
    sessionStorage.setItem("current_audit_request", JSON.stringify(formData));
    sessionStorage.removeItem("current_audit_result");
    router.push("/results");
  };

  return (
    <main className="main">
      <div className="hero">
        <div className="astro-badge">✦ {planetaryWindow} Window Active</div>
        <h1 style={{ fontSize: "clamp(2.5rem, 12vw, 6rem)", marginBottom: "3rem", letterSpacing: "-0.06em" }}>
          Strategic <span style={{ background: "var(--ocean-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Alignment</span>
        </h1>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(2, 1fr)", 
          gap: "1.5rem", 
          maxWidth: "600px", 
          margin: "0 auto 4rem" 
        }}>
          {PILLARS.map(p => (
            <div key={p.name} className="card" style={{ 
              padding: "3rem 1rem", 
              textAlign: "center", 
              borderWidth: "1px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem"
            }}>
              <div style={{ 
                width: "80px", 
                height: "80px", 
                position: "relative",
                display: "flex",
                alignItems: "center", 
                justifyContent: "center",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "20px"
              }}>
                <div style={{ 
                  width: "100%", 
                  height: "100%", 
                  background: "black", 
                  position: "absolute",
                  top: 0, left: 0,
                  zIndex: 1,
                  mixBlendMode: "destination-out" as any
                }}>
                   <CosmicIcon type={p.icon} size="70%" style={{ margin: "15%" }} />
                </div>
              </div>
              <div style={{ fontWeight: 900, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.25em", color: p.color }}>{p.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", opacity: 0.8 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        <p style={{ marginBottom: "3rem", opacity: 0.6, fontSize: "1.1rem" }}>An oceanic intelligence depth, accessible through four primary signals.</p>

        {!showForm ? (
          <button 
            className="btn hero-cta" 
            style={{ width: "auto", minWidth: "300px", padding: "1.5rem 4rem", fontSize: "1.1rem" }}
            onClick={() => setShowForm(true)}
          >
            Initiate Alignment ✦
          </button>
        ) : (
          <div style={{ animation: "fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1)", width: "100%", maxWidth: "550px", margin: "0 auto" }}>
            <div className="card" id="audit-form" style={{ textAlign: "left", padding: "3rem" }}>
              <form onSubmit={handleSubmit}>
                <AuditPresets onSelect={(preset) => setFormData({ ...formData, ...preset })} />
                <div className="form-group">
                  <label htmlFor="link">URL / Social Handle</label>
                  <input id="link" className="input" type="url" required placeholder="https://..." value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="business">Business Niche</label>
                  <input id="business" className="input" type="text" required placeholder="e.g. Creator, SaaS" value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="goals">Target Manifestation</label>
                  <textarea id="goals" className="input" style={{ minHeight: "100px" }} required placeholder="What are you aiming for?" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} />
                </div>
                {teams.length > 0 && (
                  <div className="form-group">
                    <label htmlFor="team">Assign to Team</label>
                    <select id="team" className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                      <option value="">Personal</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                )}
                <ApiKeyInline />
                {error && <p style={{ color: "var(--accent)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>{error}</p>}
                <button type="submit" className="btn" disabled={loading} style={{ fontSize: "1.1rem" }}>{loading ? "Aligning..." : "Generate Strategic Audit"}</button>
                <button type="button" className="btn btn-secondary" style={{ marginTop: "1rem", opacity: 0.6 }} onClick={() => setShowForm(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
