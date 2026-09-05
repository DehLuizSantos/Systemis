import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Deliberately NOT under `public/` — `next start` snapshots that directory's
// listing at boot, so files written there at runtime (by this app or a
// future scanning bot) 404 until the server restarts. Serving them back
// through `GET /api/uploads/evidence/[filename]` (a normal, always-dynamic
// Route Handler) avoids that trap. Swap this for object storage if you
// deploy somewhere without a writable/persistent filesystem.
const UPLOAD_DIR = path.join(process.cwd(), "storage", "evidence");
export const PUBLIC_PREFIX = "/api/uploads/evidence";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export function evidenceFilePath(filename: string) {
  return path.join(UPLOAD_DIR, filename);
}

/** Persists uploaded evidence images to disk and returns their (API) URLs. */
export async function saveEvidenceFiles(files: File[]): Promise<string[]> {
  const validFiles = files.filter(
    (file) => file.size > 0 && ALLOWED_TYPES.has(file.type) && file.size <= MAX_SIZE_BYTES
  );
  if (validFiles.length === 0) return [];

  await mkdir(UPLOAD_DIR, { recursive: true });

  const urls = await Promise.all(
    validFiles.map(async (file) => {
      const extension = path.extname(file.name) || ".png";
      const filename = `${randomUUID()}${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(evidenceFilePath(filename), buffer);
      return `${PUBLIC_PREFIX}/${filename}`;
    })
  );

  return urls;
}
