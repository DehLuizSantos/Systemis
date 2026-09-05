"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Radar,
  Swords,
  TrendingUp,
  Skull,
  Gem,
  LayoutDashboard,
  Users,
  Eye,
  UserCheck,
} from "lucide-react";
import type { Role } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { SERVER_LABEL } from "@/lib/constants";
import { SignOutButton } from "@/components/molecules/SignOutButton";

const NAV_ITEMS = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/player-scan", label: "Player Scan", icon: Radar },
  { href: "/enemies", label: "Lista de Inimigos", icon: Swords },
  { href: "/enemies-online", label: "Inimigos Online", icon: Eye },
  { href: "/allies-online", label: "Aliados Online", icon: UserCheck },
  { href: "/xp-tracker", label: "XP Tracker", icon: TrendingUp },
  { href: "/last-death", label: "Last Death", icon: Skull },
  { href: "/loot", label: "Loot", icon: Gem },
];

const ADMIN_NAV_ITEMS = [
  { href: "/users", label: "Usuários", icon: Users },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = role === "ADMIN" ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface-muted md:flex">
      <div className="flex h-16 flex-col justify-center px-5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            SB
          </div>
          <span className="font-semibold tracking-tight text-paper">
            Synthesis Bot
          </span>
        </div>
        <span className="mt-0.5 text-[11px] text-paper/40">{SERVER_LABEL}</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map(({ href, label, icon: Icon }) => {
          // `startsWith` puro casaria "/enemies-online" com o item
          // "/enemies" também (mesmo prefixo de texto) — exige a fronteira
          // de "/" pra só ativar em sub-rotas de verdade (ex.: /enemies/id).
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-primary-light"
                  : "text-paper/60 hover:bg-surface-hover hover:text-paper"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <SignOutButton />
      </div>
    </aside>
  );
}
