/**
 * The SOS mark, built from pure geometry so the SVG logo and the 3D letters
 * share one construction.
 *
 *   S — two stacked arcs of equal radius, terminals cut at 30°
 *   O — a perfect ring (in 3D, the lens itself becomes the O)
 *   · — a red point at the centre of the O: the point of view
 *
 * Units: the mark is 100 tall.
 */

export const MARK = {
  height: 100,
  stroke: 14,
  /** arc radius of each half of the S (centre-line) */
  r: 21.5,
  /** terminal angle in degrees */
  terminal: 30,
  sWidth: 57,
  oSize: 100,
  gap: 14,
  get width() {
    return this.sWidth * 2 + this.oSize + this.gap * 2;
  },
};

const rad = (d: number) => (d * Math.PI) / 180;

/** SVG path (stroke) for one S whose top-left corner is at (x, 0). */
export function sPath(x = 0) {
  const { r, terminal, height } = MARK;
  const cx = x + MARK.sWidth / 2;
  const topCy = height / 2 - r; // svg (y down)
  const botCy = height / 2 + r;
  const tx = cx + r * Math.cos(rad(terminal));
  const ty = topCy - r * Math.sin(rad(terminal));
  const bx = cx - r * Math.cos(rad(terminal));
  const by = botCy + r * Math.sin(rad(terminal));
  const f = (n: number) => +n.toFixed(3);
  return `M${f(tx)} ${f(ty)} A${r} ${r} 0 1 0 ${f(cx)} ${height / 2} A${r} ${r} 0 1 1 ${f(bx)} ${f(by)}`;
}

/**
 * Closed outline of the S (y up, centred at 0,0) as [x, y] pairs,
 * produced by offsetting the centre-line by half the stroke on each side.
 */
export function sOutline(samplesPerArc = 72): [number, number][] {
  const { r, terminal, stroke } = MARK;
  const half = stroke / 2;
  const centre: { p: [number, number]; n: [number, number] }[] = [];

  // Top arc: CCW from terminal → 270°, circle centred at (0, r)
  const a0 = rad(terminal);
  const a1 = rad(270);
  for (let i = 0; i <= samplesPerArc; i++) {
    const a = a0 + ((a1 - a0) * i) / samplesPerArc;
    const n: [number, number] = [Math.cos(a), Math.sin(a)];
    centre.push({ p: [r * n[0], r + r * n[1]], n });
  }
  // Bottom arc: CW from 90° → terminal-180°, circle centred at (0, -r)
  const b0 = rad(90);
  const b1 = rad(terminal - 180);
  for (let i = 1; i <= samplesPerArc; i++) {
    const a = b0 + ((b1 - b0) * i) / samplesPerArc;
    // outward normal flips side on the lower bowl so the offset stays continuous
    const n: [number, number] = [-Math.cos(a), -Math.sin(a)];
    centre.push({ p: [r * Math.cos(a), -r + r * Math.sin(a)], n });
  }

  const outer = centre.map(({ p, n }) => [p[0] + n[0] * half, p[1] + n[1] * half] as [number, number]);
  const inner = centre.map(({ p, n }) => [p[0] - n[0] * half, p[1] - n[1] * half] as [number, number]);
  return [...outer, ...inner.reverse()];
}
