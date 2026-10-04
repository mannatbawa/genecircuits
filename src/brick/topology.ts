// src/brick/topology.ts
// Pure analysis: read each construct, derive the regulatory wiring (edges),
// find feedback loops, and produce the plain-English readout.
// Lifted verbatim-in-spirit from brick-bench_1.jsx — do NOT "clean up" the logic,
// or the diagram will disagree with Allen's simulator.

import { Construct, ConstructInfo, Edge, Letter } from "./types";

const LC: Record<Letter, string> = {
  A: "#f0a442", B: "#b39ddb", C: "#67d5d0", D: "#7fb4e8",
};

const promName = (sites: Letter[], hasProm: boolean): string =>
  !hasProm ? "p?" : sites.length ? "p" + sites.join("") : "pConst";

/** Read one construct's parts into its derived meaning. */
export function readConstruct(c: Construct): ConstructInfo {
  const parts = c.parts;
  const sites = parts.filter((p) => p.t === "op").map((p) => (p as { L: Letter }).L);
  const hasProm = parts.some((p) => p.t === "prom");
  const dbd = parts.find((p) => p.t === "dbd") as { L: Letter } | undefined;
  const dom = parts.find((p) => p.t === "dom") as { pol: "act" | "rep" } | undefined;
  const fp = parts.find((p) => p.t === "fp") as { name: string; color: string } | undefined;

  const pn = promName(sites, hasProm);
  let cds: string;
  let product: ConstructInfo["product"] = null;
  let color: string | null = null;
  let gap: string | null = null;
  let fluor: ConstructInfo["fluor"] = null;

  if (fp) {
    cds = fp.name; product = { kind: "reporter" }; color = fp.color;
    fluor = { name: fp.name, color: fp.color };
  } else if (dbd && dom) {
    cds = `TF_${dbd.L}(${dom.pol === "act" ? "+" : "−"})`;
    product = { kind: "tf", dbd: dbd.L, pol: dom.pol }; color = LC[dbd.L];
  } else if (dbd) {
    cds = `TF_${dbd.L}(?)`; color = LC[dbd.L];
    gap = `no effector domain — it binds promoter ${dbd.L} but changes nothing`;
  } else {
    cds = "—"; gap = "no coding sequence";
  }
  if (!hasProm) gap = "no promoter — never transcribed";

  return {
    c, sites, hasProm, product, fluor,
    color: color || "#9aa79c",
    gap, promoter: pn, cds, full: `${pn}__${cds}`, short: cds,
  };
}

export type Analysis = {
  info: ConstructInfo[];
  byLetter: Map<Letter, ConstructInfo[]>;
  incoherent: Set<Letter>;
  edges: Edge[];
  dangling: ConstructInfo[];
};

/** Derive who-regulates-whom from the constructs. */
export function analyse(constructs: Construct[]): Analysis {
  const info: ConstructInfo[] = constructs.map(readConstruct);

  const byLetter = new Map<Letter, ConstructInfo[]>();
  info.forEach((x) => {
    if (x.product?.kind !== "tf") return;
    const L = x.product.dbd;
    if (!byLetter.has(L)) byLetter.set(L, []);
    byLetter.get(L)!.push(x);
  });

  const incoherent = new Set<Letter>();
  for (const [L, list] of byLetter) {
    const pols = list.map((x) => (x.product as { pol: "act" | "rep" }).pol);
    if (pols.includes("act") && pols.includes("rep")) incoherent.add(L);
  }

  const emap = new Map<string, Edge>();
  info.forEach((target) => {
    target.sites.forEach((L) => {
      for (const src of byLetter.get(L) || []) {
        const k = `${src.c.id}>${target.c.id}`;
        if (!emap.has(k)) {
          emap.set(k, {
            s: src.c.id, t: target.c.id,
            pol: (src.product as { pol: "act" | "rep" }).pol,
            letter: L, mult: 0,
          });
        }
        emap.get(k)!.mult++;
      }
    });
  });

  const dangling = info.filter(
    (x) => x.product?.kind === "tf" &&
      !info.some((t) => t.sites.includes((x.product as { dbd: Letter }).dbd))
  );

  return { info, byLetter, incoherent, edges: [...emap.values()], dangling };
}

type Cycle = { nodes: number[]; edges: Edge[] };

export function cyclesOf(info: ConstructInfo[], edges: Edge[]): Cycle[] {
  const order = info.map((x) => x.c.id);
  const pos = new Map<number, number>(order.map((id, i) => [id, i]));
  const adj = new Map<number, Edge[]>();
  for (const e of edges) {
    if (!adj.has(e.s)) adj.set(e.s, []);
    adj.get(e.s)!.push(e);
  }
  const out: Cycle[] = [];
  for (const st of order) {
    const sp = pos.get(st)!;
    const path: number[] = [st];
    const pe: Edge[] = [];
    const on = new Set<number>([st]);
    const dfs = (nd: number) => {
      for (const e of adj.get(nd) || []) {
        if (e.t === st) out.push({ nodes: [...path], edges: [...pe, e] });
        else if (!on.has(e.t) && pos.get(e.t)! > sp) {
          on.add(e.t); path.push(e.t); pe.push(e);
          dfs(e.t);
          on.delete(e.t); path.pop(); pe.pop();
        }
      }
    };
    dfs(st);
  }
  return out;
}

export type ReadoutNote = { tone: "mut" | "warn"; text: string };
export type Readout = { main: string; notes: ReadoutNote[] };

export function readout(an: Analysis): Readout {
  const notes: ReadoutNote[] = [];
  for (const x of an.info) if (x.gap) notes.push({ tone: "mut", text: `${x.full}: ${x.gap}.` });
  for (const L of an.incoherent) {
    const who = an.info.filter((x) => x.product?.kind === "tf" && (x.product as { dbd: Letter }).dbd === L);
    notes.push({
      tone: "warn",
      text: `Promoter ${L} is targeted by both ${who.map((x) => x.short).join(" and ")} — opposite domains at one operator. The sketch applies both; real proteins would compete for the site.`,
    });
  }
  for (const x of an.dangling)
    notes.push({
      tone: "mut",
      text: `${x.short} targets promoter ${(x.product as { dbd: Letter }).dbd}, which no construct carries — it regulates nothing yet.`,
    });

  let main: string;
  const cyc = cyclesOf(an.info, an.edges);
  if (!an.info.length) main = "Empty bench — drag a part across, or tap one.";
  else if (!cyc.length)
    main = an.edges.length === 0
      ? "Nothing is wired: no factor targets an operator that exists."
      : "Open circuit, no feedback — transients, then a steady state.";
  else {
    const tg = cyc.map((c) => ({ ...c, neg: c.edges.filter((e) => e.pol === "rep").length % 2 === 1 }));
    const negs = tg.filter((c) => c.neg);
    const poss = tg.filter((c) => !c.neg);
    if (negs.length) {
      const c = negs.reduce((a, b) => (a.nodes.length <= b.nodes.length ? a : b));
      main = c.nodes.length === 1
        ? "Negative autoregulation — a set point, not a clock."
        : `Negative feedback loop of ${c.nodes.length} — oscillation is possible.`;
      if (c.nodes.length >= 3) {
        const lg = an.info.filter((x) => c.nodes.includes(x.c.id)).map((x) => x.c);
        if (lg.some((g) => g.n < 3))
          notes.push({ tone: "mut", text: "Hill coefficient below 3 on the loop — it will settle at a fixed point instead of oscillating." });
        if (lg.every((g) => Math.abs(g.init - lg[0].init) < 1e-12) &&
            lg.every((g) => Math.abs(g.gamma - lg[0].gamma) < 1e-12))
          notes.push({ tone: "mut", text: "Identical loop constructs from identical starts sit on the unstable symmetric point — perturb one, or add variability." });
      }
      if (poss.length) notes.push({ tone: "mut", text: `A positive loop of ${poss[0].nodes.length} is also present.` });
    } else {
      const c = poss.reduce((a, b) => (a.nodes.length <= b.nodes.length ? a : b));
      main = c.nodes.length === 1
        ? "Positive autoregulation — bistable."
        : `Positive feedback loop of ${c.nodes.length} — bistable: it locks into one pattern and holds it.`;
    }
  }
  return { main, notes };
}
