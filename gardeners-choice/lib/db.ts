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
