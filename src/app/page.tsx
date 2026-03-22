"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ApiKeyInline from "@/components/ApiKeyInline";
import AuditPresets from "@/components/AuditPresets";
import { getStoredApiKey } from "@/services/aiProvider";
import { useSession } from "next-auth/react";
import TransparentIcon from "@/components/TransparentIcon";
import { IconType } from "@/components/CosmicIcons";
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
  const phase = (diff / (1000 * 60 * 60 * 24)) % LUNAR_MONTH;
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
  const [showForm, setShowForm] = useState(false);
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  const { data: session } = useSession();

  const planetaryWindow = typeof window !== "undefined" ? getMoonPhase() : "";

  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/teams")
        .then(res => res.json())
        .then(data => setTeams(data))
        .catch(err => console.error("Failed to fetch teams", err));
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
    <main className="main" style={{ padding: "0 1rem 3rem" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>

        <h1 style={{ fontSize: "clamp(2.2rem, 8vw, 4.5rem)", marginBottom: "0.5rem", letterSpacing: "-0.06em", fontWeight: 900, lineHeight: 1 }}>
          Digital <span style={{ background: "var(--ocean-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Alignment</span>
        </h1>

        <p style={{ opacity: 0.5, fontSize: "0.95rem", marginBottom: "2rem" }}>
          AI-powered growth audits across four strategic pillars.
        </p>

        {/* PILLARS — single row on desktop, 2x2 on mobile */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.75rem",
          marginBottom: "2rem"
        }}>
          {PILLARS.map(p => (
            <div key={p.name} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.4rem",
              padding: "1rem 0.5rem",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.06)"
            }}>
              <div style={{ width: "36px", height: "36px" }}>
                <TransparentIcon type={p.icon} size="100%" />
              </div>
              <div style={{ fontWeight: 800, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", color: p.color }}>{p.name}</div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", opacity: 0.7 }}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* FORM AREA */}
        <div className="card" style={{ borderRadius: "20px", textAlign: "left" }}>
          {!showForm ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <button
                className="btn"
                style={{ width: "auto", padding: "1rem 3rem", fontSize: "1.05rem", borderRadius: "100px", background: "var(--ocean-gradient)" }}
                onClick={() => setShowForm(true)}
              >
                Initiate Alignment
              </button>
            </div>
          ) : (
            <div style={{ animation: "fadeIn 0.4s ease-out" }}>
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
                  <textarea id="goals" className="input" style={{ minHeight: "80px" }} required placeholder="What are you aiming for?" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} />
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
                {error && <p style={{ color: "var(--accent)", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</p>}
                <button type="submit" className="btn" disabled={loading} style={{ fontSize: "1rem", padding: "1rem" }}>{loading ? "Aligning..." : "Generate Strategic Audit"}</button>
                <button type="button" className="btn btn-secondary" style={{ marginTop: "0.75rem", opacity: 0.6 }} onClick={() => setShowForm(false)}>Cancel</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
