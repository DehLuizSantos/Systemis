import { EmptyState } from "@/components/molecules/EmptyState";
import { Gem } from "lucide-react";
import { NpcPriceRow } from "@/app/(dashboard)/loot/components/atoms/NpcPriceRow";

export interface LootNpcPrice {
  npcName: string;
  city: string | null;
  price: number;
  /** Rashid é viajante — quando true, `city` já é a cidade de hoje. */
  isRashid?: boolean;
}

/** Onde o Rashid está hoje, presente só quando o item tem o Rashid como comprador. */
export interface LootRashidToday {
  city: string;
  weekday: string;
}

export interface LootSearchResult {
  name: string;
  category: string | null;
  weight: number | null;
  npcPrices: LootNpcPrice[];
  bestPrice: LootNpcPrice | null;
  rashid?: LootRashidToday | null;
}

export function LootResultCard({ result }: { result: LootSearchResult }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-paper">
        💰 {result.name}
      </h2>

      <div className="mb-4 space-y-2 border-b border-border/60 pb-4 text-sm">
        <p className="flex items-center gap-2">
          <span aria-hidden>🏆</span>
          <span className="text-paper/60">Melhor preço:</span>
          {result.bestPrice ? (
            <span className="font-medium text-paper">
              Venda para {result.bestPrice.npcName}
              {result.bestPrice.city ? ` em ${result.bestPrice.city}` : ""} por{" "}
              {result.bestPrice.price.toLocaleString("pt-BR")} gp
              {result.bestPrice.isRashid && " 🗺️"}
            </span>
          ) : (
            <span className="text-paper/40">nenhum NPC compra este item</span>
          )}
        </p>
        <p className="flex items-center gap-2">
          <span aria-hidden>⚖️</span>
          <span className="text-paper/60">Peso</span>
          <span className="font-medium text-paper">
            {result.weight != null ? `${result.weight.toFixed(2)} oz` : "—"}
          </span>
        </p>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-sm text-paper/60">
          <span aria-hidden>🏪</span> Vender para (Sell To) — melhor preço primeiro
        </p>
        {result.npcPrices.length === 0 ? (
          <EmptyState
            icon={Gem}
            title="Nenhum NPC compra este item"
            description="Esse item não tem comprador cadastrado no servidor."
          />
        ) : (
          <div>
            {result.npcPrices.map((npc, index) => (
              <NpcPriceRow
                key={`${npc.npcName}-${npc.city}-${index}`}
                npcName={npc.npcName}
                city={npc.city}
                price={npc.price}
                rank={index}
                isRashid={npc.isRashid}
              />
            ))}
          </div>
        )}
      </div>

      {result.rashid && (
        <p className="mt-4 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-paper/80">
          <span aria-hidden>🗺️</span>
          <span>
            O viajante <strong className="text-paper">Rashid</strong> compra este item. Hoje (
            {result.rashid.weekday}) ele está em{" "}
            <strong className="text-paper">{result.rashid.city}</strong>. A cidade muda no
            server save (05:00, horário de Brasília).
          </span>
        </p>
      )}
    </div>
  );
}
