# AlvSolutions

The company site. Eleventy, no framework, no CSS build step — the same setup as
the Sherpa site.

## Working on it

```bash
npx @11ty/eleventy          # one-off build into _site/
npm run serve               # Eleventy dev server with watching
node serve.mjs              # plain static server for _site/ (no rebuilds)
node check-site.mjs         # every internal link + the PLACEHOLDER count
node compare-build.mjs      # regression check against the pre-Eleventy page
```

`serve.mjs` and `npm run serve` both use port 3000. **Check whether one is
already running before starting another** — an old server on the port serves
stale files and every new route 404s, which looks exactly like a build failure.

## Where things are

```
src/
  index.html              home
  packages/               index.html (build tiers, care plans, chart)
                          for-your-business.html (the four trade builds)
                          add-ons.html (page add-ons + power features)
  pricing.html            the full standalone price list
  policies.html           plain-English terms + FAQ
  services/               index.html (hub) + service.njk → 8 pages
  work.html about.html contact.html
  stub.njk                → the legal pages
  _data/                  site · packages · careplans · bundles · addons
                          standalone · policies · services · stubs
  _includes/layouts       base.njk
  _includes/components    nav, footer, pagehead, cta-band, process-steps,
                          contact-section, price-matrix, tier-cards,
                          care-cards, bundle-cards, addon-class, price-list,
                          pricing-tiers, service-card, icon-sprite
  assets/                 styles.css, pages.css, main.js, shader.js, images
```

## The offer, in one paragraph

A build is a **one-time** price (Foundation $650 / Standard $1,050 / Complete
$1,450) and a care plan is a **separate, required monthly** one (Host $45 /
Grow $95). Standard and Complete include a number of *picks* from two lists:
eight page add-ons at $125 and seven power features at $225. The four trade
builds in `bundles.json` are those same packages with the picks already made —
that relationship is stated on every bundle card and is why `basedOn` exists.

Three components share one token vocabulary for the picks: a **blue square** is
a page add-on, a **gold diamond** is a power feature. The gold one is rotated
rather than only recoloured, so the two stay distinguishable without colour.

`Demo Restaurant/` and `Demo Detailer/` are standalone sites with their own
brand and CSS. They live outside `src/`, are copied verbatim into the build, and
are not pages of this site.

## Content lives in JSON, not in markup

Prices, service copy and nav links are data. Change `packages.json` and the tier
cards, the comparison chart, every "included in Pro" line and the home page all
change together. Adding a service is one object in `services.json`; it appears
in the nav, footer, hub and related lists on its own.

## Placeholders

An unsupplied value is `null` in the data, never a guess and never an empty
string. The `price` filter renders it as a visible `$—` marked
`PLACEHOLDER`, so it reads as unfinished rather than as free.

**There are currently zero placeholders.** Every price on the site is real.

The `money` filter handles the four shapes a flat number cannot express, and
none of them is a placeholder — they are all deliberate values:

| data | renders |
|---|---|
| `150` | `$150` |
| `{ "plus": 150 }` | `+$150` (a surcharge on something else) |
| `{ "from": 400 }` | `From $400` (a floor under a quote) |
| `{ "from": 100, "to": 175 }` | `$100 – $175` |
| `{ "soon": true }` | a `Coming soon` tag |
| `null` | `PLACEHOLDER` |

T-shirt design is `{ "soon": true }` on purpose: the pricing is not settled, and
a marked "coming soon" is honest where an invented number is not.

## Deployment

Live at **https://jxk0917.github.io/AlvSolutions-Main-Site/** — repo
`Jxk0917/AlvSolutions-Main-Site`, public.

Every push to `main` triggers `.github/workflows/deploy.yml`: Eleventy build →
`upload-pages-artifact` → `deploy-pages`. About 30 seconds end to end. There is
nothing to run by hand.

**CI installs with `npm ci --omit=dev`, and that flag is load-bearing.**
`canvas` and `puppeteer` are devDependencies used only by the local `shot-*.mjs`
capture tooling. A plain `npm ci` makes CI compile canvas from source and
download a Chromium build on every deploy.

**The repo is public because it has to be.** GitHub's free plan refuses to serve
Pages from a private repo. A future *client* site that must stay closed-source
needs Cloudflare Pages or Netlify instead.

### Switching to alvsolutions.com

The site currently builds with `PATH_PREFIX: AlvSolutions-Main-Site` so it
renders at the github.io project subpath. `HtmlBasePlugin` rewrites every
root-absolute link, so nothing is hardcoded and the switch is two edits:

1. Set `PATH_PREFIX: "/"` in `.github/workflows/deploy.yml`.
2. Add `src/CNAME` containing `alvsolutions.com`, and register it with
   `gh api -X PUT repos/Jxk0917/AlvSolutions-Main-Site/pages -f cname=alvsolutions.com`.
   The CNAME file alone does **not** set the Pages domain on an Actions deploy.

Do both only after DNS resolves, or Pages serves the domain before the
certificate exists.

## Not done yet

- **`index.html` in the project root** is the pre-Eleventy original. The home
  page has now been rewired (its cells link to the service pages and its icons
  come from the sprite), so this baseline no longer matches anything and
  `compare-build.mjs` has nothing useful to say. Both can be deleted.
- **The contact form still opens a mailto.** It is one shared component now, so
  switching to a form endpoint means editing `contact-section.njk` and the
  handler at the bottom of `assets/main.js` — two places, once.
- **`PATH_PREFIX`** is wired for GitHub Pages but unset. For a project subpath,
  build with `PATH_PREFIX=Repo-Name npx @11ty/eleventy` (bare, no slashes — a
  leading slash makes Git Bash rewrite it into a Windows path).
