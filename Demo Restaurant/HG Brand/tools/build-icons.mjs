// Writes the Hacienda Grill icon set as standalone SVG files.
// Run from the repo root:  node "Demo Restaurant/HG Brand/tools/build-icons.mjs"
//
// Tabler Icons (MIT, tabler.io/icons), outline style, pinned to one release and fetched from
// jsDelivr. Nothing is hand-drawn. Output is committed, so the site never needs the network.
// Brand rule: 24 px grid, 2 px stroke, round caps and joins, one colour per icon.
import { mkdirSync, writeFileSync } from "node:fs";

const TABLER = "https://cdn.jsdelivr.net/npm/@tabler/icons@3.31.0/icons/outline";

export const ICONS = [
  // [file id, label on the sheet, tabler name]
  ["menu", "Menu", "tools-kitchen-2"],
  ["order", "Order", "shopping-bag"],
  ["reserve", "Reserve", "calendar-event"],
  ["hours", "Hours", "clock"],
  ["visit", "Visit", "map-pin"],
  ["call", "Call", "phone"],
  ["catering", "Catering", "chef-hat"],
  ["grill", "Grill", "flame"],
  ["spice", "Spice", "pepper"],
];

const COLOURS = { mono: "currentColor", charcoal: "#231F20", chili: "#C81010", cream: "#F7F1E1" };

const bodies = {};
for (const [id, , name] of ICONS) {
  const res = await fetch(`${TABLER}/${name}.svg`);
  if (!res.ok) throw new Error(`Tabler icon "${name}" returned ${res.status}`);
  const svg = await res.text();
  // Keep only the drawn paths/shapes; drop Tabler's transparent bounding-box path.
  bodies[id] = [...svg.matchAll(/<(path|circle|rect|line|polyline|polygon|ellipse)\b[^>]*\/>/g)]
    .map((m) => m[0])
    .filter((el) => !/stroke="none"/.test(el))
    .map((el) => el.replace(/\s+/g, " "))
    .join("");
  if (!bodies[id]) throw new Error(`No drawable elements in "${name}"`);
}

for (const [variant, stroke] of Object.entries(COLOURS)) {
  const dir = `Demo Restaurant/HG Brand/icons/svg/${variant}`;
  mkdirSync(dir, { recursive: true });
  for (const [id, , name] of ICONS) {
    writeFileSync(
      `${dir}/hg-icon-${id}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><!-- tabler: ${name} -->${bodies[id]}</svg>\n`
    );
  }
}
console.log(`wrote ${ICONS.length} icons x ${Object.keys(COLOURS).length} colourways`);
