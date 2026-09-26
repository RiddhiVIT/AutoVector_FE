"use client";

import { motion } from "framer-motion";
import { Check, Circle, MinusCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyzeResponse, UiStatus } from "@/lib/types";

type StageState = "pending" | "pass" | "fail" | "skipped";

interface Stage {
  label: string;
  state: StageState;
}

const STAGE_NAMES = [
  "Parsed",
  "Dependency Analysis",
  "Memory Analysis",
  "Legality",
  "Vectorizer",
];

/**
 * The backend only reports one overall vectorizable flag plus a reason /
 * dependency list — there's no per-stage verdict in the contract. This
 * derives a plausible per-stage story from that data so the pipeline reads
 * like a real compiler halting at the first failing pass, rather than
 * inventing information the backend didn't send.
 */
function deriveStages(status: UiStatus, response: AnalyzeResponse | null): Stage[] {
  if (status === "initial" || status === "analyzing") {
    return STAGE_NAMES.map((label) => ({ label, state: "pending" as const }));
  }

  if (status === "error" || status === "invalid") {
    return STAGE_NAMES.map((label, i) => ({
      label,
      state: i === 0 ? "fail" : "pending",
    }));
  }

  if (status === "success") {
    return STAGE_NAMES.map((label) => ({ label, state: "pass" as const }));
  }

  // rejected
  const deps = response?.analysis?.dependencies ?? [];
  const reason = (response?.analysis?.reason ?? "").toLowerCase();
  let failIndex = 3; // default: Legality
  if (deps.length > 0) failIndex = 1; // Dependency Analysis
  else if (reason.includes("memory") || reason.includes("contig") || reason.includes("alias")) {
    failIndex = 2; // Memory Analysis
  }

  return STAGE_NAMES.map((label, i) => {
    if (i < failIndex) return { label, state: "pass" as const };
    if (i === failIndex) return { label, state: "fail" as const };
    return { label, state: "skipped" as const };
  });
}

const STATE_STYLES: Record<StageState, string> = {
  pass: "border-success/40 bg-success/10 text-success",
  fail: "border-destructive/40 bg-destructive/10 text-destructive",
  pending: "border-border bg-muted/30 text-muted-foreground",
  skipped: "border-border/60 bg-transparent text-muted-foreground/50",
};

const STATE_LABEL: Record<StageState, string> = {
  pass: "PASS",
  fail: "FAIL",
  pending: "PENDING",
  skipped: "SKIPPED",
};

function StateIcon({ state }: { state: StageState }) {
  const cls = "size-3.5 shrink-0";
  if (state === "pass") return <Check className={cls} aria-hidden />;
  if (state === "fail") return <X className={cls} aria-hidden />;
  if (state === "skipped") return <MinusCircle className={cls} aria-hidden />;
  return <Circle className={cls} aria-hidden />;
}

interface PipelineProps {
  status: UiStatus;
  response: AnalyzeResponse | null;
}

export function Pipeline({ status, response }: PipelineProps) {
  const stages = deriveStages(status, response);

  return (
    <div
      role="list"
      aria-label="Compiler pipeline stages"
      className="flex flex-wrap items-stretch gap-2"
    >
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex items-center gap-2">
          <motion.div
            role="listitem"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className={cn(
              "flex min-w-[132px] flex-col gap-1.5 rounded-md border px-3 py-2 font-mono text-xs",
              STATE_STYLES[stage.state],
            )}
          >
            <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wide">
              <StateIcon state={stage.state} />
              {stage.label}
            </span>
            <span className="text-[10px] tracking-wider">{STATE_LABEL[stage.state]}</span>
          </motion.div>
          {i < stages.length - 1 && (
            <span aria-hidden className="font-mono text-muted-foreground/40">
              →
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
