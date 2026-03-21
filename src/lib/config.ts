import type { Database as DatabaseType } from "better-sqlite3";
import crypto from "crypto";

export interface ConfigRecord {
  key: string;
  value: string;
  updatedAt: string;
}

const defaultConfig: Record<string, string> = {
  geminiApiKey: "",
  supabaseUrl: "",
  supabaseKey: "",
  stripeSecretKey: "",
  stripeWebhookSecret: "",
  posthogKey: "",
  posthogHost: "https://us.i.posthog.com",
  resendApiKey: "",
  cronSecret: crypto.randomBytes(32).toString("hex"),
  adminEmails: "admin@growthauditor.ai",
  authPassword: "cosmic", // allow-secret
  nextAuthSecret: crypto.randomBytes(32).toString("hex"),
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  subscriptionPriceMonthly: "price_monthly_placeholder",
  subscriptionPriceYearly: "price_yearly_placeholder",
  enableSubscriptions: "false",
  enableMonthlyAudits: "true",
  emailFrom: "hello@growthauditor.ai",
  appName: "Growth Auditor",
  appTagline: "Cosmic Strategy & Digital Alignment",
  primaryColor: "#7000ff",
  accentColor: "#00d4ff",
  logoUrl: "",
  faviconUrl: "",
  customCss: "",
  webhookUrl: "",
  webhookSecret: "",
};

// Lazy singleton — DB is initialized on first access, not at import time.
// This prevents better-sqlite3 native module from crashing Vercel's SSR runtime.
let db: DatabaseType | null = null;
let dbInitAttempted = false;

function getDb(): DatabaseType | null {
  if (dbInitAttempted) return db;
  dbInitAttempted = true;

  try {
    // Dynamic import of Node built-ins and native module
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");

    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, "config.db");
    const instance = new Database(dbPath);

    instance.exec(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const [key, value] of Object.entries(defaultConfig)) {
      const existing = instance.prepare("SELECT value FROM config WHERE key = ?").get(key);
      if (!existing) {
        instance.prepare("INSERT INTO config (key, value) VALUES (?, ?)").run(key, value);
      }
    }
    db = instance;
  } catch {
    // Native module unavailable or read-only filesystem — use defaults
    db = null;
  }

  return db;
}

export function getConfig(key: string): string | null {
  const instance = getDb();
  if (!instance) return defaultConfig[key] ?? null;
  const row = instance.prepare("SELECT value FROM config WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

export function getAllConfig(): Record<string, string> {
  const instance = getDb();
  if (!instance) return { ...defaultConfig };
  const rows = instance.prepare("SELECT key, value FROM config").all() as {
    key: string;
    value: string;
  }[];
  const config: Record<string, string> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  return config;
}

export function setConfig(key: string, value: string): void {
  const instance = getDb();
  if (!instance) return;
  instance.prepare(
    "INSERT OR REPLACE INTO config (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)"
  ).run(key, value);
}

export function deleteConfig(key: string): void {
  const instance = getDb();
  if (!instance) return;
  instance.prepare("DELETE FROM config WHERE key = ?").run(key);
}
