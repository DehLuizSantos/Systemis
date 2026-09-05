import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EnemiesTemplate } from "@/app/(dashboard)/enemies/components/templates/EnemiesTemplate";

export const metadata: Metadata = { title: "Lista de Inimigos" };

export default async function EnemiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();

  const enemies = await prisma.enemy.findMany({
    where: q ? { name: { contains: q } } : undefined,
    include: { _count: { select: { evidence: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return <EnemiesTemplate enemies={enemies} role={session!.user.role} />;
}
