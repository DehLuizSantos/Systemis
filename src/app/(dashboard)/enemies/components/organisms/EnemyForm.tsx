"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Swords, Paperclip } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { FormField } from "@/components/molecules/FormField";
import { PlayerStatusBadge } from "@/components/molecules/PlayerStatusBadge";
import {
  EnemyNameAutocomplete,
  type EnemyLookupResult,
} from "@/app/(dashboard)/enemies/components/molecules/EnemyNameAutocomplete";
import { handleStaleSession } from "@/lib/session-guard";
import { MAX_EVIDENCE_FILES } from "@/lib/constants";
import type { PlayerStatus } from "@/generated/prisma/client";

const EMPTY_FORM = {
  name: "",
  level: "1",
  vocation: "",
  guild: "",
  residence: "",
  status: "OFFLINE" as PlayerStatus,
};

export function EnemyForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [fileCount, setFileCount] = useState(0);
  const [fileError, setFileError] = useState<string>();
  const [form, setForm] = useState(EMPTY_FORM);
  // Level/vocação/guild/residência/status não aparecem mais como campos —
  // só o resultado da busca (ver EnemyNameAutocomplete) os preenche, então o
  // cadastro fica travado até um nome ser efetivamente resolvido no site.
  const [hasResolved, setHasResolved] = useState(false);
  // Id do inimigo já cadastrado com esse nome, se houver — bloqueia o envio
  // (o POST /api/enemies também recusa; isto só evita descobrir só no final).
  const [duplicateOfId, setDuplicateOfId] = useState<string>();

  function handleNameChange(name: string) {
    setForm((prev) => ({ ...prev, name }));
    setHasResolved(false);
    setDuplicateOfId(undefined);
  }

  function handleResolved(result: EnemyLookupResult | null) {
    if (!result) return;
    setForm((prev) => ({
      ...prev,
      name: result.name,
      level: result.level != null ? String(result.level) : prev.level,
      vocation: result.vocation ?? "",
      guild: result.guild ?? "",
      residence: result.residence ?? "",
      status: result.status,
    }));
    setHasResolved(true);
    setDuplicateOfId(result.alreadyRegisteredId ?? undefined);
  }

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const count = event.target.files?.length ?? 0;
    if (count > MAX_EVIDENCE_FILES) {
      event.target.value = "";
      setFileCount(0);
      setFileError(`Selecione no máximo ${MAX_EVIDENCE_FILES} imagens.`);
      return;
    }
    setFileError(undefined);
    setFileCount(count);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setSuccessMessage(undefined);
    setIsSubmitting(true);

    const formEl = event.currentTarget;
    // Multipart — o formulário carrega imagens de prova junto dos campos.
    const formData = new FormData(formEl);

    const res = await fetch("/api/enemies", {
      method: "POST",
      body: formData,
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      if (await handleStaleSession(data)) return; // já disparou o logout + redirect

      setError(
        typeof data?.error === "string"
          ? data.error
          : "Não foi possível cadastrar o inimigo. Confira os dados."
      );
      return;
    }

    const created = (await res.json().catch(() => null)) as {
      name?: string;
      historySync?: { xpImported: number; deathsImported: number } | null;
    } | null;

    formEl.reset();
    setForm(EMPTY_FORM);
    setHasResolved(false);
    setDuplicateOfId(undefined);
    setFileCount(0);
    setFileError(undefined);

    const sync = created?.historySync;
    setSuccessMessage(
      sync && (sync.xpImported > 0 || sync.deathsImported > 0)
        ? `${created?.name} cadastrado — ${sync.xpImported} registro${sync.xpImported === 1 ? "" : "s"} de XP e ${sync.deathsImported} morte${sync.deathsImported === 1 ? "" : "s"} importados do OpenTibia Info.`
        : `${created?.name} cadastrado.`
    );

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-lg border border-border bg-surface p-4"
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-paper">
        <Swords className="size-4 text-primary-light" />
        Novo inimigo
      </div>

      {error && <p className="mb-3 text-xs text-danger">{error}</p>}
      {successMessage && (
        <p className="mb-3 text-xs text-primary-light">{successMessage}</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Nome" htmlFor="name">
          <EnemyNameAutocomplete
            value={form.name}
            onChange={handleNameChange}
            onResolved={handleResolved}
          />
          {hasResolved && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-paper/50">
              <PlayerStatusBadge status={form.status} />
              <span>Lv {form.level}</span>
              <span aria-hidden>•</span>
              <span>{form.vocation || "vocação ?"}</span>
              <span aria-hidden>•</span>
              <span>{form.guild || "sem guild"}</span>
              <span aria-hidden>•</span>
              <span>{form.residence || "residência ?"}</span>
            </p>
          )}
          {duplicateOfId && (
            <p className="mt-1.5 text-xs text-warning">
              {form.name} já está cadastrado.{" "}
              <Link href={`/enemies/${duplicateOfId}`} className="underline hover:text-warning/80">
                Ver ficha
              </Link>
            </p>
          )}
        </FormField>
        <FormField label={`Prova anexada (até ${MAX_EVIDENCE_FILES} imagens)`} htmlFor="evidence">
          <label
            htmlFor="evidence"
            className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed border-border bg-surface px-3 text-sm text-paper/50 hover:border-secondary hover:text-paper"
          >
            <Paperclip className="size-4" />
            {fileCount > 0
              ? `${fileCount} imagem${fileCount > 1 ? "ns" : ""} selecionada${fileCount > 1 ? "s" : ""}`
              : "Selecionar imagens"}
          </label>
          <input
            id="evidence"
            name="evidence"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFilesChange}
          />
          {fileError && <p className="mt-1.5 text-xs text-danger">{fileError}</p>}
        </FormField>
      </div>

      {/* Preenchidos pela busca (EnemyNameAutocomplete), não editáveis à mão. */}
      <input type="hidden" name="level" value={form.level} />
      <input type="hidden" name="vocation" value={form.vocation} />
      <input type="hidden" name="guild" value={form.guild} />
      <input type="hidden" name="residence" value={form.residence} />
      <input type="hidden" name="status" value={form.status} />

      <Button
        type="submit"
        size="sm"
        className="mt-4"
        disabled={isSubmitting || !hasResolved || !!duplicateOfId}
        title={
          duplicateOfId
            ? "Esse personagem já está cadastrado"
            : !hasResolved
              ? "Escolha um resultado da busca pelo nome primeiro"
              : undefined
        }
      >
        {isSubmitting && <Spinner />}
        Cadastrar inimigo
      </Button>
    </form>
  );
}
