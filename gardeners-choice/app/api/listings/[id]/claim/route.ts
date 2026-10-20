import { NextRequest, NextResponse } from "next/server";
import { db, type ListingRow } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/listings/[id]/claim — reserve (or release) a listing.
 * Body: { action: "claim" | "release" }. Auth required.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const me = getCurrentUser();
  if (!me) {
    return NextResponse.json(
      { error: "You must be signed in to claim a listing." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* default to claim */
  }
  const action = body.action === "release" ? "release" : "claim";

  const listing = db
    .prepare("SELECT * FROM listings WHERE id = ?")
    .get(params.id) as ListingRow | undefined;

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const now = Date.now();

  if (action === "claim") {
    if (listing.ownerId === me.id) {
      return NextResponse.json(
        { error: "You can't claim your own listing." },
        { status: 400 }
      );
    }
    if (listing.status === "claimed") {
      return NextResponse.json(
        { error: "This listing has already been claimed." },
        { status: 409 }
      );
    }
    db.prepare(
      "UPDATE listings SET status = 'claimed', claimedBy = ?, updatedAt = ? WHERE id = ?"
    ).run(me.id, now, params.id);
  } else {
    // release: only the claimer or the owner may release the hold
    if (listing.claimedBy !== me.id && listing.ownerId !== me.id) {
      return NextResponse.json(
        { error: "You can't release this claim." },
        { status: 403 }
      );
    }
    db.prepare(
      "UPDATE listings SET status = 'available', claimedBy = NULL, updatedAt = ? WHERE id = ?"
    ).run(now, params.id);
  }

  const updated = db
    .prepare("SELECT * FROM listings WHERE id = ?")
    .get(params.id) as ListingRow;

  // Include the claimer's contact so the two parties can coordinate pickup.
  let contact: { displayName: string; username: string } | null = null;
  if (updated.status === "claimed" && updated.claimedBy) {
    contact = db
      .prepare("SELECT displayName, username FROM users WHERE id = ?")
      .get(updated.claimedBy) as { displayName: string; username: string };
  }

  return NextResponse.json({ listing: updated, claimer: contact });
}
