import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { unauthorizedResponse, forbiddenResponse } from "@/lib/api-utils";
import { parseGuildIdFromInput } from "@/lib/miracle-scraper";
import { importAllyGuild } from "@/lib/ally-guild-import";

// POST /api/ally-guilds — cadastra uma guild ALIADA (só admin, mesma regra
// de /api/guilds): baixa o elenco inteiro do site e importa cada membro
// como aliado (Player).
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  if (session.user.role !== "ADMIN") return forbiddenResponse();

  const body = await request.json().catch(() => null);
  const input = typeof body?.input === "string" ? body.input.trim() : "";
  if (!input) {
    return NextResponse.json(
      { error: "Informe o link ou o id da guild" },
      { status: 400 }
    );
  }

  const guildId = parseGuildIdFromInput(input);
  if (guildId == null) {
    return NextResponse.json(
      {
        error:
          "Não reconheci esse link. Cole a URL da página da guild no site (?subtopic=guilds&action=show&guild=<id>) ou só o número do id.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await importAllyGuild(guildId, session.user.id);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[AllyGuildImport]", err);
    const message = err instanceof Error ? err.message : "Falha ao importar a guild";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
