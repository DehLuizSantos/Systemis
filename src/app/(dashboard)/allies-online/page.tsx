import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOnlinePlayers } from "@/lib/miracle-scraper";
import { norm } from "@/lib/norm";
import { buildGuildGroups } from "@/lib/guild-groups";
import { AlliesOnlineTemplate } from "@/app/(dashboard)/allies-online/components/templates/AlliesOnlineTemplate";

export const metadata: Metadata = { title: "Aliados Online" };

// Nunca cachear — status online é lido ao vivo do whoisonline a cada visita.
export const dynamic = "force-dynamic";

export default async function AlliesOnlinePage() {
  const session = await auth();

  const [allies, enemyCount, online] = await Promise.all([
    prisma.player.findMany({ orderBy: { name: "asc" } }),
    prisma.enemy.findMany({ select: { name: true } }),
    getOnlinePlayers(),
  ]);

  const onlineNames = new Set(online.players.map((p) => norm(p.name)));

  const groups = buildGuildGroups(allies, onlineNames);
  const alliesOnlineCount = groups.reduce(
    (sum, g) => sum + g.members.filter((m) => m.isOnline).length,
    0
  );
  const enemiesOnlineCount = enemyCount.filter((e) => onlineNames.has(norm(e.name))).length;

  return (
    <AlliesOnlineTemplate
      groups={groups}
      role={session!.user.role}
      alliesOnlineCount={alliesOnlineCount}
      enemiesOnlineCount={enemiesOnlineCount}
    />
  );
}
