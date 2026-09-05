import { prisma } from "@/lib/prisma";
import {
  getGuildRoster,
  getCharacterInfo,
  getOnlinePlayers,
  isPlayerOnline,
} from "@/lib/miracle-scraper";
import { mapWithConcurrency } from "@/lib/concurrency";

// Concorrência limitada: uma guild pode ter 100+ membros, e cada um precisa
// de uma busca à parte na ficha (a página da guild não traz residência).
// Rajada demais arrisca 429 no site; sequencial demais deixa o import de uma
// guild grande levar minutos. 5 é um meio-termo razoável sem infraestrutura
// de fila anti-429 (esta app não tem o scheduler do bot original).
const IMPORT_CONCURRENCY = 5;

export interface GuildImportResult {
  guildId: string;
  guildName: string;
  membersFound: number;
  membersCreated: number;
  /** já existiam como inimigo avulso — só vinculamos à guild e atualizamos os dados. */
  membersUpdated: number;
  membersFailed: number;
}

/**
 * Cadastra (ou reimporta) uma guild inimiga: baixa o elenco completo do
 * `?subtopic=guilds&action=show&guild=<id>` e registra CADA membro como
 * Enemy — a ficha de cada um (level/vocação/residência/status) vem de uma
 * busca à parte (`getCharacterInfo`), porque a página da guild não traz
 * residência. Não sincroniza XP/mortes do OpenTibia Info por membro (isso já
 * dobraria as requisições de uma guild grande); use o botão "Sincronizar" na
 * ficha de cada inimigo depois, se quiser esse histórico.
 *
 * Idempotente na guild (upsert por `sourceGuildId`) e nos membros (quem já é
 * inimigo cadastrado só é atualizado/vinculado, nunca duplicado — mesma
 * checagem de nome usada no cadastro avulso).
 */
export async function importEnemyGuild(
  sourceGuildId: number,
  createdById: string | null
): Promise<GuildImportResult> {
  const roster = await getGuildRoster(sourceGuildId);
  if (!roster) {
    throw new Error(`Guild ${sourceGuildId} não encontrada no Miracle`);
  }

  const guild = await prisma.guild.upsert({
    where: { sourceGuildId },
    update: { name: roster.name, logoUrl: roster.logoUrl },
    create: {
      sourceGuildId,
      name: roster.name,
      logoUrl: roster.logoUrl,
      createdById: createdById ?? undefined,
    },
  });

  const online = await getOnlinePlayers();

  let created = 0;
  let updated = 0;
  let failed = 0;

  await mapWithConcurrency(roster.members, IMPORT_CONCURRENCY, async (member) => {
    try {
      // A ficha exata é a fonte de verdade (nome canônico, residência); a
      // linha da guild é só o fallback se a busca falhar por algum motivo.
      const charInfo = await getCharacterInfo(member.name).catch(() => null);
      const canonicalName = charInfo?.name ?? member.name;
      const isOnline = isPlayerOnline(online.players, canonicalName);

      const data = {
        name: canonicalName,
        level: charInfo?.level ?? member.level,
        vocation: charInfo?.vocation ?? member.vocation,
        residence: charInfo?.residence ?? null,
        guild: guild.name,
        guildId: guild.id,
        status: isOnline ? ("ONLINE" as const) : ("OFFLINE" as const),
      };

      const candidates = await prisma.enemy.findMany({
        where: { name: { contains: canonicalName } },
        select: { id: true, name: true },
      });
      const existing = candidates.find(
        (c) => c.name.toLowerCase() === canonicalName.toLowerCase()
      );

      if (existing) {
        await prisma.enemy.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.enemy.create({ data: { ...data, createdById: createdById ?? undefined } });
        created++;
      }
    } catch (err) {
      console.error(`[GuildImport] falha ao importar ${member.name}:`, err);
      failed++;
    }
  });

  return {
    guildId: guild.id,
    guildName: guild.name,
    membersFound: roster.members.length,
    membersCreated: created,
    membersUpdated: updated,
    membersFailed: failed,
  };
}
