# Hacienda Grill brand kit

Revised September 2026. Replaces `Hacienda Demo Resturant Brand Guide Lines.png`, which is
kept for reference only. Share `brand/hacienda-grill-brand-guidelines.png`.

## Files

```
brand/
  hacienda-grill-brand-guidelines.png   The sheet (1600 wide; @2x at 3200). Share this one.
  brand-guidelines.html                 Source for the sheet. Pulls live logo, icon, button and font files.
  hg-buttons.css                        Button styles (primary, secondary, outline, outline-light, text; 3 sizes; all states).
logo/png/
  hg-logo-full.png          Primary. Full-colour badge, tight crop. Paper, Cream, photography.
  hg-logo-cream.png         Reverse. Light fills only, for Ink and dark photos.
  hg-logo-chili.png         One colour, Chili. Bags, cups, menus, screen print.
  hg-logo-charcoal.png      One colour, Charcoal. Stamps, receipts, single-colour print.
  hg-banner-full.png        The HACIENDA GRILL sign alone, for headers and anything too short for the badge.
  hg-banner-cream.png       Banner reverse, for Chili or Ink.
  hg-favicon-512/180/32.png HG monogram: app icon, apple-touch icon, browser tab.
  *-512.png, *-256.png      Smaller copies of each logo file.
icons/svg/{mono,charcoal,chili,cream}/  Tabler outline icons, one folder per colour. mono uses currentColor.
tools/
  build-logo.mjs            Derives every logo file from the official PNG.
  build-icons.mjs           Fetches the pinned Tabler icons and writes each colourway.
  build-guidelines.mjs      Renders the sheet and favicons; fails on missing fonts/images or wrapped labels.
```

Fonts live in `Demo Restaurant/HG Fonts`. Regenerate from the repo root, in this order:

```
node "Demo Restaurant/HG Brand/tools/build-logo.mjs"
node "Demo Restaurant/HG Brand/tools/build-icons.mjs"
node "Demo Restaurant/HG Brand/tools/build-guidelines.mjs"
```

## What the audit found in the old sheet

| Area | Problem | Fix |
| --- | --- | --- |
| Typography | Named "Bebas Neue Pro" (the site loads plain Bebas Neue), used Montserrat for headings and body alike, and padded each font with filler adjectives ("Bold · Strong · Modern"). No sizes. | The five-role system: League Gothic, Fjalla One, Montserrat, Source Sans 3, with a real type scale set in site copy. |
| Colour names | "Terra Cotta" `#FF8C00` is a bright orange, not terracotta. "Agave" `#6B8E23` is the CSS preset `olivedrab`, not the logo's green (`#728C0D`). | Renamed Marigold and sampled from the logo (`#F89221`). Agave redefined for use in the interface. |
| Colour contrast | White on Agave measured 3.81:1, so the green secondary button failed. Sun Gold on light surfaces is 1.61:1. Sand `#D9B27A` is 1.90:1 and had no job. No colour had a stated role. | Agave `#5A7A1C` (4.96:1 with white). Every colour has a role and a measured pairing. Sand dropped. Clay `#6E5C4B` added for secondary text. |
| Logo variations | The red, green and black versions were separate re-renders, not derived from the logo, so details differ between them. The green version and the full-colour badge on dark both lose their outline. No favicon or small-size version. | Every variation is derived from the official pixels. The green version is dropped. Reverse added for dark grounds. Banner and HG monogram cover small sizes. |
| Clear space, minimum size | Not defined. | x = height of the GRILL lettering. Badge 128 px, banner 96 px, monogram below that. |
| Iconography | Mixed styles in one row: filled colour pepper and lime, outline cactus and sun, a shaded mortar. The labels ("Bold & Simple", "Vibrant") described feelings, not icons. | One Tabler outline set at a 2 px stroke, named by what each icon means on the site. |
| Buttons | Bebas Neue labels with coloured drop shadows; the secondary button failed contrast. | Montserrat Bold labels, no glow, four states. Focus ring is Charcoal on light and Sun Gold on dark. The site's orange ring measured 2.24:1. |

## Palette

| Name | Hex | Use |
| --- | --- | --- |
| Chili Red | `#C81010` | Primary actions, prices, text links. White text 5.94:1; on Paper 5.69:1 |
| Adobe | `#9E0C0C` | Hover and pressed Chili. White text 8.36:1 |
| Agave | `#5A7A1C` | Secondary actions. White text 4.96:1. The logo's own green (`#728C0D`) stays in the illustration |
| Sun Gold | `#F2C230` | Accents and focus rings on Ink only (11.5:1). Never text on a light surface |
| Marigold | `#F89221` | Logo and illustration only |
| Ink | `#140C08` | Hero, footer, dark sections |
| Charcoal | `#231F20` | Text on light surfaces, 15.6:1 on Paper |
| Clay | `#6E5C4B` | Secondary text, 5.65:1 on Cream |
| Cream | `#F7F1E1` | Cards and panels; text on Ink, 17.2:1 |
| Paper | `#FDFAF2` | Page background |

## Type

| Role | Font | Weight | Setting |
| --- | --- | --- | --- |
| Hero, major display | League Gothic | 400 | Uppercase, line 0.86 |
| Section headings | Fjalla One | 400 | Uppercase, 46 px; card headings 26 px, tracking 2% |
| Navigation, buttons, labels | Montserrat | 600 nav, 700 buttons | 14 px, uppercase, tracking 8% |
| Body copy | Source Sans 3 | 400 body, 500 lead | 18 px body, line 1.6, lines under 60 characters |
| Heritage accent | Montserrat | 600 | 13 to 15 px, uppercase, tracking 22%, Chili on light or Sun Gold on Ink |

## Rules

- **Chili is the action colour.** One Primary per view. Agave is the only other filled button.
- **Full colour on light, reverse on dark.** The badge's black outline disappears on Ink.
- **Heritage text is rationed.** Wide-tracked capitals are for the one line per section that
  carries place and history ("San Antonio, Texas · Since 2012"), not for every label.
- **Icons**: Tabler outline, 2 px stroke, one colour. Charcoal by default, Chili (or Cream on a
  Chili tile) for the single most important action.
- **The diamond band** is the brand's seam. Use it at the edges of a page or a printed piece,
  never behind text.
- **Radii**: 4 px buttons and inputs, 12 px cards and panels.
- **Do not** recolour parts of the badge separately, add shadows or glows to it, stretch it, or
  set the lettering in another typeface.

## Limits of the source artwork

The official logo is a 1536 x 1024 raster with the badge about 726 px wide. That is enough for
screens and small print but not for signage, vehicles or large-format print. Those need the badge
redrawn as vector artwork by an illustrator, using this sheet as the reference.

## Website

Applied to `Demo Restaurant/index.html` on 2026-09-15.

- Fonts self-hosted from `HG Fonts` (Google Fonts link removed): League Gothic for the hero and
  stats, Fjalla One for section and card headings and prices, Montserrat for nav, buttons, tabs
  and labels, Source Sans 3 for body copy. Body text moved from 15px Montserrat to 17px Source Sans 3.
- Palette per this kit: Agave `#5A7A1C` (`--agave-deep` for Agave text on Cream), `--terracotta`
  renamed `--marigold` `#F89221`, `--sand` removed, `--muted` replaced by `--clay` `#6E5C4B`.
- Focus ring Charcoal on light sections, Sun Gold on dark ones, Cream on the red reviews band.
- Buttons follow `hg-buttons.css`: no coloured glows, no hover lift, 1px press. Non-link cards
  (review plaques, menu rows) no longer move on hover.
- Logos use the kit files: full colour in the nav, cream reverse in the hero and footer. Favicon
  and apple-touch icon are the HG monogram.
- Em and en dashes removed from visible copy; ranges read "to".

Fonts are served as TTF. Converting them to WOFF2 would cut the download by roughly half.
