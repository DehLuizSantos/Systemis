/**
 * Normaliza um nome de personagem para COMPARAÇÃO (nunca para exibição).
 * Nomes vindos do site podem trazer espaço não-quebrável, caracteres de
 * largura zero ou BOM — comparar com `.toLowerCase()` puro já gerou "offline"
 * falso no bot original. Toda comparação de nome do scraper passa por aqui.
 */
export function norm(value: string = ""): string {
  return value
    .normalize("NFKC")
    .replace(/[​-‍﻿]/g, "") // zero-width / BOM
    .replace(/ /g, " ") // espaço não-quebrável -> espaço normal
    .replace(/[^\S ]/g, " ") // qualquer whitespace exótico -> espaço
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
