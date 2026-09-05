import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { unauthorizedResponse, forbiddenResponse, staleSessionResponse } from "@/lib/api-utils";
import { createEnemySchema } from "@/lib/validations/enemy";
import { saveEvidenceFiles } from "@/lib/uploads";
import { MAX_EVIDENCE_FILES } from "@/lib/constants";
import { syncEnemyHistoryFromOti } from "@/lib/enemy-history-sync";

// GET /api/enemies?q=nome — lista de inimigos (qualquer usuário autenticado).
export async function GET(request: NextRequest) {
  if (!(await auth())?.user) return unauthorizedResponse();

  const search = request.nextUrl.searchParams.get("q")?.trim();
  const enemies = await prisma.enemy.findMany({
    where: search ? { name: { contains: search } } : undefined,
    include: { _count: { select: { evidence: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(enemies);
}

// POST /api/enemies — cadastra um inimigo (somente admin). Multipart, pois
// aceita imagens de prova anexadas junto com os demais campos.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return unauthorizedResponse();
  if (session.user.role !== "ADMIN") return forbiddenResponse();

  const formData = await request.formData();
  const payload = Object.fromEntries(
    Array.from(formData.entries()).filter(([key]) => key !== "evidence")
  );
  const parsed = createEnemySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Impede duplicata: mesmo nome (comparado sem diferenciar caixa) já
  // cadastrado. O autocomplete do formulário sempre resolve pro nome
  // CANÔNICO da ficha, então isso pega o caso real (tentar cadastrar quem já
  // está na lista) sem esbarrar em variações de escrita legítimas de nomes
  // diferentes. Mesmo padrão de match usado em /api/loot-search.
  const candidates = await prisma.enemy.findMany({
    where: { name: { contains: parsed.data.name } },
    select: { id: true, name: true },
  });
  const duplicate = candidates.find(
    (c) => c.name.toLowerCase() === parsed.data.name.toLowerCase()
  );
  if (duplicate) {
    return NextResponse.json(
      {
        error: `${parsed.data.name} já está cadastrado na lista de inimigos.`,
        code: "DUPLICATE_ENEMY",
        enemyId: duplicate.id,
      },
      { status: 409 }
    );
  }

  const files = formData.getAll("evidence").filter((v): v is File => v instanceof File);
  if (files.length > MAX_EVIDENCE_FILES) {
    return NextResponse.json(
      { error: `No máximo ${MAX_EVIDENCE_FILES} imagens de prova por inimigo.` },
      { status: 400 }
    );
  }
  const evidenceUrls = await saveEvidenceFiles(files);

  try {
    const enemy = await prisma.enemy.create({
      data: {
        ...parsed.data,
        createdById: session.user.id,
        evidence: evidenceUrls.length
          ? { create: evidenceUrls.map((url) => ({ url })) }
          : undefined,
      },
      include: { evidence: true },
    });

    // Vincula ao histórico do OpenTibia Info assim que o inimigo é
    // cadastrado — mesma sincronização do botão manual nos detalhes, só que
    // já roda de cara. Uma falha aqui NÃO desfaz o cadastro (o personagem já
    // existe; o botão "Sincronizar" continua disponível pra tentar de novo).
    let historySync: { xpImported: number; deathsImported: number } | null = null;
    try {
      historySync = await syncEnemyHistoryFromOti(enemy.id, enemy.name);
    } catch (err) {
      console.error("[EnemyHistorySync] falha ao vincular no cadastro:", err);
    }

    return NextResponse.json({ ...enemy, historySync }, { status: 201 });
  } catch (err) {
    // P2003 aqui é quase sempre `createdById` apontando pra um usuário que
    // não existe mais (ex.: o banco foi resetado/reseedado depois do login) —
    // a sessão JWT guarda o id de quando o usuário logou e nunca é
    // revalidada contra o banco, então ela pode sobreviver ao usuário. Sem
    // isto, o Prisma jogava um 500 cru e a mensagem genérica do formulário
    // ("confira os dados") apontava pro lugar errado.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return staleSessionResponse();
    }
    throw err;
  }
}
