# Plan: Complete Phase 3 Implementation

This plan covers the remaining steps for Phase 3: Step 3 (Scheduled audit config UI) and Step 5 (PDF export overhaul).

## Objective
1.  Implement a server-side PDF generation API using Puppeteer.
2.  Update the Results page to use the new PDF API.
3.  Create a UI and API for managing scheduled audit configurations.

## Key Files & Context
- `src/app/api/pdf/route.ts`: New API route for PDF generation.
- `src/app/results/page.tsx`: Updated to use the new PDF API.
- `src/app/api/settings/schedules/route.ts`: New API route for managing schedules.
- `src/app/settings/schedules/page.tsx`: New page for schedule management.
- `src/lib/db.ts`: Existing database functions for schedules.

## Implementation Steps

### Part 1: Step 5 - PDF Export Overhaul

#### 1. Create PDF API Route
Create `src/app/api/pdf/route.ts` that:
- Receives HTML content in the body.
- Uses `puppeteer` to launch a headless browser.
- Sets the page content to the received HTML.
- Generates a PDF buffer.
- Returns the buffer with `application/pdf` content type.

#### 2. Update Results Page
Modify `src/app/results/page.tsx`:
- Replace the `downloadPDF` function with one that calls `POST /api/pdf`.
- Send the necessary HTML (including scores and audit content) to the API.
- Handle the response by creating a Blob and triggering a download.

### Part 2: Step 3 - Scheduled Audit Config UI

#### 1. Create Schedules API Route
Create `src/app/api/settings/schedules/route.ts` that:
- `GET`: Lists schedules for the authenticated user.
- `POST`: Creates a new schedule.
- `PUT`: Updates an existing schedule.
- `DELETE`: Deletes a schedule.
- Uses functions from `src/lib/db.ts`.

#### 2. Create Schedules UI
Create `src/app/settings/schedules/page.tsx` that:
- Displays a list of existing schedules.
- Provides a form to add a new schedule (URL, Business Type, Goals, Frequency).
- Allows toggling `enabled` status and deleting schedules.
- Connects to the new schedules API.

## Verification & Testing
- **Unit Tests:**
  - Create `src/app/api/pdf/route.test.ts` to verify PDF generation.
  - Create `src/app/api/settings/schedules/route.test.ts` to verify CRUD operations.
- **Manual Verification:**
  - Test PDF download on the results page.
  - Test creating, listing, and deleting schedules in the settings UI.
