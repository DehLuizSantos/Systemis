import { type ReactNode } from "react";
import Image from "next/image";
import { AuthBadge } from "@/app/login/components/atoms/AuthBadge";
import { SERVER_LABEL } from "@/lib/constants";

export function LoginTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <Image
        src="/images/athena_cannabis_background_1440x810.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Escurece o fundo (opacidade 0,4) pra o card ficar legível por cima. */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-lg">
        <AuthBadge />
        <h1 className="text-center text-lg font-semibold text-paper">
          Systhemis
        </h1>
        <p className="text-center text-xs italic tracking-wide text-paper/50">
          ~ Synthesis Guild
        </p>
        <p className="mb-6 mt-1 text-center text-sm text-paper/50">
          Entre para acessar o dashboard · {SERVER_LABEL}
        </p>
        {children}
      </div>
    </div>
  );
}
