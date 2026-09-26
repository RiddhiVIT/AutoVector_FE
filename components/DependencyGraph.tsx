"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Position, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";
import type { AnalyzeResponse, MemoryAccess } from "@/lib/types";

type NodeKind = "io" | "op" | "iter";

interface GraphNodeData {
  label: string;
  kind: NodeKind;
}

function GraphNode({ data }: { data: GraphNodeData }) {
  const toneClass =
    data.kind === "op"
      ? "border-primary/50 bg-primary/10 text-primary"
      : data.kind === "iter"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-border bg-card text-foreground";

  return (
    <div className={`rounded-md border px-3 py-1.5 font-mono text-xs whitespace-nowrap ${toneClass}`}>
      {data.label}
    </div>
  );
}

const nodeTypes = { graphNode: GraphNode };

const SKIP_OPS = new Set(["LOAD", "STORE", "CONST", "LOOP", "ENDLOOP"]);

function extractOp(before: string[] | undefined): string {
  if (!before) return "OP";
  for (const line of before) {
    const token = line.trim().split(/[\s,]+/)[0]?.toUpperCase();
    if (token && !SKIP_OPS.has(token)) return token;
  }
  return "OP";
}

function formatAccess(access: MemoryAccess): string {
  if (!access.offset) return `${access.array}[${access.index}]`;
  const sign = access.offset > 0 ? "+" : "";
  return `${access.array}[${access.index}${sign}${access.offset}]`;
}

function fallbackGraph(vectorizable: boolean) {
  const nodes: Node[] = [
    {
      id: "a",
      position: { x: 0, y: 0 },
      data: { label: "input", kind: "io" },
      type: "graphNode",
      sourcePosition: Position.Right,
    },
    {
      id: "b",
      position: { x: 200, y: 0 },
      data: { label: "op", kind: "op" },
      type: "graphNode",
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: "c",
      position: { x: 400, y: 0 },
      data: { label: "output", kind: "io" },
      type: "graphNode",
      targetPosition: Position.Left,
    },
  ];
  const edges: Edge[] = [
    { id: "e1", source: "a", target: "b" },
    { id: "e2", source: "b", target: "c" },
  ];
  return {
    nodes,
    edges,
    caption: vectorizable ? "No cross-iteration dependency" : "✕ Loop-carried dependency",
  };
}

function buildSuccessGraph(response: AnalyzeResponse) {
  const accesses = response.analysis?.memoryAccesses ?? [];
  const reads = accesses.filter((a) => !a.isWrite);
  const writes = accesses.filter((a) => a.isWrite);

  if (reads.length === 0 && writes.length === 0) {
    return fallbackGraph(true);
  }

  const op = extractOp(response.transformation?.before);

  const readNodes: Node[] = (reads.length ? reads : [{ array: "input", index: "i", offset: 0, isWrite: false }]).map(
    (r, i) => ({
      id: `r${i}`,
      position: { x: 0, y: i * 64 },
      data: { label: formatAccess(r), kind: "io" },
      type: "graphNode",
      sourcePosition: Position.Right,
    }),
  );

  const opY = ((readNodes.length - 1) * 64) / 2;
  const opNode: Node = {
    id: "op",
    position: { x: 210, y: Math.max(opY, 0) },
    data: { label: op, kind: "op" },
    type: "graphNode",
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };

  const writeSource = writes.length ? writes : [{ array: "output", index: "i", offset: 0, isWrite: true }];
  const writeNodes: Node[] = writeSource.map((w, i) => ({
    id: `w${i}`,
    position: { x: 420, y: opY + i * 64 },
    data: { label: formatAccess(w), kind: "io" },
    type: "graphNode",
    targetPosition: Position.Left,
  }));

  const nodes = [...readNodes, opNode, ...writeNodes];
  const edges: Edge[] = [
    ...readNodes.map((n) => ({ id: `e-${n.id}-op`, source: n.id, target: "op" })),
    ...writeNodes.map((n) => ({ id: `e-op-${n.id}`, source: "op", target: n.id })),
  ];

  return { nodes, edges, caption: "No cross-iteration dependency" };
}

function buildRejectedGraph(response: AnalyzeResponse) {
  const dep = response.analysis?.dependencies?.[0];
  if (!dep) return fallbackGraph(false);

  const op = extractOp(response.transformation?.before);

  const nodes: Node[] = [
    {
      id: "prev",
      position: { x: 0, y: 40 },
      data: { label: "Iteration i-1", kind: "iter" },
      type: "graphNode",
      sourcePosition: Position.Right,
    },
    {
      id: "access",
      position: { x: 210, y: 40 },
      data: { label: dep.source || "array access", kind: "io" },
      type: "graphNode",
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: "curr",
      position: { x: 420, y: 0 },
      data: { label: "Iteration i", kind: "iter" },
      type: "graphNode",
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    },
    {
      id: "op",
      position: { x: 630, y: 0 },
      data: { label: dep.target || op, kind: "op" },
      type: "graphNode",
      targetPosition: Position.Left,
    },
  ];

  const edgeLabelStyle = { fill: "#f87171", fontFamily: "var(--font-mono)", fontSize: 10 };
  const edgeLabelBg = { fill: "#12151c", fillOpacity: 0.9 };

  const edges: Edge[] = [
    {
      id: "e1",
      source: "prev",
      target: "access",
      label: "writes",
      style: { stroke: "#f87171" },
      labelStyle: edgeLabelStyle,
      labelBgStyle: edgeLabelBg,
    },
    {
      id: "e2",
      source: "access",
      target: "curr",
      label: "reads",
      style: { stroke: "#f87171" },
      labelStyle: edgeLabelStyle,
      labelBgStyle: edgeLabelBg,
    },
    { id: "e3", source: "curr", target: "op", style: { stroke: "#f87171" } },
  ];

  const caption = `✕ Loop-carried dependency — ${dep.type || "RAW"} (distance ${dep.distance ?? "?"}): ${
    dep.source || "?"
  } → ${dep.target || "?"}`;

  return { nodes, edges, caption };
}

export function DependencyGraph({ response }: { response: AnalyzeResponse }) {
  const vectorizable = !!response.vectorizable;

  // response is a stable prop reference per render; safe to recompute on it.
  const { nodes, edges, caption } = useMemo(() => {
    try {
      return vectorizable ? buildSuccessGraph(response) : buildRejectedGraph(response);
    } catch {
      return fallbackGraph(vectorizable);
    }
  }, [response, vectorizable]);

  return (
    <div className="flex flex-col gap-2">
      <div className="h-[220px] overflow-hidden rounded-md border border-border bg-card/40">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnDrag={false}
          preventScrolling={false}
        >
          <Background gap={16} color="#232833" />
        </ReactFlow>
      </div>
      <p
        className={`font-mono text-xs ${vectorizable ? "text-success" : "text-destructive"}`}
      >
        {caption}
      </p>
    </div>
  );
}
