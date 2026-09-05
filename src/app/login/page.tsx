import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginTemplate } from "@/app/login/components/templates/LoginTemplate";
import { LoginForm } from "@/app/login/components/organisms/LoginForm";

export const metadata: Metadata = {
  title: "Entrar — Synthesis Bot",
};

export default function LoginPage() {
  return (
    <LoginTemplate>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </LoginTemplate>
  );
}
