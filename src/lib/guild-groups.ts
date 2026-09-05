import { norm } from "@/lib/norm";

/** Rótulo usado quando um personagem não tem guild/time cadastrada nem digitada. */
export const NO_GUILD_LABEL = "Sem referência de Guild/Time";
/** Chave interna do grupo "sem guild" — sempre ordenado por último. */
const NO_GUILD_KEY = "none";

export interface GuildGroupMember {
  id: string;
  name: string;
  level: number;
  vocation: string | null;
  residence: string | null;
  isOnline: boolean;
}

export interface GuildGroup {
  /** Id da Guild cadastrada, ou `text:<nome>`/"none" pra quem não tem vínculo. */
  key: string;
  name: string;
  logoUrl: string | null;
  members: GuildGroupMember[];
}

/**
 * Agrupa personagens (inimigos ou aliados) por guild — usado pelas telas
 * "Inimigos Online" e "Aliados Online". Prioriza o vínculo com uma Guild
 * cadastrada (`guildId`/`guildName`); sem isso, agrupa pelo nome de guild
 * digitado/raspado (texto livre); sem nenhum dos dois, cai no grupo
 * "Sem referência de Guild/Time", sempre por último.
 */
export function buildGuildGroups<
  T extends {
    id: string;
    name: string;
    level: number;
    vocation: string | null;
    residence: string | null;
    guild: string | null;
    guildId?: string | null;
    guildGroup?: { name: string; logoUrl: string | null } | null;
  },
>(subjects: T[], onlineNames: Set<string>): GuildGroup[] {
  const groups = new Map<string, GuildGroup>();

  for (const subject of subjects) {
    const key =
      subject.guildId ??
      (subject.guild ? `text:${subject.guild.toLowerCase()}` : NO_GUILD_KEY);

    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        name: subject.guildGroup?.name ?? subject.guild ?? NO_GUILD_LABEL,
        logoUrl: subject.guildGroup?.logoUrl ?? null,
        members: [],
      };
      groups.set(key, group);
    }

    group.members.push({
      id: subject.id,
      name: subject.name,
      level: subject.level,
      vocation: subject.vocation,
      residence: subject.residence,
      isOnline: onlineNames.has(norm(subject.name)),
    });
  }

  return [...groups.values()].sort((a, b) => {
    if (a.key === NO_GUILD_KEY) return 1;
    if (b.key === NO_GUILD_KEY) return -1;
    return b.members.length - a.members.length;
  });
}
