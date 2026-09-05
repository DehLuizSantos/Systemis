import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOnlinePlayers } from "@/lib/miracle-scraper";
import { norm } from "@/lib/norm";
import { buildGuildGroups } from "@/lib/guild-groups";
import { EnemiesOnlineTemplate } from "@/app/(dashboard)/enemies-online/components/templates/EnemiesOnlineTemplate";

export const metadata: Metadata = { title: "Inimigos Online" };

// Nunca cachear — status online é lido ao vivo do whoisonline a cada visita.
export const dynamic = "force-dynamic";

export default async function EnemiesOnlinePage() {
  const session = await auth();

  const [enemies, allyCount, online] = await Promise.all([
    prisma.enemy.findMany({
      include: { guildGroup: { select: { name: true, logoUrl: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.player.findMany({ select: { name: true } }),
    getOnlinePlayers(),
  ]);

  // Status ao vivo (não o `status` gravado no banco, que só reflete o
  // último cadastro/scan) — cruza cada personagem com o whoisonline agora.
  const onlineNames = new Set(online.players.map((p) => norm(p.name)));

  const groups = buildGuildGroups(enemies, onlineNames);
  const enemiesOnlineCount = groups.reduce(
    (sum, g) => sum + g.members.filter((m) => m.isOnline).length,
    0
  );
  const alliesOnlineCount = allyCount.filter((p) => onlineNames.has(norm(p.name))).length;

  return (
    <EnemiesOnlineTemplate
      groups={groups}
      role={session!.user.role}
      enemiesOnlineCount={enemiesOnlineCount}
      alliesOnlineCount={alliesOnlineCount}
    />
  );
}
