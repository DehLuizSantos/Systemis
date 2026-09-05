import type { Metadata } from "next";
import { LootTemplate } from "@/app/(dashboard)/loot/components/templates/LootTemplate";

export const metadata: Metadata = { title: "Loot" };

export default function LootPage() {
  return <LootTemplate />;
}
