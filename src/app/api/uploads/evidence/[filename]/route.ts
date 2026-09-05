import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { auth } from "@/auth";
import { unauthorizedResponse } from "@/lib/api-utils";
import { evidenceFilePath } from "@/lib/uploads";

type Params = { params: Promise<{ filename: string }> };

// Only filenames this app itself generates (see `saveEvidenceFiles`) are
// valid — rejects anything else, including path-traversal attempts.
const SAFE_FILENAME = /^[0-9a-f-]{36}\.(png|jpe?g|webp|gif)$/i;

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

// GET /api/uploads/evidence/:filename — serve prova anexada de um inimigo.
// Rota dinâmica (não estática) para que uploads feitos em runtime apareçam
// imediatamente, sem depender de rebuild/restart do servidor.
export async function GET(_request: NextRequest, { params }: Params) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const { filename } = await params;
  if (!SAFE_FILENAME.test(filename)) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
  }

  try {
    const buffer = await readFile(evidenceFilePath(filename));
    const extension = filename.split(".").pop()!.toLowerCase();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }
}
