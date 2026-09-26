/**
 * Types mirroring the AutoVector backend API contract exactly.
 * Every field on AnalyzeResponse (and nested objects) is optional/nullable
 * because the backend is being built in parallel — components must treat
 * all of this defensively.
 */

export type InputType = "c-like" | "toy-ir" | "json";

export interface AnalyzeRequest {
  source: string;
  vectorWidth: number;
  inputType: InputType;
}

export interface Dependency {
  type: string;
  distance: number;
  source: string;
  target: string;
}

export interface MemoryAccess {
  array: string;
  index: string;
  offset: number;
  isWrite: boolean;
}

export interface Analysis {
  dependencies: Dependency[];
  memoryAccesses: MemoryAccess[];
  reason: string;
}

export interface Transformation {
  before: string[];
  after: string[];
}

export interface Metrics {
  scalarInstructions: number;
  vectorInstructions: number;
  instructionReduction: number;
  vectorIterations: number;
  remainderIterations: number;
}

export interface AnalyzeResponse {
  success: boolean;
  error?: string;
  vectorizable?: boolean;
  vectorWidth?: number;
  analysis?: Analysis;
  transformation?: Transformation;
  metrics?: Metrics | null;
  log?: string[];
}

/** UI state-machine statuses driving the whole page. */
export type UiStatus =
  | "initial"
  | "analyzing"
  | "success"
  | "rejected"
  | "invalid"
  | "error";
