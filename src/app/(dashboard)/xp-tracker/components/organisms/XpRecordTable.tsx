import type { Enemy, XpRecord } from "@/generated/prisma/client";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/atoms/Table";
import { DeleteRowButton } from "@/components/molecules/DeleteRowButton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { formatDate } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { XpAmount } from "@/app/(dashboard)/xp-tracker/components/atoms/XpAmount";

type XpRecordWithRelations = XpRecord & { enemy: Enemy };

export function XpRecordTable({ records }: { records: XpRecordWithRelations[] }) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Nenhum registro de XP ainda"
        description="Registre acima o level/XP observado de um inimigo."
      />
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Inimigo</Th>
          <Th>Level</Th>
          <Th>XP ganho</Th>
          <Th>Observação</Th>
          <Th>Quando</Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {records.map((record) => (
          <Tr key={record.id}>
            <Td>
              <Link
                href={`/enemies/${record.enemy.id}`}
                className="font-medium text-paper hover:text-secondary-light"
              >
                {record.enemy.name}
              </Link>
            </Td>
            <Td>{record.level}</Td>
            <Td>{record.xpGained ? <XpAmount value={record.xpGained} /> : "—"}</Td>
            <Td className="text-paper/70">{record.note ?? "—"}</Td>
            <Td className="text-paper/50">{formatDate(record.recordedAt)}</Td>
            <Td>
              <DeleteRowButton endpoint="/api/xp-records" id={record.id} />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
