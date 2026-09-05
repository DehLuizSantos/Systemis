import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { unauthorizedResponse } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const { id } = await params;
  await prisma.deathEvent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
