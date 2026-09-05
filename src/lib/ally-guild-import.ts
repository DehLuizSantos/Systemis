import { prisma } from "@/lib/prisma";
import {
  getGuildRoster,
  getCharacterInfo,
  getOnlinePlayers,
  isPlayerOnline,
} from "@/lib/miracle-scraper";
import { mapWithConcurrency } from "@/lib/concurrency";
import type { GuildImportResult } from "@/lib/guild-import";

const IMPORT_CONCURRENCY = 5;

/**
 * Igual a `importEnemyGuild`, mas cadastra o elenco como ALIADOS (`Player`)
 * em vez de inimigos. Aliados não têm uma Guild "categoria" vinculada por id
 * (não existe hoje um motivo pra ter mais de uma guild aliada) — o nome vem
 * gravado como texto livre em `guild`, do mesmo jeito que já era preenchido
 * num scan manual.
 */
export async function importAllyGuild(
  sourceGuildId: number,
  scannedById: string | null
): Promise<GuildImportResult> {
  const roster = await getGuildRoster(sourceGuildId);
  if (!roster) {
    throw new Error(`Guild ${sourceGuildId} não encontrada no Miracle`);
  }

  const online = await getOnlinePlayers();

  let created = 0;
  let updated = 0;
  let failed = 0;

  await mapWithConcurrency(roster.members, IMPORT_CONCURRENCY, async (member) => {
    try {
      const charInfo = await getCharacterInfo(member.name).catch(() => null);
      const canonicalName = charInfo?.name ?? member.name;
      const isOnline = isPlayerOnline(online.players, canonicalName);

      const data = {
        name: canonicalName,
        level: charInfo?.level ?? member.level,
        vocation: charInfo?.vocation ?? member.vocation,
        residence: charInfo?.residence ?? null,
        guild: roster.name,
        status: isOnline ? ("ONLINE" as const) : ("OFFLINE" as const),
        lastScanAt: new Date(),
        scannedById: scannedById ?? undefined,
      };

      const candidates = await prisma.player.findMany({
        where: { name: { contains: canonicalName } },
        select: { id: true, name: true },
      });
      const existing = candidates.find(
        (c) => c.name.toLowerCase() === canonicalName.toLowerCase()
      );

      if (existing) {
        await prisma.player.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.player.create({ data });
        created++;
      }
    } catch (err) {
      console.error(`[AllyGuildImport] falha ao importar ${member.name}:`, err);
      failed++;
    }
  });

  return {
    // Aliados não têm uma Guild "categoria" com id próprio (ver comentário
    // no topo do arquivo) — não há um id real pra devolver aqui.
    guildId: "",
    guildName: roster.name,
    membersFound: roster.members.length,
    membersCreated: created,
    membersUpdated: updated,
    membersFailed: failed,
  };
}
