const express = require("express");
const config = require("./config");
const { webhooksRouter } = require("./routes/webhooks");

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "onboarding-automation" });
});

app.use("/webhooks", webhooksRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, error: "Internal server error" });
});

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
});
