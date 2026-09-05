"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";

/** Deletes a resource at `${endpoint}/${id}` and refreshes the current RSC page. */
export function DeleteRowButton({
  endpoint,
  id,
  title = "Remover registro",
  confirmMessage = "Remover este registro?",
}: {
  endpoint: string;
  id: string;
  title?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleConfirm() {
    setError(false);
    startTransition(async () => {
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
      setIsConfirmOpen(false);
      if (!res.ok) {
        setError(true);
        const data = await res.json().catch(() => null);
        if (data?.error) window.alert(data.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsConfirmOpen(true)}
        disabled={isPending}
        title={error ? "Falha ao remover, tente novamente" : "Remover"}
        className={error ? "border-danger/40 text-danger" : ""}
      >
        {isPending ? <Spinner /> : <Trash2 className="size-4" />}
      </Button>

      <ConfirmDialog
        open={isConfirmOpen}
        title={title}
        message={confirmMessage}
        isConfirming={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
