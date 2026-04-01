const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  NOTION_TOKEN: z.string().min(1),
  NOTION_LEADS_DB_ID: z.string().min(1),
  NOTION_PROJECTS_DB_ID: z.string().min(1),
  NOTION_INVOICES_DB_ID: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  SLACK_WEBHOOK_URL: z.string().url(),
  WEBHOOK_SHARED_SECRET: z.string().min(16),
  IDEMPOTENCY_TTL_MS: z.coerce.number().default(86400000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = parsed.data;
