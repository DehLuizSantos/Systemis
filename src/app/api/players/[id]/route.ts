import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { unauthorizedResponse, staleSessionResponse } from "@/lib/api-utils";
import { updatePlayerSchema } from "@/lib/validations/player";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const { id } = await params;
  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) {
    return NextResponse.json(
      { error: "Jogador não encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(player);
}

// PATCH — atualiza dados de um jogador (novo "scan"/rescan).
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updatePlayerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const player = await prisma.player.update({
      where: { id },
      data: {
        ...parsed.data,
        avatarUrl: parsed.data.avatarUrl || undefined,
        lastScanAt: new Date(),
        scannedById: session.user.id,
      },
    });
    return NextResponse.json(player);
  } catch (err) {
    // Ver o mesmo tratamento em api/enemies/route.ts.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return staleSessionResponse();
    }
    throw err;
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const { id } = await params;
  await prisma.player.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
