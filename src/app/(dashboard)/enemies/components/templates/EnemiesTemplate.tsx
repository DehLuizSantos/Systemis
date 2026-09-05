import type { Enemy, Role } from "@/generated/prisma/client";
import { PageHeader } from "@/components/molecules/PageHeader";
import { SearchInput } from "@/components/molecules/SearchInput";
import { EnemyForm } from "@/app/(dashboard)/enemies/components/organisms/EnemyForm";
import { EnemyTable } from "@/app/(dashboard)/enemies/components/organisms/EnemyTable";

type EnemyWithCount = Enemy & { _count: { evidence: number } };

export function EnemiesTemplate({
  enemies,
  role,
}: {
  enemies: EnemyWithCount[];
  role: Role;
}) {
  return (
    <div>
      <PageHeader
        title="Lista de Inimigos"
        description="Todos os inimigos monitorados pelo bot."
        actions={<SearchInput placeholder="Buscar inimigo..." />}
      />
      {role === "ADMIN" && <EnemyForm />}
      <EnemyTable enemies={enemies} role={role} />
    </div>
  );
}
