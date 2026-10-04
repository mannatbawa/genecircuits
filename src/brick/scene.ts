// src/brick/scene.ts
// Turns an Analysis into pure LAYOUT DATA: node positions + boxes, and edge
// path/arrow-tip data. Ported from brick-bench's pos()/arc(), but as data only.
// RULE: all geometry lives here. Diagram.tsx must do zero layout math — it only draws.

import { Analysis } from "./topology";
import { ConstructInfo, Letter } from "./types";

const LC: Record<Letter, string> = {
  A: "#f0a442", B: "#b39ddb", C: "#67d5d0", D: "#7fb4e8",
};

const WW = 400, WH = 320, BLH = 30, CHW = 6.35;

export type SceneNode = {
  id: number;
  x: number; y: number;      // center
  w: number; h: number;
  color: string;
  label: string;             // full construct name, e.g. "pC__TF_A(−)"
  sites: Letter[];           // operator stripe on the left edge
  gap: boolean;              // true => draw dashed (incomplete construct)
};

export type SceneEdge = {
  path: string;              // SVG path "d"
  color: string;
  pol: "act" | "rep";
  letter: Letter;
  mult: number;
  tipX: number; tipY: number;    // where the arrowhead/bar sits
  dirX: number; dirY: number;    // unit tangent at the tip (arrow direction)
  perpX: number; perpY: number;  // unit perpendicular (bar / arrow wings)
  self: boolean;                 // self-loop
  labelX: number; labelY: number; // position for the ×mult label
};

export type Scene = {
  width: number; height: number;
  nodes: SceneNode[];
  edges: SceneEdge[];
};

const blockW = (x: ConstructInfo) => Math.max(74, Math.round(x.full.length * CHW) + 18);

export function buildScene(an: Analysis): Scene {
  const info = an.info;
  const N = info.length;

  // ---- node positions: single / pair / ring ----
  const posMap = new Map<number, { x: number; y: number }>();
  if (N === 1) {
    posMap.set(info[0].c.id, { x: WW / 2, y: WH / 2 });
  } else if (N === 2) {
    info.forEach((x, i) => posMap.set(x.c.id, { x: WW / 2, y: 105 + i * 110 }));
  } else {
    const Rr = N <= 4 ? 106 : 118;
    info.forEach((x, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / N;
      posMap.set(x.c.id, {
        x: WW / 2 + Rr * Math.cos(a) * 1.06,
        y: WH / 2 + Rr * Math.sin(a) * 0.92,
      });
    });
  }

  const nodes: SceneNode[] = info.map((x) => {
    const p = posMap.get(x.c.id)!;
    return {
      id: x.c.id, x: p.x, y: p.y, w: blockW(x), h: BLH,
      color: x.color, label: x.full, sites: x.sites, gap: !!x.gap,
    };
  });

  const halfOf = (id: number) => {
    const x = info.find((z) => z.c.id === id)!;
    return { hw: blockW(x) / 2 + 4, hh: BLH / 2 + 4 };
  };
  // Where a ray from a box center exits the box edge.
  const exitPoint = (c: { x: number; y: number }, ux: number, uy: number, id: number) => {
    const { hw, hh } = halfOf(id);
    const t = Math.min(
      Math.abs(ux) < 1e-6 ? 1e9 : hw / Math.abs(ux),
      Math.abs(uy) < 1e-6 ? 1e9 : hh / Math.abs(uy)
    );
    return { x: c.x + ux * t, y: c.y + uy * t };
  };

  const edges: SceneEdge[] = [];
  for (const e of an.edges) {
    const a = posMap.get(e.s);
    const b = posMap.get(e.t);
    if (!a || !b) continue;
    const col = LC[e.letter];

    // self-loop: a little arc above the box
    if (e.s === e.t) {
      const { hh } = halfOf(e.s);
      const cy = a.y - hh - 20;
      edges.push({
        path: `M ${a.x - 16} ${cy + 20} C ${a.x - 26} ${cy - 15} ${a.x + 26} ${cy - 15} ${a.x + 16} ${cy + 18}`,
        color: col, pol: e.pol, letter: e.letter, mult: e.mult,
        tipX: a.x + 16, tipY: cy + 18,
        dirX: 0.4, dirY: 0.92, perpX: -0.92, perpY: 0.4,
        self: true, labelX: a.x, labelY: cy - 6,
      });
      continue;
    }

    const dx = b.x - a.x, dy = b.y - a.y;
    const L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L;
    const p0 = exitPoint(a, ux, uy, e.s);
    const p1 = exitPoint(b, -ux, -uy, e.t);
    // if a reverse edge exists (e.g. toggle), bow outward so they don't overlap
    const twin = an.edges.some((o) => o.s === e.t && o.t === e.s);
    const off = twin ? 22 : Math.min(24, L * 0.14);
    const mx = (p0.x + p1.x) / 2 - uy * off;
    const my = (p0.y + p1.y) / 2 + ux * off;
    const q = (t: number): [number, number] => {
      const s = 1 - t;
      return [
        s * s * p0.x + 2 * s * t * mx + t * t * p1.x,
        s * s * p0.y + 2 * s * t * my + t * t * p1.y,
      ];
    };
    const [xe, ye] = q(1);
    const [xd, yd] = q(0.88);
    const tx = xe - xd, ty = ye - yd;
    const tl = Math.hypot(tx, ty) || 1;
    edges.push({
      path: `M ${p0.x} ${p0.y} Q ${mx} ${my} ${xe} ${ye}`,
      color: col, pol: e.pol, letter: e.letter, mult: e.mult,
      tipX: xe, tipY: ye,
      dirX: tx / tl, dirY: ty / tl,
      perpX: -ty / tl, perpY: tx / tl,
      self: false, labelX: mx, labelY: my,
    });
  }

  return { width: WW, height: WH, nodes, edges };
}
