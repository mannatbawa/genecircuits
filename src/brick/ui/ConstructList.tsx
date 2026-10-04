import React from "react";
import { canAppend, startsOK } from "../parts";
import { describeConstruct, useBrickBench } from "../BrickBenchContext";
import { Brick } from "./Brick";
import { BH } from "../parts";

export function ConstructList() {
  const { constructs, selId, setSelId, drag, removePart } = useBrickBench();

  return (
    <div className="brick-construct-list">
      {constructs.map((c) => {
        const x = describeConstruct(c);
        const on = selId === c.id;
        const fits = drag ? canAppend(c.parts, drag.part.t) : false;
        return (
          <div
            key={c.id}
            data-drop={c.id}
            className={`brick-construct ${on ? "selected" : ""} ${drag && !fits ? "dim" : ""} ${drag && fits ? "drop-ok" : ""}`}
          >
            <button type="button" className="brick-construct-label" onClick={() => setSelId(on ? null : c.id)}>
              <span className="brick-dot" style={{ background: x.color }} />
              <span className="brick-mono">{x.full}</span>
              {x.gap && <span className="brick-incomplete">incomplete</span>}
            </button>
            <div className="brick-row-wrap">
              <div className="brick-row-line" style={{ top: BH / 2 }} />
              <div className="brick-row">
                {c.parts.map((p) => (
                  <Brick key={p.id} part={p} onClick={() => removePart(c.id, p.id)} hint="tap to remove" />
                ))}
              </div>
            </div>
          </div>
        );
      })}
      <div
        data-drop="new"
        className={`brick-new-drop ${drag && startsOK(drag.part.t) ? "drop-ok" : ""}`}
      >
        drop an operator or promoter here to start a new construct
      </div>
    </div>
  );
}
