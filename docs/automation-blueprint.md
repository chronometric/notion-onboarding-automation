# Automation Blueprint

## Scope

Automate lead capture through project kickoff with Notion as source of truth.

## Event flow

| Trigger | Action | Tools |
|---|---|---|
| Typeform submit | Create Notion lead + Slack notify | Zapier + backend |
| Lead qualified | Mark lead qualified + create Stripe customer + send email | Make + backend + API |
| Stripe payment succeeded | Create Notion project + invoice + team assignment notification | Stripe + backend + Zapier/Notion |

## Reliability patterns

- Use Make for high-volume and branching logic.
- Add retries with exponential backoff for Notion/Stripe calls.
- Route all automation failures to Slack alert channel.
- Keep each webhook idempotent by event id.

## Rate-limit strategy

- Queue burst events where needed.
- Prefer Make for parallel control and retry windows.
- Split heavy combined scenarios into atomic modules.

## Canonical KPI set

Use this exact KPI set across all project artifacts for consistency:

- Onboarding cycle time: 14 days -> 3 days (70% faster)
- Manual data entry reduction: 95%
- Data mismatch/error rate: 15% -> 0% (pilot period)
- Automation uptime: 99.9%
- Throughput: 50+ clients/month in production, designed for 100+ clients/month scale

## Before vs after KPI table

| KPI | Baseline (before automation) | Result (after automation) |
|---|---|---|
| Onboarding cycle time | 14 days | 3 days |
| Manual work per week | 14 hours/week | <1 hour/week |
| Data mismatch/error rate | 15% | 0% (pilot period) |
| Monthly automation cost | $125/month | $75/month |

## Reliability design (concise)

- Retry policy: exponential backoff at 1m, 5m, and 15m, with max 3 retries for transient API/network failures.
- Alerting flow: every hard failure posts to Slack ops channel with `event_id`, scenario name, and failure reason.
- Fallback behavior: complex/high-volume flows execute in Make; if Zapier step errors, handoff webhook can replay in Make path.
- Recovery steps: isolate failed event, replay with original idempotency key, verify downstream write state, mark resolved in incident tracker.

## Security and compliance

- Webhook signature checks: Stripe uses signed event validation; internal webhooks require shared secret header.
- Secret management: credentials are stored in environment variables and rotated on schedule.
- Least privilege: Notion integration is scoped to onboarding databases; Stripe key is restricted to required customer/payment operations.
- PII handling: collect minimum required client data, redact logs, and restrict dashboard access by role.

## Scalability evidence

- Load test profile: 200 concurrent onboarding events in pre-production scenario runs.
- Proven throughput: 50+ monthly onboardings processed in pilot without live failures.
- 100+ readiness: event-driven architecture, backpressure via retries, and idempotent dedupe prevent duplicate amplification under retries.

## Idempotency and duplicate prevention

- Preferred key source: `x-event-id` from upstream automations.
- Fallback keying: deterministic key built from stable business identifiers when upstream id is absent.
- Duplicate handling: previously seen key returns success response with duplicate marker and skips writes.
- Stripe protection: use Stripe `event.id` as canonical key to avoid duplicate invoice/project creation.

## Bi-directional sync conflict rules

| Domain | Source of truth | Conflict handling |
|---|---|---|
| Lead profile fields | Notion after initial Typeform ingest | Last inbound update before qualification; manual override only in Notion |
| Billing and payment | Stripe | Stripe webhook always wins for amount/status fields |
| Dashboard reporting rows | Google Sheets automation writes | Lock computed columns; ignore manual edits on sync-managed fields |
| Project state and assignees | Notion | Notion updates propagate out; Slack is notification-only |
