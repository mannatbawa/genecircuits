import { ConstructInfo, Letter, Part } from "./types";

export const LC: Record<Letter, string> = {
  A: "#f0a442",
  B: "#b39ddb",
  C: "#67d5d0",
  D: "#7fb4e8",
};

export const FPS = [
  { name: "GFP", color: "#4ade80" },
  { name: "mCherry", color: "#e8879c" },
  { name: "BFP", color: "#8fa6ff" },
];

export const LETTERS: Letter[] = ["A", "B", "C", "D"];
export const TAB = 9;
export const BH = 38;
const R = 9;
const DOM_COL = { act: "#7fd18c", rep: "#d98a8a" };

export type Connector = "sq" | "round" | "tri" | "none";
export type PalettePart = Omit<Part, "id">;

let uid = 1000;
export const nid = () => ++uid;

export function brickPath(w: number, left: Connector, right: Connector): string {
  const cy = BH / 2;
  let d = `M 0 0 L ${w} 0 L ${w} ${cy - R}`;
  if (right === "round") d += ` C ${w + TAB} ${cy - R} ${w + TAB} ${cy + R} ${w} ${cy + R}`;
  else if (right === "tri") d += ` L ${w + TAB} ${cy} L ${w} ${cy + R}`;
  else if (right === "sq") d += ` L ${w + TAB} ${cy - R} L ${w + TAB} ${cy + R} L ${w} ${cy + R}`;
  else d += ` L ${w} ${cy + R}`;
  d += ` L ${w} ${BH} L 0 ${BH} L 0 ${cy + R}`;
  if (left === "round") d += ` C ${TAB} ${cy + R} ${TAB} ${cy - R} 0 ${cy - R}`;
  else if (left === "tri") d += ` L ${TAB} ${cy} L 0 ${cy - R}`;
  else if (left === "sq") d += ` L ${TAB} ${cy + R} L ${TAB} ${cy - R} L 0 ${cy - R}`;
  else d += ` L 0 ${cy - R}`;
  return d + " Z";
}

export type BrickSpec = {
  w: number;
  left: Connector;
  right: Connector;
  fill: string;
  label: string;
  aria: string;
};

export function spec(p: Part | PalettePart): BrickSpec {
  if (p.t === "op") return { w: 34, left: "sq", right: "sq", fill: LC[p.L], label: p.L, aria: `operator ${p.L}` };
  if (p.t === "prom") return { w: 46, left: "sq", right: "round", fill: "#9aa79c", label: "P", aria: "minimal promoter" };
  if (p.t === "dbd") return { w: 74, left: "round", right: "tri", fill: LC[p.L], label: `DBD_${p.L}`, aria: `DNA-binding domain for promoter ${p.L}` };
  if (p.t === "dom") {
    return {
      w: 40,
      left: "tri",
      right: "none",
      fill: DOM_COL[p.pol],
      label: p.pol === "act" ? "+" : "−",
      aria: p.pol === "act" ? "activation domain" : "repression domain",
    };
  }
  return { w: 74, left: "round", right: "none", fill: p.color, label: p.name, aria: p.name };
}

export const startsOK = (t: Part["t"]) => t === "op" || t === "prom";

export const follows: Record<Part["t"], Part["t"][]> = {
  op: ["op", "prom"],
  prom: ["dbd", "fp"],
  dbd: ["dom"],
  dom: [],
  fp: [],
};

export const canAppend = (parts: Part[], t: Part["t"]) =>
  parts.length === 0 ? startsOK(t) : follows[parts[parts.length - 1].t].includes(t);

export const clonePart = (part: Part | PalettePart): Part => ({ ...part, id: nid() } as Part);

const promName = (sites: Letter[], hasProm: boolean) =>
  !hasProm ? "p?" : sites.length ? "p" + sites.join("") : "pConst";

export function readConstruct(parts: Part[]): Omit<ConstructInfo, "c"> {
  const sites = parts.filter((p): p is Extract<Part, { t: "op" }> => p.t === "op").map((p) => p.L);
  const hasProm = parts.some((p) => p.t === "prom");
  const dbd = parts.find((p): p is Extract<Part, { t: "dbd" }> => p.t === "dbd");
  const dom = parts.find((p): p is Extract<Part, { t: "dom" }> => p.t === "dom");
  const fp = parts.find((p): p is Extract<Part, { t: "fp" }> => p.t === "fp");
  const pn = promName(sites, hasProm);
  let cds: string;
  let product: ConstructInfo["product"] = null;
  let color: string | null = null;
  let gap: string | null = null;
  let fluor: ConstructInfo["fluor"] = null;
  if (fp) {
    cds = fp.name;
    product = { kind: "reporter" };
    color = fp.color;
    fluor = { name: fp.name, color: fp.color };
  } else if (dbd && dom) {
    cds = `TF_${dbd.L}(${dom.pol === "act" ? "+" : "−"})`;
    product = { kind: "tf", dbd: dbd.L, pol: dom.pol };
    color = LC[dbd.L];
  } else if (dbd) {
    cds = `TF_${dbd.L}(?)`;
    color = LC[dbd.L];
    gap = `no effector domain — it binds promoter ${dbd.L} but changes nothing`;
  } else {
    cds = "—";
    gap = "no coding sequence";
  }
  if (!hasProm) gap = "no promoter — never transcribed";
  return {
    sites,
    hasProm,
    product,
    fluor,
    color: color || "#9aa79c",
    gap,
    promoter: pn,
    cds,
    full: `${pn}__${cds}`,
    short: cds,
  };
}

export function makeConstruct(parts: Part[], gamma = 1, init = 0, K = 0.2, n = 4) {
  return { id: nid(), parts, gamma, init, K, n };
}
