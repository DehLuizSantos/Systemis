import { NextResponse } from "next/server";

/** Standard 401 JSON response for unauthenticated API requests. */
export function unauthorizedResponse() {
  return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
}

/** Standard 403 JSON response for authenticated but unauthorized (non-admin) requests. */
export function forbiddenResponse(message = "Apenas administradores podem fazer isso") {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * A sessão é JWT (ver `auth.ts`) e nunca é revalidada contra o banco depois
 * do login — se o usuário logado for apagado/recriado nesse meio-tempo (ex.:
 * banco resetado/reseedado), `session.user.id` aponta pra um id que não
 * existe mais. Uma gravação que usa esse id como chave estrangeira
 * (`createdById`, `scannedById`, ...) falha com `P2003` do Prisma — é esse
 * erro que os chamadores devem detectar e responder com isto. `code` é o
 * campo que o cliente usa pra decidir a ação (deslogar + mandar pro login),
 * em vez de tentar casar o texto de `error`.
 */
export function staleSessionResponse() {
  return NextResponse.json(
    {
      error:
        "Sua sessão expirou (o usuário logado não existe mais no banco). Faça login novamente.",
      code: "STALE_SESSION",
    },
    { status: 401 }
  );
}
