"use client";

import { signOut } from "next-auth/react";

/**
 * Detecta a resposta `{ error, code: "STALE_SESSION" }` de `staleSessionResponse`
 * (ver `api-utils.ts`) — sessão JWT com um `user.id` que não existe mais no
 * banco. Quando é o caso, desloga (limpa o cookie inválido) e manda pro login
 * com o aviso; devolve `true` para o chamador não seguir tentando mostrar um
 * erro inline por cima do redirecionamento.
 */
export async function handleStaleSession(data: unknown): Promise<boolean> {
  const code = data && typeof data === "object" ? (data as { code?: unknown }).code : undefined;
  if (code !== "STALE_SESSION") return false;

  await signOut({ callbackUrl: "/login?reason=session-expired" });
  return true;
}
