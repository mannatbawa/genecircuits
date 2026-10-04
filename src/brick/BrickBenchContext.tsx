import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { canAppend, clonePart, makeConstruct, PalettePart, readConstruct, startsOK, follows } from "./parts";
import { PRESETS, PresetKey } from "./presets";
import { Construct } from "./types";

export type DragState = { part: PalettePart; x: number; y: number };

type BrickBenchState = {
  constructs: Construct[];
  selId: number | null;
  presetKey: PresetKey;
  simT: number;
  drag: DragState | null;
  setSelId: (id: number | null) => void;
  loadPreset: (key: PresetKey) => void;
  tapPart: (part: PalettePart) => void;
  startDrag: (part: PalettePart) => (event: React.PointerEvent) => void;
  appendTo: (cid: number, part: PalettePart) => void;
  newWith: (part: PalettePart) => boolean;
  removePart: (cid: number, pid: number) => void;
  updateConstruct: (cid: number, patch: Partial<Pick<Construct, "gamma" | "init" | "K" | "n">>) => void;
  discardConstruct: (cid: number) => void;
  clearBench: () => void;
};

const BrickBenchContext = createContext<BrickBenchState | null>(null);

export function BrickBenchProvider({ children }: { children: ReactNode }) {
  const [presetKey, setPresetKey] = useState<PresetKey>("repressilator");
  const [constructs, setConstructs] = useState<Construct[]>(() => PRESETS.repressilator.make());
  const [simT, setSimT] = useState(PRESETS.repressilator.T);
  const [selId, setSelId] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<{ part: PalettePart; sx: number; sy: number; moved: boolean } | null>(null);

  const loadPreset = useCallback((key: PresetKey) => {
    setConstructs(PRESETS[key].make());
    setSimT(PRESETS[key].T);
    setPresetKey(key);
    setSelId(null);
  }, []);

  const appendTo = useCallback((cid: number, part: PalettePart) => {
    setConstructs((cs) =>
      cs.map((c) => (c.id === cid && canAppend(c.parts, part.t) ? { ...c, parts: [...c.parts, clonePart(part)] } : c))
    );
  }, []);

  const newWith = useCallback((part: PalettePart) => {
    if (!startsOK(part.t)) return false;
    const c = makeConstruct([clonePart(part)]);
    setConstructs((cs) => [...cs, c]);
    setSelId(c.id);
    return true;
  }, []);

  const tapPart = useCallback(
    (part: PalettePart) => {
      const target = constructs.find((c) => c.id === selId);
      if (target && canAppend(target.parts, part.t)) {
        appendTo(target.id, part);
        return;
      }
      if (!newWith(part)) {
        const fit = constructs.find((c) => canAppend(c.parts, part.t));
        if (fit) {
          appendTo(fit.id, part);
          setSelId(fit.id);
        }
      }
    },
    [appendTo, constructs, newWith, selId]
  );

  const removePart = useCallback((cid: number, pid: number) => {
    setConstructs((cs) =>
      cs
        .map((c) => {
          if (c.id !== cid) return c;
          const i = c.parts.findIndex((p) => p.id === pid);
          const next = c.parts.filter((_, j) => j !== i);
          for (let j = 1; j < next.length; j++) {
            if (!follows[next[j - 1].t].includes(next[j].t)) return c;
          }
          if (next.length && !startsOK(next[0].t)) return c;
          return { ...c, parts: next };
        })
        .filter((c) => c.parts.length > 0)
    );
  }, []);

  const updateConstruct = useCallback((cid: number, patch: Partial<Pick<Construct, "gamma" | "init" | "K" | "n">>) => {
    setConstructs((cs) => cs.map((c) => (c.id === cid ? { ...c, ...patch } : c)));
  }, []);

  const discardConstruct = useCallback((cid: number) => {
    setConstructs((cs) => cs.filter((c) => c.id !== cid));
    setSelId((id) => (id === cid ? null : id));
  }, []);

  const clearBench = useCallback(() => {
    setConstructs([]);
    setSelId(null);
    setPresetKey("blank");
  }, []);

  const startDrag = useCallback(
    (part: PalettePart) => (event: React.PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current = { part, sx: event.clientX, sy: event.clientY, moved: false };
      setDrag({ part, x: event.clientX, y: event.clientY });
    },
    []
  );

  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) => {
      const d = dragRef.current;
      if (d && (Math.abs(event.clientX - d.sx) > 5 || Math.abs(event.clientY - d.sy) > 5)) d.moved = true;
      setDrag((s) => (s ? { ...s, x: event.clientX, y: event.clientY } : s));
    };
    const up = (event: PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!d) return;
      if (!d.moved) {
        tapPart(d.part);
        return;
      }
      const el = document.elementFromPoint(event.clientX, event.clientY);
      const zone = el?.closest?.("[data-drop]");
      if (!zone) return;
      const cid = zone.getAttribute("data-drop");
      if (cid === "new") newWith(d.part);
      else {
        appendTo(Number(cid), d.part);
        setSelId(Number(cid));
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, tapPart, newWith, appendTo]);

  return (
    <BrickBenchContext.Provider
      value={{
        constructs,
        selId,
        presetKey,
        simT,
        drag,
        setSelId,
        loadPreset,
        tapPart,
        startDrag,
        appendTo,
        newWith,
        removePart,
        updateConstruct,
        discardConstruct,
        clearBench,
      }}
    >
      {children}
    </BrickBenchContext.Provider>
  );
}

export function useBrickBench(): BrickBenchState {
  const ctx = useContext(BrickBenchContext);
  if (!ctx) throw new Error("useBrickBench must be used within BrickBenchProvider");
  return ctx;
}

export function describeConstruct(c: Construct) {
  return { c, ...readConstruct(c.parts) };
}
