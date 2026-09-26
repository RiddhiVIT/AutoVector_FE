"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyzeResponse } from "@/lib/types";

function SummaryStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="font-mono text-lg font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export function AnalysisSummary({ response }: { response: AnalyzeResponse }) {
  const ok = !!response.vectorizable;
  const metrics = response.metrics;
  const width = response.vectorWidth;
  const totalIterations =
    metrics != null ? metrics.vectorIterations * (width ?? 1) + metrics.remainderIterations : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-lg border p-4",
        ok ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 font-mono text-base font-bold",
          ok ? "text-success" : "text-destructive",
        )}
      >
        {ok ? <Check className="size-5" aria-hidden /> : <X className="size-5" aria-hidden />}
        {ok ? "VECTORIZE SUCCESSFUL" : "VECTORIZATION REJECTED"}
      </div>

      {ok ? (
        <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryStat label="Vector Width" value={width ?? "—"} />
          <SummaryStat label="Iterations" value={totalIterations ?? "—"} />
          <SummaryStat label="Vector Iterations" value={metrics?.vectorIterations ?? "—"} />
          <SummaryStat label="Tail" value={metrics?.remainderIterations ?? 0} />
        </dl>
      ) : (
        <p className="mt-3 font-mono text-sm text-muted-foreground">
          {response.analysis?.reason || "The compiler could not verify it is safe to vectorize this loop."}
        </p>
      )}
    </motion.div>
  );
}
