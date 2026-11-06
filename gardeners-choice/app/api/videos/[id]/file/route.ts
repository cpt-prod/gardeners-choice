import { NextRequest, NextResponse } from "next/server";
import { db, type VideoRow } from "@/lib/db";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/** GET /api/videos/[id]/file — stream the stored video, with range support. */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const row = db
    .prepare("SELECT * FROM videos WHERE id = ?")
    .get(params.id) as VideoRow | undefined;

  if (!row) {
    return NextResponse.json({ error: "Video not found." }, { status: 404 });
  }

  const filePath = path.join(UPLOAD_DIR, row.filename);
  // Guard against path traversal: resolved path must stay inside UPLOAD_DIR.
  if (!path.resolve(filePath).startsWith(path.resolve(UPLOAD_DIR))) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  let stat: fs.Stats;
  try {
    stat = await fsp.stat(filePath);
  } catch {
    return NextResponse.json({ error: "File missing on disk." }, { status: 404 });
  }

  const total = stat.size;
  const range = req.headers.get("range");

  const baseHeaders: Record<string, string> = {
    "Content-Type": row.mimeType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  };

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match && match[1] ? parseInt(match[1], 10) : 0;
    const end = match && match[2] ? parseInt(match[2], 10) : total - 1;
    if (start >= total || end >= total || start > end) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${total}` },
      });
    }
    const chunk = fs.createReadStream(filePath, { start, end });
    return new NextResponse(chunk as unknown as ReadableStream, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  const stream = fs.createReadStream(filePath);
  return new NextResponse(stream as unknown as ReadableStream, {
    status: 200,
    headers: { ...baseHeaders, "Content-Length": String(total) },
  });
}
