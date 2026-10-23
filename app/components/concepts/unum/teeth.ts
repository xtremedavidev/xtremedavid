// FDI dental chart: two arches of 16 teeth. Status is applied at runtime via data-st on each <g data-tooth>.
export const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export function chartSVG(): string {
  let s = '<svg viewBox="0 0 1100 620" aria-hidden="true">';
  s += '<line x1="550" y1="40" x2="550" y2="580" stroke="#E2E8F0" stroke-dasharray="3 6"/><line x1="80" y1="310" x2="1020" y2="310" stroke="#E2E8F0" stroke-dasharray="3 6"/>';
  const arch = (nums: number[], cy: number, dir: 1 | -1) => nums.forEach((n, i) => {
    const th = ((-78 + i * (156 / 15)) * Math.PI) / 180;
    const x = 550 + 470 * Math.sin(th), y = cy - dir * 170 * Math.cos(th);
    const d = n % 10;
    const w = d >= 6 ? 56 : d >= 4 ? 46 : d === 3 ? 40 : 36, h = d >= 6 ? 58 : d >= 4 ? 52 : d === 3 ? 56 : 54;
    const rot = ((th * 180) / Math.PI) * dir;
    const lx = x + (h / 2 + 26) * Math.sin(th), ly = y - dir * (h / 2 + 26) * Math.cos(th);
    s += `<g data-tooth="${n}"><g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${(w * 0.42).toFixed(1)}"/><circle cx="0" cy="${dir * -4}" r="9"/></g><text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle">${n}</text></g>`;
  });
  arch(UPPER, 250, 1);
  arch(LOWER, 370, -1);
  return s + "</svg>";
}

export function waveSVG(): string {
  let s = '<svg viewBox="0 0 230 40" aria-hidden="true">';
  for (let i = 0; i < 46; i++) { const h = 6 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)) * 30; s += `<rect data-bar="" x="${i * 5}" y="${((40 - h) / 2).toFixed(1)}" width="3" height="${h.toFixed(1)}" rx="1.5"/>`; }
  return s + "</svg>";
}
