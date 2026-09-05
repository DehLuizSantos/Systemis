"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { cn } from "@/lib/utils";

/** Importa histórico de XP e mortes do OpenTibia Info pra este inimigo (ver
 * `/api/enemies/[id]/sync-history`) — some/atualiza a lista já existente de
 * Histórico de XP / Histórico de mortes nos detalhes. */
export function SyncHistoryButton({ enemyId }: { enemyId: string }) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<string>();
  const [isError, setIsError] = useState(false);

  async function handleClick() {
    setIsSyncing(true);
    setMessage(undefined);
    setIsError(false);

    const res = await fetch(`/api/enemies/${enemyId}/sync-history`, {
      method: "POST",
    });
    const data = await res.json().catch(() => null);

    setIsSyncing(false);

    if (!res.ok) {
      setIsError(true);
      setMessage(data?.error ?? "Não foi possível sincronizar.");
      return;
    }

    const { xpImported, deathsImported } = data as {
      xpImported: number;
      deathsImported: number;
    };
    setMessage(
      xpImported === 0 && deathsImported === 0
        ? "Nada de novo desde a última sincronização."
        : `Importado: ${xpImported} registro${xpImported === 1 ? "" : "s"} de XP, ${deathsImported} morte${deathsImported === 1 ? "" : "s"}.`
    );
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="sm" onClick={handleClick} disabled={isSyncing}>
        {isSyncing ? <Spinner /> : <RefreshCw className="size-4" />}
        Sincronizar com OpenTibia Info
      </Button>
      {message && (
        <span className={cn("text-xs", isError ? "text-danger" : "text-paper/50")}>
          {message}
        </span>
      )}
    </div>
  );
}
