"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function CompilerLog({ log }: { log: string[] | null | undefined }) {
  const [open, setOpen] = useState(false);

  if (!log || log.length === 0) return null;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-md border border-border bg-card">
      <CollapsibleTrigger
        className="flex w-full items-center gap-2 px-4 py-3 text-left font-mono text-sm text-foreground hover:bg-muted/40"
        aria-expanded={open}
      >
        <span
          aria-hidden
          className={`inline-block transition-transform duration-150 ${open ? "rotate-90" : ""}`}
        >
          ▶
        </span>
        Compiler Details
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border px-4 py-3">
        <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
          {log.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
