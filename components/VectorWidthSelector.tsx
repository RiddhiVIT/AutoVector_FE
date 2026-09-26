"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const WIDTHS = [2, 4, 8, 16] as const;

interface VectorWidthSelectorProps {
  value: number;
  onChange: (width: number) => void;
  disabled?: boolean;
}

export function VectorWidthSelector({ value, onChange, disabled }: VectorWidthSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Vector Width
      </legend>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={(next) => {
          if (next) onChange(Number(next));
        }}
        disabled={disabled}
        aria-label="Vector width"
        className="font-mono"
      >
        {WIDTHS.map((width) => (
          <ToggleGroupItem key={width} value={String(width)} aria-label={`Vector width ${width}`}>
            {width}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </fieldset>
  );
}
