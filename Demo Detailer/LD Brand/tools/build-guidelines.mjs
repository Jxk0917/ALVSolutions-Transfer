// Renders the Lucid Detailing brand guidelines sheet.
// Run from the repo root, after build-logo.mjs and build-icons.mjs:
//   node "Demo Detailer/LD Brand/tools/build-guidelines.mjs"
// (The favicon PNGs come from build-logo.mjs, because they are cut from the logo's pixels.)
import puppeteer from "puppeteer";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = "Demo Detailer/LD Brand";
const source = pathToFileURL(resolve(ROOT, "brand/brand-guidelines.html")).href;
const FONTS = ["600 20px 'Exo 2'", "700 20px 'Exo 2'", "600 20px 'Barlow Condensed'", "700 20px 'Barlow Condensed'", "400 20px Inter", "600 20px Inter"];

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const page = await browser.newPage();

async function load(scale) {
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: scale });
  await page.goto(source, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const missing = await page.evaluate((f) => f.filter((x) => !document.fonts.check(x)), FONTS);
  if (missing.length) throw new Error(`Fonts did not load (check Demo Detailer/LD Fonts): ${missing.join(", ")}`);
  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute("src"))
  );
  if (broken.length) throw new Error(`Missing images: ${broken.join(", ")}`);
  const overflow = await page.evaluate(() => document.getElementById("sheet").scrollWidth - 1600);
  if (overflow > 0) throw new Error(`Sheet overflows horizontally by ${overflow}px`);
  // A label or button wrapping to a second line is the quiet failure on a fixed-width sheet.
  const wrapped = await page.evaluate(() =>
    [...document.querySelectorAll(".label, .ld-btn, .family, .spec b, .t-spec, .t-ui")]
      .filter((el) => {
        const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.3;
        if (el.scrollWidth > el.clientWidth + 1) return true;
        // Buttons have a fixed height taller than their line box, so only text elements get the height test.
        return !el.classList.contains("ld-btn") && el.getBoundingClientRect().height > lh * 1.6;
      })
      .map((el) => el.textContent.trim().slice(0, 40))
  );
  if (wrapped.length) throw new Error(`Content wraps or overflows its box: ${wrapped.join(" | ")}`);
}

for (const [scale, file] of [[1, "lucid-detailing-brand-guidelines.png"], [2, "lucid-detailing-brand-guidelines@2x.png"]]) {
  await load(scale);
  await (await page.$("#sheet")).screenshot({ path: resolve(ROOT, "brand", file) });
  console.log(`rendered ${file}`);
}

await browser.close();
