"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AnalyzeResponse } from "@/lib/types";

interface ColumnProps {
  title: string;
  lines: string[];
  hovered: number | null;
  onHover: (index: number | null) => void;
  tone: "neutral" | "success";
}

function Column({ title, lines, hovered, onHover, tone }: ColumnProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        {lines.length === 0 ? (
          <p className="p-4 font-mono text-sm text-muted-foreground">No instructions.</p>
        ) : (
          <ol>
            {lines.map((line, i) => (
              <li
                key={i}
                onMouseEnter={() => onHover(i)}
                onMouseLeave={() => onHover(null)}
                className={cn(
                  "flex gap-3 border-b border-border/60 px-3 py-1.5 font-mono text-sm transition-colors last:border-b-0",
                  hovered === i &&
                    (tone === "success" ? "bg-success/10 text-success" : "bg-primary/10 text-foreground"),
                )}
              >
                <span className="w-6 shrink-0 select-none text-right text-muted-foreground/50">{i + 1}</span>
                <span className="whitespace-pre">{line}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export function BeforeAfter({ response }: { response: AnalyzeResponse }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const before = response.transformation?.before ?? [];
  const after = response.transformation?.after ?? [];
  const vectorizable = !!response.vectorizable;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <Column title="SCALAR (before)" lines={before} hovered={hovered} onHover={setHovered} tone="neutral" />
      {vectorizable ? (
        <Column title="VECTOR (after)" lines={after} hovered={hovered} onHover={setHovered} tone="success" />
      ) : (
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">VECTOR (after)</h3>
          <div className="flex min-h-[120px] flex-1 items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-4 text-center font-mono text-sm text-muted-foreground">
            No vector IR generated — vectorization rejected.
          </div>
        </div>
      )}
    </motion.div>
  );
}
