/**
 * DEV-ONLY photo upload fallback.
 *
 * Writes incoming images into /public/uploads and returns the public URL.
 * UploadThing is NOT installed; if/when it is, swap this route for their SDK.
 *
 * Production warning: writing to /public/uploads at runtime works in dev but
 * is incompatible with most serverless / read-only deploy targets. Replace
 * with S3 / R2 / UploadThing before deploying.
 */
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only PNG / JPEG / WEBP / GIF images are allowed" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image too large (max 5MB)" },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = (
    file.name && path.extname(file.name)
      ? path.extname(file.name)
      : `.${file.type.split("/")[1] ?? "png"}`
  ).toLowerCase();
  const safeExt = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)
    ? ext
    : ".png";
  const id = randomBytes(8).toString("hex");
  const filename = `${id}${safeExt}`;

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buf);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
