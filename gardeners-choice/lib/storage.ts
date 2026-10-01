// Typed localStorage wrappers. All access funnels through here so hooks/components
// never call localStorage directly. SSR-safe: every read/write is gated by `typeof window`.

import type { User, OfferThread } from "./types";

export const KEYS = {
  users: "gc:users",
  session: "gc:session",
  threads: "gc:threads",
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Notify in-page listeners (storage events only fire for OTHER tabs).
    window.dispatchEvent(new CustomEvent("gc:write", { detail: { key } }));
  } catch {
    // quota or serialization error — silent for demo
  }
}

export function readUsers(): User[] {
  return readJSON<User[]>(KEYS.users, []);
}

export function writeUsers(users: User[]): void {
  writeJSON(KEYS.users, users);
}

export function readSessionUserId(): string | null {
  return readJSON<string | null>(KEYS.session, null);
}

export function writeSessionUserId(userId: string | null): void {
  writeJSON(KEYS.session, userId);
}

export function readThreads(): OfferThread[] {
  return readJSON<OfferThread[]>(KEYS.threads, []);
}

export function writeThreads(threads: OfferThread[]): void {
  writeJSON(KEYS.threads, threads);
}

// Simple in-memory pub/sub so hook consumers refresh after writes.
type Listener = (key: string) => void;
const listeners = new Set<Listener>();

if (typeof window !== "undefined") {
  window.addEventListener("gc:write", (e) => {
    const detail = (e as CustomEvent<{ key: string }>).detail;
    listeners.forEach((fn) => fn(detail?.key ?? ""));
  });
  window.addEventListener("storage", (e) => {
    if (e.key) listeners.forEach((fn) => fn(e.key!));
  });
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
