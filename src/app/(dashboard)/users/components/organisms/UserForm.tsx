"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { FormField } from "@/components/molecules/FormField";

export function UserForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar o usuário.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border border-border bg-surface p-4"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-paper">
        <UserPlus className="size-4 text-primary-light" />
        Novo usuário
      </div>

      {error && (
        <p className="mb-3 text-xs text-danger">
          {typeof error === "string" ? error : "Confira os dados informados."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Nome" htmlFor="name">
          <Input id="name" name="name" required placeholder="Nome" />
        </FormField>
        <FormField label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" required placeholder="email@exemplo.com" />
        </FormField>
        <FormField label="Senha" htmlFor="password">
          <Input id="password" name="password" type="password" required minLength={6} />
        </FormField>
        <FormField label="Papel" htmlFor="role">
          <Select id="role" name="role" defaultValue="MEMBER">
            <option value="MEMBER">Membro</option>
            <option value="ADMIN">Admin</option>
          </Select>
        </FormField>
      </div>

      <Button type="submit" size="sm" className="mt-4" disabled={isSubmitting}>
        {isSubmitting && <Spinner />}
        Criar usuário
      </Button>
    </form>
  );
}
