import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db, type UserRow } from "@/lib/db";

const SESSION_COOKIE = "hh_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// ---------- password hashing (scrypt + per-user salt) ----------
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  const expected = Buffer.from(hash, "hex");
  const actual = crypto.scryptSync(password, salt, 64);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

// ---------- public projection (never leak passwordHash) ----------
export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  createdAt: number;
};

export function publicUser(u: UserRow): PublicUser {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    bio: u.bio,
    createdAt: u.createdAt,
  };
}

// ---------- sessions ----------
export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  db.prepare(
    "INSERT INTO sessions (token, userId, expiresAt) VALUES (?, ?, ?)"
  ).run(token, userId, expiresAt);
  return token;
}

export function destroySession(token: string): void {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

/** Read the session cookie and return the current user row, or null. */
export function getCurrentUser(): UserRow | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = db
    .prepare("SELECT token, userId, expiresAt FROM sessions WHERE token = ?")
    .get(token) as { token: string; userId: string; expiresAt: number } | undefined;

  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    destroySession(token);
    return null;
  }

  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(session.userId) as UserRow | undefined;
  return user ?? null;
}

// ---------- cookie helpers ----------
export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    // secure only in production — enabling on http://localhost silently drops the cookie
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export { SESSION_COOKIE };
