import { PageHeader } from "@/components/molecules/PageHeader";
import { LootPanel } from "@/app/(dashboard)/loot/components/organisms/LootPanel";

export function LootTemplate() {
  return (
    <div>
      <PageHeader
        title="Loot"
        description="Busque um item para ver o melhor preço de venda e onde vender."
      />
      <LootPanel />
    </div>
  );
}
