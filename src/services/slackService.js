const { IncomingWebhook } = require("@slack/webhook");
const config = require("../config");

const webhook = new IncomingWebhook(config.SLACK_WEBHOOK_URL);

async function sendSlackMessage(text, blocks = undefined) {
  await webhook.send({ text, blocks });
}

module.exports = { sendSlackMessage };
