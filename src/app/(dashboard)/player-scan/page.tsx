import type { Metadata } from "next";
import { PlayerScanTemplate } from "@/app/(dashboard)/player-scan/components/templates/PlayerScanTemplate";

export const metadata: Metadata = { title: "Player Scan" };

export default function PlayerScanPage() {
  return <PlayerScanTemplate />;
}
