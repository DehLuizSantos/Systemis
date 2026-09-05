import type { ScanSkills } from "@/lib/player-scan";

const LABELS: [keyof ScanSkills, string][] = [
  ["magicLevel", "Magic Level"],
  ["fist", "Fist"],
  ["club", "Club"],
  ["sword", "Sword"],
  ["axe", "Axe"],
  ["distance", "Distance"],
  ["shielding", "Shielding"],
  ["fishing", "Fishing"],
];

export function SkillsLine({ skills }: { skills: ScanSkills }) {
  return (
    <p className="text-sm leading-relaxed text-paper/80">
      {LABELS.map(([key, label], index) => (
        <span key={key}>
          {index > 0 && <span className="text-paper/30"> • </span>}
          {label} <span className="font-semibold text-paper">{skills[key]}</span>
        </span>
      ))}
    </p>
  );
}
