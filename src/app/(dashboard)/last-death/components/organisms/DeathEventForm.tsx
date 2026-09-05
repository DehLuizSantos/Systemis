"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Skull } from "lucide-react";
import type { Enemy, Player } from "@/generated/prisma/client";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { FormField } from "@/components/molecules/FormField";

export function DeathEventForm({
  enemies,
  players,
}: {
  enemies: Enemy[];
  players: Player[];
}) {
  const router = useRouter();
  const [subjectType, setSubjectType] = useState<"ENEMY" | "ALLY">("ENEMY");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch("/api/deaths", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError("Não foi possível registrar a morte. Confira os dados.");
      return;
    }

    form.reset();
    setSubjectType("ENEMY");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border border-border bg-surface p-4"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-paper">
        <Skull className="size-4 text-primary-light" />
        Registrar morte
      </div>

      {error && <p className="mb-3 text-xs text-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Tipo" htmlFor="subjectType">
          <Select
            id="subjectType"
            name="subjectType"
            value={subjectType}
            onChange={(e) => setSubjectType(e.target.value as "ENEMY" | "ALLY")}
          >
            <option value="ENEMY">Inimigo</option>
            <option value="ALLY">Aliado</option>
          </Select>
        </FormField>

        {subjectType === "ENEMY" ? (
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
        ) : (
          <FormField label="Aliado" htmlFor="playerId">
            <Select id="playerId" name="playerId" required defaultValue="">
              <option value="" disabled>
                Selecione
              </option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Morto por" htmlFor="killedBy">
          <Input id="killedBy" name="killedBy" placeholder="Opcional" />
        </FormField>
        <FormField label="Causa" htmlFor="cause">
          <Input id="cause" name="cause" placeholder="Opcional" />
        </FormField>
        <FormField label="Local" htmlFor="location">
          <Input id="location" name="location" placeholder="Opcional" />
        </FormField>
      </div>

      <Button type="submit" size="sm" className="mt-4" disabled={isSubmitting}>
        {isSubmitting && <Spinner />}
        Registrar
      </Button>
    </form>
  );
}
