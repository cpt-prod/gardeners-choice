import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db, type UserRow, type QrLoginRow } from "@/lib/db";

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

// ---------- QR sign-in (short-lived, single-use tokens) ----------
const QR_TTL_MS = 1000 * 60 * 2; // 2 minutes

/** Opportunistically drop expired/stale QR rows so the table stays tiny. */
function pruneQrLogins(): void {
  db.prepare("DELETE FROM qr_logins WHERE expiresAt < ?").run(Date.now());
}

/** Desktop: create a new pending QR login and return its token + expiry. */
export function createQrLogin(): { token: string; expiresAt: number } {
  pruneQrLogins();
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const expiresAt = now + QR_TTL_MS;
  db.prepare(
    "INSERT INTO qr_logins (token, status, userId, createdAt, expiresAt) VALUES (?, 'pending', NULL, ?, ?)"
  ).run(token, now, expiresAt);
  return { token, expiresAt };
}

export function getQrLogin(token: string): QrLoginRow | null {
  const row = db
    .prepare("SELECT * FROM qr_logins WHERE token = ?")
    .get(token) as QrLoginRow | undefined;
  return row ?? null;
}

/** Phone (already authenticated): approve a pending QR login for `userId`. */
export function approveQrLogin(
  token: string,
  userId: string
): { ok: true } | { ok: false; error: string } {
  const row = getQrLogin(token);
  if (!row) return { ok: false, error: "This sign-in code is invalid." };
  if (row.expiresAt < Date.now())
    return { ok: false, error: "This sign-in code has expired." };
  if (row.status !== "pending")
    return { ok: false, error: "This sign-in code has already been used." };

  db.prepare(
    "UPDATE qr_logins SET status = 'approved', userId = ? WHERE token = ?"
  ).run(userId, token);
  return { ok: true };
}

/**
 * Desktop poll: if the token has been approved, consume it (so it can't be
 * reused) and return the userId to log in. Otherwise report its state.
 */
export function consumeApprovedQrLogin(
  token: string
): { state: "pending" | "expired" | "consumed"; userId?: string } {
  const row = getQrLogin(token);
  if (!row) return { state: "expired" };
  if (row.status === "consumed") return { state: "consumed" };
  if (row.expiresAt < Date.now()) return { state: "expired" };
  if (row.status === "approved" && row.userId) {
    db.prepare("UPDATE qr_logins SET status = 'consumed' WHERE token = ?").run(
      token
    );
    return { state: "consumed", userId: row.userId };
  }
  return { state: "pending" };
}
