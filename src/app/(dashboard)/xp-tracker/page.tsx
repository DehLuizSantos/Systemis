import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { XpTrackerTemplate } from "@/app/(dashboard)/xp-tracker/components/templates/XpTrackerTemplate";

export const metadata: Metadata = { title: "Inimigos XP Tracker" };

export default async function XpTrackerPage() {
  const [records, enemies] = await Promise.all([
    prisma.xpRecord.findMany({
      include: { enemy: true },
      orderBy: { recordedAt: "desc" },
      take: 100,
    }),
    prisma.enemy.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <XpTrackerTemplate records={records} enemies={enemies} />;
}
