import { Construct } from "./types";

/**
 * Hardcoded repressilator from brick-bench (same parts and default parameters).
 * Reeya and Allen develop against this until the live bench wires constructs.
 */
export const REPRESSILATOR: Construct[] = [
  {
    id: 1,
    gamma: 1,
    init: 0.001,
    K: 0.2,
    n: 4,
    parts: [
      { id: 11, t: "op", L: "C" },
      { id: 12, t: "prom" },
      { id: 13, t: "dbd", L: "A" },
      { id: 14, t: "dom", pol: "rep" },
    ],
  },
  {
    id: 2,
    gamma: 1,
    init: 0,
    K: 0.2,
    n: 4,
    parts: [
      { id: 21, t: "op", L: "A" },
      { id: 22, t: "prom" },
      { id: 23, t: "dbd", L: "B" },
      { id: 24, t: "dom", pol: "rep" },
    ],
  },
  {
    id: 3,
    gamma: 1,
    init: 0,
    K: 0.2,
    n: 4,
    parts: [
      { id: 31, t: "op", L: "B" },
      { id: 32, t: "prom" },
      { id: 33, t: "dbd", L: "C" },
      { id: 34, t: "dom", pol: "rep" },
    ],
  },
  {
    id: 4,
    gamma: 1,
    init: 0,
    K: 0.2,
    n: 4,
    parts: [
      { id: 41, t: "op", L: "A" },
      { id: 42, t: "prom" },
      { id: 43, t: "fp", name: "GFP", color: "#4ade80" },
    ],
  },
];
