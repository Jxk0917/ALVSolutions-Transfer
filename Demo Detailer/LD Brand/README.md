# Lucid Detailing brand kit

Revised September 2026, on the same blueprint as the Hacienda Grill, AlvSolutions and Forge PC
kits. Replaces `Lucid Detailing Brand GuideLines.png`, which is kept for reference only.
Share `brand/lucid-detailing-brand-guidelines.png`.

## Files

```
brand/
  lucid-detailing-brand-guidelines.png   The sheet (1600 wide; @2x at 3200). Share this one.
  brand-guidelines.html                  Source for the sheet. Pulls live logo, icon, button and font files.
  lucid-buttons.css                      Button styles (primary, secondary, text, on light; 3 sizes; all states).
logo/png/
  lucid-logo-full.png        Primary. Original colors, transparent. Ink, Carbon, Navy, dark photos.
  lucid-logo-light.png       Ink artwork with Slate DETAILING. Chrome, white, print.
  lucid-logo-chrome.png      One color Chrome. Photos, vinyl on dark vehicles, embroidery.
  lucid-logo-ink.png         One color Ink. Stamps, receipts, window decals on light glass.
  lucid-lockup-full.png      Logo without the strapline. Site header, anything under 400 px wide.
  lucid-lockup-light.png     Lockup for light grounds.
  lucid-favicon-512/180/32.png  The logo's own L and sparkle on an Ink tile: app icon, apple-touch icon, tab.
  *-512.png, *-256.png       Smaller copies of each logo file.
icons/svg/{mono,fog,sky,ink}/  Tabler outline icons, one folder per color. mono uses currentColor.
tools/
  build-logo.mjs             Derives every logo file and the favicons from the official PNG.
  build-icons.mjs            Fetches the pinned Tabler icons and writes each colorway.
  build-guidelines.mjs       Renders the sheet; fails on missing fonts/images or wrapped labels.
```

Fonts live in `Demo Detailer/LD Fonts`. Regenerate from the repo root, in this order:

```
node "Demo Detailer/LD Brand/tools/build-logo.mjs"
node "Demo Detailer/LD Brand/tools/build-icons.mjs"
node "Demo Detailer/LD Brand/tools/build-guidelines.mjs"
```

## What the audit found in the old sheet

| Area | Problem | Fix |
| --- | --- | --- |
| Typography | Three faces for two jobs: Raleway subheads and Montserrat body are both geometric sans and too alike to earn separate roles. The "EXO 2" specimen was not set in Exo 2. The body sample described Montserrat and used an em dash. Every label was wide-tracked capitals. No sizes. | Exo 2 for display, headings, nav, buttons and eyebrows; Barlow Condensed for prices, times and specs; Inter for body. A full type scale set in site copy. Tracked capitals only for nav, buttons and one eyebrow per three sections. |
| Color contrast | The primary button put white text on Sky: **2.37:1**, a fail. Slate `#4A5563` is **2.56:1** on the black, so it can't be text, a border or an icon. The Light logo put Sky DETAILING on pale gray: **1.61:1**. | Primary is Ink on Sky (8.20:1). Slate redefined as `#647081`, for control borders only (3.86:1). Sky Deep `#2B6497` added for Sky's job on light grounds (white text 6.23:1). |
| Color roles | No color had a stated job. The blue in the logo's DETAILING is a steel `#6E869D`, not the Sky on the sheet, and it wasn't listed. The site also depends on `#12171E` and a gray secondary text color, and neither was on the sheet. The sky-to-black gradient bar had no use. | Every color has a role and a measured pairing. Steel named and kept for the logo. Carbon, Mist, Glint and Chrome added. Gradient dropped. |
| Logo files | Only a 1536 x 1024 raster on a solid black plate. No transparent file, so the site knocks the plate out with an SVG filter and hand-measured crop offsets. | Transparent PNGs derived from the official pixels, edge pixels un-premultiplied so there is no dark fringe on photos. |
| Logo variations | "Primary Light" kept the silver car and pale DETAILING, which almost disappear on light gray. "Monochrome" put the silver logo on mid gray, which was low contrast. "Alternate Blue" was the same logo on navy, not a variation. No lockup, favicon or small-size version. | Light (Ink + Slate), one color Chrome and Ink, a lockup without the strapline, and a favicon cut from the logo's own L and sparkle. |
| Clear space, minimum size | Not defined. | x = cap height of LUCID. Full logo 400 px (the strapline is illegible below it), lockup 180 px, favicon below that. |
| Iconography | AI-drawn set with mixed detail: sparkles and water drops added to some icons, a shield with an unreadable glyph, uneven stroke weights. | Ten Tabler outline icons at a 1.5 px stroke, matched to the car line, each named by what it means on the site. |
| Buttons | White on Sky primary (fails). Hover was a glossy gradient. A ">" chevron appended to every button. | Exo 2 600 labels, no glow, no chevrons, four states. The focus ring is Sky on dark grounds and Ink on light ones. |

## Palette

| Name | Hex | Use |
| --- | --- | --- |
| Sky | `#6FAEE6` | Primary action, focus ring, links, active state. Ink text 8.20:1. Never on a light ground (1.61:1) |
| Glint | `#9CCBF2` | Hover for Sky. Ink text 11.32:1 |
| Sky Deep | `#2B6497` | Sky's role on Chrome, white and print. White text 6.23:1, on Chrome 5.65:1 |
| Steel | `#6E869D` | The DETAILING color. Logo only |
| Ink | `#0D0D0F` | Page background |
| Carbon | `#12171E` | Raised bands and panels |
| Navy | `#1E2A38` | Cards, the featured package, disabled buttons |
| Slate | `#647081` | Control borders: 3.86:1 on Ink, 3.58:1 on Carbon. Fails on Navy (2.89:1), where borders use Mist. Never text |
| Mist | `#9AA3AF` | Secondary text: 7.61:1 on Ink, 7.05:1 on Carbon, 5.70:1 on Navy |
| Fog | `#D1D5DB` | Body text, 13.18:1 on Ink |
| Chrome | `#F2F4F7` | Headings on dark (17.62:1), light ground for print |
| Hairline | Fog at 12% | Dividers only. It carries no meaning and has no contrast requirement |

## Type

| Role | Font | Weight | Setting |
| --- | --- | --- | --- |
| Hero | Exo 2 | 700 | 88 px desktop (48 px mobile), line 1.0, tracking -1%, sentence case |
| Section heading | Exo 2 | 600 | 48 px (32 px mobile), line 1.08 |
| Card heading | Exo 2 | 600 | 24 px, line 1.25 |
| Automotive spec | Barlow Condensed | 600 | 20 to 24 px, uppercase, tracking 4%: package names, durations, stages, vehicle names |
| Price and stat numbers | Barlow Condensed | 700 | 56 to 72 px, line 0.95 |
| Lead | Inter | 400 | 20 px, line 1.55 |
| Body | Inter | 400, 600 and 700 for emphasis | 17 px, line 1.65, lines under 65 characters. Form fields 16 px (smaller makes iOS zoom) |
| Navigation, buttons | Exo 2 | 600 | 14 px, uppercase, tracking 8% |
| Eyebrow | Exo 2 | 600 | 13 px, uppercase, tracking 14%, Sky. At most one per three sections |

## Rules

- **Sky is the action color.** One Primary per view. It is also the focus ring, so it should not
  be spread across decoration.
- **Full logo on dark, Light logo on light.** The silver car and steel DETAILING disappear on pale grounds.
- **The strapline is part of the logo, not a type style.** Wide-tracked caps like "CLEANER SURFACE.
  BETTER FINISH." stay inside the logo artwork.
- **No glows.** Colored drop shadows, glowing edges and gradient text all compete with the one light
  source the brand owns: the inspection lamp.
- **Icons**: Tabler outline, 1.5 px stroke, one color. Fog by default. Sky, or Ink on a Sky tile,
  only for the single most important action.
- **Radii**: 6 px buttons, inputs and tags; 12 px cards, panels and photos. Circles only for
  controls that are round by function (the lamp handle, back to top).
- **Do not** recolor parts of the logo separately, add shadows or glows to it, stretch it, or retype
  LUCID in Exo 2 or any other font.

## Limits of the source artwork

The official logo is a 1536 x 1024 raster with the artwork about 990 px wide. That covers screens
and small print, but not vehicle wraps, signage or large-format print. Those need the logo redrawn
as vector artwork using this sheet as the reference. The lettering is not Exo 2, so it can't be
rebuilt from the brand fonts.

## Website audit: changes to make

Audit of `Demo Detailer/index.html` against this kit on 2026-09-15. The site has not been
changed yet. Contrast figures were measured on the site's own color values.

### Must fix (accessibility)

1. **Slate text fails contrast.** `--slate:#4A5563` is used for `.svc-num` (2.56:1 on Ink), input
   placeholders, `.form-note`, the "not included" rows in `.tier-rows .no` (2.37:1 on Carbon) and the
   footer strapline. Move all of these to Mist `#9AA3AF`, and set `--slate` to `#647081` for borders.
2. **Control borders are invisible.** Inputs use `rgba(209,213,219,0.14)` and the secondary and ghost
   buttons use similar low-alpha borders. All of these are well under the 3:1 needed for UI parts.
   Use Slate (Mist on Navy).
3. **Form fields are 14.5 px.** iOS zooms the page when a field under 16 px is focused. Set inputs,
   select and textarea to Inter 16 px.
4. **Micro labels are too small.** Field labels, contact labels and footer headings are 10.5 px
   tracked capitals, and `.inspect-tag` drops to 9.5 px on mobile. Form labels should be Inter 500
   14 px in sentence case, above the field. Footer headings should be Exo 2 600 14 px.
5. **Star ratings read as symbol soup.** `★★★★★` is announced as "black star" five times. Wrap each
   one in `role="img" aria-label="5 out of 5 stars"`, with the glyphs `aria-hidden`.
6. **No favicon.** Add `logo/png/lucid-favicon-32.png` and `-180.png` as the icon and apple-touch icon.

### Brand alignment

7. **Fonts.** Remove the Google Fonts link (Exo 2, Raleway, Montserrat). Self-host from `LD Fonts`:
   Exo 2 variable, Barlow Condensed 600 and 700, Inter variable. Replace every Raleway and Montserrat
   rule using the Type table (12 Raleway and 2 Montserrat declarations today).
   - Nav links, buttons, eyebrows: Exo 2 600 (currently Raleway).
   - Prices (`.tier-price b`), rail numbers, `.inspect-fact b`, `.score b`, `.step-time`, `.tier-name`:
     Barlow Condensed.
   - Body, leads, form fields: Inter (currently Montserrat).
8. **Buttons.** Replace `.btn-*` with `lucid-buttons.css`: remove the Sky glow `box-shadow`, the
   hover jump to white, the `translateY(-2px)` lift, and the arrow SVG in every button (nav CTA,
   hero, form submit).
9. **Glows elsewhere.** Remove `box-shadow` glows on `.tier-feature`, `.step::before` and
   `.inspect-edge`. The inspection lamp's beam itself can stay: it is the brand's signature
   interaction and the one place light should move on the page.
10. **Gradient hero text.** `.chrome` sweeps a Sky gradient through the H1. It competes with the lamp
    and is a generic effect. Set the hero in solid Chrome.
11. **Logo.** Replace the `#plate-out` SVG filter and `.lockup` crop offsets with plain `<img>` tags:
    `lucid-lockup-full.png` in the nav at 180 px or wider (it is 150 px today, under the minimum) and
    `lucid-logo-full.png` in the footer at 400 px or wider. The footer logo is 200 px today, so its
    strapline can't be read. If it has to stay small, use the lockup there too.
12. **Icons.** The page draws its icons as inline SVG paths by hand, at six different stroke widths
    (0.8 to 2.2). Swap in `icons/svg/mono` at 1.5 px: phone, calendar, mobile, and the service icons if icons are added to
    the services list.
13. **Eyebrows.** Every section has one (8 in total). Keep at most 3: hero ("Mobile detailing"),
    correction and book. Remove the 30 px rule drawn before each one.
14. **Radii.** Tokens today are 8/12/18 px plus pills. Change `--r-sm` to 6 px and `--r-md` and `--r-lg`
    to 12 px. Make the "Most booked" badge, step-time chips and inspect tags 6 px instead of pills.
15. **Colors.** Add `--glint`, `--sky-deep`, `--mist` and `--chrome`. Replace `--fog-dim:#8B94A2` with Mist,
    because it is 4.75:1 on Navy and fails there. Replace pure `#FFFFFF` headings with Chrome.

### Copy

16. **Em and en dashes.** Remove them from visible copy: title tag, nav logo `aria-label`, hero lead,
    services lead, packages lead, the illustration caption, the four package `<option>`s, the form
    note, and the ranges "1–3", "2–8 hrs", "60–90 min", "Monday – Saturday". Ranges read "1 to 3",
    "2 to 8 hrs".
17. **Middle dots.** 18 uses, mostly in meta strings like "per vehicle · 2–3 hrs on site" and "Marcus T. ·
    Signature". Split them into two lines or two spans: price detail under the price, package name
    under the reviewer.
18. **Spelling. Done 2026-09-15.** The site and this kit are now US English: tyres to tires,
    car park to parking lot, grey to gray, levelled to leveled, colour to color, front wing to front
    fender, and the windscreen called "screen" to windshield. Keep US spelling in all new copy.
19. **Service numbering.** The services list is labeled 01 to 06 with an "01 / 06" counter, but
    services aren't steps in order. Drop the numbers there. The Process section is a real sequence,
    so its numbers stay.
20. **Proof figures. Keep.** "500+ vehicles detailed", "4.9 across 213 reviews", "3,000 lm" and the
    three named reviews are sample content, there on purpose so clients can see how a finished
    site presents proof. Swap in the client's real numbers and reviews when the site is sold.

### Housekeeping

21. **Tailwind CDN.** `cdn.tailwindcss.com` loads a runtime compiler for 7 utility classes
    (`grid`, `sm:grid-cols-2`, `gap-5` and `sm:col-span-2` on the form; `w-6`, `h-6` and `hidden` on
    the menu icons). Replace those with two lines of
    CSS and remove the script. On AlvSolutions the same CDN caused the hamburger to show at every
    breakpoint.
