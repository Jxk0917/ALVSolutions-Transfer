// Writes the AlvSolutions icon set as standalone SVG files.
// Run from the repo root:  node Brand_Assets/tools/build-icons.mjs
//
// These are Tabler Icons (MIT, tabler.io/icons), outline style, the same paths the
// website inlines. Nothing here is hand-drawn. Brand rule: 24 px grid, 1.75 stroke,
// round caps and joins, one colour per icon.
import { mkdirSync, writeFileSync } from "node:fs";

const ICONS = {
  // name: [label, tabler name, paths]
  websites: ["Websites", "app-window", ["M4 8h16", "M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", "M8 4v4"]],
  restaurants: ["Restaurants", "tools-kitchen-2", ["M19 3v12h-5c-.023 -3.681 .184 -7.406 5 -12m0 12v6h-1v-3m-10 -14v17m-3 -17v3a3 3 0 1 0 6 0v-3"]],
  booking: ["Booking", "calendar-check", ["M11.5 21h-5.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v6", "M16 3v4", "M8 3v4", "M4 11h16", "M15 19l2 2l4 -4"]],
  search: ["Search", "world-search", ["M21 12a9 9 0 1 0 -9 9", "M3.6 9h16.8", "M3.6 15h7.9", "M11.5 3a17 17 0 0 0 0 18", "M12.5 3a16.984 16.984 0 0 1 2.574 8.62", "M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "M20.2 20.2l1.8 1.8"]],
  support: ["Support", "lifebuoy", ["M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "M15 15l3.35 3.35", "M9 15l-3.35 3.35", "M15 9l3.35 -3.35", "M9 9l-3.35 -3.35"]],
  mobile: ["Mobile", "device-mobile", ["M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14", "M11 4h2", "M12 17v.01"]],
  cards: ["Cards", "id", ["M7 12h3v4h-3l0 -4", "M10 6h-6a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1 -1v-12a1 1 0 0 0 -1 -1h-6", "M10 4a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z", "M14 16h3", "M14 12h3"]],
  apparel: ["Apparel", "shirt", ["M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0"]],
  pricing: ["Pricing", "tag", ["M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0", "M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3"]],
};

// Colour files exist because an <img> cannot inherit currentColor.
const COLOURS = { mono: "currentColor", blue: "#3DA8F8", gold: "#FFC811", navy: "#072753" };

export const iconList = Object.entries(ICONS).map(([id, [label]]) => ({ id, label }));

for (const [variant, stroke] of Object.entries(COLOURS)) {
  const dir = `Brand_Assets/icons/svg/${variant}`;
  mkdirSync(dir, { recursive: true });
  for (const [id, [, tabler, paths]] of Object.entries(ICONS)) {
    const body = paths.map((d) => `<path d="${d}"/>`).join("");
    writeFileSync(
      `${dir}/alv-icon-${id}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><!-- tabler: ${tabler} -->${body}</svg>\n`
    );
  }
}
console.log(`wrote ${Object.keys(ICONS).length} icons x ${Object.keys(COLOURS).length} colourways to Brand_Assets/icons/svg`);
