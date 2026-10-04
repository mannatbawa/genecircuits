import React from "react";
import { BH, TAB, brickPath, spec, PalettePart } from "../parts";
import { Part } from "../types";

type BrickProps = {
  part: Part | PalettePart;
  onClick?: () => void;
  onPointerDown?: (event: React.PointerEvent) => void;
  hint?: string;
};

export function Brick({ part, onClick, onPointerDown, hint }: BrickProps) {
  const s = spec(part);
  const interactive = Boolean(onClick || onPointerDown);
  return (
    <svg
      width={s.w + TAB}
      height={BH}
      viewBox={`0 0 ${s.w + TAB} ${BH}`}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className="brick-svg"
      style={{
        marginRight: -TAB,
        display: "block",
        cursor: onPointerDown ? "grab" : onClick ? "pointer" : "default",
        touchAction: "none",
        flex: "0 0 auto",
      }}
      role={interactive ? "button" : undefined}
      aria-label={hint ? `${s.aria} — ${hint}` : s.aria}
    >
      <path d={brickPath(s.w, s.left, s.right)} fill={s.fill} stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
      {part.t === "prom" ? (
        <g stroke="#0c1810" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M 12 27 L 12 14 L 24 14" />
          <path d="M 21 10.5 L 27 14 L 21 17.5" fill="#0c1810" stroke="none" />
        </g>
      ) : (
        <text
          x={s.w / 2 + 2}
          y={BH / 2 + (part.t === "dom" ? 6 : 4.5)}
          textAnchor="middle"
          fontSize={part.t === "op" ? 14 : part.t === "dom" ? 19 : 11.5}
          fontWeight="700"
          fontFamily={part.t === "dbd" || part.t === "fp" ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit"}
          fill="#0c1810"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {s.label}
        </text>
      )}
    </svg>
  );
}
