import React from "react";
import { FPS, LETTERS, PalettePart } from "../parts";
import { useBrickBench } from "../BrickBenchContext";
import { Brick } from "./Brick";
import { Flex, Text } from "@radix-ui/themes";

const PALETTE: { head: string; items: PalettePart[] }[] = [
  { head: "Operators", items: LETTERS.map((L) => ({ t: "op", L })) },
  { head: "Minimal promoter", items: [{ t: "prom" }] },
  { head: "DNA-binding domains", items: LETTERS.map((L) => ({ t: "dbd", L })) },
  { head: "Effector domains", items: [{ t: "dom", pol: "act" }, { t: "dom", pol: "rep" }] },
  { head: "Fluorophores", items: FPS.map((f) => ({ t: "fp", ...f })) },
];

export function PartsBin() {
  const { startDrag } = useBrickBench();
  return (
    <Flex direction="column" gap="3">
      <Text size="4" weight="bold">Parts</Text>
      <Text size="2" color="gray">
        Drag onto a construct, or tap to add. Shapes only snap if the DNA grammar allows it.
      </Text>
      {PALETTE.map((grp) => (
        <div key={grp.head}>
          <Text size="1" color="gray" style={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
            {grp.head}
          </Text>
          <div className="brick-palette-row">
            {grp.items.map((p, i) => (
              <Brick key={i} part={p} onPointerDown={startDrag(p)} hint="drag or tap to add" />
            ))}
          </div>
        </div>
      ))}
    </Flex>
  );
}
