"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/atoms/Input";
import { Spinner } from "@/components/atoms/Spinner";

/** Client-side search box that syncs the `q` query param and refreshes the RSC page. */
export function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/40" />
      <Input
        type="search"
        placeholder={placeholder}
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(event) => handleChange(event.target.value)}
        className="pl-9"
      />
      {isPending && (
        <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/40" />
      )}
    </div>
  );
}
