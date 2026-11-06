import { NextRequest, NextResponse } from "next/server";
import { db, type VideoRow } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";

export const dynamic = "force-dynamic";
// Allow larger request bodies for uploads (App Router route segment config).
export const maxDuration = 60;

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB cap
const ALLOWED = new Map<string, string>([
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/ogg", "ogv"],
  ["video/quicktime", "mov"],
]);

type VideoDTO = Omit<VideoRow, "filename"> & {
  ownerName: string;
  url: string;
};

function toDTO(row: VideoRow): VideoDTO {
  const owner = db
    .prepare("SELECT displayName FROM users WHERE id = ?")
    .get(row.ownerId) as { displayName: string } | undefined;
  const { filename, ...rest } = row;
  return {
    ...rest,
    ownerName: owner?.displayName ?? "Unknown",
    url: `/api/videos/${row.id}/file`,
  };
}

/** GET /api/videos — public gallery list (no file paths leaked). */
export async function GET() {
  const rows = db
    .prepare("SELECT * FROM videos ORDER BY createdAt DESC")
    .all() as VideoRow[];
  return NextResponse.json({ videos: rows.map(toDTO) });
}

/** POST /api/videos — multipart upload. Auth required. */
export async function POST(req: NextRequest) {
  const me = getCurrentUser();
  if (!me) {
    return NextResponse.json(
      { error: "You must be signed in to upload a video." },
      { status: 401 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected a multipart form upload." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No video file provided." }, { status: 400 });
  }
  if (title.length < 3) {
    return NextResponse.json(
      { error: "Title must be at least 3 characters." },
      { status: 400 }
    );
  }
  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload MP4, WebM, OGG, or MOV." },
      { status: 415 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Max ${Math.round(MAX_BYTES / 1024 / 1024)} MB.` },
      { status: 413 }
    );
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const id = crypto.randomUUID();
  const filename = `${id}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  const now = Date.now();
  db.prepare(
    `INSERT INTO videos (id, ownerId, title, description, filename, mimeType, sizeBytes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, me.id, title, description, filename, file.type, file.size, now);

  const row = db.prepare("SELECT * FROM videos WHERE id = ?").get(id) as VideoRow;
  return NextResponse.json({ video: toDTO(row) }, { status: 201 });
}
