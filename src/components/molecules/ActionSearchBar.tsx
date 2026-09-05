"use client";

import { type FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";

/** Search box with an explicit submit button (vs. `SearchInput`'s live/URL-synced search). */
export function ActionSearchBar({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder,
  buttonLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder: string;
  buttonLabel: string;
}) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (value.trim()) onSubmit();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/40" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
          autoFocus
        />
      </div>
      <Button type="submit" disabled={isLoading || !value.trim()}>
        {isLoading && <Spinner />}
        {buttonLabel}
      </Button>
    </form>
  );
}
