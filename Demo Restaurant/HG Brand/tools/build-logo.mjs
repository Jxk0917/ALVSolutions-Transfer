// Builds every Hacienda Grill logo file from the official artwork.
// Run from the repo root:  node "Demo Restaurant/HG Brand/tools/build-logo.mjs"
//
// The official logo is a raster illustration (Demo Restaurant/Hacienda Demo Resturant Logo.png,
// 1536x1024 with the artwork floating in a transparent canvas). It cannot be traced into clean
// vectors the way a flat mark can, so nothing here redraws it. Every variation is derived from
// the source pixels:
//   - Full colour:  a tight crop.
//   - One colour:   the artwork's dark outline work, pulled out by luminance and recoloured.
//                   Fills drop away, so it reads as a stamp or a screen print.
//   - Reverse:      the inverse split. The light fills become the ink, the outlines drop away,
//                   which is what keeps the lettering readable on a dark or red ground.
//   - Banner:       the HACIENDA GRILL sign on its own, for places too short for the full badge.
import { loadImage, createCanvas } from "canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE = "Demo Restaurant/Hacienda Demo Resturant Logo.png";
const OUT = "Demo Restaurant/HG Brand/logo/png";

export const C = {
  chili: [200, 16, 16],     // #C81010
  charcoal: [35, 31, 32],   // #231F20
  cream: [247, 241, 225],   // #F7F1E1
};

const img = await loadImage(SOURCE);
const W = img.width, H = img.height;
const src = createCanvas(W, H).getContext("2d");
src.drawImage(img, 0, 0);
const px = src.getImageData(0, 0, W, H).data;

// Tight bounding box of anything visible, padded so antialiased edges never clip.
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (px[(y * W + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
const PAD = 12;
const box = { x: Math.max(0, x0 - PAD), y: Math.max(0, y0 - PAD), w: Math.min(W, x1 + PAD + 1) - Math.max(0, x0 - PAD), h: Math.min(H, y1 + PAD + 1) - Math.max(0, y0 - PAD) };

const smooth = (e0, e1, v) => { const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// mode: "full" | "lines" (dark outline work as ink) | "fills" (light fills as ink)
// topEdge: optional per-column first visible row (crop coordinates), used to trim the banner.
function render(mode, ink, crop = box, topEdge = null) {
  const cv = createCanvas(crop.w, crop.h);
  const cx = cv.getContext("2d");
  const out = cx.createImageData(crop.w, crop.h);
  for (let y = 0; y < crop.h; y++)
    for (let x = 0; x < crop.w; x++) {
      const si = ((y + crop.y) * W + (x + crop.x)) * 4, di = (y * crop.w + x) * 4;
      const a = topEdge && y < topEdge[x] ? 0 : px[si + 3];
      if (mode === "full") { for (let k = 0; k < 3; k++) out.data[di + k] = px[si + k]; out.data[di + 3] = a; continue; }
      const lum = 0.2126 * px[si] + 0.7152 * px[si + 1] + 0.0722 * px[si + 2];
      // Outlines in the artwork sit below ~55 luminance; fills start well above 100.
      const light = smooth(55, 105, lum);
      let cover = mode === "lines" ? 1 - light : light;
      // The artwork has a distressed print texture. Faint partial pixels from it turn into
      // specks once recoloured, so anything under a third coverage is dropped.
      if (a * cover < (mode === "fills" ? 130 : 85)) cover = 0;
      out.data[di] = ink[0]; out.data[di + 1] = ink[1]; out.data[di + 2] = ink[2];
      out.data[di + 3] = Math.round(a * cover);
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

// The sign starts at the red rule above HACIENDA. Found by scanning down the centre column
// for the first long run of chili red, so a re-exported source still crops correctly.
function bannerRuleRow() {
  const cxm = Math.round((x0 + x1) / 2);
  for (let y = Math.round(y0 + (y1 - y0) * 0.45); y < y1; y++) {
    let run = 0;
    for (let x = cxm - 150; x < cxm + 150; x++) {
      const i = (y * W + x) * 4;
      if (px[i + 3] > 240 && px[i] > 170 && px[i + 1] < 60 && px[i + 2] < 60) run++;
    }
    if (run > 240) return y;
  }
  throw new Error("Could not find the banner's top rule");
}

// The pyramid and cactus overlap the sign's top edge, so a straight crop line always catches
// pieces of them. Instead the sign's own outline is followed: for every column, find where the
// curved red rule starts, then keep the sign's dark border above it (measured at the centre,
// where nothing overlaps) and nothing higher.
function bannerCropAndEdge() {
  const ruleY = bannerRuleRow();
  const isRed = (i) => px[i + 3] > 200 && px[i] > 170 && px[i + 1] < 60 && px[i + 2] < 60;
  const cxm = Math.round((x0 + x1) / 2);
  let border = 0;
  while (px[((ruleY - border - 1) * W + cxm) * 4 + 3] > 128 && !isRed(((ruleY - border - 1) * W + cxm) * 4)) border++;
  const crop = { x: box.x, y: ruleY - border - 40, w: box.w, h: box.y + box.h - (ruleY - border - 40) };
  const edge = new Array(crop.w).fill(null);
  for (let x = 0; x < crop.w; x++)
    for (let y = 0; y < 90; y++)
      if (isRed(((crop.y + y) * W + crop.x + x) * 4)) { edge[x] = Math.max(0, y - border - 1); break; }
  // Columns past the ends of the rule take the nearest measured column.
  const first = edge.findIndex((v) => v !== null), last = edge.length - 1 - [...edge].reverse().findIndex((v) => v !== null);
  for (let x = 0; x < crop.w; x++) if (edge[x] === null) edge[x] = edge[x < first ? first : last];
  // Red parts of the figure (a headdress tassel, the pepper) sit just above the rule and read as
  // an early "rule" in their columns. The rule itself is a smooth curve, so a wide median across
  // columns throws those local spikes out.
  const R = 70;
  const smoothed = edge.map((_, x) => {
    const win = edge.slice(Math.max(0, x - R), Math.min(edge.length, x + R + 1)).sort((p, q) => p - q);
    return win[win.length >> 1];
  });
  // The crop started 40px high to be safe; trim it back to the sign so the file has even margins.
  const lift = Math.max(0, Math.min(...smoothed) - PAD);
  return { crop: { ...crop, y: crop.y + lift, h: crop.h - lift }, edge: smoothed.map((v) => v - lift) };
}

mkdirSync(OUT, { recursive: true });
const { crop: banner, edge: bannerEdge } = bannerCropAndEdge();
const variants = {
  "hg-logo-full": render("full"),
  "hg-logo-charcoal": render("lines", C.charcoal),
  "hg-logo-chili": render("lines", C.chili),
  "hg-logo-cream": render("fills", C.cream),
  "hg-banner-full": render("full", null, banner, bannerEdge),
  "hg-banner-cream": render("fills", C.cream, banner, bannerEdge),
};
for (const [name, cv] of Object.entries(variants)) {
  for (const width of [cv.width, 512, 256]) {
    if (width > cv.width) continue;
    const file = width === cv.width ? `${name}.png` : `${name}-${width}.png`;
    writeFileSync(resolve(OUT, file), scaled(cv, width).toBuffer("image/png"));
  }
  console.log(`wrote ${name} (${cv.width}x${cv.height})`);
}
