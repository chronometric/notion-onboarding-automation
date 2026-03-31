const express = require("express");
const { z } = require("zod");
const { asyncHandler } = require("../utils/asyncHandler");
const { createLead, markLeadQualified, createProjectAndInvoice } = require("../services/notionService");
const { sendSlackMessage } = require("../services/slackService");
const { createCustomer, verifyStripeSignature } = require("../services/stripeService");

const router = express.Router();

const typeformSchema = z.object({
  form_response: z.object({
    hidden: z.record(z.string()).optional(),
    answers: z.array(z.any()).optional(),
  }),
});

function getAnswerByRef(answers = [], ref) {
  const answer = answers.find((item) => item.field?.ref === ref);
  if (!answer) return "";
  return (
    answer.text ||
    answer.email ||
    answer.choice?.label ||
    answer.number ||
    ""
  );
}

router.post(
  "/typeform",
  express.json(),
  asyncHandler(async (req, res) => {
    const parsed = typeformSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: "Invalid Typeform payload" });
    }

    const answers = parsed.data.form_response.answers || [];
    const name = getAnswerByRef(answers, "full_name");
    const email = getAnswerByRef(answers, "email");
    const company = getAnswerByRef(answers, "company");
    const service = getAnswerByRef(answers, "service_needed");

    const lead = await createLead({ name, email, company, service });

    await sendSlackMessage(
      `New lead captured: ${name} (${email}) from ${company}. Notion lead page: ${lead.url}`
    );

    res.status(201).json({ ok: true, leadId: lead.id });
  })
);

router.post(
  "/lead-qualified",
  express.json(),
  asyncHandler(async (req, res) => {
    const schema = z.object({
      leadPageId: z.string().min(1),
      name: z.string().min(1),
      email: z.string().email(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }

    await markLeadQualified({ leadPageId: parsed.data.leadPageId });
    const customer = await createCustomer({
      name: parsed.data.name,
      email: parsed.data.email,
    });

    await sendSlackMessage(`Lead qualified and Stripe customer created: ${customer.id}`);

    res.status(200).json({ ok: true, customerId: customer.id });
  })
);

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ ok: false, error: "Missing stripe signature" });
    }

    let event;
    try {
      event = verifyStripeSignature(req.body, signature);
    } catch (error) {
      return res.status(400).json({ ok: false, error: error.message });
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata || {};
      const leadName = metadata.leadName || "Unknown Lead";

      await createProjectAndInvoice({
        leadName,
        stripeCustomerId: String(paymentIntent.customer || ""),
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
      });

      await sendSlackMessage(`Payment received for ${leadName}. Project kickoff created.`);
    }

    return res.status(200).json({ received: true });
  })
);

module.exports = { webhooksRouter: router };
