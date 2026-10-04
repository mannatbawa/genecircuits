// src/brick/ui/DiagramDev.tsx
// Isolated harness so you can see the diagram WITHOUT the bench or sim.
// To view it: temporarily point the web entry at this component (see note in chat),
// run `npm run dev:frontend`, open http://localhost:5173.

import React from "react";
import { Diagram } from "./Diagram";
import { REPRESSILATOR } from "../fixtures";

export default function DiagramDev() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f1512",
        padding: 24,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ color: "#e7ede7", fontWeight: 500, fontSize: 20 }}>
          Diagram dev — repressilator
        </h2>
        <p style={{ color: "#8a968c", fontSize: 13, marginTop: -6 }}>
          Should show a 3-cycle of repressions (C→A→B→C) plus a GFP reporter node,
          and the readout “Negative feedback loop of 3 — oscillation is possible.”
        </p>
        <Diagram constructs={REPRESSILATOR} />
      </div>
    </div>
  );
}


// // src/brick/ui/DiagramDev.tsx
// // Isolated harness: renders the diagram for several test circuits at once.

// import React from "react";
// import { Construct } from "../types";
// import { Diagram } from "./Diagram";
// import { REPRESSILATOR } from "../fixtures";

// const TOGGLE: Construct[] = [
//   { id: 101, gamma: 1, init: 0.4, K: 0.2, n: 4, parts: [{ id: 1011, t: "op", L: "B" }, { id: 1012, t: "prom" }, { id: 1013, t: "dbd", L: "A" }, { id: 1014, t: "dom", pol: "rep" }] },
//   { id: 102, gamma: 1, init: 0.3, K: 0.2, n: 4, parts: [{ id: 1021, t: "op", L: "A" }, { id: 1022, t: "prom" }, { id: 1023, t: "dbd", L: "B" }, { id: 1024, t: "dom", pol: "rep" }] },
//   { id: 103, gamma: 1, init: 0, K: 0.2, n: 4, parts: [{ id: 1031, t: "op", L: "A" }, { id: 1032, t: "prom" }, { id: 1033, t: "fp", name: "GFP", color: "#4ade80" }] },
//   { id: 104, gamma: 1, init: 0, K: 0.2, n: 4, parts: [{ id: 1041, t: "op", L: "B" }, { id: 1042, t: "prom" }, { id: 1043, t: "fp", name: "mCherry", color: "#e8879c" }] },
// ];
// const SELF: Construct[] = [
//   { id: 301, gamma: 1, init: 0.001, K: 0.2, n: 4, parts: [{ id: 3011, t: "op", L: "A" }, { id: 3012, t: "prom" }, { id: 3013, t: "dbd", L: "A" }, { id: 3014, t: "dom", pol: "rep" }] },
// ];
// const SOLO: Construct[] = [
//   { id: 201, gamma: 1, init: 0, K: 0.2, n: 4, parts: [{ id: 2011, t: "prom" }, { id: 2012, t: "fp", name: "GFP", color: "#4ade80" }] },
// ];

// const CASES: { label: string; constructs: Construct[] }[] = [
//   { label: "Repressilator (3-ring)", constructs: REPRESSILATOR },
//   { label: "Toggle switch (mutual repression)", constructs: TOGGLE },
//   { label: "Self-repressor (self-loop)", constructs: SELF },
//   { label: "Lone gene (no wiring)", constructs: SOLO },
//   { label: "Empty bench", constructs: [] },
// ];

// export default function DiagramDev() {
//   return (
//     <div style={{ minHeight: "100vh", background: "#0f1512", padding: 24, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
//       <div style={{ maxWidth: 520, margin: "0 auto" }}>
//         <h2 style={{ color: "#e7ede7", fontWeight: 500, fontSize: 20 }}>Diagram dev — test cases</h2>
//         {CASES.map((c) => (
//           <div key={c.label} style={{ marginBottom: 36 }}>
//             <div style={{ color: "#8a968c", fontSize: 13, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>
//               {c.label}
//             </div>
//             <Diagram constructs={c.constructs} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }