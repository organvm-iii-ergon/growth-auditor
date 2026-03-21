"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AI_PROVIDERS,
  AIProvider,
  getStoredProvider,
  getProviderConfig,
  getStoredApiKey,
} from "@/services/aiProvider";
import ProBadge from "@/components/ProBadge";

export default function SettingsPage() {
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "agency" | "data" | "integrations">("ai");
  const { data: session } = useSession();

  const isPro = session?.user?.isPro || session?.user?.isAdmin;

  useEffect(() => {
    const storedProvider = getStoredProvider();
    const storedKey = getStoredApiKey(storedProvider) || "";
    setProvider(storedProvider);
    setApiKey(storedKey);

    if (session?.user?.email) {
      fetch("/api/settings/branding")
        .then(res => res.json())
        .then(data => {
          if (data.customLogoUrl) setLogoUrl(data.customLogoUrl);
        })
        .catch(() => {});
    }
  }, [session]);

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    const storedKey = getStoredApiKey(newProvider) || "";
    setApiKey(storedKey);
  };

  const config = getProviderConfig(provider);

  const saveKeys = () => {
    localStorage.setItem("ai_provider", provider);
    if (provider === "gemini") {
      localStorage.setItem("gemini_api_key", apiKey);
    } else {
      localStorage.setItem(`${provider}_api_key`, apiKey);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleBrandingSave = async () => {
    try {
      const res = await fetch("/api/settings/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl }),
      });
      if (!res.ok) throw new Error("Failed to save branding");
      setBrandingSaved(true);
      setTimeout(() => setBrandingSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Pro subscription required.");
    }
  };

  const handleDeleteData = async () => {
    if (!confirm("Are you sure? This is irreversible.")) return;
    try {
      const res = await fetch("/api/settings/data/forget", { method: "DELETE" });
      if (res.ok) {
        alert("Your data has been erased.");
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="main">
      <div className="hero">
        <h1>Settings {isPro && <ProBadge />}</h1>
        <p>Control your cosmic interface and strategic data.</p>
      </div>

      <div className="container" style={{ maxWidth: "900px" }}>
        {/* TAB NAVIGATION (Iceberg Tips) */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          <button 
            onClick={() => setActiveTab("ai")}
            className={`btn ${activeTab === "ai" ? "" : "btn-secondary"}`}
            style={{ width: "auto", flex: "none", padding: "0.5rem 1.5rem" }}
          >
            AI Engine
          </button>
          {isPro && (
            <button 
              onClick={() => setActiveTab("agency")}
              className={`btn ${activeTab === "agency" ? "" : "btn-secondary"}`}
              style={{ width: "auto", flex: "none", padding: "0.5rem 1.5rem" }}
            >
              Agency
            </button>
          )}
          <button 
            onClick={() => setActiveTab("integrations")}
            className={`btn ${activeTab === "integrations" ? "" : "btn-secondary"}`}
            style={{ width: "auto", flex: "none", padding: "0.5rem 1.5rem" }}
          >
            Integrations
          </button>
          <button 
            onClick={() => setActiveTab("data")}
            className={`btn ${activeTab === "data" ? "" : "btn-secondary"}`}
            style={{ width: "auto", flex: "none", padding: "0.5rem 1.5rem" }}
          >
            Privacy
          </button>
        </div>

        <div className="card">
          {activeTab === "ai" && (
            <div className="tab-content" style={{ animation: "fadeIn 0.3s" }}>
              <div className="form-group">
                <label htmlFor="provider">Selected AI Model</label>
                <select id="provider" className="input" value={provider} onChange={(e) => handleProviderChange(e.target.value as AIProvider)}>
                  {AI_PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="apikey">{config.name} Secret Key</label>
                <input id="apikey" type="password" className="input" placeholder={config.keyPlaceholder} value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                <small style={{ color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>
                  Get credentials at <a href={config.getKeyUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>{config.name}</a>
                </small>
              </div>
              <button className="btn" onClick={saveKeys}>
                {saved ? "Alignment Saved! ✦" : "Align AI Engine"}
              </button>
            </div>
          )}

          {activeTab === "agency" && isPro && (
            <div className="tab-content" style={{ animation: "fadeIn 0.3s" }}>
              <h3 style={{ marginBottom: "1rem" }}>White-Label Configuration</h3>
              <div className="form-group">
                <label htmlFor="logoUrl">Custom Agency Logo URL</label>
                <input id="logoUrl" className="input" type="url" placeholder="https://..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
              </div>
              <button className="btn" onClick={handleBrandingSave}>
                {brandingSaved ? "Branding Applied! ✦" : "Manifest Branding"}
              </button>
              
              <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <Link href="/settings/schedules" className="btn btn-secondary" style={{ display: "block", textAlign: "center" }}>
                  Manage Recurring Audits
                </Link>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="tab-content" style={{ animation: "fadeIn 0.3s" }}>
              <h3 style={{ marginBottom: "1rem" }}>External Orbits</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
                Connect your growth reports to external systems like Slack or Zapier.
              </p>
              {/* Integration management UI would go here - placeholder for now */}
              <button className="btn btn-secondary" style={{ width: "auto" }}>Add Webhook</button>
            </div>
          )}

          {activeTab === "data" && (
            <div className="tab-content" style={{ animation: "fadeIn 0.3s" }}>
              <h3 style={{ marginBottom: "1rem" }}>Strategic Sovereignty</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
                Your data is your legacy. Export or erase your footprint at any time.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <a href="/api/settings/data/export" className="btn btn-secondary" style={{ flex: 1, textAlign: "center", minWidth: "200px" }}>
                  Export Strategic History
                </a>
                <button onClick={handleDeleteData} className="btn" style={{ flex: 1, minWidth: "200px", backgroundColor: "transparent", color: "var(--accent)", border: "1px solid var(--accent)" }}>
                  Erase Cosmic Presence
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "2rem", textAlign: "center", lineHeight: "1.6", opacity: 0.6 }}>
          Local keys are never stored in our core database. They remain in your device&apos;s gravitational pull.
        </p>
      </div>
    </main>
  );
}
