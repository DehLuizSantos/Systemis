import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Belt-and-suspenders: `proxy.ts` already redirects unauthenticated
  // requests, this keeps the layout safe if ever rendered without it.
  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardTemplate user={session.user}>{children}</DashboardTemplate>;
}
