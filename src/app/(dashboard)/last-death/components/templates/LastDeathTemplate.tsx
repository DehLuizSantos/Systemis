import type { DeathEvent, Enemy, Player } from "@/generated/prisma/client";
import { PageHeader } from "@/components/molecules/PageHeader";
import { DeathEventForm } from "@/app/(dashboard)/last-death/components/organisms/DeathEventForm";
import { DeathTimeline } from "@/app/(dashboard)/last-death/components/organisms/DeathTimeline";

export function LastDeathTemplate({
  deaths,
  enemies,
  players,
}: {
  deaths: (DeathEvent & { enemy: Enemy | null; player: Player | null })[];
  enemies: Enemy[];
  players: Player[];
}) {
  return (
    <div>
      <PageHeader
        title="Last Death"
        description="Últimas mortes de inimigos e aliados."
      />
      <DeathEventForm enemies={enemies} players={players} />
      <DeathTimeline deaths={deaths} />
    </div>
  );
}
