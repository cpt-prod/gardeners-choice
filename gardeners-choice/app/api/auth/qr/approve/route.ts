import { NextRequest, NextResponse } from "next/server";
import { approveQrLogin, getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/qr/approve  { token }
 * Called from the PHONE after it scanned the QR. The phone must already be
 * signed in — we approve the pending token for the phone's user, which lets the
 * waiting desktop pick up a session on its next poll.
 */
export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in on this device to approve." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  const result = approveQrLogin(token, user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
