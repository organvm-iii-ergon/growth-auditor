# Phase 4: Scaling & Collaboration Implementation Plan

## Objective
The goal of Phase 4 is to transition from a single-user tool to a collaborative platform for teams and agencies, while introducing professional subscription tiers to gate advanced features.

## Key Files & Context
- `src/app/teams/`: New directory for team management UI.
- `src/app/api/teams/`: New API routes for team CRUD and membership.
- `src/app/pricing/`: New page for subscription selection.
- `src/app/api/checkout/`: Existing route to be fully integrated with the UI.
- `src/lib/db.ts`: Existing team/member schema to be fully utilized.
- `src/services/scraper.ts`: To be enhanced for multi-page crawling.
- `src/components/CosmicChart.tsx`: To be updated with trend data.

## Implementation Steps

### Step 1: Team Management & Collaboration
- **UI:** Create `/teams` (list/create teams) and `/teams/[id]` (manage members).
- **API:** Implement `POST /api/teams` and `GET /api/teams`.
- **Membership:** Add `POST /api/teams/[id]/members` to invite members by email.
- **Audit Sharing:** Allow assigning an audit to a team during generation or from the history page.

### Step 2: Professional Subscription Tiers
- **Pricing UI:** Create `/pricing` page with "Basic" (Free) and "Pro" ($49/mo) tiers.
- **Stripe Integration:** Connect the existing `/api/subscription` route to the "Pro" buy button.
- **Gating:** Restrict "Scheduled Audits" and "Advanced Analysis" (multi-page) to Pro users.
- **Pro Badge:** Display a "Pro" status on the settings and results pages.

### Step 3: Advanced Analytics & Trend Tracking
- **Trend Data:** Create `GET /api/stats/trends` to fetch historical scores for a specific URL.
- **Visuals:** Use Recharts to show score evolution (Mercury, Venus, Mars, Saturn) over time.
- **Dashboard:** Enhance the user's history page with these trend visualizations.

### Step 4: Enhanced Multi-Page Scraper
- **Recursive Scrape:** Update `scraper.ts` to follow internal links (max depth 1, max 3 pages).
- **Contextual AI:** Pass extra page content to `promptTemplates.ts` for more holistic audits.
- **Technical SEO:** Integrate deeper PageSpeed results into the AI scoring logic.

### Step 5: White-Label Reporting (Pro Feature)
- **Branding:** Allow Pro users to upload a logo in `/settings`.
- **Custom PDF:** Update `src/app/api/pdf/route.ts` to include the user's custom logo if present.
- **Client Reports:** Add a "Client Presentation Mode" to the results page (cleaner UI, custom branding).

## Verification & Testing
- **Automated Tests:**
  - `src/app/api/teams/route.test.ts` (Team CRUD).
  - `src/services/scraper.test.ts` (Multi-page logic).
  - `src/app/api/stats/trends/route.test.ts` (Analytics).
- **Manual Verification:**
  - Create a team, invite a user, and share an audit.
  - Complete a mock Stripe checkout for the "Pro" plan.
  - Generate a PDF report with a custom logo.
  - View the score trend line for a frequently audited site.
