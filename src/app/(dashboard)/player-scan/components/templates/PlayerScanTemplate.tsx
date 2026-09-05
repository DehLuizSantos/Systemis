import { PageHeader } from "@/components/molecules/PageHeader";
import { ScanPanel } from "@/app/(dashboard)/player-scan/components/organisms/ScanPanel";

export function PlayerScanTemplate() {
  return (
    <div>
      <PageHeader
        title="Player Scan"
        description="Busque um personagem para ver seu perfil e possíveis alts."
      />
      <ScanPanel />
    </div>
  );
}
