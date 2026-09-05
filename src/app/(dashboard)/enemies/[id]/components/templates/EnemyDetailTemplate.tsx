import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { DeathEvent, Enemy, EnemyEvidence, XpRecord } from "@/generated/prisma/client";
import { EnemyProfileCard } from "@/app/(dashboard)/enemies/[id]/components/organisms/EnemyProfileCard";
import { EvidenceGallery } from "@/app/(dashboard)/enemies/[id]/components/organisms/EvidenceGallery";
import { EnemyHistoryList } from "@/app/(dashboard)/enemies/[id]/components/organisms/EnemyHistoryList";

type EnemyDetail = Enemy & {
  evidence: EnemyEvidence[];
  xpRecords: XpRecord[];
  deathEvents: DeathEvent[];
  createdBy: { name: string } | null;
};

export function EnemyDetailTemplate({ enemy }: { enemy: EnemyDetail }) {
  return (
    <div>
      <Link
        href="/enemies"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-paper/50 hover:text-paper"
      >
        <ArrowLeft className="size-4" />
        Voltar para a lista de inimigos
      </Link>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <EnemyProfileCard enemy={enemy} />
          {enemy.createdBy && (
            <p className="mt-2 text-xs text-paper/30">
              Cadastrado por {enemy.createdBy.name}
            </p>
          )}
        </div>
        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-medium text-paper">Prova anexada</h3>
          <EvidenceGallery evidence={enemy.evidence} />
        </div>
      </div>

      <EnemyHistoryList
        enemyId={enemy.id}
        xpRecords={enemy.xpRecords}
        deathEvents={enemy.deathEvents}
      />
    </div>
  );
}
