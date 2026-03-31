# Sample Payloads

## `POST /webhooks/typeform`

```json
{
  "form_response": {
    "answers": [
      { "field": { "ref": "full_name" }, "text": "John Smith" },
      { "field": { "ref": "email" }, "email": "john@acme.com" },
      { "field": { "ref": "company" }, "text": "Acme Inc." },
      { "field": { "ref": "service_needed" }, "choice": { "label": "SEO + PPC" } }
    ]
  }
}
```

## `POST /webhooks/lead-qualified`

```json
{
  "leadPageId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "John Smith",
  "email": "john@acme.com"
}
```

## Stripe CLI for local webhook testing

1. Start forwarding:
   - `stripe listen --forward-to localhost:4000/webhooks/stripe`
2. Trigger payment event:
   - `stripe trigger payment_intent.succeeded`

Before triggering, add metadata such as `leadName` in your test payment flow if needed.
