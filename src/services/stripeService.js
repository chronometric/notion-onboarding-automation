const Stripe = require("stripe");
const config = require("../config");

const stripe = new Stripe(config.STRIPE_SECRET_KEY);

async function createCustomer({ name, email }) {
  return stripe.customers.create({ name, email });
}

function verifyStripeSignature(rawBodyBuffer, signature) {
  return stripe.webhooks.constructEvent(
    rawBodyBuffer,
    signature,
    config.STRIPE_WEBHOOK_SECRET
  );
}

module.exports = {
  createCustomer,
  verifyStripeSignature,
};
