"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY, type GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";

type Props = {
  term: GlossaryKey;
  /** Optional override className for the icon (size, color). */
  className?: string;
  /** Render the trigger as the children instead of the default ⓘ icon. */
  children?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

/**
 * Hover an ⓘ icon (or any children) to see a plain-English explanation of a term.
 * Wire up new terms by adding to lib/glossary.ts, then <InfoTip term="myKey" />.
 */
export function InfoTip({ term, className, children, side = "top", align = "center" }: Props) {
  const entry = GLOSSARY[term];
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        {children ? (
          <span className="cursor-help">{children}</span>
        ) : (
          <button
            type="button"
            tabIndex={0}
            aria-label={`Explain: ${entry.title}`}
            className={cn(
              "inline-flex items-center justify-center text-muted-foreground/60 hover:text-primary transition-colors",
              className,
            )}
          >
            <Info className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side={side} align={align} collisionPadding={12}>
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {entry.title}
          </div>
          <p className="text-xs leading-relaxed text-foreground/90">{entry.body}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
