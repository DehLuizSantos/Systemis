export function AuthBadge() {
  return (
    // .jfif não está na lista de extensões que o otimizador de imagem do
    // Next reconhece — <img> simples evita esse problema (mesmo raciocínio
    // do Avatar.tsx pra imagem arbitrária/local).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/guild_image.jfif"
      alt="Synthesis Guild"
      width={64}
      height={64}
      className="mx-auto mb-6 size-16 rounded-xl object-cover"
    />
  );
}
