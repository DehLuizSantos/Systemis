/**
 * Scraping ao vivo do site oficial do Miracle 7.4 (miracle74.com) e, para as
 * skills completas, do OpenTibia Info (opentibia.info) — que espelha o
 * `src/scraper.js` do bot de Discord original, na parte usada pelo Player Scan
 * (`src/modules/playerScan.js` de lá).
 *
 * Usa `fetch()` puro (mesmo padrão de `server-status.ts`), não o `curl` via
 * subprocesso que o bot original precisou para IP de VPS (a Cloudflare do
 * miracle74.com bloqueava o fingerprint do Node puro num datacenter). Se um
 * dia isso voltar a acontecer neste deploy, é essa a primeira coisa a checar.
 */
import { norm } from "@/lib/norm";

const BASE_URL = "https://www.miracle74.com";
const OTI_URL = "https://opentibia.info";
const USER_AGENT =
  "Mozilla/5.0 (compatible; SynthesisBot/1.0; +https://miracle74.com/)";
const FETCH_TIMEOUT_MS = 15000;

class HttpStatusError extends Error {
  constructor(
    public statusCode: number,
    url: string
  ) {
    super(`HTTP ${statusCode} ao acessar ${url}`);
  }
}

async function fetchHtml(
  url: string,
  init: { cookie?: string | null } = {}
): Promise<string> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ...(init.cookie ? { Cookie: init.cookie } : {}),
    },
  });

  if (!res.ok) throw new HttpStatusError(res.status, url);
  return res.text();
}

function stripHtml(str: string = ""): string {
  return str
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// `label` casa contra o texto de uma célula <td>rótulo:</td><td>valor</td>. O
// site às vezes usa `&#160;`/`&nbsp;` em vez de espaço normal dentro do rótulo
// (ex.: "Account&#160;Status:") — normalizamos isso antes de procurar, senão
// o rótulo com espaço comum nunca casa. A última célula da ficha ("Account
// Status") também vem sem `</td>` de fechamento (emenda direto em `</table>`);
// por isso o valor termina no que vier primeiro entre `</td>`, `</table>` ou a
// próxima linha (`<tr`) — sem isso, a captura "vazava" para dentro da tabela
// seguinte (Character Deaths) e trazia lixo junto.
function extractTableValue(html: string, label: string): string | null {
  const normalizedHtml = html.replace(/&#160;|&nbsp;/gi, " ");
  const pattern = new RegExp(
    label + "[\\s\\S]*?<\\/td>[\\s\\S]*?<td[^>]*>([\\s\\S]*?)(?:<\\/td>|<\\/table>|<tr[ >])",
    "i"
  );
  const m = normalizedHtml.match(pattern);
  return m ? stripHtml(m[1]) : null;
}

// "4 September 2026, 3:25 pm" — hora do SITE, que é hora de Brasília (mesma
// convenção usada em todo o bot original). Convertida com offset explícito
// -03:00 para não depender do fuso horário do processo que roda o servidor.
function parseSiteDateBRT(text: string | null): string | null {
  if (!text) return null;
  const m = text.match(
    /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(am|pm)/i
  );
  if (!m) return null;
  const [, day, monthName, year, hourRaw, minute, meridiem] = m;
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const month = months.indexOf(monthName.toLowerCase());
  if (month < 0) return null;
  let hour = parseInt(hourRaw, 10) % 12;
  if (meridiem.toLowerCase() === "pm") hour += 12;
  const iso = `${year}-${String(month + 1).padStart(2, "0")}-${day.padStart(2, "0")}T${String(hour).padStart(2, "0")}:${minute}:00-03:00`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// ── Character Info ──────────────────────────────────────────────────────────

export interface CharacterInfo {
  /** Nome canônico da ficha — pode diferir em caixa/espaço do que foi digitado. */
  name: string;
  formerName: string | null;
  level: number | null;
  vocation: string | null;
  residence: string | null;
  guild: string | null;
  /** ISO 8601, já convertido do horário de Brasília exibido pelo site. */
  lastLogin: string | null;
  /** "Premium Account" | "Free Account" (texto cru do site). */
  premium: string | null;
}

/**
 * Busca a ficha de um personagem. `null` = confirmado que não existe
 * ("Character X does not exist"). Lança erro para qualquer outra resposta
 * inconclusiva (desafio da Cloudflare, manutenção, etc.) — quem chama trata
 * isso como falha transitória, não como "não existe".
 */
export async function getCharacterInfo(
  name: string
): Promise<CharacterInfo | null> {
  const url = `${BASE_URL}/?subtopic=characters&name=${encodeURIComponent(name)}`;
  const html = await fetchHtml(url);

  if (!html.includes("Character Information")) {
    if (/does not exist/i.test(html)) return null;
    throw new Error("página do personagem inconclusiva (desafio/erro)");
  }

  let guild = extractTableValue(html, "Guild Membership:");
  if (guild) {
    const gm = guild.match(/of the\s+(.+)$/i);
    if (gm) guild = gm[1].trim();
  }

  // A linha "Name:" pode vir sem `</td>` de verdade (o valor emenda na bandeira
  // e no <br>) — lemos só o texto da célula até a primeira tag, igual ao bot
  // original, em vez do extractTableValue genérico.
  const nameM = html.match(/>\s*Name:\s*<\/td>\s*<td[^>]*>([^<]*)/i);
  const formerM = html.match(/Former Names?:\s*<\/td>\s*<td[^>]*>([^<]*)/i);
  const currentName = nameM ? stripHtml(nameM[1]).trim() : null;
  const formerName = formerM ? stripHtml(formerM[1]).trim() : null;

  const levelText = extractTableValue(html, "Level:");
  const level = levelText ? parseInt(levelText, 10) : null;

  return {
    name: currentName || name,
    formerName: formerName || null,
    level: Number.isFinite(level) ? level : null,
    vocation: extractTableValue(html, "Vocation:"),
    residence: extractTableValue(html, "Residence:"),
    guild: guild || null,
    lastLogin: parseSiteDateBRT(extractTableValue(html, "Last login:")),
    premium: extractTableValue(html, "Account Status:"),
  };
}

// ── Online Players (whoisonline) ────────────────────────────────────────────

export interface OnlinePlayer {
  name: string;
  level: number;
  vocation: string;
}

/**
 * HTML malformado do site (sem `</a>`):
 *   <A HREF="?subtopic=characters&name=Grzechu">Grzechu<TD WIDTH=10%>82</TD><TD WIDTH=20%>Royal Paladin</TD></TR>
 * O nome aparece no href; capturamos o 1º <td> (level) e o 2º (vocação) logo depois.
 */
interface OnlineSnapshot {
  total: number;
  players: OnlinePlayer[];
}

// Cache curto: o autocomplete de inimigos consulta isso a cada tecla digitada
// (com debounce no cliente), e não faz sentido baixar de novo a página de
// ~200KB do whoisonline várias vezes por segundo — o mesmo raciocínio do
// WHOISONLINE_TTL do bot original, só que bem mais folgado (aqui não é um
// painel em tempo real, é autocomplete de formulário).
const ONLINE_CACHE_TTL_MS = 5000;
let onlineCache: { ts: number; data: OnlineSnapshot } | null = null;

async function fetchOnlinePlayers(): Promise<OnlineSnapshot> {
  const html = await fetchHtml(`${BASE_URL}/?subtopic=whoisonline`);

  const countMatch = html.match(/(\d+)\s+players?\s+(?:are\s+)?online/i);
  const players: OnlinePlayer[] = [];
  const seen = new Set<string>();

  const re =
    /name=([^"&]+)(?:&[^"]*)?"\s*>[^<]*?<td[^>]*>\s*(\d+)\s*<\/td>\s*<td[^>]*>\s*([^<]+?)\s*<\/td>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const name = decodeURIComponent(m[1].replace(/\+/g, " ")).trim();
    const key = norm(name);
    if (!name || seen.has(key)) continue;

    const vocation = stripHtml(m[3]).trim();
    if (!/Knight|Paladin|Sorcerer|Druid|None/i.test(vocation)) continue; // filtra lixo de outras tabelas

    seen.add(key);
    players.push({ name, level: parseInt(m[2], 10), vocation });
  }

  return { total: countMatch ? parseInt(countMatch[1], 10) : players.length, players };
}

export async function getOnlinePlayers(): Promise<OnlineSnapshot> {
  if (onlineCache && Date.now() - onlineCache.ts < ONLINE_CACHE_TTL_MS) {
    return onlineCache.data;
  }
  const data = await fetchOnlinePlayers();
  onlineCache = { ts: Date.now(), data };
  return data;
}

/** Confere se um nome (já resolvido/canônico) está na lista online agora. */
export function isPlayerOnline(players: OnlinePlayer[], name: string): boolean {
  const target = norm(name);
  return players.some((p) => norm(p.name) === target);
}

// ── Elenco de uma guild (?subtopic=guilds&action=show&guild=<id>) ──────────
// Página bem-formada (ao contrário do whoisonline): uma linha por membro —
// Rank | Nome (link) [+ "(Título)" opcional] | Vocação | Level | Status.
// O status aqui já vem pronto (`<span class='playerOnline'|'playerOffline'>`),
// sem precisar cruzar com o whoisonline.

export interface GuildRosterMember {
  rank: string;
  name: string;
  vocation: string;
  level: number;
  online: boolean;
}

export interface GuildRoster {
  name: string;
  logoUrl: string;
  members: GuildRosterMember[];
}

/** `null` = guild não existe (id inválido/removida) — página sem o `<h1>` do nome. */
export async function getGuildRoster(sourceGuildId: number): Promise<GuildRoster | null> {
  const html = await fetchHtml(
    `${BASE_URL}/?subtopic=guilds&action=show&guild=${sourceGuildId}`
  );

  const nameMatch = html.match(/<h1>([^<]+)<\/h1>/i);
  if (!nameMatch) return null;

  const rowRe =
    /<td>([^<]*)<\/td>\s*<td><a href="\?subtopic=characters&name=[^"]+"><b>([^<]+)<\/b><\/a>[\s\S]*?<\/td>\s*<td>([^<]*)<\/td>\s*<td>(\d+)<\/td>\s*<td><span class='player(Online|Offline)'>/gi;

  const members: GuildRosterMember[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(html)) !== null) {
    const [, rank, name, vocation, levelText, onlineText] = m;
    members.push({
      rank: stripHtml(rank),
      name: stripHtml(name),
      vocation: stripHtml(vocation),
      level: parseInt(levelText, 10),
      online: onlineText.toLowerCase() === "online",
    });
  }

  return {
    name: stripHtml(nameMatch[1]),
    logoUrl: `${BASE_URL}/guild_image.php?id=${sourceGuildId}`,
    members,
  };
}

/**
 * Aceita tanto a URL completa (`.../?subtopic=guilds&action=show&guild=897`)
 * quanto só o número do id. `null` = não deu pra reconhecer nenhum dos dois.
 */
export function parseGuildIdFromInput(input: string): number | null {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const id = url.searchParams.get("guild");
    if (id && /^\d+$/.test(id)) return parseInt(id, 10);
  } catch {
    // não é uma URL válida — segue pro fallback abaixo
  }
  return /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : null;
}

// ── Busca de personagens por nome parcial (TODOS, online ou não) ───────────
// O miracle74.com só busca por nome EXATO — mas o OpenTibia Info alimenta o
// autocomplete de busca dele (widget "Search Player" em toda página do site)
// com um endpoint que varre o CENSO inteiro do servidor, achado inspecionando
// o `custom.js` do site: POST /count/name/<server> → JSON com os nomes que
// contêm o termo (até 25, ordenados alfabeticamente). Não precisa do cookie
// de seleção de servidor (o servidor já vai na URL).
const OTI_SEARCH_SERVER_SLUG = "miracle";

async function searchCensusPlayerNames(query: string): Promise<string[]> {
  const res = await fetch(`${OTI_URL}/count/name/${OTI_SEARCH_SERVER_SLUG}`, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `name=${encodeURIComponent(query)}`,
  });
  if (!res.ok) return [];

  const data: unknown = await res.json().catch(() => null);
  return Array.isArray(data) ? data.filter((n): n is string => typeof n === "string") : [];
}

export interface PlayerSuggestion {
  name: string;
  /** true quando o nome também aparece no whoisonline agora. */
  online: boolean;
}

/**
 * Sugestões de personagens pra autocomplete — TODOS que o OpenTibia Info já
 * viu (online ou não), com o whoisonline do miracle74.com só pra marcar quem
 * está online agora. Se o OTI falhar (fora do ar), ainda sobra a busca entre
 * quem está online — o formulário nunca fica cego, só com menos opções.
 */
export async function searchPlayerNames(
  query: string,
  limit = 10
): Promise<PlayerSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [censusNames, online] = await Promise.all([
    searchCensusPlayerNames(q).catch(() => [] as string[]),
    getOnlinePlayers().catch(() => ({ total: 0, players: [] as OnlinePlayer[] })),
  ]);

  const onlineNames = new Set(online.players.map((p) => norm(p.name)));
  const onlineMatches = online.players.filter((p) => norm(p.name).includes(norm(q)));

  const byKey = new Map<string, string>(); // norm(nome) -> nome como veio da fonte
  for (const name of [...censusNames, ...onlineMatches.map((p) => p.name)]) {
    const key = norm(name);
    if (!byKey.has(key)) byKey.set(key, name);
  }

  return [...byKey.entries()]
    .slice(0, limit)
    .map(([key, name]) => ({ name, online: onlineNames.has(key) }));
}

// ── OpenTibia Info: skills completas ────────────────────────────────────────
// O site guarda o servidor escolhido num cookie (`server=<hash>~miracle`); sem
// ele, /stats/* responde com outro servidor padrão. Selecionamos uma vez e
// cacheamos o cookie pelo tempo de vida do processo (ele dura semanas no site).

let otiCookie: string | null = null;
let otiCookiePromise: Promise<string | null> | null = null;

async function ensureOtiCookie(): Promise<string | null> {
  if (otiCookie) return otiCookie;
  if (otiCookiePromise) return otiCookiePromise;

  otiCookiePromise = (async () => {
    try {
      const res = await fetch(`${OTI_URL}/index/server/miracle`, {
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { "User-Agent": USER_AGENT },
      });
      const cookies = res.headers.getSetCookie().map((c) => c.split(";")[0]);
      if (cookies.some((c) => c.startsWith("server="))) {
        otiCookie = cookies.join("; ");
      }
    } catch {
      // Sem cookie, getOtiSkills simplesmente não traz nada — não é fatal.
    }
    return otiCookie;
  })();

  const result = await otiCookiePromise;
  otiCookiePromise = null;
  return result;
}

export interface CharacterSkill {
  label: string;
  value: number;
}

function parseOtiSkills(html: string): CharacterSkill[] {
  // Cabeçalho: Magic level | Fist | Melee | Distance | Shielding | Fishing.
  // A célula de Melee vem combinada: "Cl:25 Sw:57 Ax:67".
  const row = html.match(
    /Magic level<\/th>[\s\S]*?Fishing<\/th>\s*<\/tr>\s*<tr>([\s\S]*?)<\/tr>/i
  );
  if (!row) return [];

  const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) =>
    stripHtml(c[1])
  );
  const skills: CharacterSkill[] = [];
  const push = (label: string, raw: string | undefined) => {
    const value = parseInt((String(raw).match(/\d+/) || [])[0] ?? "", 10);
    if (Number.isFinite(value) && value > 0) skills.push({ label, value });
  };

  push("Magic Level", cells[0]);
  push("Fist", cells[1]);
  const melee = cells[2] || "";
  const cl = melee.match(/Cl:\s*(\d+)/i);
  if (cl) push("Club", cl[1]);
  const sw = melee.match(/Sw:\s*(\d+)/i);
  if (sw) push("Sword", sw[1]);
  const ax = melee.match(/Ax:\s*(\d+)/i);
  if (ax) push("Axe", ax[1]);
  push("Distance", cells[3]);
  push("Shielding", cells[4]);
  push("Fishing", cells[5]);

  return skills;
}

const toInt = (s: string) => parseInt(s.replace(/,/g, ""), 10);

// "2026-08-31 23:55:13" — hora do SITE (mesma convenção da ficha do
// miracle74.com: hora local = horário de Brasília). Convertida com offset
// explícito -03:00 pra não depender do fuso do processo.
function isoFromServerLocal(dateTimeText: string): string | null {
  const m = dateTimeText.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})$/);
  if (!m) return null;
  const date = new Date(`${m[1]}T${m[2]}-03:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export interface OtiExpEntry {
  /** ISO 8601 — o snapshot diário de XP do OTI (hora do servidor). */
  recordedAt: string;
  level: number | null;
  exp: number | null;
  /** Ganho do dia (pode ser negativo — morte com perda de XP/level). */
  gain: number | null;
}

// Cada linha ≈ [Data | Level (+delta opcional) | Exp total (+delta opcional)].
// O nº de células varia (2 a 4) conforme houve ou não mudança de level/exp
// naquele dia, então a extração é por FORMA do valor, não por posição fixa —
// mesma ideia da ficha do personagem (armadilha de HTML sem estrutura fixa).
function parseOtiExpHistory(html: string): OtiExpEntry[] {
  const startIdx = html.search(/Exp history from last 7 days/i);
  if (startIdx < 0) return [];
  let section = html.slice(startIdx);
  const endIdx = section.search(/Time online|<\/table>/i);
  if (endIdx > 0) section = section.slice(0, endIdx);

  const rows = [...section.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  const entries: OtiExpEntry[] = [];

  for (const row of rows) {
    const dateMatch = row.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/);
    if (!dateMatch) continue; // linha de cabeçalho

    // Ganhos vêm como "+N" (pode haver "+1" de level e "+122.262" de xp — o
    // maior é o de xp). Perdas (morte com penalidade) não têm "+"; ficam de
    // fora daqui e são recalculadas abaixo pela diferença com o dia seguinte.
    const gains = [...row.matchAll(/\+\s*([\d,]+)/g)].map((g) => toInt(g[1]));
    const gain = gains.length ? Math.max(...gains) : null;

    // Exp total = maior número de 5+ dígitos que não é um dos ganhos acima
    // (exclui o level e datas/anos).
    const nums = [...row.matchAll(/>\s*([\d][\d,]{2,})\s*</g)]
      .map((n) => toInt(n[1]))
      .filter((n) => !gains.includes(n) && n > 9999);
    const exp = nums.length ? Math.max(...nums) : null;

    // Level = primeiro número puro de até 4 dígitos que não é um ganho.
    const levels = [...row.matchAll(/>\s*(\d{1,4})\s*</g)]
      .map((n) => parseInt(n[1], 10))
      .filter((n) => !gains.includes(n));
    const level = levels.length ? levels[0] : null;

    const recordedAt = isoFromServerLocal(dateMatch[0]);
    if (!recordedAt) continue;
    entries.push({ recordedAt, level, exp, gain });
  }

  // Preenche o ganho dos dias sem "+N" pela diferença de exp com o dia
  // seguinte (mostra o valor negativo real em vez de ficar null).
  for (let i = 0; i < entries.length; i++) {
    const cur = entries[i];
    const next = entries[i + 1];
    if (cur.gain == null && cur.exp != null && next?.exp != null) {
      cur.gain = cur.exp - next.exp;
    }
  }

  return entries;
}

export interface OtiDeathEntry {
  /** ISO 8601 — hora do servidor (ver `isoFromServerLocal`). */
  diedAt: string;
  level: number | null;
  /** Nomes dos matadores separados por vírgula, ou a causa (ex.: "field
   * item", nome do monstro) quando não foi morte por outro jogador. */
  killedBy: string;
}

// "Last 20 deaths": [Data | Level | Via]. "Via" é `<nick>Nome</nick>` (pode
// ter vários, separados por vírgula) pra PvP, ou texto solto (monstro/causa)
// caso contrário — únicas duas formas que o site usa.
function parseOtiDeaths(html: string): OtiDeathEntry[] {
  const startIdx = html.search(/Last 20 deaths/i);
  if (startIdx < 0) return [];
  const nextSectionIdx = html.indexOf("Last 10 kills", startIdx);
  const section = html.slice(startIdx, nextSectionIdx > 0 ? nextSectionIdx : startIdx + 20000);

  const rowRe =
    /<tr>\s*<td class="m">(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})<\/td>\s*<td class="m">(\d+)<\/td>\s*<td colspan="4" class="m">([\s\S]*?)<\/td>\s*<\/tr>/g;

  const deaths: OtiDeathEntry[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(section)) !== null) {
    const [, dateText, levelText, killerHtml] = m;
    const diedAt = isoFromServerLocal(dateText);
    if (!diedAt) continue;

    const nicks = [...killerHtml.matchAll(/<nick>([^<]+)<\/nick>/g)].map((n) => n[1]);
    const killedBy = nicks.length > 0 ? nicks.join(", ") : stripHtml(killerHtml);

    deaths.push({ diedAt, level: parseInt(levelText, 10), killedBy });
  }
  return deaths;
}

export interface OtiPlayerStats {
  skills: CharacterSkill[];
  expHistory: OtiExpEntry[];
  deaths: OtiDeathEntry[];
}

const EMPTY_OTI_STATS: OtiPlayerStats = { skills: [], expHistory: [], deaths: [] };

/**
 * Skills completas, histórico de XP (últimos 7 dias) e últimas mortes de um
 * personagem — tudo numa página só do OpenTibia Info (`/stats/player/{nome}`),
 * fonte que o site oficial do Miracle não tem (a ficha lá só traz a lista de
 * mortes RECENTES do personagem, sem histórico de XP nem skills completas;
 * o índice de highscores só guarda o top 3 de cada skill). Nunca lança — é
 * um extra da ficha; se o OTI estiver fora do ar, devolve tudo vazio.
 */
export async function getOtiPlayerStats(name: string): Promise<OtiPlayerStats> {
  try {
    const cookie = await ensureOtiCookie();
    const html = await fetchHtml(
      `${OTI_URL}/stats/player/${encodeURIComponent(name)}`,
      { cookie }
    );
    return {
      skills: parseOtiSkills(html),
      expHistory: parseOtiExpHistory(html),
      deaths: parseOtiDeaths(html),
    };
  } catch {
    return EMPTY_OTI_STATS;
  }
}
