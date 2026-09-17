// Renders every logo SVG, plus the wordmark lockups, to transparent PNGs.
// Run from the repo root after build-logo.mjs:  node Brand_Assets/tools/export-png.mjs
import puppeteer from "puppeteer";
import { mkdirSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SVG_DIR = "Brand_Assets/logo/svg";
const PNG_DIR = "Brand_Assets/logo/png";
const SIZES = [1024, 512, 256, 128, 64, 32];
mkdirSync(PNG_DIR, { recursive: true });

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();
const url = (p) => pathToFileURL(resolve(p)).href;

// A local page so file:// images and fonts are allowed to load.
const host = resolve(PNG_DIR, "_render.html");
const { writeFileSync, rmSync } = await import("node:fs");

async function shoot(html, width, file) {
  writeFileSync(host, `<!doctype html><html><head><style>
    @font-face { font-family: Manrope; src: url("${url("Brand_Assets/ALVS Fonts/Geist/ManRope/Manrope-VariableFont_wght.ttf")}"); font-weight: 200 800; }
    @font-face { font-family: Geist; src: url("${url("Brand_Assets/ALVS Fonts/Geist/Geist-VariableFont_wght.ttf")}"); font-weight: 100 900; }
    html, body { margin: 0; background: transparent; }
    #t { display: inline-block; }
    .lockup { display: inline-flex; align-items: center; gap: .42em; font: 800 100px/1 Manrope; letter-spacing: -.03em; white-space: nowrap; padding: .3em; }
    .lockup img { height: 1.42em; }
    .stacked { display: inline-flex; flex-direction: column; align-items: center; font-family: Manrope; padding: 40px; }
    .stacked img { width: 375px; }
    .stacked .w { margin-top: 38px; font-size: 100px; font-weight: 800; letter-spacing: -.03em; line-height: 1; }
    .stacked .t { margin-top: 22px; font: 500 31px Geist; }
  </style></head><body><div id="t">${html}</div></body></html>`);
  await page.setViewport({ width: 2400, height: 1600, deviceScaleFactor: 1 });
  await page.goto(url(host), { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$("#t");
  const box = await el.boundingBox();
  const scale = width / box.width;
  await page.setViewport({ width: 2400, height: 1600, deviceScaleFactor: scale });
  await page.goto(url(host), { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await (await page.$("#t")).screenshot({ path: resolve(PNG_DIR, file), omitBackground: true });
}

for (const svg of readdirSync(SVG_DIR).filter((f) => f.endsWith(".svg"))) {
  const base = svg.replace(/\.svg$/, "");
  for (const size of SIZES) {
    await shoot(`<img src="${url(`${SVG_DIR}/${svg}`)}" style="display:block;width:1000px">`, size, `${base}-${size}.png`);
  }
}

const dark = { a: "#EDF2F8", s: "#3DA8F8", mark: "alv-mark-reverse.svg", tag: "#B4C2D2" };
const light = { a: "#072753", s: "#1A72C6", mark: "alv-mark.svg", tag: "#3A4A5E" };
for (const [name, t] of Object.entries({ dark, light })) {
  const mark = url(`${SVG_DIR}/${t.mark}`);
  for (const width of [2000, 1000, 500]) {
    await shoot(`<div class="lockup"><img src="${mark}"><span style="color:${t.a}">Alv<span style="color:${t.s}">Solutions</span></span></div>`, width, `alv-lockup-horizontal-${name}-${width}.png`);
    await shoot(`<div class="stacked"><img src="${mark}"><div class="w" style="color:${t.a}">Alv<span style="color:${t.s}">Solutions</span></div><div class="t" style="color:${t.tag}">Professional Business Websites</div></div>`, width, `alv-lockup-stacked-${name}-${width}.png`);
  }
}

rmSync(host);
await browser.close();
console.log(`wrote PNGs to ${PNG_DIR}`);
