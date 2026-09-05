import type { ScanAlt } from "@/lib/player-scan";
import { AltProgressBar } from "@/app/(dashboard)/player-scan/components/atoms/AltProgressBar";

export function AltsAnalysisCard({ name, alts }: { name: string; alts: ScanAlt[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="mb-1 flex items-center gap-2 font-medium text-paper">
        🔎 Prováveis alts de {name} — detalhado
      </h3>
      <p className="mb-4 text-xs text-paper/50">
        Quando {name} desloga e outro char loga logo em seguida (≤ 10 min), de
        forma repetida e regular, e os dois quase nunca ficam online juntos, é
        provável que sejam a mesma pessoa. Quanto maior a %, mais forte o
        padrão.
      </p>

      {alts.length === 0 ? (
        <p className="text-sm text-paper/40">
          Ainda sem dados suficientes: essa análise depende de um histórico de
          login/logout do servidor, que este dashboard ainda não coleta.
        </p>
      ) : (
        <>
          <p className="mb-3 text-sm font-medium text-paper">
            🎯 {alts.length} possíve{alts.length === 1 ? "l alt" : "is alts"}
          </p>
          <div className="space-y-2.5">
            {alts.map((alt, index) => (
              <AltProgressBar
                key={alt.name}
                name={alt.name}
                probability={alt.probability}
                rank={index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
