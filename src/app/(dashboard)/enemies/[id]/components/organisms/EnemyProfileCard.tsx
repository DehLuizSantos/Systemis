import type { Enemy } from "@/generated/prisma/client";
import { PlayerStatusBadge } from "@/components/molecules/PlayerStatusBadge";
import { InfoRow } from "@/components/molecules/InfoRow";
import { formatDate } from "@/lib/utils";

export function EnemyProfileCard({ enemy }: { enemy: Enemy }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="mb-4 text-lg font-semibold text-paper">{enemy.name}</h2>

      <InfoRow icon="📊" label="Level" value={enemy.level} />
      <InfoRow icon="⚔️" label="Vocação" value={enemy.vocation ?? "—"} />
      <InfoRow icon="📡" label="Status" value={<PlayerStatusBadge status={enemy.status} />} />
      <InfoRow icon="🛡️" label="Guild / time" value={enemy.guild ?? "—"} />
      <InfoRow icon="🏠" label="Residência" value={enemy.residence ?? "—"} />
      <InfoRow icon="🕒" label="Cadastrado em" value={formatDate(enemy.createdAt)} />

      {enemy.notes && (
        <p className="mt-4 rounded-md bg-surface-hover p-3 text-sm text-paper/70">
          {enemy.notes}
        </p>
      )}
    </div>
  );
}
