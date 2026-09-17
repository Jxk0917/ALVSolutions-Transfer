// Writes the Lucid Detailing icon set as standalone SVG files.
// Run from the repo root:  node "Demo Detailer/LD Brand/tools/build-icons.mjs"
//
// Tabler Icons (MIT, tabler.io/icons), outline style, pinned to one release and fetched from
// jsDelivr. Nothing is hand-drawn. Output is committed, so the site never needs the network.
// Brand rule: 24 px grid, 1.5 px stroke (it matches the logo's fine car line), round caps and
// joins, one color per icon.
import { mkdirSync, writeFileSync } from "node:fs";

const TABLER = "https://cdn.jsdelivr.net/npm/@tabler/icons@3.31.0/icons/outline";

export const ICONS = [
  // [file id, label on the sheet, tabler name]
  ["exterior", "Exterior wash", "car"],
  ["interior", "Interior", "armchair"],
  ["correction", "Paint correction", "sparkles"],
  ["ceramic", "Ceramic coating", "shield-check"],
  ["wheels", "Wheels", "wheel"],
  ["glass", "Glass", "droplet"],
  ["engine", "Engine bay", "engine"],
  ["mobile", "We come to you", "truck"],
  ["book", "Book", "calendar-event"],
  ["call", "Call", "phone"],
];

const COLORS = { mono: "currentColor", fog: "#D1D5DB", sky: "#6FAEE6", ink: "#0D0D0F" };

const bodies = {};
for (const [id, , name] of ICONS) {
  const res = await fetch(`${TABLER}/${name}.svg`);
  if (!res.ok) throw new Error(`Tabler icon "${name}" returned ${res.status}`);
  const svg = await res.text();
  // Keep only the drawn shapes; drop Tabler's transparent bounding-box path.
  bodies[id] = [...svg.matchAll(/<(path|circle|rect|line|polyline|polygon|ellipse)\b[^>]*\/>/g)]
    .map((m) => m[0])
    .filter((el) => !/stroke="none"/.test(el))
    .map((el) => el.replace(/\s+/g, " "))
    .join("");
  if (!bodies[id]) throw new Error(`No drawable elements in "${name}"`);
}

for (const [variant, stroke] of Object.entries(COLORS)) {
  const dir = `Demo Detailer/LD Brand/icons/svg/${variant}`;
  mkdirSync(dir, { recursive: true });
  for (const [id, , name] of ICONS) {
    writeFileSync(
      `${dir}/lucid-icon-${id}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><!-- tabler: ${name} -->${bodies[id]}</svg>\n`
    );
  }
}
console.log(`wrote ${ICONS.length} icons x ${Object.keys(COLORS).length} colorways`);
