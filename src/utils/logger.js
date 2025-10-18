// src/utils/logger.js
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "res.headers.cookie"],
    censor: "[REDACTED]",
  },
});

export default logger;
