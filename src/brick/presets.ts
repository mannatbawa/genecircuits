import { clonePart, FPS, makeConstruct } from "./parts";
import { Construct, Letter } from "./types";

const op = (L: Letter) => clonePart({ t: "op", L });
const prom = () => clonePart({ t: "prom" });
const dbd = (L: Letter) => clonePart({ t: "dbd", L });
const dom = (pol: "act" | "rep") => clonePart({ t: "dom", pol });
const fp = (i: number) => clonePart({ t: "fp", ...FPS[i] });

export type PresetKey = "repressilator" | "toggle" | "andgate" | "copies" | "blank";

export const PRESETS: Record<PresetKey, { label: string; T: number; count: number; make: () => Construct[] }> = {
  repressilator: {
    label: "Repressilator",
    T: 100,
    count: 4,
    make: () => [
      makeConstruct([op("C"), prom(), dbd("A"), dom("rep")], 1, 0.001),
      makeConstruct([op("A"), prom(), dbd("B"), dom("rep")]),
      makeConstruct([op("B"), prom(), dbd("C"), dom("rep")]),
      makeConstruct([op("A"), prom(), fp(0)]),
    ],
  },
  toggle: {
    label: "Toggle switch",
    T: 40,
    count: 4,
    make: () => [
      makeConstruct([op("B"), prom(), dbd("A"), dom("rep")], 1, 0.4),
      makeConstruct([op("A"), prom(), dbd("B"), dom("rep")], 1, 0.3),
      makeConstruct([op("A"), prom(), fp(0)]),
      makeConstruct([op("B"), prom(), fp(1)]),
    ],
  },
  andgate: {
    label: "AND gate",
    T: 20,
    count: 3,
    make: () => [
      makeConstruct([prom(), dbd("A"), dom("act")], 1, 0, 0.3, 3),
      makeConstruct([prom(), dbd("B"), dom("act")], 0.25, 0, 0.3, 3),
      makeConstruct([op("A"), op("B"), prom(), fp(0)]),
    ],
  },
  copies: {
    label: "Copy number sharpens",
    T: 20,
    count: 3,
    make: () => [
      makeConstruct([prom(), dbd("A"), dom("rep")], 0.15, 0, 0.5, 2),
      makeConstruct([op("A"), prom(), fp(2)]),
      makeConstruct([op("A"), op("A"), op("A"), prom(), fp(0)]),
    ],
  },
  blank: { label: "Empty bench", T: 30, count: 0, make: () => [] },
};
