"use client";

import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import type { InputType } from "@/lib/types";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  inputType: InputType;
  disabled?: boolean;
}

export function CodeEditor({ value, onChange, inputType, disabled }: CodeEditorProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <CodeMirror
        value={value}
        height="240px"
        theme="dark"
        extensions={inputType === "c-like" ? [cpp()] : []}
        onChange={onChange}
        editable={!disabled}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
          autocompletion: false,
          bracketMatching: true,
        }}
        className="font-mono text-sm"
        aria-label={
          inputType === "c-like"
            ? "C-like loop source editor"
            : "Toy IR source editor"
        }
      />
    </div>
  );
}
