"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyzeResponse } from "@/lib/types";

export function MetricsPanel({ response }: { response: AnalyzeResponse }) {
  const m = response.metrics;
  if (!m) return null;

  const width = response.vectorWidth ?? 0;
  const originalIterations = m.vectorIterations * width + m.remainderIterations;

  const items: { label: string; value: string | number }[] = [
    { label: "Vector Width", value: width },
    { label: "Original Iterations", value: originalIterations },
    { label: "Vector Iterations", value: m.vectorIterations },
    { label: "Scalar Remainder", value: m.remainderIterations },
    { label: "Original Instructions", value: m.scalarInstructions },
    { label: "Vector Instructions", value: m.vectorInstructions },
    { label: "Instruction Reduction", value: `${Math.round(m.instructionReduction)}%` },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
          >
            <Card className="gap-1 border-border bg-card py-4">
              <CardHeader className="px-4">
                <CardTitle className="font-mono text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <p className="font-mono text-xl font-semibold text-foreground">{item.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">
        Instruction reduction is a simulated compiler-level metric, not guaranteed CPU runtime speedup.
      </p>
    </div>
  );
}
