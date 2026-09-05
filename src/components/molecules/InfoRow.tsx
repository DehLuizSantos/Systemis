import { type ReactNode } from "react";

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2.5 last:border-0">
      <span className="flex items-center gap-2 text-sm text-paper/60">
        <span aria-hidden>{icon}</span>
        {label}
      </span>
      <span className="text-sm font-medium text-paper">{value}</span>
    </div>
  );
}
