import { NextRequest, NextResponse } from "next/server";
import { db, type UserRow } from "@/lib/db";
import {
  consumeApprovedQrLogin,
  createSession,
  publicUser,
  sessionCookieOptions,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/qr/status?token=...
 * Desktop polls this. While the token is pending it returns { status: "pending" }.
 * Once the phone has approved it, we consume the token, mint a real session for
 * the approving user, set the httpOnly session cookie on THIS (desktop) response,
 * and return the public user — logging the desktop in.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const result = consumeApprovedQrLogin(token);

  if (result.state === "pending") {
    return NextResponse.json({ status: "pending" });
  }
  if (result.state === "expired") {
    return NextResponse.json({ status: "expired" });
  }

  // state === "consumed"
  if (!result.userId) {
    // Already consumed by an earlier poll — nothing to hand out again.
    return NextResponse.json({ status: "expired" });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(result.userId) as UserRow | undefined;
  if (!user) {
    return NextResponse.json({ status: "expired" });
  }

  const sessionToken = createSession(user.id);
  const res = NextResponse.json({ status: "approved", user: publicUser(user) });
  res.cookies.set({ ...sessionCookieOptions(), value: sessionToken });
  return res;
}
