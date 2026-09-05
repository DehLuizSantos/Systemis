/**
 * Roda `fn` sobre `items` com no máximo `limit` execuções em paralelo —
 * usado pelo import de guild (inimiga ou aliada): uma guild pode ter 100+
 * membros, cada um exigindo uma busca à parte na ficha. Rajada demais
 * arrisca 429 no site; sequencial demais deixa uma guild grande levar
 * minutos. Sem dependência externa — é só um pool de workers simples.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}
