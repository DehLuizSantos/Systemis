import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "secondary";
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4">
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          tone === "primary"
            ? "bg-primary/15 text-primary-light"
            : "bg-secondary/15 text-secondary-light"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs text-paper/60">{label}</p>
        <p className="text-xl font-semibold text-paper">{value}</p>
      </div>
    </div>
  );
}
