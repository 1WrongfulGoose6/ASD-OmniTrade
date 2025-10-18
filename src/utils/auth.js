// src/utils/auth.js
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/verifyJWT";

/**
 * Reads the accessToken cookie, verifies the JWT, and returns the decoded payload.
 * @returns {object|null} The decoded JWT payload (e.g., { id, email, name }) or null if invalid/not found.
 */
export async function getAuthPayload() {
  try {
    const jar = await cookies();
    const token = jar.get("accessToken")?.value;
    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return null;
    }

    const payload = verifyJWT(token, secret);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Convenience function that requires a valid user session and returns the user ID.
 * Throws an error if the user is not authenticated.
 * @returns {number} The user's ID.
 */
export async function requireUserId() {
  const payload = await getAuthPayload();
  if (!payload?.id) throw new Error("unauthorized");
  return payload.id;
}

/**
 * Verifies the CSRF token for a request.
 * It compares the token from the 'X-CSRF-Token' header with the one in the JWT payload.
 * Throws an error if the tokens are missing or do not match.
 * @param {Headers} headers The request headers.
 */
export async function verifyCsrf(headers) {
  const payload = await getAuthPayload();
  const csrfHeader = headers.get("X-CSRF-Token");

  if (!payload?.csrfToken || !csrfHeader) {
    throw new Error("missing csrf token");
  }

  if (payload.csrfToken !== csrfHeader) {
    throw new Error("invalid csrf token");
  }
}