import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { unauthorizedResponse } from "@/lib/api-utils";
import { syncEnemyHistoryFromOti } from "@/lib/enemy-history-sync";

type Params = { params: Promise<{ id: string }> };

// POST /api/enemies/[id]/sync-history — importa histórico de XP e mortes do
// OpenTibia Info pro inimigo (mesma permissão de /api/xp-records e
// /api/deaths: qualquer usuário autenticado, não só admin).
export async function POST(_request: NextRequest, { params }: Params) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const { id } = await params;
  const enemy = await prisma.enemy.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!enemy) {
    return NextResponse.json({ error: "Inimigo não encontrado" }, { status: 404 });
  }

  try {
    const result = await syncEnemyHistoryFromOti(enemy.id, enemy.name);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[EnemyHistorySync]", err);
    return NextResponse.json(
      { error: "Não foi possível buscar dados no OpenTibia Info agora. Tente novamente." },
      { status: 502 }
    );
  }
}
