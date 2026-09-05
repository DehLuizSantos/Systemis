import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { unauthorizedResponse, forbiddenResponse } from "@/lib/api-utils";
import { getCharacterInfo, getOnlinePlayers, isPlayerOnline } from "@/lib/miracle-scraper";

// POST /api/enemies/lookup — ficha completa de UM personagem (nome exato),
// via scraping do miracle74.com: level, vocação, guild, residência e status
// online/offline (cruzando com o whoisonline). É o que preenche o resto do
// formulário quando o usuário escolhe uma sugestão do autocomplete — ou
// digita direto o nome de alguém offline (que não aparece nas sugestões).
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  if (session.user.role !== "ADMIN") return forbiddenResponse();

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json(
      { error: "Informe o nome do personagem" },
      { status: 400 }
    );
  }

  try {
    const [charInfo, online] = await Promise.all([
      getCharacterInfo(name),
      getOnlinePlayers(),
    ]);

    if (!charInfo) {
      return NextResponse.json(
        { error: `${name} não existe no Miracle` },
        { status: 404 }
      );
    }

    // Avisa ANTES do cadastro (o POST /api/enemies também bloqueia de
    // verdade — isto é só pra não deixar o usuário preencher tudo e só
    // descobrir a duplicata ao clicar em "Cadastrar").
    const candidates = await prisma.enemy.findMany({
      where: { name: { contains: charInfo.name } },
      select: { id: true, name: true },
    });
    const existing = candidates.find(
      (c) => c.name.toLowerCase() === charInfo.name.toLowerCase()
    );

    return NextResponse.json({
      name: charInfo.name,
      level: charInfo.level,
      vocation: charInfo.vocation,
      guild: charInfo.guild,
      residence: charInfo.residence,
      status: isPlayerOnline(online.players, charInfo.name) ? "ONLINE" : "OFFLINE",
      alreadyRegisteredId: existing?.id ?? null,
    });
  } catch (err) {
    console.error("[EnemyLookup]", err);
    return NextResponse.json(
      { error: "Não foi possível buscar dados no site agora. Tente novamente." },
      { status: 502 }
    );
  }
}
