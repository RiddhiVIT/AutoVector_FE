"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyzeButtonProps {
  analyzing: boolean;
  disabled?: boolean;
  onAnalyze: () => void;
  onReset: () => void;
}

export function AnalyzeButton({ analyzing, disabled, onAnalyze, onReset }: AnalyzeButtonProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        onClick={onAnalyze}
        disabled={analyzing || disabled}
        className="font-mono"
        size="lg"
      >
        {analyzing ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Analyzing…
          </>
        ) : (
          "Analyze & Vectorize"
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={analyzing}
        className="font-mono"
        size="lg"
      >
        Reset
      </Button>
    </div>
  );
}
