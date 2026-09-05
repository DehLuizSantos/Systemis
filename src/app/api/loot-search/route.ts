import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { unauthorizedResponse } from "@/lib/api-utils";
import { getRashidToday, isRashid } from "@/lib/rashid";

// POST /api/loot-search — busca um item do catálogo (nome, peso, e a lista
// de NPCs que compram o item, do melhor preço para o pior).
//
// O Rashid é um NPC viajante: a cidade salva no catálogo (scrapeada de
// miracle74.com) é a que aparece FIXA na ficha do item, não onde ele está
// hoje de fato. Por isso sobrescrevemos a cidade dele aqui, em runtime, com
// a mesma lógica do bot de Discord original (ver `src/lib/rashid.ts`).
export async function POST(request: NextRequest) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const query = typeof body?.name === "string" ? body.name.trim() : "";

  if (!query) {
    return NextResponse.json(
      { error: "Informe o nome do item" },
      { status: 400 }
    );
  }

  const candidates = await prisma.item.findMany({
    where: { name: { contains: query } },
    include: { npcPrices: true },
    take: 20,
  });

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Nenhum item encontrado com esse nome" },
      { status: 404 }
    );
  }

  // Prefere um match exato (case-insensitive); senão, o primeiro resultado.
  const item =
    candidates.find((c) => c.name.toLowerCase() === query.toLowerCase()) ??
    candidates[0];

  const rashidToday = getRashidToday();

  const npcPrices = [...item.npcPrices]
    .sort((a, b) => b.price - a.price)
    .map((npc) => ({
      ...npc,
      isRashid: isRashid(npc.npcName),
      // A cidade do dia manda: sobrescreve a estática do catálogo.
      city: isRashid(npc.npcName) ? rashidToday.city : npc.city,
    }));

  return NextResponse.json({
    name: item.name,
    category: item.category,
    weight: item.weight,
    attack: item.attack,
    defense: item.defense,
    npcPrices,
    bestPrice: npcPrices[0] ?? null,
    // Só é relevante mostrar quando o item tem o Rashid entre os compradores.
    rashid: npcPrices.some((npc) => npc.isRashid) ? rashidToday : null,
  });
}
