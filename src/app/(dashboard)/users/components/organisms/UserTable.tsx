import type { Role } from "@/generated/prisma/client";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/atoms/Table";
import { DeleteRowButton } from "@/components/molecules/DeleteRowButton";
import { formatDate } from "@/lib/utils";
import { RoleBadge } from "@/app/(dashboard)/users/components/molecules/RoleBadge";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date | string;
}

export function UserTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Nome</Th>
          <Th>E-mail</Th>
          <Th>Papel</Th>
          <Th>Criado em</Th>
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {users.map((user) => (
          <Tr key={user.id}>
            <Td className="font-medium text-paper">
              {user.name}
              {user.id === currentUserId && (
                <span className="ml-2 text-xs text-paper/40">(você)</span>
              )}
            </Td>
            <Td className="text-paper/70">{user.email}</Td>
            <Td>
              <RoleBadge role={user.role} />
            </Td>
            <Td className="text-paper/50">{formatDate(user.createdAt)}</Td>
            <Td>
              {user.id !== currentUserId && (
                <DeleteRowButton
                  endpoint="/api/users"
                  id={user.id}
                  confirmMessage={`Remover o usuário ${user.name}?`}
                />
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
