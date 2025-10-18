// src/utils/encryption.js
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY environment variable must be set and be 32 bytes (256 bits) long.");
}

/**
 * Encrypts a string using AES-256-CBC.
 * @param {string} text The text to encrypt.
 * @returns {string} The encrypted text in the format 'iv:encryptedData'.
 */
export function encrypt(text) {
  if (text === null || typeof text === 'undefined') return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a string that was encrypted with the encrypt function.
 * @param {string} text The encrypted text in the format 'iv:encryptedData'.
 * @returns {string} The decrypted text.
 */
export function decrypt(text) {
  if (text === null || typeof text === 'undefined') return text;
  try {
    const parts = text.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted text format');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    // Return the original text or a placeholder if decryption fails
    return text;
  }
}
