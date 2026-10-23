// Deterministic street-scene point cloud seen from a forward-facing radar.
// Every point has a "dense" (Arbe, 2,304 channels, true elevation) and a "sparse"
// (conventional radar: coarse azimuth, no elevation) position, so one value t morphs between them.

export type Pt = { dx: number; dy: number; px: number; py: number; z: number; kind: string; keep: boolean };

export function buildCloud(W: number, H: number): Pt[] {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const f = W * 0.85, cx = W / 2, hor = H * 0.2, camY = 2.4;
  const proj = (x: number, y: number, z: number) => [cx + (f * x) / z, hor + (f * (camY - y)) / z];
  const pts: Pt[] = [];
  const add = (x: number, y: number, z: number, kind: string) => {
    if (z < 3 || z > 90) return;
    const [dx, dy] = proj(x, y, z);
    if (dx < -20 || dx > W + 20 || dy < -20 || dy > H + 20) return;
    const sx = x + gauss() * (0.8 + z / 30), sz = z + gauss() * 0.8;
    const [px, py] = proj(sx, 0.5, Math.max(4, sz));
    pts.push({ dx, dy, px, py, z, kind, keep: false });
  };
  for (let i = 0; i < 1500; i++) { const z = 4 + Math.pow(rnd(), 1.8) * 80; add((rnd() - 0.5) * 16, 0, z, "ground"); }
  for (const lx of [-5.4, -1.8, 1.8, 5.4]) for (let z = 4; z < 90; z += 0.9 + z * 0.03) add(lx + gauss() * 0.05, 0.02, z, "lane");
  for (const gx of [-7.6, 7.6]) for (let z = 4; z < 90; z += 0.35 + z * 0.012) { add(gx, 0.75 + gauss() * 0.04, z, "rail"); if (rnd() < 0.5) add(gx, 0.45, z, "rail"); }
  const boxes: [number, number, number, number, number, string][] = [[-3.6, 13, 1.9, 1.5, 4.5, "car"], [3.6, 21, 2.0, 1.6, 4.6, "car"], [-0.1, 33, 2.5, 3.6, 11, "truck"], [3.7, 47, 1.9, 1.5, 4.4, "car"], [-3.7, 60, 1.9, 1.5, 4.4, "car"]];
  for (const [x, z, w, h, d, kind] of boxes) {
    const n = kind === "truck" ? 900 : Math.round(700 * (13 / z) + 120);
    for (let i = 0; i < n; i++) {
      const face = rnd();
      let px: number, py: number, pz: number;
      if (face < 0.6) { px = x + (rnd() - 0.5) * w; py = rnd() * h; pz = z; }
      else if (face < 0.85) { px = x + (x < 0 ? w / 2 : -w / 2); py = rnd() * h; pz = z + rnd() * d; }
      else { px = x + (rnd() - 0.5) * w; py = h; pz = z + rnd() * d; }
      if (kind === "car" && py > h * 0.55 && Math.abs(px - x) > w * 0.38) continue;
      add(px, py, pz, kind);
    }
  }
  const person = (x: number, z: number) => { for (let i = 0; i < 220; i++) { const y = rnd() * 1.75; add(x + gauss() * (y > 1.45 ? 0.12 : 0.22), y, z + gauss() * 0.15, "person"); } };
  person(-6.6, 18); person(6.6, 30);
  for (let i = 0; i < 320; i++) { const y = rnd() * 1.7; add(1.3 + gauss() * (y > 1 ? 0.18 : 0.3), y, 10 + gauss() * 0.7, "cyclist"); }
  for (let i = 0; i < 60; i++) add(-1.2 + gauss() * 0.3, rnd() * 0.25, 26 + gauss() * 0.3, "debris");
  pts.forEach((p, i) => { p.keep = p.kind !== "debris" && p.kind !== "ground" && i % 12 === 0; });
  return pts;
}

/** Draw at morph t (0 sparse → 1 dense). Points left of `split` (px) are always drawn sparse. */
export function drawCloud(ctx: CanvasRenderingContext2D, pts: Pt[], W: number, H: number, t: number, split: number | null, alpha = 1, clear = true) {
  if (clear) ctx.clearRect(0, 0, W, H);
  for (const p of pts) {
    const tt = split != null && p.dx < split ? 0 : t;
    if (tt < 0.02 && !p.keep) continue;
    const vis = p.keep ? 1 : tt;
    const x = p.px + (p.dx - p.px) * tt, y = p.py + (p.dy - p.py) * tt;
    const near = Math.max(0, Math.min(1, 1 - (p.z - 4) / 70));
    const hl = (p.kind === "person" || p.kind === "cyclist" || p.kind === "debris") && tt > 0.6;
    const r = (p.kind === "ground" ? 0.8 + near * 0.6 : 1.0 + near * 1.2) * (p.keep && tt < 0.5 ? 2.6 - tt * 2 : 1);
    ctx.globalAlpha = alpha * vis * (p.kind === "ground" ? 0.3 + near * 0.4 : 0.6 + near * 0.4);
    ctx.fillStyle = hl ? "#FF3DA6" : p.kind === "ground" || p.kind === "lane" ? "#3D63FF" : near > 0.6 ? "#C9D6FF" : "#6E8CFF";
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
