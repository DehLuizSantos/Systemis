"use client";

import { useState } from "react";
import type { PlayerScanResult } from "@/lib/player-scan";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Radar } from "lucide-react";
import { ActionSearchBar } from "@/components/molecules/ActionSearchBar";
import { ScanResultCard } from "@/app/(dashboard)/player-scan/components/organisms/ScanResultCard";
import { AltsAnalysisCard } from "@/app/(dashboard)/player-scan/components/organisms/AltsAnalysisCard";

export function ScanPanel() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PlayerScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleScan() {
    setIsLoading(true);
    setError(undefined);
    setResult(null);

    const res = await fetch("/api/player-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: query }),
    });

    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível escanear esse personagem.");
      return;
    }

    setResult(await res.json());
  }

  return (
    <div>
      <ActionSearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleScan}
        isLoading={isLoading}
        placeholder="Nome do personagem..."
        buttonLabel="Escanear"
      />

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {result ? (
        <div>
          <ScanResultCard result={result} />
          <AltsAnalysisCard name={result.name} alts={result.alts} />
        </div>
      ) : (
        !isLoading && (
          <EmptyState
            icon={Radar}
            title="Nenhum scan realizado ainda"
            description="Digite o nome de um personagem acima e clique em escanear. Os dados vêm ao vivo do site do Miracle."
          />
        )
      )}
    </div>
  );
}
