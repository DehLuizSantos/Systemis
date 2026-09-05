import { AlertCircle } from "lucide-react";

export function LoginFormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </div>
  );
}
