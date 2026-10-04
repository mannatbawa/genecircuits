// src/brick/ui/Diagram.tsx
// "Dumb" renderer: takes constructs, runs analyse + buildScene + readout,
// and draws the result. No layout math lives here — scene.ts owns all geometry.

import React from "react";
import { DiagramProps, Letter } from "../types";
import { analyse, readout } from "../topology";
import { buildScene } from "../scene";

const LC: Record<Letter, string> = {
  A: "#f0a442", B: "#b39ddb", C: "#67d5d0", D: "#7fb4e8",
};
const PANEL = "#151d18", LINE = "#26312a", INK = "#e7ede7",
  MUT = "#8a968c", AMBER = "#f0a442", GO = "#4ade80";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

export function Diagram({ constructs }: DiagramProps) {
  const an = analyse(constructs);
  const scene = buildScene(an);
  const rd = readout(an);

  return (
    <div>
      <svg
        viewBox={`0 0 ${scene.width} ${scene.height}`}
        style={{ width: "100%", background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, display: "block" }}
      >
        {/* edges */}
        {scene.edges.map((e, i) => (
          <g key={`e${i}`}>
            <path d={e.path} fill="none" stroke={e.color} strokeWidth={1.6 + 0.7 * (e.mult - 1)} opacity={0.9} />
            {e.pol === "rep" ? (
              // repression: a blunt bar across the tip
              <line
                x1={e.tipX - e.perpX * 7} y1={e.tipY - e.perpY * 7}
                x2={e.tipX + e.perpX * 7} y2={e.tipY + e.perpY * 7}
                stroke={e.color} strokeWidth={2.8} strokeLinecap="round"
              />
            ) : (
              // activation: an arrowhead
              <path
                d={`M ${e.tipX + e.dirX * 8} ${e.tipY + e.dirY * 8} L ${e.tipX - e.perpX * 5.5} ${e.tipY - e.perpY * 5.5} L ${e.tipX + e.perpX * 5.5} ${e.tipY + e.perpY * 5.5} Z`}
                fill={e.color}
              />
            )}
            {!e.self && e.mult > 1 && (
              <text
                x={e.labelX} y={e.labelY + 3.5} textAnchor="middle" fontSize={10} fontFamily={MONO}
                fill={an.incoherent.has(e.letter) ? AMBER : MUT}
                style={{ paintOrder: "stroke", stroke: PANEL, strokeWidth: 3 } as React.CSSProperties}
              >
                ×{e.mult}
              </text>
            )}
          </g>
        ))}

        {/* nodes */}
        {scene.nodes.map((n) => {
          const stripe = n.sites.length ? n.sites.slice(0, 3) : [null];
          const segH = n.h / stripe.length;
          return (
            <g key={`n${n.id}`}>
              <rect
                x={n.x - n.w / 2} y={n.y - n.h / 2} width={n.w} height={n.h} rx={5}
                fill={n.color} opacity={0.88}
                stroke={n.color} strokeWidth={1.1}
                strokeDasharray={n.gap ? "4 3" : "none"}
              />
              {stripe.map((L, si) => (
                <rect
                  key={si}
                  x={n.x - n.w / 2} y={n.y - n.h / 2 + si * segH}
                  width={7} height={segH}
                  rx={si === 0 || si === stripe.length - 1 ? 3 : 0}
                  fill={L ? LC[L] : "#6d786f"} opacity={0.95}
                />
              ))}
              <text
                x={n.x + 4} y={n.y + 4} textAnchor="middle" fontSize={10.5}
                fontFamily={MONO} fontWeight={600} fill="#0c1810"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* readout */}
      <div style={{ borderLeft: `3px solid ${GO}`, paddingLeft: 12, marginTop: 12 }}>
        <div style={{ fontSize: 17, lineHeight: 1.35, color: INK, fontFamily: "'Spectral', Georgia, serif" }}>
          {rd.main}
        </div>
        {rd.notes.map((note, i) => (
          <div key={i} style={{ fontSize: 12, color: note.tone === "warn" ? AMBER : MUT, marginTop: 5, lineHeight: 1.45 }}>
            {note.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Diagram;
