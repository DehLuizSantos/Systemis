import { type ReactNode } from "react";
import type { Role } from "@/generated/prisma/client";
import { Sidebar } from "@/components/organisms/Sidebar";
import { Topbar } from "@/components/organisms/Topbar";

/**
 * App shell shared by every dashboard page (sidebar + topbar + scroll area).
 * Each feature page is responsible for its own heading via `PageHeader`.
 */
export function DashboardTemplate({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: Role };
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
