import type { User } from "./types";
import { readUsers, writeUsers } from "./storage";

export const PREMIUM_TOKENS_GRANT = 50;
export const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const OFFER_COST_TOKENS = 1;
export const COUNTER_COST_TOKENS = 1;

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function isPremium(user: User): boolean {
  if (user.tier !== "premium") return false;
  if (user.tierExpiresAt == null) return false;
  return user.tierExpiresAt > Date.now();
}

export function refreshDailyBonus(user: User): { user: User; granted: boolean } {
  const today = todayISO();
  if (user.lastDailyBonus === today) return { user, granted: false };

  const bonus = user.tier === "premium" ? 2 : 1;
  return {
    user: { ...user, tokens: user.tokens + bonus, lastDailyBonus: today },
    granted: true,
  };
}

function writeUser(updated: User): User[] {
  const users = readUsers();
  const next = users.map((u) => (u.id === updated.id ? updated : u));
  writeUsers(next);
  return next;
}

export function upgradeToPremium(user: User): User {
  const expires = Date.now() + PREMIUM_DURATION_MS;
  const updated: User = {
    ...user,
    tier: "premium",
    tierExpiresAt: expires,
    tokens: user.tokens + PREMIUM_TOKENS_GRANT,
  };
  writeUser(updated);
  return updated;
}

export function spendTokens(user: User, amount: number, reason: string): User {
  if (amount <= 0) return user;
  if (user.tokens < amount) {
    throw new Error(`Insufficient tokens: need ${amount}, have ${user.tokens} (${reason})`);
  }
  const updated = { ...user, tokens: user.tokens - amount };
  writeUser(updated);
  return updated;
}

export function earnTokens(user: User, amount: number): User {
  if (amount <= 0) return user;
  const updated = { ...user, tokens: user.tokens + amount };
  writeUser(updated);
  return updated;
}

export function markFirstThreadOpened(user: User): User {
  if (user.hasOpenedFirstThread) return user;
  const updated: User = {
    ...user,
    hasOpenedFirstThread: true,
    tokens: user.tokens + 2,
  };
  writeUser(updated);
  return updated;
}

export function markUnread(user: User, count: number): User {
  const updated = { ...user, unreadOffers: Math.max(0, user.unreadOffers + count) };
  writeUser(updated);
  return updated;
}

export function clearUnread(user: User): User {
  if (user.unreadOffers === 0) return user;
  const updated = { ...user, unreadOffers: 0 };
  writeUser(updated);
  return updated;
}
