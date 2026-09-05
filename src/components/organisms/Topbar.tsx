import { Avatar } from "@/components/atoms/Avatar";
import { RefreshButton } from "@/components/molecules/RefreshButton";

export function Topbar({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const name = user.name || user.email || "Usuário";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface-muted px-4 md:px-6">
      <div className="md:hidden font-semibold text-paper">Synthesis Bot</div>
      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <RefreshButton />
        <div className="text-right">
          <p className="text-sm font-medium leading-tight text-paper">{name}</p>
          {user.email && (
            <p className="text-xs leading-tight text-paper/50">{user.email}</p>
          )}
        </div>
        <Avatar alt={name} />
      </div>
    </header>
  );
}
