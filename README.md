# TRAINNORTH — prototype build

A static, dependency-free prototype of an evidence-graded research compound
reference site. No build step. Open `index.html` directly or serve the folder.

Brand, author details and location are neutral placeholders.

## Files

```
index.html                 Single page, 10 chapters, all JSON-LD in the head
assets/css/tokens.css      Design tokens (colour, type, spacing, motion)
assets/css/base.css        Reset, typography, chrome, atmosphere, primitives
assets/css/sections.css    Per-section layout
assets/js/peptides.js      36-compound dataset + evidence grading
assets/js/videos.js        Video wall dataset  ← placeholders need real IDs
assets/js/app.js           All behaviour
robots.txt                 Crawl control, AI crawlers explicitly allowed
sitemap.xml                Current route + commented roadmap
llms.txt                   AI/answer-engine briefing
```

Scripts are classic, not ES modules — deliberately, so the site works when
opened straight from disk. Modules are blocked by CORS over `file://`, which
would leave the library and calculator blank in a demo.

## Before any production launch

1. **Remove the demo guard.** `index.html` carries `noindex, nofollow` in a
   clearly marked block near the top. The production robots directive sits
   commented directly beneath it. The site will not rank until this is swapped.
2. **Video IDs.** `assets/js/videos.js` has one real entry and six placeholders
   marked `verified: false`. Placeholders are never rendered, so nothing breaks —
   the wall simply shows fewer cards. Replace `id` with the real 11-character
   YouTube ID, set `verified: true`, and add a matching `VideoObject` block to
   the head schema.
3. **Share image.** `assets/og/trainnorth-share.jpg` is referenced but absent.
   Needs a 1200×630 image.
4. **Domain.** Canonical, hreflang, sitemap and schema URLs all point at the
   GitHub Pages URL. Change them together when a real domain is attached.

## The evidence grading system

The core differentiator. Every compound is graded from its own evidence text
into one of four tiers, shown on the card and mirrored in the schema:

| Tier | Count | Meaning |
|---|---|---|
| Approved medicine | 8 | Approved by a recognised regulator somewhere |
| Human trial data | 3 | Unhedged human trials, not approved |
| Limited human data | 14 | Hedged, unreplicated, or mostly mechanistic |
| Preclinical only | 11 | Animal/mechanistic only, no completed human trials |

Grading lives in `evidenceTier()` in `assets/js/peptides.js` and is
**negation-aware by design**. Free text routinely says "not yet approved",
"never an approved therapy", "no human trials" and "no completed human trials" —
each contains the exact phrase a naive matcher looks for. Rules are ordered
strongest-denial-first: an explicit denial settles the grade before any positive
pattern is tested.

Two real bug classes were caught this way during the build. Both would have
published false claims:

- "not yet approved" (Retatrutide) and "never an approved therapy" (DSIP) were
  graded **Approved medicine**.
- "no human trials" (MOTS-c, SLU-PP-332, Follistatin 344, Dihexa) was graded
  **Human trial data**.

**If you add a compound, re-run the audit.** Grades must never overstate the
source text — that accuracy is the entire proposition.

## SEO notes

- **FAQPage schema is deliberately absent.** Google restricted FAQ rich results
  to government and health-authority sites in Aug 2023 and has since retired the
  feature. There is no rich result to win and this site disclaims medical
  authority, so it would be pure risk. Same reasoning applies to `Drug` and
  `MedicalWebPage` — do not "upgrade" the library to those types.
- **`DefinedTermSet` / `DefinedTerm`** is the correct type for a reference
  glossary, and puts all 36 compound entities in front of Google and AI engines.
- **JSON-LD is static in the head**, not JS-injected, which can be processed late.
- **AI crawlers are explicitly allowed**, with `llms.txt` briefing them on the
  grading system and the research-use-only constraints.
- **YouTube uses a click-to-load facade.** No third-party script or cookie loads
  until the visitor presses play.

### Known gaps, ranked

1. **The library is client-rendered, so non-rendering AI crawlers can't read it.**
   GPTBot, ClaudeBot and PerplexityBot don't execute JavaScript. They see only
   the static `DefinedTerm` descriptions, not the full dataset. The fix is the
   same as the biggest organic opportunity below.
2. **No outbound citations.** Every evidence claim is asserted without a link to
   an FDA label, MHRA SmPC, or trial record. For a site whose proposition is
   "graded, not sold", this is the widest gap between claim and proof.
3. **Fonts are render-blocking** — four families from Google Fonts, with the H1
   (likely LCP element) depending on one of them. Self-host and preload the
   headline weight; consider dropping IBM Plex Mono for a system mono stack.
4. **Two sticky `backdrop-filter` elements** (masthead, library filter bar)
   repaint every scroll frame. Deliberate, but test on mid-tier Android; reduce
   blur radius before removing the effect.

### Biggest organic opportunity

**Thirty-six standalone compound pages.** Each has real UK search demand and
almost no well-sourced competing content. The homepage cannot rank for 36
keyword clusters at once, and static per-compound pages are also the only way
the dataset becomes citable by AI crawlers.

Build them as individual sourced write-ups. Do **not** template-fill all 36 —
that is scaled content abuse and Google treats it accordingly.

## Compliance

Research-use-only positioning is load-bearing, not decorative. The compliance
ticker sits above the masthead and never scrolls away; disclaimers appear at
hero, calculator, video wall, supply and footer; the referral arrangement is
disclosed rather than implied. Do not soften these to tidy the page.

One structural risk worth raising with any client: if the enquiry/referral flow
reads as a storefront for unapproved compounds, the "not a shop" framing has to
survive scrutiny of the actual user journey, not just the copy. That is a legal
and commercial question before it is an SEO one.
