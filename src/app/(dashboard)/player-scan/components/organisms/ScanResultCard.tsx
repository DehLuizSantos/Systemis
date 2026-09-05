import type { PlayerScanResult } from "@/lib/player-scan";
import { Badge } from "@/components/atoms/Badge";
import { SERVER_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { InfoRow } from "@/components/molecules/InfoRow";
import { SkillsLine } from "@/app/(dashboard)/player-scan/components/atoms/SkillsLine";

export function ScanResultCard({ result }: { result: PlayerScanResult }) {
  return (
    <div className="mb-4 rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-paper">{result.name}</h2>
        <span className="text-xs text-paper/40">
          {SERVER_LABEL} • Análise completa • {formatDate(result.scannedAt)}
        </span>
      </div>

      <div className="mb-4">
        <InfoRow icon="📊" label="Level" value={result.level} />
        <InfoRow icon="⚔️" label="Vocação" value={result.vocation} />
        <InfoRow
          icon="📡"
          label="Status"
          value={
            result.status === "ONLINE" ? (
              <Badge tone="success">🟢 ONLINE</Badge>
            ) : (
              <Badge tone="neutral">⚪ OFFLINE</Badge>
            )
          }
        />
        <InfoRow icon="🛡️" label="Guild" value={result.guild ?? "Sem guild"} />
        <InfoRow icon="🏠" label="Residência" value={result.residence} />
        <InfoRow icon="💳" label="Conta" value={result.account} />
        <InfoRow
          icon="🕒"
          label="Último login"
          value={result.lastLogin ? formatDate(result.lastLogin) : "?"}
        />
        {result.formerName && (
          <InfoRow icon="📝" label="Nome anterior" value={result.formerName} />
        )}
      </div>

      <div>
        <p className="mb-1.5 flex items-center gap-2 text-sm text-paper/60">
          <span aria-hidden>🎯</span> Skills
        </p>
        <SkillsLine skills={result.skills} />
      </div>
    </div>
  );
}
