"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { FormField } from "@/components/molecules/FormField";
import { handleStaleSession } from "@/lib/session-guard";

interface GuildImportResponse {
  guildName: string;
  membersFound: number;
  membersCreated: number;
  membersUpdated: number;
  membersFailed: number;
}

/**
 * Cadastra uma guild inteira a partir do link/id do site — importa todos os
 * membros como inimigos ou aliados, dependendo de `endpoint`. Compartilhado
 * pelas telas Inimigos Online (`/api/guilds`) e Aliados Online
 * (`/api/ally-guilds`).
 */
export function GuildRegisterForm({
  endpoint,
  title,
  subjectLabel,
}: {
  endpoint: string;
  title: string;
  /** Ex.: "inimigos" ou "aliados" — usado só no texto de ajuda/resultado. */
  subjectLabel: string;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);
    setIsSubmitting(true);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    const data = await res.json().catch(() => null);

    setIsSubmitting(false);

    if (!res.ok) {
      if (await handleStaleSession(data)) return;
      setError(
        typeof data?.error === "string"
          ? data.error
          : "Não foi possível importar a guild."
      );
      return;
    }

    const result = data as GuildImportResponse;
    setInput("");
    setMessage(
      `${result.guildName}: ${result.membersCreated} ${subjectLabel === "aliados" ? "aliado" : "inimigo"}${result.membersCreated === 1 ? "" : "s"} novo${result.membersCreated === 1 ? "" : "s"}, ` +
        `${result.membersUpdated} já cadastrado${result.membersUpdated === 1 ? "" : "s"} atualizado${result.membersUpdated === 1 ? "" : "s"}` +
        `${result.membersFailed > 0 ? `, ${result.membersFailed} falharam` : ""} (${result.membersFound} no elenco).`
    );
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border border-border bg-surface p-4"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-paper">
        <Building2 className="size-4 text-primary-light" />
        {title}
      </div>

      {error && <p className="mb-3 text-xs text-danger">{error}</p>}
      {message && <p className="mb-3 text-xs text-primary-light">{message}</p>}

      <FormField label="Link ou id da guild no site" htmlFor="guild-input">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="guild-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://miracle74.com/?subtopic=guilds&action=show&guild=897"
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isSubmitting || !input.trim()}>
            {isSubmitting && <Spinner />}
            Importar guild
          </Button>
        </div>
      </FormField>
      <p className="mt-2 text-xs text-paper/40">
        Importa todos os personagens da guild como {subjectLabel}, com level, vocação, residência
        e status. Pode levar um tempo em guilds grandes — cada membro é conferido na ficha dele.
      </p>
    </form>
  );
}
