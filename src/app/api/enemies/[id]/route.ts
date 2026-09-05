import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { unauthorizedResponse, forbiddenResponse } from "@/lib/api-utils";
import { updateEnemySchema } from "@/lib/validations/enemy";

type Params = { params: Promise<{ id: string }> };

// GET /api/enemies/:id — detalhe completo do inimigo (prova, XP, mortes).
export async function GET(_request: NextRequest, { params }: Params) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const { id } = await params;
  const enemy = await prisma.enemy.findUnique({
    where: { id },
    include: {
      evidence: { orderBy: { createdAt: "desc" } },
      xpRecords: { orderBy: { recordedAt: "desc" }, take: 20 },
      deathEvents: { orderBy: { diedAt: "desc" }, take: 20 },
      createdBy: { select: { name: true } },
    },
  });
  if (!enemy) {
    return NextResponse.json(
      { error: "Inimigo não encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(enemy);
}

// PATCH — atualiza um inimigo (somente admin).
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  if (session.user.role !== "ADMIN") return forbiddenResponse();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateEnemySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const enemy = await prisma.enemy.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json(enemy);
}

// DELETE — remove um inimigo (somente admin).
export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  if (session.user.role !== "ADMIN") return forbiddenResponse();

  const { id } = await params;
  await prisma.enemy.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
