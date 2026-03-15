# Growth Auditor Phase 2: Product Evolution

**Date**: 2026-03-15
**Status**: Approved
**Scope**: 7 features across 3 layers (First Impressions → Retention → Revenue)

## Context

Growth Auditor is a deployed, tested Next.js app with a working AI audit pipeline, admin panel, teams, payments, and chat. The infrastructure is solid (CI, E2E tests, Sentry, rate limiting). What's missing is the product layer: first-impression polish, retention mechanics, and revenue capture.

## Architecture Principle

All changes build on existing patterns: App Router pages, vanilla CSS with CSS variables, config DB for runtime settings, dual Supabase/SQLite persistence. No new dependencies unless strictly necessary.

---

## Layer 1: First Impressions

### 1.1 Landing Hero Section

**Problem**: Homepage shows a bare form with no value proposition. Users don't know what they're getting before committing to fill out three fields.

**Solution**: Add a hero marketing section above the existing form on `src/app/page.tsx`.

**Components**:
- Headline: "Decode Your Digital Bottlenecks in 60 Seconds"
- Three value bullets with planet icons (Mercury/Venus/Mars/Saturn mapping)
- Social proof section (placeholder: "Trusted by 100+ creators" with count from DB)
- "Get Your Free Audit" CTA button that smooth-scrolls to the form
- The existing form remains below, unchanged

**Data flow**: The social proof count comes from a new lightweight API endpoint `GET /api/stats/public` that returns `{ totalAudits: number }` (no auth required, cached aggressively).

**Files touched**:
- `src/app/page.tsx` — Add hero section above form
- `src/app/api/stats/public/route.ts` — New: public audit count
- `src/app/globals.css` — Hero-specific styles

### 1.2 Inline API Key Prompt

**Problem**: Users must navigate to Settings → paste key → save → go back → fill form → submit. 3-page journey before any value.

**Solution**: If no Gemini API key is stored in localStorage, show an inline collapsible section directly on the homepage form (between the form fields and submit button).

**Behavior**:
- On mount, check `localStorage.getItem("gemini_api_key")`
- If missing: show expandable "Setup" section with key input + "Get a free key" link to Google AI Studio + save button
- If present: show small "API Key configured ✓" badge (clickable to expand/change)
- Key is saved to localStorage on blur/save, same as Settings page
- Settings page remains as an alternative path

**Files touched**:
- `src/app/page.tsx` — Add inline key section
- `src/components/ApiKeyInline.tsx` — New: reusable inline key component

### 1.3 SEO + OG Meta

**Problem**: Sharing the URL on Slack/iMessage/Twitter shows a generic Next.js preview. The OG image endpoint exists but isn't wired in.

**Solution**: Add proper metadata to all pages via Next.js Metadata API.

**Pages**:
- Layout (global): title template, description, default OG image
- Homepage: specific title + description
- Results: dynamic — if audit scores available, generate OG image via `/api/og?score=X&domain=Y`
- Share page (new, see 3.2): dynamic OG per shared audit

**Files touched**:
- `src/app/layout.tsx` — Add metadata export with OG defaults
- `src/app/page.tsx` — Page-specific metadata
- `src/app/results/page.tsx` — No server metadata possible (client component), handled by layout defaults
- `src/app/about/page.tsx` — Page metadata
- `src/app/examples/page.tsx` — Page metadata

---

## Layer 2: Retention & Differentiation

### 2.1 Audit Comparison View

**Problem**: Monthly re-audits generate data but there's no UI to visualize score evolution over time. Users can't see if their changes are working.

**Solution**: Enhance the history page with trend visualization and a comparison picker.

**Components**:
- **Trend sparklines**: For each audit URL that has 2+ audits, show mini line charts of the four pillar scores over time
- **Delta badges**: "+12" / "-5" badges showing change from previous audit per pillar
- **Compare picker**: Select two audits for side-by-side view (scores radar chart + markdown diff highlights)

**Data flow**:
- `GET /api/history` already returns all user audits with scores
- Client-side grouping by `link` field to find repeat audits
- Scores are stored as JSON string in `scores` column — parse on client
- No new API endpoints needed

**New components**:
- `src/components/TrendSparkline.tsx` — Small inline SVG sparkline (no dependency, hand-rolled for simplicity)
- `src/components/DeltaBadge.tsx` — Score change indicator
- `src/components/AuditCompare.tsx` — Side-by-side comparison view

**Files touched**:
- `src/app/history/page.tsx` — Add trend view, grouping, compare picker
- 3 new components above

### 2.2 White-Label Rendering

**Problem**: Config DB stores `primaryColor`, `accentColor`, `appName`, `appTagline`, `logoUrl`, `faviconUrl`, `customCss` but the frontend ignores them entirely.

**Solution**: Read white-label config server-side in the root layout and inject as CSS custom properties + DOM elements.

**Approach**:
- `src/app/layout.tsx` calls `getAllConfig()` at render time (server component, no client overhead)
- Injects `--primary`, `--secondary`, `--accent` as inline `<style>` overrides on `<html>`
- Replaces hardcoded "Growth Auditor.ai" logo text with `appName` from config
- Adds `<link rel="icon">` with `faviconUrl` if set
- Injects `customCss` as a `<style>` block if set
- Falls back to current defaults when config values are empty

**Files touched**:
- `src/app/layout.tsx` — Read config, inject CSS vars + branding
- `src/app/globals.css` — Ensure all color references use `var()` (audit for any hardcoded hex values)

---

## Layer 3: Revenue Mechanics

### 3.1 Email Capture Gate

**Problem**: Audits are fully visible to anonymous users. No mechanism to capture leads.

**Solution**: Progressive disclosure — anonymous users see scores + first section of the audit. Full audit requires email.

**Behavior**:
- Audit generation works identically (no change to `/api/audit`)
- On results page, if user is not logged in:
  - Show: radar chart with scores, first section of markdown (split at second `##` heading)
  - Blur/fade the rest with an overlay: "Enter your email to see the full audit"
  - Email input + submit stores email in a new `leads` table and reveals full content
  - Sets a session flag so they don't get gated again during this session
- Logged-in users see everything (no gate)

**Data model**:
- New table `leads`: `id TEXT PK, email TEXT NOT NULL, auditId TEXT, source TEXT DEFAULT 'audit_gate', createdAt DATETIME`
- Added to both SQLite and Supabase paths in `src/lib/db.ts`

**Files touched**:
- `src/app/results/page.tsx` — Add gate logic
- `src/components/EmailGate.tsx` — New: email capture overlay component
- `src/lib/db.ts` — Add `leads` table + `saveLead()` function
- `src/app/api/leads/route.ts` — New: POST endpoint to save lead

### 3.2 Shareable Audit Reports

**Problem**: `/api/share/[id]` returns raw JSON. There's no human-viewable public page for shared audits.

**Solution**: Create a public page at `/share/[id]` that renders the audit as a beautiful, standalone report.

**Components**:
- Server component that fetches audit via `getAuditById(id)`
- Renders: header with scores + radar chart, full markdown audit, CTA footer ("Get your own audit →")
- Dynamic OG metadata: title = "Growth Audit: {domain}", image = `/api/og?score=X&domain=Y`
- No auth required (public by design)

**Files touched**:
- `src/app/share/[id]/page.tsx` — New: public audit report page
- `src/app/share/[id]/layout.tsx` — New: dynamic metadata for OG

---

## Testing Strategy

Each feature gets:
- Unit tests for new components and API routes
- E2E test for the critical user flow (inline key → submit → see gated result → enter email → see full result)
- Existing tests must continue to pass

## Non-Goals

- No new third-party dependencies for charts (hand-roll sparklines with SVG)
- No database migrations (SQLite auto-creates tables)
- No breaking changes to existing API contracts
- No changes to the admin panel in this phase
