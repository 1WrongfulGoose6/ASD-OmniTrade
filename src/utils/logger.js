// src/utils/logger.js
const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "passwordhash",
  "token",
  "session",
]);

function scrubValue(value) {
  if (value == null) return value;

  if (Array.isArray(value)) {
    return value.map((entry) => scrubValue(entry));
  }

  if (typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, val]) => {
      const lower = key.toLowerCase();
      acc[key] = SENSITIVE_KEYS.has(lower) ? "[REDACTED]" : scrubValue(val);
      return acc;
    }, {});
  }

  return value;
}

function emit(level, event, meta) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...meta,
  };

  const serialized = JSON.stringify(payload);
  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}

export function auditLog(event, userId, details = {}) {
  emit("info", event, {
    category: "audit",
    userId,
    details: scrubValue(details),
  });
}

export function securityLog(event, details = {}) {
  emit("warn", event, {
    category: "security",
    details: scrubValue(details),
  });
}

export function errorLog(event, error, context = {}) {
  emit("error", event, {
    category: "error",
    error: error?.message || error,
    stack: error?.stack,
    context: scrubValue(context),
  });
}
