import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { unauthorizedResponse, staleSessionResponse } from "@/lib/api-utils";
import { createPlayerSchema } from "@/lib/validations/player";

// GET /api/players?q=nome — lista jogadores (aliados) já escaneados.
export async function GET(request: NextRequest) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const search = request.nextUrl.searchParams.get("q")?.trim();
  const players = await prisma.player.findMany({
    where: search ? { name: { contains: search } } : undefined,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(players);
}

// POST /api/players — registra um "scan" de jogador (novo ou atualizado).
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = createPlayerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const player = await prisma.player.create({
      data: {
        ...parsed.data,
        avatarUrl: parsed.data.avatarUrl || undefined,
        lastScanAt: new Date(),
        scannedById: session.user.id,
      },
    });
    return NextResponse.json(player, { status: 201 });
  } catch (err) {
    // Ver o mesmo tratamento em api/enemies/route.ts.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return staleSessionResponse();
    }
    throw err;
  }
}
