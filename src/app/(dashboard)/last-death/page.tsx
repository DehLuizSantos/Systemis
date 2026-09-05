import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LastDeathTemplate } from "@/app/(dashboard)/last-death/components/templates/LastDeathTemplate";

export const metadata: Metadata = { title: "Last Death" };

export default async function LastDeathPage() {
  const [deaths, enemies, players] = await Promise.all([
    prisma.deathEvent.findMany({
      include: { enemy: true, player: true },
      orderBy: { diedAt: "desc" },
      take: 100,
    }),
    prisma.enemy.findMany({ orderBy: { name: "asc" } }),
    prisma.player.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <LastDeathTemplate deaths={deaths} enemies={enemies} players={players} />;
}
