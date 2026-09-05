import { UserCheck, Swords, Users } from "lucide-react";
import type { Role } from "@/generated/prisma/client";
import { PageHeader } from "@/components/molecules/PageHeader";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StatCard } from "@/components/molecules/StatCard";
import { GuildRegisterForm } from "@/components/organisms/GuildRegisterForm";
import { CollapsibleGuildGroup } from "@/components/organisms/CollapsibleGuildGroup";
import type { GuildGroup } from "@/lib/guild-groups";

export function AlliesOnlineTemplate({
  groups,
  role,
  alliesOnlineCount,
  enemiesOnlineCount,
}: {
  groups: GuildGroup[];
  role: Role;
  alliesOnlineCount: number;
  enemiesOnlineCount: number;
}) {
  const totalMembers = groups.reduce((sum, g) => sum + g.members.length, 0);

  return (
    <div>
      <PageHeader
        title="Aliados Online"
        description={`${alliesOnlineCount} de ${totalMembers} aliados online agora, agrupados por guild.`}
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
          endpoint="/api/ally-guilds"
          title="Cadastrar Guild aliada"
          subjectLabel="aliados"
        />
      )}

      {groups.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="Nenhum aliado cadastrado"
          description="Registre um scan de aliado, ou importe uma guild inteira acima."
        />
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <CollapsibleGuildGroup key={group.key} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
