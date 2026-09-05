"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";
import type { Enemy } from "@/generated/prisma/client";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { FormField } from "@/components/molecules/FormField";

export function XpRecordForm({ enemies }: { enemies: Enemy[] }) {
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

    const res = await fetch("/api/xp-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError("Não foi possível registrar. Confira os dados.");
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
        <TrendingUp className="size-4 text-primary-light" />
        Registrar level/XP
      </div>

      {error && <p className="mb-3 text-xs text-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Inimigo" htmlFor="enemyId">
          <Select id="enemyId" name="enemyId" required defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {enemies.map((enemy) => (
              <option key={enemy.id} value={enemy.id}>
                {enemy.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Level atual" htmlFor="level">
          <Input id="level" name="level" type="number" min={1} required />
        </FormField>
        <FormField label="XP ganho (opcional)" htmlFor="xpGained">
          <Input id="xpGained" name="xpGained" type="number" min={0} />
        </FormField>
        <FormField label="Observação" htmlFor="note">
          <Input id="note" name="note" placeholder="Opcional" />
        </FormField>
      </div>

      <Button type="submit" size="sm" className="mt-4" disabled={isSubmitting}>
        {isSubmitting && <Spinner />}
        Registrar
      </Button>
    </form>
  );
}
