"use client";

import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import type { EditorMode } from "@/lib/types";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  inputType: EditorMode;
  disabled?: boolean;
}

export function CodeEditor({ value, onChange, inputType, disabled }: CodeEditorProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <CodeMirror
        value={value}
        height="240px"
        theme="dark"
        extensions={inputType === "c-like" ? [cpp()] : inputType === "python" ? [python()] : []}
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
            : inputType === "python"
              ? "Python example viewer"
              : "Toy IR source editor"
        }
      />
    </div>
  );
}
