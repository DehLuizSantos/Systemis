import type { EnemyEvidence } from "@/generated/prisma/client";
import { EmptyState } from "@/components/molecules/EmptyState";
import { ImageIcon } from "lucide-react";

export function EvidenceGallery({ evidence }: { evidence: EnemyEvidence[] }) {
  if (evidence.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="Nenhuma prova anexada"
        description="Screenshots que comprovem alts ou comportamento hostil aparecem aqui."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {evidence.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-lg border border-border bg-surface-hover"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- imagens de upload local, sem otimização remota */}
          <img
            src={item.url}
            alt={item.caption ?? "Prova anexada"}
            className="aspect-square w-full object-cover"
          />
        </a>
      ))}
    </div>
  );
}
