// Vectorises the official AlvSolutions mark and writes every logo SVG.
// Run from the repo root:  node Brand_Assets/tools/build-logo.mjs
//
// The official mark only exists as a raster (Brand_Assets/derived/alv-mark.png). This
// script does not redraw it: it traces the three shapes straight out of that PNG
// (marching squares on the alpha channel, corner detection, then smooth cubic fits),
// so the geometry stays the official geometry. If the PNG is ever replaced, re-run.
import { loadImage, createCanvas } from "canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE = "Brand_Assets/derived/alv-mark.png";
const OUT = "Brand_Assets/logo/svg";

// Palette. Logo colours are sampled from the official PNG (see sampleColours below);
// the rest match the brand guidelines and src/assets/styles.css.
export const C = {
  navy: "#072753",      // Logo Navy, the left blade
  // The sampled averages (#0168C7 / #0895D9) are region means, which flattens the
  // ramp; these are the ends of the ramp as it reads in the PNG.
  gradFrom: "#005CC5",  // Logo Gradient, lower end of the arrow
  gradTo: "#0BA2E4",    // Logo Gradient, arrow tip
  blue: "#3DA8F8",      // Alv Blue
  deep: "#1A72C6",      // Deep Blue
  ink: "#070C14",
  mist: "#EDF2F8",
};

const img = await loadImage(SOURCE);
const W = img.width, H = img.height;
const cv = createCanvas(W, H);
const cx = cv.getContext("2d");
cx.drawImage(img, 0, 0);
const px = cx.getImageData(0, 0, W, H).data;
const alpha = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : px[(y * W + x) * 4 + 3] / 255);

// ---- 1. Marching squares at iso 0.5, with linear interpolation along each cell edge.
function traceContours() {
  const segs = new Map(); // "x,y" start key -> list of [p0, p1]
  const lerp = (a, b) => (0.5 - a) / (b - a);
  const edges = [];
  for (let y = -1; y < H; y++) {
    for (let x = -1; x < W; x++) {
      const a = alpha(x, y), b = alpha(x + 1, y), c = alpha(x + 1, y + 1), d = alpha(x, y + 1);
      const idx = (a > 0.5 ? 8 : 0) | (b > 0.5 ? 4 : 0) | (c > 0.5 ? 2 : 0) | (d > 0.5 ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const T = [x + lerp(a, b), y], R = [x + 1, y + lerp(b, c)];
      const B = [x + lerp(d, c), y + 1], L = [x, y + lerp(a, d)];
      // Orientation keeps filled pixels on the same side, so every loop is closed and consistent.
      const table = {
        1: [[L, B]], 2: [[B, R]], 3: [[L, R]], 4: [[R, T]], 5: [[L, T], [R, B]], 6: [[B, T]], 7: [[L, T]],
        8: [[T, L]], 9: [[T, B]], 10: [[T, R], [B, L]], 11: [[T, R]], 12: [[R, L]], 13: [[R, B]], 14: [[B, L]],
      };
      for (const [p, q] of table[idx]) edges.push([p, q]);
    }
  }
  const key = (p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
  for (const e of edges) segs.set(key(e[0]), e);
  const loops = [];
  const used = new Set();
  for (const e of edges) {
    const k0 = key(e[0]);
    if (used.has(k0)) continue;
    const loop = [];
    let cur = e;
    while (cur && !used.has(key(cur[0]))) {
      used.add(key(cur[0]));
      loop.push(cur[0]);
      cur = segs.get(key(cur[1]));
    }
    if (loop.length > 40) loops.push(loop);
  }
  return loops;
}

// ---- 2. Corners: large turning angle measured over a window, with non-max suppression.
function findCorners(pts, win = 5, thresholdDeg = 38) {
  const n = pts.length;
  const ang = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const p = pts[(i - win + n) % n], q = pts[i], r = pts[(i + win) % n];
    const a1 = Math.atan2(q[1] - p[1], q[0] - p[0]);
    const a2 = Math.atan2(r[1] - q[1], r[0] - q[0]);
    let d = Math.abs(a2 - a1);
    if (d > Math.PI) d = 2 * Math.PI - d;
    ang[i] = (d * 180) / Math.PI;
  }
  const corners = [];
  for (let i = 0; i < n; i++) {
    if (ang[i] < thresholdDeg) continue;
    let isMax = true;
    for (let k = -win; k <= win; k++) if (k && ang[(i + k + n) % n] > ang[i]) isMax = false;
    if (isMax && !corners.some((c) => Math.min(Math.abs(c - i), n - Math.abs(c - i)) <= win)) corners.push(i);
  }
  return corners.sort((a, b) => a - b);
}

// ---- 3. Douglas-Peucker on an open run.
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  let max = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > max) { max = d; at = i; }
  }
  if (max <= eps) return [a, b];
  return rdp(pts.slice(0, at + 1), eps).slice(0, -1).concat(rdp(pts.slice(at), eps));
}

// ---- 4. Smooth each corner-to-corner run and fit it with Catmull-Rom cubics.
function runToPath(run) {
  // Light smoothing removes pixel stair-steps; the run's endpoints (corners) never move.
  const sm = run.map((p, i) => {
    if (i < 2 || i > run.length - 3) return p;
    let sx = 0, sy = 0;
    for (let k = -2; k <= 2; k++) { sx += run[i + k][0]; sy += run[i + k][1]; }
    return [sx / 5, sy / 5];
  });
  const s = rdp(sm, 0.45);
  if (s.length === 2) return [`L${f(s[1])}`];
  const out = [];
  for (let i = 0; i < s.length - 1; i++) {
    const p0 = s[Math.max(0, i - 1)], p1 = s[i], p2 = s[i + 1], p3 = s[Math.min(s.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    out.push(`C${f(c1)} ${f(c2)} ${f(p2)}`);
  }
  return out;
}
const f = (p) => `${+p[0].toFixed(2)} ${+p[1].toFixed(2)}`;

// Pixel contours round every tip off. Rebuild each corner as the intersection of a line
// fitted to the edge arriving at it and one fitted to the edge leaving it.
function fitLine(points) {
  const n = points.length;
  const mx = points.reduce((s, p) => s + p[0], 0) / n, my = points.reduce((s, p) => s + p[1], 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (const [x, y] of points) { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my); syy += (y - my) ** 2; }
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return { p: [mx, my], d: [Math.cos(theta), Math.sin(theta)] };
}
function sharpCorner(loop, i, near = 3, far = 11) {
  const n = loop.length;
  const before = [], after = [];
  for (let k = near; k <= far; k++) { before.push(loop[(i - k + n) % n]); after.push(loop[(i + k) % n]); }
  const a = fitLine(before), b = fitLine(after);
  const det = a.d[0] * b.d[1] - a.d[1] * b.d[0];
  if (Math.abs(det) < 0.15) return loop[i]; // nearly parallel: keep the traced point
  const t = ((b.p[0] - a.p[0]) * b.d[1] - (b.p[1] - a.p[1]) * b.d[0]) / det;
  const hit = [a.p[0] + t * a.d[0], a.p[1] + t * a.d[1]];
  // A long jump means the fit misread the edge; trust the contour instead.
  return Math.hypot(hit[0] - loop[i][0], hit[1] - loop[i][1]) < 4 ? hit : loop[i];
}

function loopToPath(loop) {
  const corners = findCorners(loop);
  if (corners.length === 0) corners.push(0);
  const n = loop.length;
  const sharp = new Map(corners.map((i) => [i, sharpCorner(loop, i)]));
  const CUT = 3; // contour points this close to a corner are the rounded-off tip; drop them
  const parts = [`M${f(sharp.get(corners[0]))}`];
  for (let c = 0; c < corners.length; c++) {
    const from = corners[c], to = corners[(c + 1) % corners.length];
    const run = [sharp.get(from)];
    const span = (to - from + n) % n || n;
    for (let k = CUT; k <= span - CUT; k++) run.push(loop[(from + k) % n]);
    run.push(sharp.get(to));
    parts.push(...runToPath(run));
  }
  return parts.join("") + "Z";
}

// ---- 5. Classify each shape as navy or blue from the pixels it encloses.
const loops = traceContours();
const shapes = loops.map((loop) => {
  const xs = loop.map((p) => p[0]), ys = loop.map((p) => p[1]);
  const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  let blue = 0, n = 0;
  for (let y = Math.ceil(bbox[1]); y < bbox[3]; y += 2)
    for (let x = Math.ceil(bbox[0]); x < bbox[2]; x += 2) {
      const i = (y * W + x) * 4;
      if (px[i + 3] < 250 || !pointInPoly([x, y], loop)) continue;
      blue += px[i + 2]; n++;
    }
  return { loop, bbox, d: loopToPath(loop), tone: blue / n > 150 ? "blue" : "navy" };
});
function pointInPoly([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
if (shapes.length !== 3) throw new Error(`Expected 3 shapes in the mark, traced ${shapes.length}`);

// Tight viewBox around the traced mark, so every SVG shares the same frame.
const minX = Math.min(...shapes.map((s) => s.bbox[0])), minY = Math.min(...shapes.map((s) => s.bbox[1]));
const maxX = Math.max(...shapes.map((s) => s.bbox[2])), maxY = Math.max(...shapes.map((s) => s.bbox[3]));
const VB = `${+minX.toFixed(2)} ${+minY.toFixed(2)} ${+(maxX - minX).toFixed(2)} ${+(maxY - minY).toFixed(2)}`;
const navyD = shapes.filter((s) => s.tone === "navy").map((s) => s.d).join("");
const blueD = shapes.filter((s) => s.tone === "blue").map((s) => s.d).join("");

// Report the real logo colours so the palette above can be checked against the source.
function sampleColours() {
  const acc = { navy: [0, 0, 0, 0], lo: [0, 0, 0, 0], hi: [0, 0, 0, 0] };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (px[i + 3] < 250) continue;
      const bucket = px[i + 2] < 150 ? "navy" : (x - minX) / (maxX - minX) - (y - minY) / (maxY - minY) < -0.35 ? "lo" : (x - minX) / (maxX - minX) - (y - minY) / (maxY - minY) > 0.45 ? "hi" : null;
      if (!bucket) continue;
      for (let k = 0; k < 3; k++) acc[bucket][k] += px[i + k];
      acc[bucket][3]++;
    }
  const hex = (a) => "#" + a.slice(0, 3).map((v) => Math.round(v / a[3]).toString(16).padStart(2, "0")).join("").toUpperCase();
  return { navy: hex(acc.navy), gradientLow: hex(acc.lo), gradientHigh: hex(acc.hi) };
}
console.log("sampled", sampleColours());

// Gradient runs along the arrow's own direction: lower left to the tip.
const grad = (id) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${+(minX + (maxX - minX) * 0.2).toFixed(1)}" y1="${+maxY.toFixed(1)}" x2="${+maxX.toFixed(1)}" y2="${+minY.toFixed(1)}"><stop offset="0" stop-color="${C.gradFrom}"/><stop offset="1" stop-color="${C.gradTo}"/></linearGradient>`;

const svg = (body, { viewBox = VB, defs = "", title = "AlvSolutions" } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}">${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>\n`;

// Square tile variants: the mark centred in a square with its own padding.
function tile(fill, markBody, defs, pad, radius) {
  const w = maxX - minX, h = maxY - minY;
  const side = Math.max(w, h) / (1 - 2 * pad);
  const ox = minX - (side - w) / 2, oy = minY - (side - h) / 2;
  return svg(`<rect x="${+ox.toFixed(2)}" y="${+oy.toFixed(2)}" width="${+side.toFixed(2)}" height="${+side.toFixed(2)}" rx="${+(side * radius).toFixed(2)}" fill="${fill}"/>${markBody}`, {
    viewBox: `${+ox.toFixed(2)} ${+oy.toFixed(2)} ${+side.toFixed(2)} ${+side.toFixed(2)}`,
    defs,
  });
}

const files = {
  // Primary. Navy blade and gradient arrow, for light backgrounds.
  "alv-mark.svg": svg(`<path fill="${C.navy}" d="${navyD}"/><path fill="url(#g)" d="${blueD}"/>`, { defs: grad("g") }),
  // Reverse. Blade turns Mist so it survives on Ink, Navy and photography.
  "alv-mark-reverse.svg": svg(`<path fill="${C.mist}" d="${navyD}"/><path fill="url(#g)" d="${blueD}"/>`, { defs: grad("g") }),
  // Single-colour versions for print, embroidery, vinyl and one-colour stamps.
  "alv-mark-navy.svg": svg(`<path fill="${C.navy}" d="${navyD}${blueD}"/>`),
  "alv-mark-white.svg": svg(`<path fill="${C.mist}" d="${navyD}${blueD}"/>`),
  // App icon and social avatar: reverse mark on an Ink tile.
  "alv-badge.svg": tile(C.ink, `<path fill="${C.mist}" d="${navyD}"/><path fill="url(#g)" d="${blueD}"/>`, grad("g"), 0.2, 0.22),
  // Favicon: white mark on Deep Blue. Holds up in light and dark browser tabs at 16 px.
  "alv-favicon.svg": tile(C.deep, `<path fill="#FFFFFF" d="${navyD}${blueD}"/>`, "", 0.14, 0.2),
};

mkdirSync(OUT, { recursive: true });
for (const [name, body] of Object.entries(files)) {
  writeFileSync(resolve(OUT, name), body);
  console.log(`wrote ${OUT}/${name}`);
}
