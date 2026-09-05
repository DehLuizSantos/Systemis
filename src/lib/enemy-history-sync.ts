import { prisma } from "@/lib/prisma";
import { getOtiPlayerStats } from "@/lib/miracle-scraper";

export interface EnemyHistorySyncResult {
  xpImported: number;
  deathsImported: number;
}

/**
 * Importa o histórico de XP (últimos 7 dias) e as últimas mortes de um
 * inimigo a partir do OpenTibia Info (`/stats/player/{nome}`) pros MESMOS
 * registros usados pelo cadastro manual — `XpRecord` (XP Tracker) e
 * `DeathEvent` (Last Death) — então aparecem automaticamente nos detalhes do
 * inimigo, sem precisar de tabela nova nem duplicar a UI que já existe.
 *
 * Idempotente: compara pelo timestamp exato (`recordedAt`/`diedAt`, que o
 * scraper sempre recalcula igual pro mesmo dado-fonte) e só insere o que
 * ainda não está gravado — rodar de novo não duplica nada, só traz o que é
 * NOVO desde a última sincronização.
 */
export async function syncEnemyHistoryFromOti(
  enemyId: string,
  characterName: string
): Promise<EnemyHistorySyncResult> {
  const stats = await getOtiPlayerStats(characterName);

  const [existingXp, existingDeaths] = await Promise.all([
    prisma.xpRecord.findMany({ where: { enemyId }, select: { recordedAt: true } }),
    prisma.deathEvent.findMany({ where: { enemyId }, select: { diedAt: true } }),
  ]);
  const existingXpTimes = new Set(existingXp.map((r) => r.recordedAt.getTime()));
  const existingDeathTimes = new Set(existingDeaths.map((d) => d.diedAt.getTime()));

  const newXpRecords = stats.expHistory
    .filter((entry) => entry.level != null)
    .map((entry) => ({
      enemyId,
      level: entry.level as number,
      xpGained: entry.gain,
      note: "OpenTibia Info",
      recordedAt: new Date(entry.recordedAt),
    }))
    .filter((record) => !existingXpTimes.has(record.recordedAt.getTime()));

  const newDeaths = stats.deaths
    .map((death) => ({
      subjectType: "ENEMY" as const,
      enemyId,
      level: death.level,
      killedBy: death.killedBy,
      diedAt: new Date(death.diedAt),
    }))
    .filter((death) => !existingDeathTimes.has(death.diedAt.getTime()));

  if (newXpRecords.length > 0) {
    await prisma.xpRecord.createMany({ data: newXpRecords });
  }
  if (newDeaths.length > 0) {
    await prisma.deathEvent.createMany({ data: newDeaths });
  }

  return { xpImported: newXpRecords.length, deathsImported: newDeaths.length };
}
