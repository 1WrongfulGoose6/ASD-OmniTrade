import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";
const PREFIX = `enc:${VERSION}:`;
const IV_LENGTH = 12; // bytes for GCM
const TAG_LENGTH = 16; // bytes

function getEncryptionSecret() {
  const secret =
    process.env.PII_ENCRYPTION_KEY ||
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET_KEY;

  if (secret) {
    return crypto.createHash("sha256").update(secret).digest();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("PII encryption secret not configured");
  }

  console.warn(
    "[encryption] PII_ENCRYPTION_KEY missing; using development fallback"
  );
  return crypto.createHash("sha256").update("development-pii-secret").digest();
}

const KEY = getEncryptionSecret();

export function encryptField(value) {
  if (value == null) return null;
  const plain = String(value);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  const payload = Buffer.concat([iv, tag, encrypted]).toString("base64url");
  return `${PREFIX}${payload}`;
}

export function decryptField(value) {
  if (value == null) return null;
  const text = String(value);

  if (!text.startsWith(PREFIX)) {
    return text;
  }

  try {
    const payload = Buffer.from(text.slice(PREFIX.length), "base64url");
    if (payload.length <= IV_LENGTH + TAG_LENGTH) {
      return null;
    }

    const iv = payload.subarray(0, IV_LENGTH);
    const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = payload.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}
