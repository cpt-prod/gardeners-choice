import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Single module-level connection. The .data dir is gitignored.
const dataDir = path.join(process.cwd(), ".data");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "app.sqlite");

export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,        -- scrypt$salt$hash
    displayName TEXT NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expiresAt INTEGER NOT NULL
  );

  -- Give-away marketplace: surplus food / produce listings
  CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    ownerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,            -- produce | pantry | prepared | other
    quantity TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','claimed')),
    claimedBy TEXT REFERENCES users(id) ON DELETE SET NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status, createdAt DESC);
  CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(ownerId, createdAt DESC);
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(userId);

  -- Community gardening video uploads (files stored on disk in gitignored uploads/)
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    ownerId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    filename TEXT NOT NULL,            -- stored file name on disk
    mimeType TEXT NOT NULL,
    sizeBytes INTEGER NOT NULL,
    createdAt INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_videos_created ON videos(createdAt DESC);
  CREATE INDEX IF NOT EXISTS idx_videos_owner ON videos(ownerId, createdAt DESC);

  -- QR sign-in: short-lived, single-use tokens.
  -- Desktop creates a 'pending' row + shows its token as a QR code; a phone that
  -- is already signed in scans it and 'approve's it (stamping userId); the desktop
  -- polls, gets a session, and the row is marked 'consumed' so it can't be reused.
  CREATE TABLE IF NOT EXISTS qr_logins (
    token TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending','approved','consumed')),
    userId TEXT REFERENCES users(id) ON DELETE CASCADE,
    createdAt INTEGER NOT NULL,
    expiresAt INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_qr_expires ON qr_logins(expiresAt);

  -- Onboarding questionnaire (the 5 Chabot Fresh Market intake questions).
  -- One row per user, filled in during sign-up.
  CREATE TABLE IF NOT EXISTS questionnaires (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    fullName TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    visitMarket INTEGER NOT NULL DEFAULT 0,
    visitCoffee INTEGER NOT NULL DEFAULT 0,
    householdSize TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    createdAt INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_questionnaires_user ON questionnaires(userId);
`);

export type UserRow = {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  bio: string;
  createdAt: number;
};

export type ListingRow = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  location: string;
  status: "available" | "claimed";
  claimedBy: string | null;
  createdAt: number;
  updatedAt: number;
};

export type VideoRow = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: number;
};

export type QrLoginRow = {
  token: string;
  status: "pending" | "approved" | "consumed";
  userId: string | null;
  createdAt: number;
  expiresAt: number;
};

export type QuestionnaireRow = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  visitMarket: number;
  visitCoffee: number;
  householdSize: string;
  description: string;
  createdAt: number;
};
