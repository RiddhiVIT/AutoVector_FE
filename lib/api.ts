import type { AnalyzeRequest, AnalyzeResponse } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8000";

/** Thrown for network failures / non-2xx responses from the compiler service. */
export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * POST /api/analyze — calls the AutoVector backend and returns its response
 * as-is. Throws ApiError on network failure or a non-2xx status; a 2xx
 * response with `success: false` is returned normally (that's a valid,
 * "invalid input" response per the API contract, not a transport error).
 */
export async function analyzeLoop(
  payload: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Network request to the compiler service failed.");
  }

  if (!res.ok) {
    throw new ApiError(`Compiler service returned status ${res.status}.`, res.status);
  }

  try {
    const data = (await res.json()) as AnalyzeResponse;
    return data;
  } catch {
    throw new ApiError("Compiler service returned an invalid response.");
  }
}

/**
 * GET /api/health — lightweight reachability check. Never throws; returns
 * false on any failure so callers can distinguish "backend down" from
 * "backend rejected the input" without extra try/catch boilerplate.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export { API_BASE };
