# MarcinLabs — enhanced build

A rebuilt, pitch-ready version of the MarcinLabs site. Static, no dependencies,
no build step. Open `index.html` directly or serve the folder.

## Files

```
index.html                 Single page, 10 chapters, all JSON-LD in the head
assets/css/tokens.css      Design tokens (colour, type, spacing, motion)
assets/css/base.css        Reset, typography, chrome, atmosphere, primitives
assets/css/sections.css    Per-section layout
assets/js/peptides.js      36-compound dataset + evidence grading
assets/js/videos.js        Video wall dataset  ← NEEDS REAL YOUTUBE IDs
assets/js/app.js           All behaviour
robots.txt                 Crawl control, AI crawlers explicitly allowed
sitemap.xml                Current routes + commented roadmap
llms.txt                   AI/answer-engine briefing
```

Scripts are classic, not ES modules — deliberately, so the site works when
opened straight from disk. Modules are blocked by CORS over `file://`, which
would leave the library and calculator blank in a demo.

## Before launch

1. **Video IDs.** `assets/js/videos.js` has one real entry and six placeholders
   marked `verified: false`. Placeholders are never rendered, so nothing breaks —
   but the wall shows one video until real IDs are added. Replace `id` with the
   real 11-character YouTube ID and set `verified: true`.
2. **Share image.** `assets/og/marcinlabs-share.jpg` is referenced but not
   present. Needs a 1200×630 image.
3. **Domain.** All canonical, hreflang, sitemap and schema URLs assume
   `https://marcinlab.com/en/`. Change together if the domain differs.
4. **Contact and video links** currently point back to in-page anchors. Wire to
   real destinations.

## The evidence grading system

The core differentiator. Every compound is graded from its own evidence text
into one of four tiers, shown on the card and in the schema:

| Tier | Count | Meaning |
|---|---|---|
| Approved medicine | 8 | Approved by a recognised regulator somewhere |
| Human trial data | 3 | Unhedged human trials, not approved |
| Limited human data | 14 | Hedged, unreplicated, or mostly mechanistic |
| Preclinical only | 11 | Animal/mechanistic only, no completed human trials |

Grading is in `evidenceTier()` in `assets/js/peptides.js` and is
**negation-aware by design**. Free text routinely says "not yet approved",
"never an approved therapy", "no human trials" and "no completed human trials" —
each contains the exact phrase a naive matcher looks for. Rules are therefore
ordered strongest-denial-first: an explicit denial of human evidence settles the
grade before any positive pattern is tested.

Two real bugs were caught this way during the build. Both would have published
false claims:

- "not yet approved" (Retatrutide) and "never an approved therapy" (DSIP) were
  being graded **Approved medicine**.
- "no human trials" (MOTS-c, SLU-PP-332, Follistatin 344, Dihexa) was being
  graded **Human trial data**.

**If you add a compound, re-run the audit.** Grades must never overstate the
source text — that accuracy is the whole proposition.

## SEO notes

- **FAQPage schema is deliberately absent.** Google restricted FAQ rich results
  to government and recognised health-authority sites in Aug 2023. This site
  states it is not a medical authority, so using it would be misuse and a
  manual-action risk. The FAQ content is still on the page for users.
- **`DefinedTermSet` / `DefinedTerm`** is used for the library — the correct
  type for a reference glossary, and it puts all 36 compound entities in front
  of both Google and AI answer engines.
- **JSON-LD is static in the head**, not JS-injected: script-injected structured
  data can face delayed processing.
- **AI crawlers are explicitly allowed** in `robots.txt`, with `llms.txt`
  briefing them on the grading system and the research-use-only constraints.
  Being the best-sourced reference in this niche is the strategy; being quotable
  serves it.
- **YouTube uses a click-to-load facade.** No third-party script or cookie
  loads until the visitor presses play, which keeps YouTube off the critical
  path and out of scope for the cookie banner.

## Compliance

Research-use-only positioning is load-bearing, not decorative. The compliance
ticker sits above the masthead and never scrolls away, disclaimers appear at
hero, calculator, video wall, supply and footer, and the referral arrangement is
disclosed rather than implied. Do not soften these to make the page tidier.
