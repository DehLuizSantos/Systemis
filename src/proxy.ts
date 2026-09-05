import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`
// (behaviour is identical — only the file/export name changed).
const PUBLIC_PATHS = ["/login"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isPublicPath = PUBLIC_PATHS.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  // Guard pages only — API routes authenticate themselves (see each
  // route.ts) and should return JSON 401s instead of HTML redirects.
  // `images` fica de fora porque são assets públicos servidos direto de
  // `public/images/` (ex.: o fundo e a logo da tela de login) — sem isso,
  // um <img> puro (não otimizado via /_next/image) pra quem não está logado
  // caía num redirect pro /login em vez do arquivo.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
