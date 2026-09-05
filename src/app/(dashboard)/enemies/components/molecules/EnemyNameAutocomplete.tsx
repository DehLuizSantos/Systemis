"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/atoms/Input";

export interface EnemyLookupResult {
  name: string;
  level: number | null;
  vocation: string | null;
  guild: string | null;
  residence: string | null;
  status: "ONLINE" | "OFFLINE";
  /** Id do inimigo já cadastrado com esse nome, ou `null` se for novo. */
  alreadyRegisteredId: string | null;
}

interface PlayerSuggestion {
  name: string;
  /** true quando também está no whoisonline agora. */
  online: boolean;
}

/**
 * Campo "Nome" do formulário de inimigo com busca automática enquanto digita
 * (via `/api/enemies/search`, que cruza o censo do OpenTibia Info — todo
 * nome já visto no servidor, online ou não — com o whoisonline do
 * miracle74.com só pra marcar quem está online agora) — funciona como um
 * select: ao clicar numa sugestão, busca a ficha completa
 * (`/api/enemies/lookup`) e devolve pro formulário preencher o resto.
 */
export function EnemyNameAutocomplete({
  value,
  onChange,
  onResolved,
}: {
  value: string;
  onChange: (name: string) => void;
  onResolved: (result: EnemyLookupResult | null) => void;
}) {
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [lookupError, setLookupError] = useState<string>();
  const containerRef = useRef<HTMLDivElement>(null);

  const query = value.trim();

  // Debounce: busca sugestões (personagens online) 300ms depois da última
  // tecla. `isSearching` liga no `onChange` do input (evento do usuário, não
  // aqui) — este efeito só sincroniza com o fetch externo, nunca chama
  // setState de forma síncrona no corpo dele.
  useEffect(() => {
    if (query.length < 2) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/enemies/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json().catch(() => null);
        if (!cancelled) setSuggestions(data?.suggestions ?? []);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Fecha o dropdown ao clicar fora do campo.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function resolve(name: string) {
    setIsOpen(false);
    setLookupError(undefined);
    setIsResolving(true);
    onChange(name);

    try {
      const res = await fetch("/api/enemies/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setLookupError(data?.error ?? "Não foi possível buscar esse personagem.");
        onResolved(null);
        return;
      }

      onResolved(await res.json());
    } finally {
      setIsResolving(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter busca a ficha exata do que foi digitado, em vez de submeter o
    // formulário inteiro (o comportamento nativo de <form> com um só input).
    if (event.key === "Enter" && query.length >= 2) {
      event.preventDefault();
      resolve(query);
    }
  }

  const showDropdown = isOpen && query.length >= 2;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          id="name"
          name="name"
          required
          autoComplete="off"
          placeholder="Nome do personagem"
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            onChange(next);
            setLookupError(undefined);
            setIsOpen(true);
            setIsSearching(next.trim().length >= 2);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {((isSearching && query.length >= 2) || isResolving) && (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-paper/40" />
        )}
      </div>

      {lookupError && <p className="mt-1 text-xs text-danger">{lookupError}</p>}

      {showDropdown && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-surface shadow-lg">
          {suggestions.length > 0 && (
            <ul className="max-h-56 overflow-y-auto">
              {suggestions.map((s) => (
                <li key={s.name}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-paper hover:bg-surface-hover"
                    onClick={() => resolve(s.name)}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${s.online ? "bg-success" : "bg-paper/20"}`}
                        aria-hidden
                      />
                      {s.name}
                    </span>
                    <span className="shrink-0 text-xs text-paper/40">
                      {s.online ? "online" : "offline"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="flex w-full items-center gap-2 border-t border-border/60 px-3 py-2 text-left text-sm text-paper/60 hover:bg-surface-hover hover:text-paper"
            onClick={() => resolve(query)}
          >
            <Search className="size-3.5 shrink-0" />
            Buscar ficha exata de &quot;{query}&quot;
          </button>
        </div>
      )}
    </div>
  );
}
