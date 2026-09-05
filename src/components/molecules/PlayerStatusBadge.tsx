import type { PlayerStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/atoms/Badge";

const config: Record<PlayerStatus, { label: string; tone: "success" | "neutral" }> = {
  ONLINE: { label: "Online", tone: "success" },
  OFFLINE: { label: "Offline", tone: "neutral" },
};

export function PlayerStatusBadge({ status }: { status: PlayerStatus }) {
  const { label, tone } = config[status];
  return (
    <Badge tone={tone}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}
