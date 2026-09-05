import { Eye, Swords, Users } from "lucide-react";
import type { Role } from "@/generated/prisma/client";
import { PageHeader } from "@/components/molecules/PageHeader";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StatCard } from "@/components/molecules/StatCard";
import { GuildRegisterForm } from "@/components/organisms/GuildRegisterForm";
import { CollapsibleGuildGroup } from "@/components/organisms/CollapsibleGuildGroup";
import type { GuildGroup } from "@/lib/guild-groups";

export function EnemiesOnlineTemplate({
  groups,
  role,
  enemiesOnlineCount,
  alliesOnlineCount,
}: {
  groups: GuildGroup[];
  role: Role;
  enemiesOnlineCount: number;
  alliesOnlineCount: number;
}) {
  const totalMembers = groups.reduce((sum, g) => sum + g.members.length, 0);

  return (
    <div>
      <PageHeader
        title="Inimigos Online"
        description={`${enemiesOnlineCount} de ${totalMembers} inimigos online agora, agrupados por guild.`}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Inimigos online" value={enemiesOnlineCount} icon={Swords} />
        <StatCard
          label="Aliados online"
          value={alliesOnlineCount}
          icon={Users}
          tone="secondary"
        />
      </div>

      {role === "ADMIN" && (
        <GuildRegisterForm
          endpoint="/api/guilds"
          title="Cadastrar Guild inimiga"
          subjectLabel="inimigos"
        />
      )}

      {groups.length === 0 ? (
        <EmptyState
          icon={Eye}
          title="Nenhum inimigo cadastrado"
          description="Cadastre inimigos avulsos na Lista de Inimigos, ou importe uma guild inteira acima."
        />
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <CollapsibleGuildGroup key={group.key} group={group} detailHrefBase="/enemies" />
          ))}
        </div>
      )}
    </div>
  );
}
