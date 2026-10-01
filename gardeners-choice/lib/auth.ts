import type { User } from "./types";
import { readUsers, writeUsers, readSessionUserId, writeSessionUserId } from "./storage";

// Mock auth. SHA-256 via Web Crypto is browser-native (no deps). This is NOT real
// security — passwords are still XSS-readable. The UI surfaces a "toy demo" banner.

export const SIGNUP_BONUS_TOKENS = 5;
export const FIRST_THREAD_BONUS_TOKENS = 2;
export const DAILY_BONUS_TOKENS = 1;

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string): Promise<string> {
  return sha256Hex(`gc:v1:${password}`);
}

export type AuthResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

export async function signup(
  username: string,
  password: string,
  displayName: string,
): Promise<AuthResult> {
  const u = username.trim().toLowerCase();
  const dn = displayName.trim() || u;
  if (!/^[a-z0-9_-]{3,24}$/.test(u)) {
    return { ok: false, error: "Username must be 3–24 chars: a–z, 0–9, _ or -" };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }
  const users = readUsers();
  if (users.some((x) => x.username === u)) {
    return { ok: false, error: "Username already taken" };
  }
  const passwordHash = await hashPassword(password);
  const user: User = {
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    username: u,
    passwordHash,
    displayName: dn,
    tier: "free",
    tierExpiresAt: null,
    tokens: SIGNUP_BONUS_TOKENS,
    lastDailyBonus: null,
    createdAt: Date.now(),
    unreadOffers: 0,
    hasOpenedFirstThread: false,
  };
  writeUsers([...users, user]);
  writeSessionUserId(user.id);
  return { ok: true, user };
}

export async function login(
  username: string,
  password: string,
): Promise<AuthResult> {
  const u = username.trim().toLowerCase();
  const users = readUsers();
  const user = users.find((x) => x.username === u);
  if (!user) return { ok: false, error: "No account with that username" };
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    return { ok: false, error: "Wrong password" };
  }
  writeSessionUserId(user.id);
  return { ok: true, user };
}

export function logout(): void {
  writeSessionUserId(null);
}

export function getUserById(id: string | null): User | null {
  if (!id) return null;
  const users = readUsers();
  return users.find((u) => u.id === id) ?? null;
}

export function getCurrentUserId(): string | null {
  return readSessionUserId();
}
