"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { AnalyzeResponse } from "@/lib/types";

const SUCCESS_BULLETS = [
  "No loop-carried dependency",
  "Array accesses use independent indices",
  "Memory access is contiguous",
  "Vector width is compatible with the loop",
  "Vectorization reduces the modeled instruction count",
];

function deriveRejectionBullets(response: AnalyzeResponse): string[] {
  const bullets: string[] = [];
  const dep = response.analysis?.dependencies?.[0];
  const reason = response.analysis?.reason;

  if (dep) {
    bullets.push("Loop-carried dependency");
    bullets.push(
      dep.source && dep.target
        ? `${dep.target} depends on ${dep.source}.`
        : `A ${dep.type || "cross-iteration"} dependency was found (distance ${dep.distance ?? "?"}).`,
    );
  }

  if (reason && !bullets.includes(reason)) {
    bullets.push(reason);
  }

  bullets.push("Executing multiple iterations simultaneously could change program behavior.");

  return bullets.length
    ? bullets
    : ["The compiler could not verify it is safe to vectorize this loop."];
}

export function ExplanationPanel({ response }: { response: AnalyzeResponse }) {
  const vectorizable = !!response.vectorizable;
  const bullets = vectorizable ? SUCCESS_BULLETS : deriveRejectionBullets(response);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-3"
    >
      <h3 className="font-mono text-sm font-semibold text-foreground">
        Why did the compiler make this decision?
      </h3>
      <ul className="flex flex-col gap-2">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 font-mono text-sm text-muted-foreground">
            {vectorizable ? (
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            ) : (
              <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            )}
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
