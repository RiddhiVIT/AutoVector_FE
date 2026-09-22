"use client";

import { useCallback, useMemo, useReducer, type ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Terminal } from "lucide-react";
import { Header } from "@/components/Header";
import { CodeEditor } from "@/components/CodeEditor";
import { ExampleSelector } from "@/components/ExampleSelector";
import { VectorWidthSelector } from "@/components/VectorWidthSelector";
import { AnalyzeButton } from "@/components/AnalyzeButton";
import { Pipeline } from "@/components/Pipeline";
import { AnalysisSummary } from "@/components/AnalysisSummary";
import { DependencyGraph } from "@/components/DependencyGraph";
import { BeforeAfter } from "@/components/BeforeAfter";
import { IterationVisualizer } from "@/components/IterationVisualizer";
import { MetricsPanel } from "@/components/MetricsPanel";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { CompilerLog } from "@/components/CompilerLog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { analyzeLoop } from "@/lib/api";
import { EXAMPLES } from "@/lib/examples";
import type { AnalyzeResponse, InputType, UiStatus } from "@/lib/types";

interface State {
  status: UiStatus;
  inputType: InputType;
  cLikeSource: string;
  toyIrSource: string;
  vectorWidth: number;
  response: AnalyzeResponse | null;
  errorMessage: string | null;
}

type Action =
  | { type: "SET_SOURCE"; value: string }
  | { type: "SET_INPUT_TYPE"; value: InputType }
  | { type: "SET_VECTOR_WIDTH"; value: number }
  | { type: "LOAD_EXAMPLE"; cLike: string; toyIr: string }
  | { type: "ANALYZE_START" }
  | { type: "ANALYZE_DONE"; response: AnalyzeResponse }
  | { type: "ANALYZE_ERROR"; message: string }
  | { type: "RESET" };

const DEFAULT_EXAMPLE = EXAMPLES[0];

const initialState: State = {
  status: "initial",
  inputType: "c-like",
  cLikeSource: DEFAULT_EXAMPLE.cLike,
  toyIrSource: DEFAULT_EXAMPLE.toyIr,
  vectorWidth: 4,
  response: null,
  errorMessage: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SOURCE":
      return state.inputType === "c-like"
        ? { ...state, cLikeSource: action.value }
        : { ...state, toyIrSource: action.value };
    case "SET_INPUT_TYPE":
      return { ...state, inputType: action.value };
    case "SET_VECTOR_WIDTH":
      return { ...state, vectorWidth: action.value };
    case "LOAD_EXAMPLE":
      return { ...state, cLikeSource: action.cLike, toyIrSource: action.toyIr };
    case "ANALYZE_START":
      return { ...state, status: "analyzing", errorMessage: null };
    case "ANALYZE_DONE": {
      const r = action.response;
      if (!r.success) {
        return {
          ...state,
          status: "invalid",
          response: r,
          errorMessage: r.error || null,
        };
      }
      return {
        ...state,
        status: r.vectorizable ? "success" : "rejected",
        response: r,
        errorMessage: null,
      };
    }
    case "ANALYZE_ERROR":
      return { ...state, status: "error", response: null, errorMessage: action.message };
    case "RESET":
      return { ...state, status: "initial", response: null, errorMessage: null };
    default:
      return state;
  }
}

function statusAnnouncement(status: UiStatus, errorMessage: string | null): string {
  switch (status) {
    case "analyzing":
      return "Analyzing…";
    case "success":
      return "Vectorization successful";
    case "rejected":
      return "Vectorization rejected";
    case "invalid":
      return errorMessage
        ? `Unsupported or invalid loop syntax. ${errorMessage}`
        : "Unsupported or invalid loop syntax.";
    case "error":
      return errorMessage || "Compiler service unavailable.";
    default:
      return "";
  }
}

export default function Page() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const source = state.inputType === "c-like" ? state.cLikeSource : state.toyIrSource;

  const runAnalysis = useCallback(async () => {
    dispatch({ type: "ANALYZE_START" });
    try {
      const response = await analyzeLoop({
        source,
        vectorWidth: state.vectorWidth,
        inputType: state.inputType,
      });
      dispatch({ type: "ANALYZE_DONE", response });
    } catch {
      dispatch({
        type: "ANALYZE_ERROR",
        message: "Compiler service unavailable. Try again.",
      });
    }
  }, [source, state.vectorWidth, state.inputType]);

  const handleExampleSelect = useCallback((id: string) => {
    const example = EXAMPLES.find((e) => e.id === id);
    if (example) {
      dispatch({ type: "LOAD_EXAMPLE", cLike: example.cLike, toyIr: example.toyIr });
    }
  }, []);

  const announcement = useMemo(
    () => statusAnnouncement(state.status, state.errorMessage),
    [state.status, state.errorMessage],
  );

  const hasResults = state.status === "success" || state.status === "rejected";
  const showPipeline = state.status !== "initial";

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6">
        {/* aria-live region announcing state changes, visually hidden */}
        <div aria-live="polite" className="sr-only">
          {announcement}
        </div>

        {/* B. Input / editor section */}
        <section id="visualizer" aria-labelledby="input-heading" className="lab-grid rounded-lg border border-border p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="input-heading" className="font-mono text-sm font-semibold text-foreground">
                  Loop input
                </h2>
                <p className="mt-1 max-w-prose font-mono text-xs text-muted-foreground">
                  Write or select a scalar loop, choose a vector width, then run the compiler.
                </p>
              </div>
              <div id="examples">
                <ExampleSelector onSelect={handleExampleSelect} disabled={state.status === "analyzing"} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <ToggleGroup
                type="single"
                value={state.inputType}
                onValueChange={(v) => {
                  if (v) dispatch({ type: "SET_INPUT_TYPE", value: v as InputType });
                }}
                aria-label="Input mode"
                className="font-mono"
              >
                <ToggleGroupItem value="c-like" aria-label="C-like input mode">
                  C-like
                </ToggleGroupItem>
                <ToggleGroupItem value="toy-ir" aria-label="Toy IR input mode">
                  Toy IR
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <CodeEditor
              value={source}
              onChange={(value) => dispatch({ type: "SET_SOURCE", value })}
              inputType={state.inputType}
              disabled={state.status === "analyzing"}
            />

            <div className="flex flex-wrap items-end justify-between gap-6">
              <VectorWidthSelector
                value={state.vectorWidth}
                onChange={(value) => dispatch({ type: "SET_VECTOR_WIDTH", value })}
                disabled={state.status === "analyzing"}
              />
              <AnalyzeButton
                analyzing={state.status === "analyzing"}
                onAnalyze={runAnalysis}
                onReset={() => dispatch({ type: "RESET" })}
              />
            </div>
          </div>
        </section>

        {/* C. Analysis section */}
        <section aria-labelledby="analysis-heading" className="flex flex-col gap-6">
          <h2 id="analysis-heading" className="font-mono text-sm font-semibold text-foreground">
            Analysis pipeline
          </h2>

          {state.status === "initial" && (
            <p className="rounded-md border border-dashed border-border p-6 text-center font-mono text-sm text-muted-foreground">
              Enter a loop to begin.
            </p>
          )}

          {showPipeline && <Pipeline status={state.status} response={state.response} />}

          {state.status === "invalid" && (
            <ErrorNotice
              icon={<AlertTriangle className="size-4" aria-hidden />}
              title="Unsupported or invalid loop syntax."
              message={state.errorMessage}
            />
          )}

          {state.status === "error" && (
            <ErrorNotice
              icon={<AlertTriangle className="size-4" aria-hidden />}
              title="Compiler service unavailable. Try again."
              message={null}
              action={
                <Button type="button" variant="outline" size="sm" className="font-mono" onClick={runAnalysis}>
                  <RotateCcw className="size-3.5" aria-hidden />
                  Retry
                </Button>
              }
            />
          )}

          {state.response && hasResults && (
            <>
              <AnalysisSummary response={state.response} />
              <DependencyGraph response={state.response} />
            </>
          )}
        </section>

        {/* D. Before / After */}
        {state.response && hasResults && (
          <section aria-labelledby="before-after-heading" className="flex flex-col gap-3">
            <h2 id="before-after-heading" className="font-mono text-sm font-semibold text-foreground">
              IR transformation
            </h2>
            <BeforeAfter response={state.response} />
          </section>
        )}

        {/* E. Iteration visualizer */}
        {state.response && hasResults && (
          <section aria-labelledby="iteration-heading" className="flex flex-col gap-3">
            <h2 id="iteration-heading" className="font-mono text-sm font-semibold text-foreground">
              Iteration grouping
            </h2>
            <IterationVisualizer response={state.response} />
          </section>
        )}

        {/* F. Metrics */}
        {state.response && hasResults && state.response.metrics && (
          <section aria-labelledby="metrics-heading" className="flex flex-col gap-3">
            <h2 id="metrics-heading" className="font-mono text-sm font-semibold text-foreground">
              Metrics
            </h2>
            <MetricsPanel response={state.response} />
          </section>
        )}

        {/* G. Explanation */}
        {state.response && hasResults && (
          <section aria-labelledby="explanation-heading" className="flex flex-col gap-3">
            <h2 id="explanation-heading" className="sr-only">
              Explanation
            </h2>
            <ExplanationPanel response={state.response} />
          </section>
        )}

        {/* H. Compiler log */}
        {state.response && hasResults && <CompilerLog log={state.response.log} />}

        {/* About */}
        <section id="about" aria-labelledby="about-heading" className="border-t border-border pt-8">
          <div className="flex items-start gap-3">
            <Terminal className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <h2 id="about-heading" className="font-mono text-sm font-semibold text-foreground">
                About AutoVector
              </h2>
              <p className="mt-2 max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground">
                AutoVector is a teaching tool for a toy auto-vectorizing compiler. It parses a small
                scalar loop, checks whether iterations can safely run in parallel, and shows the
                resulting vector IR alongside a modeled instruction-count reduction. The reduction
                figure is a simulated compiler-level metric — not a measured CPU runtime speedup.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border px-4 py-6 text-center font-mono text-xs text-muted-foreground sm:px-6">
        AutoVector Visualizer — a compiler laboratory for scalar-to-vector transformations.
      </footer>
    </>
  );
}

function ErrorNotice({
  icon,
  title,
  message,
  action,
}: {
  icon: ReactNode;
  title: string;
  message: string | null;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2 font-mono text-sm text-destructive">
        {icon}
        <div>
          <p className="font-semibold">{title}</p>
          {message && <p className="mt-1 text-xs text-muted-foreground">{message}</p>}
        </div>
      </div>
      {action}
    </motion.div>
  );
}
