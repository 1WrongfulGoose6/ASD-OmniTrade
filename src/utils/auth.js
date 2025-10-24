import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";

export const SESSION_COOKIE_NAME = "omni_session";
const MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET_KEY;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET (or JWT_SECRET_KEY) must be configured");
  }
  console.warn("AUTH_SECRET missing; falling back to insecure development secret");
  return "development-secret";
}

export function createSessionToken({ id, email, role }) {
  const secret = getAuthSecret();
  const payload = {
    sub: String(id),
    email,
    role: role || "USER",
  };
  return jwt.sign(payload, secret, { expiresIn: `${MAX_AGE_SECONDS}s` });
}

export function verifySessionToken(token) {
  if (!token) return null;
  try {
    const secret = getAuthSecret();
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

export function applySessionCookie(response, token) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionFromCookies() {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getUserIdFromCookies() {
  const session = await getSessionFromCookies();
  if (!session?.sub) return null;
  const id = Number(session.sub);
  return Number.isFinite(id) ? id : null;
}

export async function getUserSession() {
  const session = await getSessionFromCookies();
  if (!session) return null;
  const id = Number(session.sub);
  if (!Number.isFinite(id)) return null;
  return {
    id,
    email: session.email,
    role: session.role || "USER",
  };
}

export async function getSessionFromRequest(request) {
  const hdr = request ? request.headers : await headers();
  const token =
    hdr?.get?.(`cookie`)
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`))
      ?.split("=")[1] || null;
  return verifySessionToken(token);
}
