// src/utils/auth.js
import { cookies } from "next/headers";

export async function getUserIdFromCookies() {
  try {
    const jar = await cookies(); 
    const uid = jar.get("uid")?.value;
    if (!uid) return null;
    const n = Number(uid);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

// Throwing version for convenience
export async function requireUserId() {
  const id = await getUserIdFromCookies();
  if (!id) throw new Error("unauthorized");
  return id;
}
