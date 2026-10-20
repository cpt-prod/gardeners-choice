import { NextRequest, NextResponse } from "next/server";
import { db, type ListingRow } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const CATEGORIES = ["produce", "pantry", "prepared", "other"];

type ListingDTO = ListingRow & {
  ownerName: string;
  claimedByName: string | null;
};

/** Join owner/claimer display names; never exposes any password data. */
function toDTO(row: ListingRow): ListingDTO {
  const owner = db
    .prepare("SELECT displayName FROM users WHERE id = ?")
    .get(row.ownerId) as { displayName: string } | undefined;
  const claimer = row.claimedBy
    ? (db
        .prepare("SELECT displayName FROM users WHERE id = ?")
        .get(row.claimedBy) as { displayName: string } | undefined)
    : undefined;
  return {
    ...row,
    ownerName: owner?.displayName ?? "Unknown",
    claimedByName: claimer?.displayName ?? null,
  };
}

/** GET /api/listings — public browse. ?mine=1 and ?owner=<id> optional filters. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine");

  let rows: ListingRow[];
  if (mine === "1") {
    const me = getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    rows = db
      .prepare("SELECT * FROM listings WHERE ownerId = ? ORDER BY createdAt DESC")
      .all(me.id) as ListingRow[];
  } else {
    rows = db
      .prepare("SELECT * FROM listings ORDER BY status ASC, createdAt DESC")
      .all() as ListingRow[];
  }

  return NextResponse.json({ listings: rows.map(toDTO) });
}

/** POST /api/listings — create a listing. Auth required. */
export async function POST(req: NextRequest) {
  const me = getCurrentUser();
  if (!me) {
    return NextResponse.json(
      { error: "You must be signed in to post a listing." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const category =
    typeof body.category === "string" && CATEGORIES.includes(body.category)
      ? body.category
      : "other";
  const quantity = typeof body.quantity === "string" ? body.quantity.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";

  if (title.length < 3) {
    return NextResponse.json(
      { error: "Title must be at least 3 characters." },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  const now = Date.now();
  db.prepare(
    `INSERT INTO listings
       (id, ownerId, title, description, category, quantity, location, status, claimedBy, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'available', NULL, ?, ?)`
  ).run(id, me.id, title, description, category, quantity, location, now, now);

  const row = db.prepare("SELECT * FROM listings WHERE id = ?").get(id) as ListingRow;
  return NextResponse.json({ listing: toDTO(row) }, { status: 201 });
}
