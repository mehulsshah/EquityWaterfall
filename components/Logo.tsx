import { cn } from "@/lib/utils";

/** Bare mark — three descending bars suggesting a waterfall cascade. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <rect x="4" y="5" width="16" height="3" rx="1.5" />
      <rect x="4" y="11" width="11" height="3" rx="1.5" opacity="0.85" />
      <rect x="4" y="17" width="6" height="3" rx="1.5" opacity="0.7" />
    </svg>
  );
}

/** Mark in a tinted, slightly elevated container — for header / nav use. */
export function LogoBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-xl",
        "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground",
        "shadow-md shadow-primary/20",
        "ring-1 ring-inset ring-white/10 dark:ring-white/5",
        className,
      )}
    >
      <LogoMark className="h-[18px] w-[18px]" />
    </div>
  );
}

/** Full lockup: badge + wordmark + tagline. */
export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoBadge />
      <div className="flex flex-col gap-0.5 leading-none">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
          Equity Waterfall
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.09em] text-muted-foreground">
          PE scenario modeling
        </span>
      </div>
    </div>
  );
}
