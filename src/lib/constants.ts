// Contexto do jogo monitorado por este dashboard.
export const SERVER_NAME = "Miracle";
export const SERVER_VERSION = "7.4";
export const SERVER_LABEL = `${SERVER_NAME} ${SERVER_VERSION}`;

// Vocações e cidades clássicas da era 7.4 (pré/pós promoção).
export const TIBIA_VOCATIONS = [
  "Knight",
  "Elite Knight",
  "Paladin",
  "Royal Paladin",
  "Sorcerer",
  "Master Sorcerer",
  "Druid",
  "Elder Druid",
  "None",
] as const;

// Teto de imagens de prova por inimigo — validado no formulário (cliente) e
// em POST /api/enemies (servidor, autoritativo).
export const MAX_EVIDENCE_FILES = 4;

export const TIBIA_CITIES = [
  "Thais",
  "Carlin",
  "Venore",
  "Ab'Dendriel",
  "Edron",
  "Kazordoon",
  "Darashia",
  "Liberty Bay",
  "Port Hope",
  "Svargrond",
  "Yalahar",
] as const;
