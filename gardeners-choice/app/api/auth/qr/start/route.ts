import { NextResponse } from "next/server";
import { createQrLogin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/qr/start
 * Desktop asks for a fresh QR sign-in token. Returns the token (which the
 * client encodes into a QR code as `${origin}/qr/<token>`) and its expiry.
 */
export async function POST() {
  const { token, expiresAt } = createQrLogin();
  return NextResponse.json({ token, expiresAt }, { status: 201 });
}
