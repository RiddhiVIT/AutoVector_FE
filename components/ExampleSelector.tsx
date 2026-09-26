"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXAMPLES } from "@/lib/examples";

interface ExampleSelectorProps {
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function ExampleSelector({ onSelect, disabled }: ExampleSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="example-select"
        className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
      >
        Examples
      </label>
      <Select onValueChange={onSelect} disabled={disabled}>
        <SelectTrigger id="example-select" className="w-full font-mono sm:w-64">
          <SelectValue placeholder="Examples ▾" />
        </SelectTrigger>
        <SelectContent>
          {EXAMPLES.map((example) => (
            <SelectItem key={example.id} value={example.id} className="font-mono">
              {example.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
