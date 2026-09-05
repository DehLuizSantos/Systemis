import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EnemyDetailTemplate } from "@/app/(dashboard)/enemies/[id]/components/templates/EnemyDetailTemplate";

export const metadata: Metadata = { title: "Detalhes do inimigo" };

export default async function EnemyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  if (!enemy) notFound();

  return <EnemyDetailTemplate enemy={enemy} />;
}
