import { NextRequest, NextResponse } from "next/server";
import { db, type UserRow } from "@/lib/db";
import crypto from "node:crypto";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getCurrentUser,
  publicUser,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth";
import { validateAnswers } from "@/lib/questionnaire";

export const dynamic = "force-dynamic";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;

/** GET /api/auth — session probe. */
export async function GET() {
  const user = getCurrentUser();
  return NextResponse.json({ user: user ? publicUser(user) : null });
}

/** POST /api/auth — { action: "signup" | "login" | "logout", ... } */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const action = body.action;

  if (action === "logout") {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (token) destroySession(token);
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ ...sessionCookieOptions(), value: "", maxAge: 0 });
    return res;
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (action === "signup") {
    const displayName =
      typeof body.displayName === "string" && body.displayName.trim()
        ? body.displayName.trim()
        : username;

    if (!USERNAME_RE.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3–24 letters, numbers, or underscores." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const qa = validateAnswers(
      (typeof body.answers === "object" && body.answers !== null
        ? body.answers
        : {}) as Record<string, unknown>
    );
    if (!qa.ok) {
      return NextResponse.json({ error: qa.error }, { status: 400 });
    }

    const existing = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username);
    if (existing) {
      return NextResponse.json({ error: "Username is taken." }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    db.prepare(
      `INSERT INTO users (id, username, passwordHash, displayName, bio, createdAt)
       VALUES (?, ?, ?, ?, '', ?)`
    ).run(id, username, hashPassword(password), displayName, now);

    db.prepare(
      `INSERT INTO questionnaires
         (id, userId, fullName, email, visitMarket, visitCoffee, householdSize, description, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      crypto.randomUUID(),
      id,
      qa.answers.fullName,
      qa.answers.email,
      qa.answers.visitMarket ? 1 : 0,
      qa.answers.visitCoffee ? 1 : 0,
      qa.answers.householdSize,
      qa.answers.description,
      now
    );

    const token = createSession(id);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow;
    const res = NextResponse.json({ user: publicUser(user) }, { status: 201 });
    res.cookies.set({ ...sessionCookieOptions(), value: token });
    return res;
  }

  if (action === "login") {
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username) as UserRow | undefined;

    // One generic error for unknown-user AND wrong-password (don't reveal which usernames exist)
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = createSession(user.id);
    const res = NextResponse.json({ user: publicUser(user) });
    res.cookies.set({ ...sessionCookieOptions(), value: token });
    return res;
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
