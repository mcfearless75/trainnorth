/* ==========================================================================
   Video wall — rotating creator coverage

   ⚠️  ACTION REQUIRED BEFORE LAUNCH
   Every entry below marked `verified: false` carries a PLACEHOLDER YouTube id.
   Placeholder ids are NOT rendered — the wall silently skips them — so the
   page never ships a broken embed. Replace `id` with the real 11-character
   YouTube video id and flip `verified: true` to bring an entry live.

   Fabricated ids would produce dead embeds and invalid VideoObject markup,
   which Google treats as structured-data spam. Only verified entries are
   emitted into schema.

   Embeds use youtube-nocookie.com and a click-to-load facade: no YouTube
   iframe, script or cookie is loaded until the visitor chooses to play.
   That keeps third-party JS off the critical path (LCP/INP) and means the
   cookie banner does not need to gate the section.
   ========================================================================== */

const VIDEO_LIBRARY = [
  {
    id: "0xHkEg5-iwU",
    verified: true,
    title: "Retatrutide — six-week body composition record",
    channel: "MarcinLabs",
    topic: "Weight loss",
    duration: "PT12M",
    summary: "Six weeks of documented change, with the cost and sourcing questions answered directly rather than deflected."
  },
  {
    id: "REPLACE_ME_01",
    verified: false,
    title: "What the BPC-157 literature actually shows",
    channel: "Creator coverage",
    topic: "Recovery",
    duration: "PT15M",
    summary: "A walk through the tissue-repair evidence base and why almost all of it is animal work."
  },
  {
    id: "REPLACE_ME_02",
    verified: false,
    title: "GLP-1 agonists explained without the hype",
    channel: "Creator coverage",
    topic: "Weight loss",
    duration: "PT18M",
    summary: "Mechanism, trial data and side-effect profile for the approved GLP-1 medicines."
  },
  {
    id: "REPLACE_ME_03",
    verified: false,
    title: "Reconstitution, step by step",
    channel: "Creator coverage",
    topic: "Handling",
    duration: "PT9M",
    summary: "Vial strength, diluent volume and the unit conversion people most often get wrong."
  },
  {
    id: "REPLACE_ME_04",
    verified: false,
    title: "Reading a certificate of analysis",
    channel: "Creator coverage",
    topic: "Sourcing",
    duration: "PT11M",
    summary: "Purity, identity and salt form — what a COA proves and what it cannot."
  },
  {
    id: "REPLACE_ME_05",
    verified: false,
    title: "Growth hormone secretagogues compared",
    channel: "Creator coverage",
    topic: "GH",
    duration: "PT16M",
    summary: "Ipamorelin, GHRP-2, GHRP-6 and hexarelin side by side on selectivity and side effects."
  },
  {
    id: "REPLACE_ME_06",
    verified: false,
    title: "Why most peptide studies do not transfer to humans",
    channel: "Creator coverage",
    topic: "Evidence",
    duration: "PT14M",
    summary: "Dose scaling, model organisms and the gap between a rodent result and a clinical claim."
  }
];

/* Only entries with a real id are ever shown or marked up. */
function liveVideos() {
  return VIDEO_LIBRARY.filter((v) => v.verified && !/^REPLACE_ME/.test(v.id));
}
