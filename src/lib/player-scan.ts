/**
 * Motor do Player Scan — porta o fluxo de `src/modules/playerScan.js` do bot de
 * Discord original (menos a parte de "prováveis alts", que depende de um
 * histórico de sessão acumulado por um worker que ainda não existe neste
 * projeto; ver o comentário em `alts` abaixo).
 *
 * Substitui o antigo `mock-scan.ts`: mesmo formato de resposta, dados reais.
 */
import {
  getCharacterInfo,
  getOnlinePlayers,
  getOtiPlayerStats,
  isPlayerOnline,
} from "@/lib/miracle-scraper";

export interface ScanSkills {
  magicLevel: number;
  fist: number;
  club: number;
  sword: number;
  axe: number;
  distance: number;
  shielding: number;
  fishing: number;
}

export interface ScanAlt {
  name: string;
  probability: number;
}

export interface PlayerScanResult {
  name: string;
  formerName: string | null;
  level: number;
  vocation: string;
  status: "ONLINE" | "OFFLINE";
  guild: string | null;
  residence: string;
  account: string;
  /** ISO 8601, ou `null` quando o site não trouxe a data (raro). */
  lastLogin: string | null;
  skills: ScanSkills;
  alts: ScanAlt[];
  scannedAt: string;
}

function buildSkills(raw: { label: string; value: number }[]): ScanSkills {
  const byLabel = new Map(raw.map((s) => [s.label, s.value]));
  return {
    magicLevel: byLabel.get("Magic Level") ?? 0,
    fist: byLabel.get("Fist") ?? 0,
    club: byLabel.get("Club") ?? 0,
    sword: byLabel.get("Sword") ?? 0,
    axe: byLabel.get("Axe") ?? 0,
    distance: byLabel.get("Distance") ?? 0,
    shielding: byLabel.get("Shielding") ?? 0,
    fishing: byLabel.get("Fishing") ?? 0,
  };
}

/**
 * Escaneia um personagem no Miracle. `null` = não existe no servidor.
 * Lança erro em falha de rede/scraping (o chamador decide como responder).
 */
export async function scanPlayer(
  rawName: string
): Promise<PlayerScanResult | null> {
  const name = rawName.trim();

  // Onda única em paralelo (mesma ideia do bot original): ficha + lista online
  // (miracle74.com) e skills completas (opentibia.info, outro host) não competem
  // pelo mesmo orçamento de requisições, então não há motivo para serializar.
  const [charInfo, online, otiStats] = await Promise.all([
    getCharacterInfo(name),
    getOnlinePlayers(),
    getOtiPlayerStats(name),
  ]);

  if (!charInfo) return null;

  // A partir daqui vale o nome CANÔNICO da ficha (pode diferir em caixa/espaço
  // do que foi digitado) — é ele que decide o status online.
  const canonical = charInfo.name;
  const isOnline = isPlayerOnline(online.players, canonical);

  return {
    name: canonical,
    formerName: charInfo.formerName,
    level: charInfo.level ?? 0,
    vocation: charInfo.vocation ?? "?",
    status: isOnline ? "ONLINE" : "OFFLINE",
    guild: charInfo.guild,
    residence: charInfo.residence ?? "?",
    account: charInfo.premium ?? "?",
    lastLogin: charInfo.lastLogin,
    skills: buildSkills(otiStats.skills),
    // A detecção de "prováveis alts" do bot original (`findAlts`) cruza um
    // histórico de login/logout coletado 24/7 ao longo de meses — não é algo
    // que dá para calcular a partir de uma ficha isolada. Fica vazio até essa
    // infraestrutura (worker de sessão + tabela de eventos) existir aqui.
    alts: [],
    scannedAt: new Date().toISOString(),
  };
}
