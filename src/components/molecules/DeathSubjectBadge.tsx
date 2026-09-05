import type { DeathSubject } from "@/generated/prisma/client";
import { Badge } from "@/components/atoms/Badge";

export function DeathSubjectBadge({ subject }: { subject: DeathSubject }) {
  return subject === "ENEMY" ? (
    <Badge tone="danger">Inimigo</Badge>
  ) : (
    <Badge tone="secondary">Aliado</Badge>
  );
}
