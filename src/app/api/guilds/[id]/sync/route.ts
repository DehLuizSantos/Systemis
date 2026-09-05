import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { unauthorizedResponse } from "@/lib/api-utils";
import { importEnemyGuild } from "@/lib/guild-import";

type Params = { params: Promise<{ id: string }> };

// POST /api/guilds/[id]/sync — reimporta o elenco de uma guild já cadastrada
// (mesma permissão de /api/enemies/[id]/sync-history: qualquer usuário
// autenticado, não só admin).
export async function POST(_request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const { id } = await params;
  const guild = await prisma.guild.findUnique({
    where: { id },
    select: { sourceGuildId: true },
  });
  if (!guild) {
    return NextResponse.json({ error: "Guild não encontrada" }, { status: 404 });
  }

  try {
    const result = await importEnemyGuild(guild.sourceGuildId, session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GuildSync]", err);
    const message = err instanceof Error ? err.message : "Falha ao sincronizar a guild";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
