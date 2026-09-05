import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { unauthorizedResponse } from "@/lib/api-utils";
import { createXpRecordSchema } from "@/lib/validations/xp";

// GET /api/xp-records — histórico de level/XP dos inimigos (XP tracker).
export async function GET(request: NextRequest) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const enemyId = request.nextUrl.searchParams.get("enemyId") ?? undefined;
  const records = await prisma.xpRecord.findMany({
    where: enemyId ? { enemyId } : undefined,
    include: { enemy: true },
    orderBy: { recordedAt: "desc" },
    take: 200,
  });
  return NextResponse.json(records);
}

// POST /api/xp-records — registra um novo level/XP observado para um inimigo.
export async function POST(request: NextRequest) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = createXpRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const record = await prisma.xpRecord.create({
    data: parsed.data,
    include: { enemy: true },
  });

  // Mantém o level exibido na lista de inimigos coerente com o último registro.
  await prisma.enemy.update({
    where: { id: parsed.data.enemyId },
    data: { level: parsed.data.level },
  });

  return NextResponse.json(record, { status: 201 });
}
