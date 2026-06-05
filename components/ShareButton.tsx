"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** Called when the user clicks Share — should return the current shareable URL. */
  getUrl: () => string;
};

export function ShareButton({ getUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const url = getUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // Legacy fallback
        const el = document.createElement("textarea");
        el.value = url;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last-ditch fallback: prompt the user with the URL
      window.prompt("Copy this link to share:", url);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-1.5 transition-colors",
        copied && "border-success/40 bg-success/5 text-success hover:bg-success/10",
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span>Link copied</span>
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5" />
          <span>Share scenario</span>
        </>
      )}
    </Button>
  );
}
