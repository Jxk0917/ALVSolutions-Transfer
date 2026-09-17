// Renders the AlvSolutions brand guidelines sheet from Brand_Assets/brand/brand-guidelines.html.
// Run from the repo root:  node Brand_Assets/tools/build-guidelines.mjs
import puppeteer from "puppeteer";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const source = pathToFileURL(resolve("Brand_Assets/brand/brand-guidelines.html")).href;
const outputs = [
  [1, "alvsolutions-brand-guidelines.png"],
  [2, "alvsolutions-brand-guidelines@2x.png"],
];

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();

for (const [scale, file] of outputs) {
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: scale });
  await page.goto(source, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const fontsOk = await page.evaluate(() =>
    ["400 20px Geist", "600 20px Geist", "700 20px Manrope", "800 20px Manrope"].every((f) => document.fonts.check(f))
  );
  if (!fontsOk) throw new Error("Manrope or Geist did not load; check the Fonts/ path");
  // A missing logo or icon file would otherwise render as an empty tile.
  const broken = await page.evaluate(() =>
    [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.getAttribute("src"))
  );
  if (broken.length) throw new Error(`Missing images: ${broken.join(", ")}`);
  // Content wider than the sheet, or a label wrapping out of its cell, would be clipped silently.
  const overflow = await page.evaluate(() => document.getElementById("sheet").scrollWidth - 1600);
  if (overflow > 0) throw new Error(`Sheet overflows horizontally by ${overflow}px`);
  const wrapped = await page.evaluate(() =>
    [...document.querySelectorAll(".label, .alv-btn, .lockup")].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent.trim())
  );
  if (wrapped.length) throw new Error(`Content overflows its box: ${wrapped.join(" | ")}`);

  const path = resolve("Brand_Assets/brand", file);
  await (await page.$("#sheet")).screenshot({ path });
  console.log(`rendered ${path}`);
}

await browser.close();
