/** Frozen Brick Bench contract. Do not change without the whole trio agreeing. */

export type Letter = "A" | "B" | "C" | "D";

export type Part =
  | { id: number; t: "op"; L: Letter }
  | { id: number; t: "prom" }
  | { id: number; t: "dbd"; L: Letter }
  | { id: number; t: "dom"; pol: "act" | "rep" }
  | { id: number; t: "fp"; name: string; color: string };

export type Construct = {
  id: number;
  parts: Part[];
  gamma: number;
  init: number;
  K: number;
  n: number;
};

export type ConstructInfo = {
  c: Construct;
  sites: Letter[];
  hasProm: boolean;
  product: { kind: "reporter" } | { kind: "tf"; dbd: Letter; pol: "act" | "rep" } | null;
  fluor: { name: string; color: string } | null;
  color: string;
  gap: string | null;
  promoter: string;
  cds: string;
  full: string;
  short: string;
};

export type Edge = {
  s: number; // source construct id
  t: number; // target construct id
  pol: "act" | "rep";
  letter: Letter;
  mult: number;
};

/** Reeya: export function Diagram({ constructs }: DiagramProps) */
export type DiagramProps = {
  constructs: Construct[];
};

/** Allen: export function SimPanel({ constructs }: SimPanelProps) */
export type SimPanelProps = {
  constructs: Construct[];
};
