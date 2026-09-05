import type { DeathEvent, XpRecord } from "@/generated/prisma/client";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/atoms/Table";
import { EmptyState } from "@/components/molecules/EmptyState";
import { SyncHistoryButton } from "@/app/(dashboard)/enemies/[id]/components/molecules/SyncHistoryButton";
import { formatDate } from "@/lib/utils";
import { TrendingUp, Skull } from "lucide-react";

export function EnemyHistoryList({
  enemyId,
  xpRecords,
  deathEvents,
}: {
  enemyId: string;
  xpRecords: XpRecord[];
  deathEvents: DeathEvent[];
}) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-paper">
          Histórico (XP e mortes)
        </h3>
        <SyncHistoryButton enemyId={enemyId} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-paper/50">
            <TrendingUp className="size-3.5" /> Histórico de XP
          </p>
          {xpRecords.length === 0 ? (
            <EmptyState icon={TrendingUp} title="Nenhum registro ainda" />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Data</Th>
                  <Th>Level</Th>
                  <Th>XP ganho</Th>
                </Tr>
              </Thead>
              <Tbody>
                {xpRecords.map((record) => (
                  <Tr key={record.id}>
                    <Td className="text-paper/50">{formatDate(record.recordedAt)}</Td>
                    <Td>{record.level}</Td>
                    <Td
                      className={
                        record.xpGained != null && record.xpGained < 0
                          ? "text-danger"
                          : undefined
                      }
                    >
                      {record.xpGained != null
                        ? `${record.xpGained > 0 ? "+" : ""}${record.xpGained.toLocaleString("pt-BR")}`
                        : "—"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-paper/50">
            <Skull className="size-3.5" /> Histórico de mortes
          </p>
          {deathEvents.length === 0 ? (
            <EmptyState icon={Skull} title="Nenhuma morte registrada" />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Data</Th>
                  <Th>Level</Th>
                  <Th>Morto por</Th>
                </Tr>
              </Thead>
              <Tbody>
                {deathEvents.map((death) => (
                  <Tr key={death.id}>
                    <Td className="text-paper/50">{formatDate(death.diedAt)}</Td>
                    <Td>{death.level ?? "—"}</Td>
                    <Td>
                      {death.killedBy ?? "desconhecido"}
                      {death.cause ? ` (${death.cause})` : ""}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
