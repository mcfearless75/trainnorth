/* ==========================================================================
   Video wall - rotating creator coverage

   Every entry below was verified against YouTube's oEmbed endpoint before
   being added. `title` and `channel` are the exact values YouTube returned,
   not paraphrases; `topic` and `summary` are editorial.

   To verify a new id before adding it:
     https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json
   A 200 with JSON means the video exists and is embeddable. Anything else
   means do not add it. Never add an id you have not resolved this way - a
   fabricated id produces a dead thumbnail and a broken player.

   `verified: false` entries are skipped at render time, so an unverified
   placeholder can sit here safely without ever reaching a visitor.

   Selection rotates weekly rather than per page load. See weeklySelection()
   in app.js.

   Embeds use youtube-nocookie.com behind a click-to-load facade: no YouTube
   iframe, script or cookie loads until the visitor presses play. That keeps
   third-party JS off the critical path and out of scope for the cookie banner.

   These are other people's videos. They are embedded, not claimed, which is
   why the page carries no VideoObject markup for them.
   ========================================================================== */

const VIDEO_LIBRARY = [
  {
    id: "1PFKLv__5G0",
    verified: true,
    title: "Two Doctors Audit the Peptide Market: BPC-157, MK-677, Retatrutide, CJC-1295, MOTS-c, and More!",
    channel: "Barbell Medicine",
    topic: "Evidence",
    summary: "Two physicians work through the popular compounds one by one and ask what the human evidence actually supports."
  },
  {
    id: "5hpNkU-RsP8",
    verified: true,
    title: "BPC-157 After 30 Years: What the Research Actually Shows",
    channel: "Reta knowledge",
    topic: "Recovery",
    summary: "Three decades of BPC-157 research, and the awkward question of why so little of it is in humans."
  },
  {
    id: "HIrI8STJPJo",
    verified: true,
    title: "Peptide BPC-157 - Does It Work? Breaking Down the Evidence and the Hype",
    channel: "Talking With Docs",
    topic: "Recovery",
    summary: "Separating the tissue-repair claims from what the studies were actually designed to measure."
  },
  {
    id: "RuL_hVkCTNw",
    verified: true,
    title: "You Don't Need Peptides—Here's What You Actually Need",
    channel: "Dr. Dan | Obesity Expert",
    topic: "Counterpoint",
    summary: "The case against reaching for compounds at all, from a clinician who treats obesity for a living."
  },
  {
    id: "TCRolSfwjG4",
    verified: true,
    title: "Ep 158 | Peptides & GLP-1s: Tool or Trap? What You Need to Know Before You Start",
    channel: "Fitness Uncharted",
    topic: "Weight loss",
    summary: "Where approved GLP-1 medicines end and the unapproved end of the market begins."
  },
  {
    id: "SGGk3PnUpzM",
    verified: true,
    title: "The Truth About Peptide Injections: GLP-1s, BPC-157, GHK-Cu, & What They Do for Your Skin & Body",
    channel: "Mixed Makeup",
    topic: "Cosmetic",
    summary: "Copper peptides and the dermal claims, including where topical evidence outruns injectable."
  }
];

/* Only entries with a verified, well-formed id are ever rendered. */
function liveVideos() {
  return VIDEO_LIBRARY.filter((v) => v.verified && /^[A-Za-z0-9_-]{11}$/.test(v.id));
}
