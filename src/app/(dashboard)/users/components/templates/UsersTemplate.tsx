import { PageHeader } from "@/components/molecules/PageHeader";
import { UserForm } from "@/app/(dashboard)/users/components/organisms/UserForm";
import {
  UserTable,
  type UserRow,
} from "@/app/(dashboard)/users/components/organisms/UserTable";

export function UsersTemplate({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Quem tem acesso ao dashboard. Só administradores gerenciam esta lista."
      />
      <UserForm />
      <UserTable users={users} currentUserId={currentUserId} />
    </div>
  );
}
