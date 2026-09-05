import { type LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
      <Icon className="size-8 text-paper/30" />
      <p className="text-sm font-medium text-paper/70">{title}</p>
      {description && (
        <p className="max-w-sm text-xs text-paper/40">{description}</p>
      )}
    </div>
  );
}
