/**
 * Rashid é um NPC VIAJANTE: muda de cidade a cada dia da semana. O catálogo de
 * itens (ver `prisma/data/items.ts`, scrapeado de miracle74.com) guarda a
 * localização ESTÁTICA dele ("Edron"), que é só onde ele aparece na ficha do
 * item no site — não reflete onde ele está de fato hoje. Este módulo calcula
 * isso em runtime, o mesmo cálculo usado pelo bot de Discord original
 * (`src/modules/lootChecker.js`), para sobrescrever a cidade na hora de exibir.
 *
 * Tabela de rotação do Miracle 7.4 (índice = Date.getDay(): 0=domingo … 6=sábado).
 */
const RASHID_BY_DAY = [
  "Carlin", // 0 domingo
  "Thais", // 1 segunda
  "Venore", // 2 terça
  "Ab'Dendriel", // 3 quarta
  "Ankrahmun", // 4 quinta
  "Darashia", // 5 sexta
  "Edron", // 6 sábado
] as const;

const WEEKDAY_PT = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
] as const;

const SHORT_WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface RashidLocation {
  /** Índice do dia (0=domingo … 6=sábado), já considerando o corte do server save. */
  dayIndex: number;
  /** Cidade onde o Rashid está hoje. */
  city: (typeof RASHID_BY_DAY)[number];
  /** Dia da semana por extenso, em português. */
  weekday: (typeof WEEKDAY_PT)[number];
}

/**
 * Onde o Rashid está AGORA, respeitando o corte do server save às 05:00
 * (horário de Brasília): antes das 5h ainda vale o dia anterior. Subtraímos
 * 5h do instante e lemos o dia da semana no fuso America/Sao_Paulo (via
 * `Intl`), assim não depende do fuso horário do processo/servidor.
 */
export function getRashidToday(now: Date = new Date()): RashidLocation {
  const shifted = new Date(now.getTime() - 5 * 60 * 60 * 1000);
  const weekdayShort = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
  }).format(shifted);

  const dayIndex = SHORT_WEEKDAY_INDEX[weekdayShort] ?? now.getDay();

  return {
    dayIndex,
    city: RASHID_BY_DAY[dayIndex],
    weekday: WEEKDAY_PT[dayIndex],
  };
}

/** Detecta se um NPC é o Rashid (case-insensitive). */
export function isRashid(npcName: string | null | undefined): boolean {
  return /rashid/i.test(npcName ?? "");
}
