# Automated Client Onboarding System

Production-ready starter for a Notion-based onboarding pipeline for a digital marketing agency.

## What this project includes

- Express webhook backend for three events:
  - `POST /webhooks/typeform`
  - `POST /webhooks/lead-qualified`
  - `POST /webhooks/stripe`
- Notion API integration for Leads, Projects, and Invoices databases.
- Stripe customer creation and verified Stripe webhook handling.
- Slack alerts for operational visibility.
- Environment validation with Zod.

## Architecture

1. Typeform submission creates a lead in Notion and posts a Slack alert.
2. Qualified lead creates/updates Stripe customer and marks lead as qualified.
3. Stripe payment success creates Notion project + invoice and notifies Slack.

See detailed workflow in `docs/automation-blueprint.md`.

## Quick start

1. Install dependencies:
   - `npm install`
2. Configure environment:
   - copy `.env.example` to `.env`
   - fill all values
3. Start server:
   - `npm run dev`
4. Health check:
   - `GET http://localhost:4000/health`

## Required Notion database properties

Create these fields in each Notion database exactly as named below.

### Leads DB

- `Name` (title)
- `Email` (email)
- `Company` (rich text)
- `Service` (rich text)
- `Source` (select: includes `Typeform`)
- `Status` (select: includes `New`, `Qualified`)

### Projects DB

- `Name` (title)
- `Stage` (select: includes `Kickoff`)
- `Owner` (rich text)
- `StripeCustomerId` (rich text)

### Invoices DB

- `Name` (title)
- `Amount` (number)
- `Currency` (select: includes `USD`)
- `Status` (select: includes `Paid`)
- `PaymentIntentId` (rich text)

## Zapier / Make setup

- Zapier:
  - Trigger: Typeform new entry -> Action: webhook to `/webhooks/typeform`
  - Trigger: Stripe payment event -> Action: webhook to `/webhooks/stripe` (or direct Stripe webhook)
- Make:
  - Trigger: lead qualification in Notion -> Action: webhook to `/webhooks/lead-qualified`
  - Add retry + backoff modules for rate-limit resilience.

## Test endpoints with sample payloads

Use samples in `docs/sample-payloads.md`.

## Production hardening checklist

- Deploy on a stable host (Render, Railway, AWS, GCP).
- Add request authentication for non-Stripe routes.
- Add idempotency storage (Redis or DB) to avoid duplicate writes.
- Add central logging and alerting.
- Add token refresh flow if any upstream system uses expiring OAuth tokens.
