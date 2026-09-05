import Link from "next/link";
import { ImageIcon } from "lucide-react";
import type { Enemy, Role } from "@/generated/prisma/client";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/atoms/Table";
import { PlayerStatusBadge } from "@/components/molecules/PlayerStatusBadge";
import { DeleteRowButton } from "@/components/molecules/DeleteRowButton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { formatDate } from "@/lib/utils";
import { Swords } from "lucide-react";

type EnemyWithCount = Enemy & { _count: { evidence: number } };

export function EnemyTable({
  enemies,
  role,
}: {
  enemies: EnemyWithCount[];
  role: Role;
}) {
  if (enemies.length === 0) {
    return (
      <EmptyState
        icon={Swords}
        title="Nenhum inimigo cadastrado"
        description="Cadastre um inimigo acima para começar a monitorá-lo."
      />
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Inimigo</Th>
          <Th>Nível</Th>
          <Th>Vocação</Th>
          <Th>Guild</Th>
          <Th>Residência</Th>
          <Th>Cadastrado em</Th>
          <Th>Status</Th>
          {role === "ADMIN" && <Th />}
        </Tr>
      </Thead>
      <Tbody>
        {enemies.map((enemy) => (
          <Tr key={enemy.id}>
            <Td>
              <Link
                href={`/enemies/${enemy.id}`}
                className="flex items-center gap-2 font-medium text-paper hover:text-secondary-light"
              >
                {enemy.name}
                {enemy._count.evidence > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-normal text-paper/40">
                    <ImageIcon className="size-3.5" />
                    {enemy._count.evidence}
                  </span>
                )}
              </Link>
            </Td>
            <Td>{enemy.level}</Td>
            <Td className="text-paper/70">{enemy.vocation ?? "—"}</Td>
            <Td className="text-paper/70">{enemy.guild ?? "—"}</Td>
            <Td className="text-paper/70">{enemy.residence ?? "—"}</Td>
            <Td className="text-paper/50">{formatDate(enemy.createdAt)}</Td>
            <Td>
              <PlayerStatusBadge status={enemy.status} />
            </Td>
            {role === "ADMIN" && (
              <Td>
                <DeleteRowButton
                  endpoint="/api/enemies"
                  id={enemy.id}
                  title="Remover inimigo"
                  confirmMessage={`Tem certeza que deseja deletar o personagem ${enemy.name} da lista de inimigos?`}
                />
              </Td>
            )}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
