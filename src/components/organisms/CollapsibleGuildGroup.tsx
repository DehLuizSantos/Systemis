"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/atoms/Table";
import { Badge } from "@/components/atoms/Badge";
import { cn } from "@/lib/utils";
import type { GuildGroup } from "@/lib/guild-groups";

/**
 * Uma guild (ou "Sem referência de Guild/Time") como tabela minimizada —
 * clica no cabeçalho pra abrir e ver os membros. Usado tanto em Inimigos
 * Online quanto em Aliados Online. `detailHrefBase`, quando informado, faz o
 * nome do membro linkar pra `${detailHrefBase}/{id}` (ex.: "/enemies");
 * omitido, o nome fica só como texto (ainda não existe ficha de aliado).
 */
export function CollapsibleGuildGroup({
  group,
  detailHrefBase,
}: {
  group: GuildGroup;
  detailHrefBase?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const onlineCount = group.members.filter((m) => m.isOnline).length;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-surface-hover"
      >
        <span className="flex min-w-0 items-center gap-2 font-medium text-paper">
          <ChevronRight
            className={cn("size-4 shrink-0 text-paper/40 transition-transform", isOpen && "rotate-90")}
          />
          {group.logoUrl && (
            // .php da ficha de guild não é um tipo de imagem que o
            // otimizador do Next reconhece de antemão — <img> puro evita
            // ter que declarar isso num loader remoto.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={group.logoUrl}
              alt=""
              width={24}
              height={24}
              className="size-6 shrink-0 rounded"
            />
          )}
          <span className="truncate">{group.name}</span>
        </span>
        <Badge tone={onlineCount > 0 ? "success" : "neutral"} className="shrink-0">
          {onlineCount}/{group.members.length} online
        </Badge>
      </button>

      {isOpen && (
        <div className="border-t border-border p-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Nome do player</Th>
                <Th>Level</Th>
                <Th>Vocação</Th>
                <Th>Status</Th>
                <Th>Residência</Th>
              </Tr>
            </Thead>
            <Tbody>
              {group.members.map((member) => (
                <Tr key={member.id}>
                  <Td>
                    {detailHrefBase ? (
                      <Link
                        href={`${detailHrefBase}/${member.id}`}
                        className="font-medium text-paper hover:text-secondary-light"
                      >
                        {member.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-paper">{member.name}</span>
                    )}
                  </Td>
                  <Td>{member.level}</Td>
                  <Td className="text-paper/70">{member.vocation ?? "—"}</Td>
                  <Td>
                    {member.isOnline ? (
                      <Badge tone="success">🟢 Online</Badge>
                    ) : (
                      <Badge tone="neutral">⚪ Offline</Badge>
                    )}
                  </Td>
                  <Td className="text-paper/70">{member.residence ?? "—"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
