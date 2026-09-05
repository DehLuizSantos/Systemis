import type { Role } from "@/generated/prisma/client";
import { Badge } from "@/components/atoms/Badge";

export function RoleBadge({ role }: { role: Role }) {
  return role === "ADMIN" ? (
    <Badge tone="primary">Admin</Badge>
  ) : (
    <Badge tone="neutral">Membro</Badge>
  );
}
