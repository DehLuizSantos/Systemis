"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

/** Estilizado como os demais links da Sidebar (ver `NAV_ITEMS` em Sidebar.tsx) — vive no
 * final da lista de navegação, não mais no header. */
export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-paper/60 transition-colors hover:bg-surface-hover hover:text-paper"
    >
      <LogOut className="size-4" />
      Sair
    </button>
  );
}
