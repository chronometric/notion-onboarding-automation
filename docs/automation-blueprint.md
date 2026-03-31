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
