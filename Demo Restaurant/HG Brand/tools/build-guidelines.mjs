// Renders the Hacienda Grill brand guidelines sheet and the monogram favicon PNGs.
// Run from the repo root, after build-logo.mjs and build-icons.mjs:
//   node "Demo Restaurant/HG Brand/tools/build-guidelines.mjs"
import puppeteer from "puppeteer";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = "Demo Restaurant/HG Brand";
const source = pathToFileURL(resolve(ROOT, "brand/brand-guidelines.html")).href;
const FONTS = ["400 20px 'League Gothic'", "400 20px 'Fjalla One'", "600 20px Montserrat", "700 20px Montserrat", "400 20px 'Source Sans 3'", "500 20px 'Source Sans 3'"];

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();

async function load(scale) {
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: scale });
  await page.goto(source, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const missing = await page.evaluate((f) => f.filter((x) => !document.fonts.check(x)), FONTS);
  if (missing.length) throw new Error(`Fonts did not load (check Demo Restaurant/HG Fonts): ${missing.join(", ")}`);
  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute("src"))
  );
  if (broken.length) throw new Error(`Missing images: ${broken.join(", ")}`);
  const overflow = await page.evaluate(() => document.getElementById("sheet").scrollWidth - 1600);
  if (overflow > 0) throw new Error(`Sheet overflows horizontally by ${overflow}px`);
  // A label or button wrapping to a second line is the quiet failure on a fixed-width sheet.
  const wrapped = await page.evaluate(() =>
    [...document.querySelectorAll(".label, .hg-btn, .family, .spec b")]
      .filter((el) => {
        const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3;
        if (el.scrollWidth > el.clientWidth + 1) return true;
        // Buttons have a fixed height taller than their line box, so only text elements get the height test.
        return !el.classList.contains("hg-btn") && el.getBoundingClientRect().height > lh * 1.6;
      })
      .map((el) => el.textContent.trim().slice(0, 40))
  );
  if (wrapped.length) throw new Error(`Content wraps or overflows its box: ${wrapped.join(" | ")}`);
}

for (const [scale, file] of [[1, "hacienda-grill-brand-guidelines.png"], [2, "hacienda-grill-brand-guidelines@2x.png"]]) {
  await load(scale);
  await (await page.$("#sheet")).screenshot({ path: resolve(ROOT, "brand", file) });
  console.log(`rendered ${file}`);
}

// Favicon PNGs from the same live monogram the sheet shows, so the two can never drift.
const outDir = resolve(ROOT, "logo/png");
mkdirSync(outDir, { recursive: true });
await load(1);
for (const size of [512, 180, 32]) {
  await page.evaluate((s) => {
    const el = document.createElement("div");
    el.id = "fav";
    el.className = "mono";
    el.style.cssText = `position:fixed;left:0;top:0;width:${s}px;height:${s}px;font-size:${s * 0.75}px;z-index:9`;
    el.innerHTML = "<span>HG</span>";
    document.getElementById("fav")?.remove();
    document.body.appendChild(el);
  }, size);
  await (await page.$("#fav")).screenshot({ path: resolve(outDir, `hg-favicon-${size}.png`), omitBackground: true });
}
console.log("rendered hg-favicon-512/180/32.png");

await browser.close();
