export interface Example {
  id: string;
  name: string;
  description: string;
  cLike: string;
  toyIr: string;
}

export const EXAMPLES: Example[] = [
  {
    id: "simple-addition",
    name: "Simple Addition",
    description: "Elementwise C[i] = A[i] + B[i], fully independent per iteration.",
    cLike: `for (int i = 0; i < 100; i++) {\n    C[i] = A[i] + B[i];\n}`,
    toyIr: `LOOP i 0 100 1\nLOAD t1, A[i]\nLOAD t2, B[i]\nADD t3, t1, t2\nSTORE C[i], t3\nENDLOOP`,
  },
  {
    id: "simple-multiplication",
    name: "Simple Multiplication",
    description: "Elementwise C[i] = A[i] * B[i], fully independent per iteration.",
    cLike: `for (int i = 0; i < 100; i++) {\n    C[i] = A[i] * B[i];\n}`,
    toyIr: `LOOP i 0 100 1\nLOAD t1, A[i]\nLOAD t2, B[i]\nMUL t3, t1, t2\nSTORE C[i], t3\nENDLOOP`,
  },
  {
    id: "independent-arrays",
    name: "Independent Arrays",
    description: "Three independent input arrays combined into one output.",
    cLike: `for (int i = 0; i < 100; i++) {\n    D[i] = A[i] + B[i] - C[i];\n}`,
    toyIr: `LOOP i 0 100 1\nLOAD t1, A[i]\nLOAD t2, B[i]\nADD t3, t1, t2\nLOAD t4, C[i]\nSUB t5, t3, t4\nSTORE D[i], t5\nENDLOOP`,
  },
  {
    id: "loop-carried-dependency",
    name: "Loop-Carried Dependency",
    description: "Each iteration reads the previous iteration's write — unsafe to vectorize.",
    cLike: `for (int i = 1; i < 100; i++) {\n    A[i] = A[i-1] + 1;\n}`,
    toyIr: `LOOP i 1 100 1\nLOAD t1, A[i-1]\nCONST t2, 1\nADD t3, t1, t2\nSTORE A[i], t3\nENDLOOP`,
  },
  {
    id: "array-shift",
    name: "Array Shift",
    description: "Reads one index ahead of the write — a forward loop-carried hazard.",
    cLike: `for (int i = 0; i < 100; i++) {\n    A[i] = A[i+1];\n}`,
    toyIr: `LOOP i 0 100 1\nLOAD t1, A[i+1]\nSTORE A[i], t1\nENDLOOP`,
  },
  {
    id: "remainder-tail",
    name: "Remainder / Tail",
    description: "10 iterations — too few to divide evenly, exercising the scalar tail.",
    cLike: `for (int i = 0; i < 10; i++) {\n    C[i] = A[i] + B[i];\n}`,
    toyIr: `LOOP i 0 10 1\nLOAD t1, A[i]\nLOAD t2, B[i]\nADD t3, t1, t2\nSTORE C[i], t3\nENDLOOP`,
  },
];
