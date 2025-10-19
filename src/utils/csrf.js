// src/utils/csrf.js
import crypto from "crypto";
import { NextResponse } from "next/server";

export const CSRF_COOKIE_NAME = "omni_csrf";
export const CSRF_HEADER_NAME = "x-csrf-token";
const TOKEN_BYTE_LENGTH = 32;
const CSRF_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

function isSecureEnv() {
  return process.env.NODE_ENV === "production";
}

export function generateCsrfToken() {
  return crypto.randomBytes(TOKEN_BYTE_LENGTH).toString("hex");
}

export function setCsrfCookie(response, token) {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "strict",
    secure: isSecureEnv(),
    path: "/",
    maxAge: CSRF_MAX_AGE_SECONDS,
  });
}

export function clearCsrfCookie(response) {
  response.cookies.set(CSRF_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "strict",
    secure: isSecureEnv(),
    path: "/",
    maxAge: 0,
  });
}

export function issueNewCsrfToken(response) {
  const token = generateCsrfToken();
  setCsrfCookie(response, token);
  response.headers.set("X-CSRF-Token", token);
  return token;
}

function extractCookieToken(request) {
  if (request?.cookies?.get) {
    return request.cookies.get(CSRF_COOKIE_NAME)?.value || null;
  }

  const cookieHeader =
    request?.headers?.get?.("cookie") ||
    request?.headers?.get?.("Cookie") ||
    null;

  if (!cookieHeader) return null;

  const pair = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE_NAME}=`));

  if (!pair) return null;
  return pair.split("=")[1] || null;
}

function extractHeaderToken(request) {
  if (!request?.headers?.get) return null;
  return (
    request.headers.get(CSRF_HEADER_NAME) ||
    request.headers.get(CSRF_HEADER_NAME.toUpperCase()) ||
    null
  );
}

export function ensureCsrfToken(request, response) {
  const existing = extractCookieToken(request);
  if (existing) {
    setCsrfCookie(response, existing);
    return existing;
  }
  return issueNewCsrfToken(response);
}

export function validateRequestCsrf(request) {
  const method = (request?.method || "").toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return null;
  }

  const cookieToken = extractCookieToken(request);
  const headerToken = extractHeaderToken(request);

  if (!cookieToken || !headerToken) {
    return NextResponse.json({ error: "csrf_required" }, { status: 403 });
  }

  const cookieBuf = Buffer.from(cookieToken, "utf8");
  const headerBuf = Buffer.from(headerToken, "utf8");

  if (cookieBuf.length !== headerBuf.length) {
    return NextResponse.json({ error: "csrf_invalid" }, { status: 403 });
  }

  try {
    if (!crypto.timingSafeEqual(cookieBuf, headerBuf)) {
      return NextResponse.json({ error: "csrf_invalid" }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: "csrf_invalid" }, { status: 403 });
  }

  return null;
}
