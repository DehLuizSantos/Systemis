import Link from "next/link";
import { Swords, Users, Skull, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/molecules/PageHeader";
import { StatCard } from "@/components/molecules/StatCard";
import { DeathSubjectBadge } from "@/components/molecules/DeathSubjectBadge";
import { EmptyState } from "@/components/molecules/EmptyState";
import { formatDate } from "@/lib/utils";
import { getServerStatus } from "@/lib/server-status";
import { SERVER_LABEL } from "@/lib/constants";

// Nunca cachear esta página — os stats vêm do banco (que muda a qualquer
// momento) e de uma raspagem ao vivo do site do servidor.
export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [enemiesOnline, alliesOnline, recentDeaths, serverStatus] =
    await Promise.all([
      prisma.enemy.count({ where: { status: "ONLINE" } }),
      prisma.player.count({ where: { status: "ONLINE" } }),
      prisma.deathEvent.findMany({
        orderBy: { diedAt: "desc" },
        take: 5,
        include: { enemy: true, player: true },
      }),
      getServerStatus(),
    ]);

  return (
    <div>
      <PageHeader
        title="Visão geral"
        description={`Resumo em tempo real do que o bot está monitorando em ${SERVER_LABEL}.`}
        actions={
          <span className="text-xs text-paper/40">
            Atualizado às {formatDate(serverStatus.fetchedAt)}
          </span>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Inimigos online" value={enemiesOnline} icon={Swords} />
        <StatCard
          label="Aliados online"
          value={alliesOnline}
          icon={Users}
          tone="secondary"
        />
        <StatCard label="Últimas mortes" value={recentDeaths.length} icon={Skull} />
        <StatCard
          label="Players online no servidor"
          value={
            serverStatus.playersOnline != null
              ? serverStatus.playersOnline.toLocaleString("pt-BR")
              : "indisponível"
          }
          icon={Globe}
          tone="secondary"
        />
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-paper">Últimas mortes</h2>
        {recentDeaths.length === 0 ? (
          <EmptyState icon={Skull} title="Nenhuma morte registrada ainda" />
        ) : (
          <ul className="divide-y divide-border">
            {recentDeaths.map((death) => (
              <li
                key={death.id}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <div className="flex items-center gap-3">
                  <DeathSubjectBadge subject={death.subjectType} />
                  <span className="font-medium text-paper">
                    {death.enemy?.name ?? death.player?.name ?? "—"}
                  </span>
                  {death.killedBy && (
                    <span className="text-paper/50">
                      morto por {death.killedBy}
                    </span>
                  )}
                </div>
                <span className="text-xs text-paper/40">
                  {formatDate(death.diedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/last-death"
          className="mt-3 inline-block text-xs text-secondary-light hover:underline"
        >
          Ver histórico completo →
        </Link>
      </div>
    </div>
  );
}
