import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { unauthorizedResponse } from "@/lib/api-utils";
import { createDeathEventSchema } from "@/lib/validations/death";

// GET /api/deaths — últimas mortes de inimigos e aliados (last-death).
export async function GET(request: NextRequest) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const subjectType = request.nextUrl.searchParams.get("subjectType") as
    | "ENEMY"
    | "ALLY"
    | null;

  const deaths = await prisma.deathEvent.findMany({
    where: subjectType ? { subjectType } : undefined,
    include: { enemy: true, player: true },
    orderBy: { diedAt: "desc" },
    take: 200,
  });
  return NextResponse.json(deaths);
}

// POST /api/deaths — registra a morte de um inimigo ou aliado.
export async function POST(request: NextRequest) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = createDeathEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { subjectType, enemyId, playerId, killedBy, cause, location } =
    parsed.data;

  const death = await prisma.deathEvent.create({
    data: {
      subjectType,
      enemyId: subjectType === "ENEMY" ? enemyId || undefined : undefined,
      playerId: subjectType === "ALLY" ? playerId || undefined : undefined,
      killedBy,
      cause,
      location,
    },
    include: { enemy: true, player: true },
  });

  return NextResponse.json(death, { status: 201 });
}
