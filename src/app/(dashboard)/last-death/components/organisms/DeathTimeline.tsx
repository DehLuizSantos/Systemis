import type { DeathEvent, Enemy, Player } from "@/generated/prisma/client";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/atoms/Table";
import { DeathSubjectBadge } from "@/components/molecules/DeathSubjectBadge";
import { DeleteRowButton } from "@/components/molecules/DeleteRowButton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { formatDate } from "@/lib/utils";
import { Skull } from "lucide-react";

type DeathEventWithRelations = DeathEvent & {
  enemy: Enemy | null;
  player: Player | null;
};

export function DeathTimeline({ deaths }: { deaths: DeathEventWithRelations[] }) {
  if (deaths.length === 0) {
    return (
      <EmptyState
        icon={Skull}
        title="Nenhuma morte registrada"
        description="Registre acima a última morte de um inimigo ou aliado."
      />
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Tipo</Th>
          <Th>Nome</Th>
          <Th>Morto por</Th>
          <Th>Causa</Th>
          <Th>Local</Th>
          <Th>Quando</Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {deaths.map((death) => (
          <Tr key={death.id}>
            <Td>
              <DeathSubjectBadge subject={death.subjectType} />
            </Td>
            <Td className="font-medium text-paper">
              {death.enemy?.name ?? death.player?.name ?? "—"}
            </Td>
            <Td className="text-paper/70">{death.killedBy ?? "—"}</Td>
            <Td className="text-paper/70">{death.cause ?? "—"}</Td>
            <Td className="text-paper/70">{death.location ?? "—"}</Td>
            <Td className="text-paper/50">{formatDate(death.diedAt)}</Td>
            <Td>
              <DeleteRowButton endpoint="/api/deaths" id={death.id} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
