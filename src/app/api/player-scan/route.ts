import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { unauthorizedResponse } from "@/lib/api-utils";
import { scanPlayer } from "@/lib/player-scan";

// POST /api/player-scan — busca um personagem no servidor. Faz scraping ao
// vivo de miracle74.com (ficha + status online) e opentibia.info (skills
// completas) — porta de src/modules/playerScan.js do bot de Discord original.
// A análise de "prováveis alts" de lá ainda não existe aqui (depende de um
// histórico de sessão acumulado por um worker que este projeto não tem
// ainda); `alts` sempre volta vazio por enquanto.
export async function POST(request: NextRequest) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json(
      { error: "Informe o nome do personagem" },
      { status: 400 }
    );
  }

  try {
    const result = await scanPlayer(name);

    if (!result) {
      return NextResponse.json(
        { error: `${name} não existe no Miracle` },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[PlayerScan]", err);
    return NextResponse.json(
      { error: "Não foi possível buscar dados no site agora. Tente novamente." },
      { status: 502 }
    );
  }
}
