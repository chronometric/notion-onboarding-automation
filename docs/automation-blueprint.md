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

## Suggested KPIs

- Lead-to-kickoff cycle time (target: <= 3 days)
- Onboarding failure rate (target: < 1%)
- Manual touch time per client (target: -70%)
- Automation uptime (target: 99.9%+)
