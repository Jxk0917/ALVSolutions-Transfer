// Builds every Lucid Detailing logo file from the official artwork.
// Run from the repo root:  node "Demo Detailer/LD Brand/tools/build-logo.mjs"
//
// The official logo (Demo Detailer/Lucid Detailing Logo.png) is a 1536x1024 raster with white and
// silver artwork on a solid black plate (#010101). There is no transparent version, which is why the
// site had to knock the plate out with an SVG filter and hand-measured crop offsets. Nothing here
// redraws the artwork. Every file is derived from the source pixels:
//   - Full:        original colors, plate removed. Coverage comes from brightness, and edge pixels
//                  are un-premultiplied so antialiasing does not leave a dark fringe on photos.
//   - Light:       the same shapes for light grounds. LUCID, the car and the strapline in Ink;
//                  DETAILING and its rules in Slate, which is the logo's steel blue darkened to pass
//                  on Chrome (the original steel #6E869D is 3.3:1 there).
//   - One color:   every shape in a single ink, Chrome or Ink.
//   - Lockup:      the logo without the strapline, for headers and anything under 400 px wide.
//   - Favicon:     the logo's own L and its large sparkle, placed on an Ink tile.
import { loadImage, createCanvas } from "canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE = "Demo Detailer/Lucid Detailing Logo.png";
const OUT = "Demo Detailer/LD Brand/logo/png";

export const C = {
  ink: [13, 13, 15],      // #0D0D0F
  chrome: [242, 244, 247], // #F2F4F7
  slate: [100, 112, 129],  // #647081
};

const img = await loadImage(SOURCE);
const W = img.width, H = img.height;
const src = createCanvas(W, H).getContext("2d");
src.drawImage(img, 0, 0);
const px = src.getImageData(0, 0, W, H).data;
const peak = (i) => Math.max(px[i], px[i + 1], px[i + 2]);

// The plate measures 0 to 2 in every channel. Anything brighter than 8 is artwork.
const PLATE = 8;
// Brightness at which a pixel counts as fully covered. The darkest solid artwork is the steel
// DETAILING lettering, whose brightest channel sits around 157.
const SOLID = 150;
const coverage = (i) => Math.min(1, Math.max(0, (peak(i) - PLATE) / (SOLID - PLATE)));

// Horizontal bands of artwork, top to bottom: car + sparkles, LUCID, DETAILING + rules, strapline.
function bands() {
  const out = [];
  let cur = null;
  for (let y = 0; y < H; y++) {
    let x0 = W, x1 = -1;
    for (let x = 0; x < W; x++) if (peak((y * W + x) * 4) > 40) { if (x < x0) x0 = x; x1 = x; }
    if (x1 >= 0) {
      if (!cur) cur = { y0: y, y1: y, x0, x1 };
      cur.y1 = y; cur.x0 = Math.min(cur.x0, x0); cur.x1 = Math.max(cur.x1, x1);
    } else if (cur) { if (cur.y1 - cur.y0 > 2) out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  if (out.length !== 4) throw new Error(`Expected 4 bands of artwork (car, LUCID, DETAILING, strapline), found ${out.length}`);
  return out;
}
const [CAR, WORD, SUB, TAG] = bands();

const PAD = 16;
const box = (y0, y1) => {
  const x0 = Math.min(CAR.x0, WORD.x0, SUB.x0, TAG.x0) - PAD;
  const x1 = Math.max(CAR.x1, WORD.x1, SUB.x1, TAG.x1) + PAD;
  return { x: x0, y: y0 - PAD, w: x1 - x0 + 1, h: y1 - y0 + 1 + PAD * 2 };
};
const FULL = box(CAR.y0, TAG.y1);
const LOCKUP = box(CAR.y0, SUB.y1);

// ink: null keeps the source color; a function picks an ink per row.
function render(crop, ink) {
  const cv = createCanvas(crop.w, crop.h);
  const cx = cv.getContext("2d");
  const out = cx.createImageData(crop.w, crop.h);
  for (let y = 0; y < crop.h; y++) {
    const sy = y + crop.y;
    const rowInk = typeof ink === "function" ? ink(sy) : ink;
    for (let x = 0; x < crop.w; x++) {
      const si = (sy * W + x + crop.x) * 4, di = (y * crop.w + x) * 4;
      const a = coverage(si);
      if (a === 0) continue;
      for (let k = 0; k < 3; k++) out.data[di + k] = rowInk ? rowInk[k] : Math.min(255, Math.round(px[si + k] / a));
      out.data[di + 3] = Math.round(a * 255);
    }
  }
  cx.putImageData(out, 0, 0);
  return cv;
}

function scaled(cv, width) {
  if (width >= cv.width) return cv; // never upscale a raster
  const h = Math.round((cv.height * width) / cv.width);
  const o = createCanvas(width, h);
  const ox = o.getContext("2d");
  ox.imageSmoothingQuality = "high";
  ox.drawImage(cv, 0, 0, width, h);
  return o;
}

// DETAILING and its two rules share one band, so the split is by row, halfway into the gaps.
const subTop = Math.round((WORD.y1 + SUB.y0) / 2), subBottom = Math.round((SUB.y1 + TAG.y0) / 2);
const lightInk = (y) => (y >= subTop && y <= subBottom ? C.slate : C.ink);

mkdirSync(OUT, { recursive: true });
const variants = {
  "lucid-logo-full": render(FULL, null),
  "lucid-logo-light": render(FULL, lightInk),
  "lucid-logo-chrome": render(FULL, C.chrome),
  "lucid-logo-ink": render(FULL, C.ink),
  "lucid-lockup-full": render(LOCKUP, null),
  "lucid-lockup-light": render(LOCKUP, lightInk),
};
for (const [name, cv] of Object.entries(variants)) {
  for (const width of [cv.width, 512, 256]) {
    if (width > cv.width) continue;
    const file = width === cv.width ? `${name}.png` : `${name}-${width}.png`;
    writeFileSync(resolve(OUT, file), scaled(cv, width).toBuffer("image/png"));
  }
  console.log(`wrote ${name} (${cv.width}x${cv.height})`);
}

// ---- Favicon ---------------------------------------------------------------------------------
// The car line is a 7:1 sliver and disappears below about 120 px, so small sizes use the logo's
// own L with its large sparkle. Both are lifted from the pixels, not typed in another face.

// The L is the first glyph in the LUCID band: scan columns until the first gap.
function firstGlyph() {
  let x0 = -1;
  for (let x = WORD.x0; x <= WORD.x1; x++) {
    let on = false;
    for (let y = WORD.y0; y <= WORD.y1; y++) if (peak((y * W + x) * 4) > 60) { on = true; break; }
    if (on && x0 < 0) x0 = x;
    if (!on && x0 >= 0) return { x: x0, y: WORD.y0, w: x - x0, h: WORD.y1 - WORD.y0 + 1 };
  }
  throw new Error("Could not isolate the L");
}

function tinted(crop, ink) {
  const cv = createCanvas(crop.w, crop.h);
  const cx = cv.getContext("2d");
  const out = cx.createImageData(crop.w, crop.h);
  for (let y = 0; y < crop.h; y++)
    for (let x = 0; x < crop.w; x++) {
      const k = (y + crop.y) * W + x + crop.x, di = (y * crop.w + x) * 4;
      out.data[di] = ink[0]; out.data[di + 1] = ink[1]; out.data[di + 2] = ink[2];
      out.data[di + 3] = Math.round(coverage(k * 4) * 255);
    }
  cx.putImageData(out, 0, 0);
  return cv;
}

// The large sparkle's lower point touches the car line, so it cannot be cut out whole. It is a
// symmetric four-point star, so its clean upper half is taken from the pixels and mirrored.
function sparkle(ink) {
  // The top spike is the first artwork in the columns just in from the car's tail.
  const x0 = CAR.x1 - 110, x1 = CAR.x1 - 50;
  let top = -1, cx = 0;
  for (let y = CAR.y0; y < CAR.y1 && top < 0; y++)
    for (let x = x0; x < x1; x++) if (peak((y * W + x) * 4) > 60) { top = y; cx = x; break; }
  if (top < 0) throw new Error("Could not find the sparkle");
  // The center row is where the horizontal arms make the widest unbroken run through the spike.
  // Only the upper rows are searched: lower down, the car line joins the run and wins.
  const bright = (x, y) => peak((y * W + x) * 4) > 60;
  let cy = top, widest = 0;
  for (let y = top; y < top + 36; y++) {
    if (!bright(cx, y)) continue;
    let a = cx, b = cx;
    while (bright(a - 1, y)) a--;
    while (bright(b + 1, y)) b++;
    if (b - a > widest) { widest = b - a; cy = y; }
  }
  const R = cy - top + 3;
  if (R < 15 || R > 45) throw new Error(`Sparkle radius looks wrong (${R})`);
  const size = R * 2 + 1;
  const half = tinted({ x: cx - R, y: cy - R, w: size, h: R + 1 }, ink);
  const cv = createCanvas(size, size);
  const g = cv.getContext("2d");
  g.drawImage(half, 0, 0);
  g.save(); g.translate(0, size); g.scale(1, -1); g.drawImage(half, 0, 0); g.restore();
  return cv;
}

const L = tinted(firstGlyph(), C.chrome);
const S = sparkle(C.chrome);

function favicon(size) {
  const cv = createCanvas(size, size);
  const cx = cv.getContext("2d");
  const r = size * 0.18;
  cx.fillStyle = "#0D0D0F";
  cx.beginPath();
  cx.roundRect(0, 0, size, size, r);
  cx.fill();
  cx.imageSmoothingQuality = "high";
  // L: 50% of the tile wide, sitting low and left of center so the sparkle has its corner.
  const lw = size * 0.5, lh = (L.height * lw) / L.width;
  // At tab size the L's stroke lands under 2 px, so it is drawn with a sub-pixel spread to hold weight.
  const spread = size < 64 ? [[0, 0], [0.45, 0], [0, -0.45], [0.45, -0.45]] : [[0, 0]];
  for (const [dx, dy] of spread) cx.drawImage(L, size * 0.19 + dx, size * 0.74 - lh + dy, lw, lh);
  // Sparkle: its upper right, sized to the L's height as it relates to the car in the logo.
  const sw = size * (size < 64 ? 0.34 : 0.28), sh = (S.height * sw) / S.width;
  cx.drawImage(S, size * 0.8 - sw, size * 0.2, sw, sh);
  return cv;
}
for (const size of [512, 180, 32]) writeFileSync(resolve(OUT, `lucid-favicon-${size}.png`), favicon(size).toBuffer("image/png"));
console.log("wrote lucid-favicon-512/180/32");
