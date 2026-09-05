export function XpAmount({ value }: { value: number }) {
  return (
    <span className="font-mono text-sm font-semibold text-primary-light">
      +{value.toLocaleString("pt-BR")} XP
    </span>
  );
}
