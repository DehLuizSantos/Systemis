import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "success" | "danger" | "warning" | "neutral";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/15 text-primary-light border-primary/30",
  secondary: "bg-secondary/15 text-secondary-light border-secondary/30",
  success: "bg-success/15 text-primary-light border-success/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  neutral: "bg-surface-hover text-paper/70 border-border",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
