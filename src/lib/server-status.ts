const STATUS_URL = "https://miracle74.com/";

// The homepage renders `<span class="playersNumber">823 Players Online</span>`
// in its right-column status box. There's no public API, so we scrape that
// span and pull the leading number out of it.
const PLAYERS_NUMBER_RE = /class="playersNumber">\s*([\d.,]+)\s*Players Online/i;

export interface ServerStatus {
  playersOnline: number | null;
  fetchedAt: string;
}

/**
 * Live player count for the actual game server, scraped from miracle74.com.
 * Returns `playersOnline: null` (never throws) if the site is unreachable or
 * changes its markup — callers should render a "indisponível" fallback.
 */
export async function getServerStatus(): Promise<ServerStatus> {
  try {
    const res = await fetch(STATUS_URL, {
      // Always hit the live site — this is exactly the data the "Atualizar
      // dados" button exists to refresh.
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SynthesisBot/1.0; +https://miracle74.com/)",
      },
    });

    if (!res.ok) {
      return { playersOnline: null, fetchedAt: new Date().toISOString() };
    }

    const html = await res.text();
    const match = html.match(PLAYERS_NUMBER_RE);
    const playersOnline = match
      ? Number(match[1].replace(/[.,]/g, ""))
      : null;

    return {
      playersOnline: Number.isFinite(playersOnline) ? playersOnline : null,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return { playersOnline: null, fetchedAt: new Date().toISOString() };
  }
}
