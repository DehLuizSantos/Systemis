import { cn } from "@/lib/utils";

export function Avatar({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const initials = alt
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      // avatarUrl is arbitrary/user-provided, so next/image's domain
      // allowlist doesn't fit here.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={36}
        height={36}
        className={cn("size-9 shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-paper/80",
        className
      )}
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
}
