const MEDALS = ["🥇", "🥈", "🥉"];

export function AltProgressBar({
  name,
  probability,
  rank,
}: {
  name: string;
  probability: number;
  rank: number;
}) {
  const tone =
    probability >= 80 ? "bg-danger" : probability >= 65 ? "bg-warning" : "bg-secondary";

  return (
    <div className="flex items-center gap-3">
      <span className="w-6 shrink-0 text-center text-sm">
        {MEDALS[rank] ?? ""}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-hover">
        <div
          className={`h-full ${tone}`}
          style={{ width: `${Math.min(100, probability)}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-xs text-paper/60">
        {probability}%
      </span>
      <span className="w-28 shrink-0 truncate text-sm font-medium text-paper">
        {name}
      </span>
    </div>
  );
}
