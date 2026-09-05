import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { unauthorizedResponse, forbiddenResponse } from "@/lib/api-utils";
import { searchPlayerNames } from "@/lib/miracle-scraper";

// POST /api/enemies/search — autocomplete do formulário de inimigo: sugere
// personagens cujo nome contém o termo digitado, ONLINE ou não. O
// miracle74.com só busca por nome exato, então a lista vem do censo do
// OpenTibia Info (todo nome que ele já viu no servidor), cruzado com o
// whoisonline só para marcar quem está online agora (ver `searchPlayerNames`
// em miracle-scraper.ts). O resto do formulário é preenchido de verdade em
// /api/enemies/lookup, quando o usuário escolhe uma sugestão.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  if (session.user.role !== "ADMIN") return forbiddenResponse();

  const body = await request.json().catch(() => null);
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await searchPlayerNames(query);
    return NextResponse.json({ suggestions });
  } catch (err) {
    // Autocomplete é só um extra sobre o formulário manual — se o site cair,
    // devolve vazio em vez de quebrar a digitação do usuário.
    console.error("[EnemySearch]", err);
    return NextResponse.json({ suggestions: [] });
  }
}
