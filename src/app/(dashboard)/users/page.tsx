import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UsersTemplate } from "@/app/(dashboard)/users/components/templates/UsersTemplate";

export const metadata: Metadata = { title: "Usuários" };

export default async function UsersPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return <UsersTemplate users={users} currentUserId={session.user.id} />;
}
