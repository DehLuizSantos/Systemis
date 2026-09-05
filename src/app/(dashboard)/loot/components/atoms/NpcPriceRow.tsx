import { Badge } from "@/components/atoms/Badge";

const MEDALS = ["🥇", "🥈", "🥉"];

export function NpcPriceRow({
  npcName,
  city,
  price,
  rank,
  isRashid,
}: {
  npcName: string;
  city?: string | null;
  price: number;
  rank: number;
  /** Rashid é viajante — `city` já vem com a cidade de hoje quando true. */
  isRashid?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 text-sm last:border-0">
      <span className="flex flex-wrap items-center gap-2">
        <span className="w-6 text-center" aria-hidden>
          {MEDALS[rank] ?? ""}
        </span>
        <span className="font-medium text-paper">{npcName}</span>
        {city && <span className="text-paper/40">({city})</span>}
        {isRashid && (
          <Badge tone="warning" title="A cidade muda no server save (05:00, horário de Brasília).">
            🗺️ Rashid hoje
          </Badge>
        )}
      </span>
      <span className="font-mono text-primary-light">
        {price.toLocaleString("pt-BR")} gp
      </span>
    </div>
  );
}
