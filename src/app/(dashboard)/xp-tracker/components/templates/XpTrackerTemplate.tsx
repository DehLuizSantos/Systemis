import type { Enemy, XpRecord } from "@/generated/prisma/client";
import { PageHeader } from "@/components/molecules/PageHeader";
import { XpRecordForm } from "@/app/(dashboard)/xp-tracker/components/organisms/XpRecordForm";
import { XpRecordTable } from "@/app/(dashboard)/xp-tracker/components/organisms/XpRecordTable";

export function XpTrackerTemplate({
  records,
  enemies,
}: {
  records: (XpRecord & { enemy: Enemy })[];
  enemies: Enemy[];
}) {
  return (
    <div>
      <PageHeader
        title="Inimigos XP Tracker"
        description="Acompanhe a evolução de level/XP de cada inimigo ao longo do tempo."
      />
      <XpRecordForm enemies={enemies} />
      <XpRecordTable records={records} />
    </div>
  );
}
