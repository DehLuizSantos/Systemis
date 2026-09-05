import { type ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-paper">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-paper/50">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
