const { Client } = require("@notionhq/client");
const config = require("../config");

const notion = new Client({ auth: config.NOTION_TOKEN });

function richText(content) {
  return [{ type: "text", text: { content: String(content ?? "") } }];
}

async function createLead({ name, email, company, service, source = "Typeform" }) {
  const response = await notion.pages.create({
    parent: { database_id: config.NOTION_LEADS_DB_ID },
    properties: {
      Name: { title: richText(name) },
      Email: { email: email || null },
      Company: { rich_text: richText(company) },
      Service: { rich_text: richText(service) },
      Source: { select: { name: source } },
      Status: { select: { name: "New" } },
    },
  });

  return response;
}

async function markLeadQualified({ leadPageId }) {
  return notion.pages.update({
    page_id: leadPageId,
    properties: {
      Status: { select: { name: "Qualified" } },
    },
  });
}

async function createProjectAndInvoice({ leadName, stripeCustomerId, paymentIntentId, amount }) {
  const project = await notion.pages.create({
    parent: { database_id: config.NOTION_PROJECTS_DB_ID },
    properties: {
      Name: { title: richText(`${leadName} - Onboarding Project`) },
      Stage: { select: { name: "Kickoff" } },
      Owner: { rich_text: richText("Auto-assigned") },
      StripeCustomerId: { rich_text: richText(stripeCustomerId) },
    },
  });

  const invoice = await notion.pages.create({
    parent: { database_id: config.NOTION_INVOICES_DB_ID },
    properties: {
      Name: { title: richText(`Invoice - ${leadName}`) },
      Amount: { number: amount / 100 },
      Currency: { select: { name: "USD" } },
      Status: { select: { name: "Paid" } },
      PaymentIntentId: { rich_text: richText(paymentIntentId) },
    },
  });

  return { project, invoice };
}

module.exports = {
  createLead,
  markLeadQualified,
  createProjectAndInvoice,
};
