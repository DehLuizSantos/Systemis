"use client";

import { useState } from "react";
import { Gem } from "lucide-react";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ActionSearchBar } from "@/components/molecules/ActionSearchBar";
import {
  LootResultCard,
  type LootSearchResult,
} from "@/app/(dashboard)/loot/components/organisms/LootResultCard";

export function LootPanel() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<LootSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSearch() {
    setIsLoading(true);
    setError(undefined);
    setResult(null);

    const res = await fetch("/api/loot-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: query }),
    });

    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível buscar esse item.");
      return;
    }

    setResult(await res.json());
  }

  return (
    <div>
      <ActionSearchBar
        value={query}
        onChange={setQuery}
        onSubmit={handleSearch}
        isLoading={isLoading}
        placeholder="Nome do item..."
        buttonLabel="Buscar"
      />

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {result ? (
        <LootResultCard result={result} />
      ) : (
        !isLoading &&
        !error && (
          <EmptyState
            icon={Gem}
            title="Nenhuma busca realizada ainda"
            description="Digite o nome de um item acima para ver preço, peso e onde vender."
          />
        )
      )}
    </div>
  );
}
