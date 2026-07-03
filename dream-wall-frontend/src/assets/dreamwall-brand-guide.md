# DreamWall Brand Guide

## Personality
**Warm · Propulsive · Grounded**

Every decision below should serve at least two of these three words. If it doesn't, it doesn't belong in DreamWall.

- **Warm** — never cold or corporate. Feels like a friend, not a productivity tool.
- **Propulsive** — momentum over stillness. This isn't a vision board that sits there.
- **Grounded** — the "Wall" half of the name. Optimism with a spine, not naive positivity.

---

## Color

| Token | Hex | Role |
|---|---|---|
| Dusk Iris | `#4A4368` | Wordmark, headings on cream, hero block fill |
| Sunset Coral | `#F2735C` | Block color 1 |
| Coral Deep | `#D9573F` | CTA fills only — never used as a block color |
| Golden Glow | `#F6B352` | Block color 2, celebration accent |
| Twilight Blue | `#4A5FB8` | Block color 3 — new |
| Momentum Green | `#5FA777` | Block color 4 — new |
| Warm Cream | `#FBF7F4` | Default page background, never pure white |
| Warm Charcoal | `#2A2438` | Body text on cream **and** text/borders sitting on top of color blocks |
| Border | `#E4DDE0` | Dividers, hairlines on cream surfaces |

**Rule:** Coral, Gold, Blue, and Green are the block palette — used for numbered navigation/section cards, one color per block, never mixed within a single block. Coral Deep is reserved exclusively for CTAs and never appears as a block fill; that separation (block colors vs. action color) is what units.gr does too, and it keeps "click here" visually distinct from "this is a category."

**Rule:** Iris is for text on cream surfaces (headings, wordmark). Charcoal is for text and borders sitting on top of a color block — Iris doesn't have enough contrast against Coral or Green to stay accessible there.

**Rule:** gold as celebration accent stays sparing; gold as a block color is fine and expected, that's a different job for the same hue.

---

## Typography

Single family: **Plus Jakarta Sans**. Hierarchy comes from weight, not from mixing fonts.

| Role | Size | Weight |
|---|---|---|
| Hero | 40px | 700 |
| Section heading | 24px | 600 |
| Subheading | 18px | 600 |
| Body | 16px | 400, line-height 1.6 |
| Label / button | 14px | 500 |
| Caption / meta | 12px | 400 |

**Rule:** never introduce a second typeface. Change weight or color instead.

---

## Spacing

8px base rhythm: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`

- Icon-to-label gaps: 4–8
- Component padding: 12–16
- Section breaks: 32–48
- Page-level breathing room: 64–96

**Rule:** never use a value outside this scale.

---

## Background

- Default surface is Warm Cream everywhere. Never pure white.
- One gradient (Dusk Iris → Sunset Coral, low opacity) reserved for the landing hero or a "goal achieved" screen.
- No textures, no noise, no card-on-card gradients anywhere else.

---

## Structural System — units.gr influence

DreamWall borrows its structural grammar from units.gr, not its literal colors. The lesson from that reference: **loud color stays professional when it's contained by strict, repeated structure.** Four rules carry that discipline:

- **Thick charcoal borders (2px)** outline every color-block card. The border is what stops a bright fill from feeling like a toy — it gives the block a printed, intentional edge.
- **Large rounded corners (24px)** on block/hero cards specifically — softer and friendlier than the 12–16px used elsewhere in the system. Reserve the bigger radius for these structural cards so it stays a meaningful signal, not a default.
- **Numbered blocks** for navigation or sectioned content (01, 02, 03...) — a small, quiet way to suggest order and progress, which fits DreamWall's "propulsive" word better than an unordered grid would.
- **One hero block per screen, in Iris**, holding the boldest headline (weight 800) and the primary CTA in Coral Deep. Everything else — the numbered blocks — stays lower-key by comparison, so the hero has somewhere to lead the eye.

**Rule:** never invent a fifth block color without retiring one of the existing four. Four is the ceiling, matching what's disciplined about the reference — Units doesn't have six nav colors either.

---

## Logo

Wordmark only, no symbol — **Dreamwall**, sentence case, one weight (600), one color (Dusk Iris on light, Warm Cream on dark) plus the coral spark in the period. No weight contrast, no color-splitting the word itself.

Two corrections got us here, then one addition. First, an earlier direction split "Dream" and "Wall" into different weights and colors — it read as a designed-in trick (FedEx-arrow territory), which fights "timeless." Second, an all-lowercase pass leaned too "dev-tool startup" (right for ASCIInator or Shapes.tools, wrong for a brand meant to feel human and lasting). Apple and Units.gr both use plain sentence-case naming with the wordmark doing most of the work — that's the base we landed on. The one deliberate exception is the period: units.gr hides a tiny house in theirs, so DreamWall hides a tiny coral spark in ours. The difference between that and the earlier rejected trick is scale — this lives in a single punctuation mark, invisible until you look closely, not a redesign of the whole word.

- **Case:** sentence case always — "Dreamwall," never "dreamwall" or "DREAMWALL."
- **Weight:** 600 everywhere. Never mix weights within the wordmark.
- **Clear space:** height of the capital "D" on all sides, minimum.
- **Minimum size:** 120px wide. Below that, use the monogram.
- **Monogram fallback:** capital "D" in a circle, same weight as the wordmark. Used for favicons, app icons, avatars. Never a separate invented icon.
- **Reversed lockup:** on Iris backgrounds, wordmark switches to Warm Cream. No other change.
- **Optional detail — the coral dot:** the period after the wordmark is not a plain dot — it's a small rotated coral square (a diamond/spark), the same move units.gr makes hiding a tiny house in their own period. It's subtle by design: barely noticeable at normal reading size, a small reward on closer inspection, never the focal point of the mark. Use it in the primary lockup by default; for very small or single-color contexts (embroidery, single-color print), a plain period is an acceptable fallback.

---

## Files in this kit

- `dreamwall-tokens.css` — CSS custom properties, ready to `@import` or `<link>` directly
- `dreamwall-tokens.json` — framework-agnostic tokens (Figma, JS themes, Tailwind config, etc.)
