const config = require("../config");

const processedEvents = new Map();

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, expiresAt] of processedEvents.entries()) {
    if (expiresAt <= now) {
      processedEvents.delete(key);
    }
  }
}

function reserveEventKey(eventKey) {
  cleanupExpiredEntries();

  if (processedEvents.has(eventKey)) {
    return false;
  }

  processedEvents.set(eventKey, Date.now() + config.IDEMPOTENCY_TTL_MS);
  return true;
}

module.exports = { reserveEventKey };
