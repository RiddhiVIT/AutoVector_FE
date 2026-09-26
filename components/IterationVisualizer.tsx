"use client";

import { motion } from "framer-motion";
import type { AnalyzeResponse } from "@/lib/types";

const MAX_BOXES = 64;

function Box({ label, tone = "default" }: { label: string; tone?: "default" | "tail" }) {
  return (
    <div
      className={
        "flex h-8 min-w-8 items-center justify-center rounded border px-1.5 font-mono text-[10px] " +
        (tone === "tail"
          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
          : "border-border bg-card text-muted-foreground")
      }
    >
      {label}
    </div>
  );
}

function Overflow({ n }: { n: number }) {
  return (
    <div className="flex h-8 items-center justify-center rounded border border-dashed border-border px-2 font-mono text-[10px] text-muted-foreground">
      +{n} more
    </div>
  );
}

export function IterationVisualizer({ response }: { response: AnalyzeResponse }) {
  const vectorizable = !!response.vectorizable;
  const metrics = response.metrics;
  const width = response.vectorWidth ?? 4;
  const vectorGroups = metrics?.vectorIterations ?? 0;
  const remainder = metrics?.remainderIterations ?? 0;
  const totalScalar = vectorGroups * width + remainder;

  if (!vectorizable) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center font-mono text-sm text-muted-foreground">
        Vectorization rejected — no iteration grouping to display.
      </div>
    );
  }

  const scalarIndices = Array.from({ length: Math.min(totalScalar, MAX_BOXES) }, (_, i) => i);
  const groupIndices = Array.from({ length: Math.min(vectorGroups, MAX_BOXES) }, (_, i) => i);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Scalar iterations
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {scalarIndices.map((i) => (
            <Box key={i} label={`i=${i}`} />
          ))}
          {totalScalar > MAX_BOXES && <Overflow n={totalScalar - MAX_BOXES} />}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Vector iterations (width {width})
        </h4>
        <div className="flex flex-wrap gap-3">
          {groupIndices.map((g) => (
            <motion.div
              key={g}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: Math.min(g, 20) * 0.02 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="flex overflow-hidden rounded-md border border-success/50">
                {Array.from({ length: width }, (_, j) => (
                  <div
                    key={j}
                    className="flex h-8 w-8 items-center justify-center border-r border-success/30 bg-success/10 font-mono text-[11px] text-success last:border-r-0"
                  >
                    {g * width + j}
                  </div>
                ))}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                one vector op
              </span>
            </motion.div>
          ))}
          {vectorGroups > MAX_BOXES && <Overflow n={vectorGroups - MAX_BOXES} />}
        </div>
      </div>

      {remainder > 0 && (
        <div className="flex flex-col gap-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 p-3">
          <h4 className="font-mono text-xs uppercase tracking-wider text-amber-400">
            Scalar remainder (tail)
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: remainder }, (_, i) => (
              <Box key={i} label={`i=${vectorGroups * width + i}`} tone="tail" />
            ))}
          </div>
        </div>
      )}

      <p className="font-mono text-xs text-muted-foreground">
        Vectorized iterations: {vectorGroups * width} / Remaining iterations: {remainder}
      </p>
    </div>
  );
}
