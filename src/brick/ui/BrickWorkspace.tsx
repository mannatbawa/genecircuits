import React from "react";
import { ConstructList } from "./ConstructList";
import { useBrickBench } from "../BrickBenchContext";
import { Brick } from "./Brick";
import { DiagramProps, SimPanelProps } from "../types";

function DiagramPlaceholder({ constructs }: DiagramProps) {
  return (
    <div className="brick-placeholder">
      Wiring diagram (Reeya) · {constructs.length} construct{constructs.length === 1 ? "" : "s"}
    </div>
  );
}

function SimPlaceholder({ constructs }: SimPanelProps) {
  return (
    <div className="brick-placeholder">
      Traces and microscope (Allen) · {constructs.length} construct{constructs.length === 1 ? "" : "s"}
    </div>
  );
}

export function BrickWorkspace() {
  const { constructs, drag } = useBrickBench();
  return (
    <div className="brick-workspace">
      {drag && (
        <div
          className="brick-drag-ghost"
          style={{ left: drag.x, top: drag.y }}
        >
          <Brick part={drag.part} />
        </div>
      )}
      <ConstructList />
      <div className="brick-workspace-slots">
        <DiagramPlaceholder constructs={constructs} />
        <SimPlaceholder constructs={constructs} />
      </div>
    </div>
  );
}
