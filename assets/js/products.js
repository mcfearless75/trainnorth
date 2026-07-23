/* ==========================================================================
   Catalogue data

   PRICES ARE NOT SET YET. Every `price` below is null, which the catalogue
   renders as "On enquiry" rather than a number. Nothing shows a fabricated
   figure at any point.

   TO LOAD THE PRICE SHEET
   Fill the `price` values in CATALOGUE below. One number per strength, in
   whole units of the currency set in CURRENCY, and priced PER BOX (10 vials),
   not per vial. Anything left null keeps showing "On enquiry", so the sheet
   can be loaded in stages.

   Columns needed from the spreadsheet:
     compound name | strength | vials per box | price per box

   Product name, description and research bullets are derived from the
   36-compound library in peptides.js rather than duplicated here, so the
   evidence grading stays the single source of truth and cannot drift.
   ========================================================================== */

const CURRENCY = { code: "USD", symbol: "$" };

/* Referral terms applied to the basket subtotal. */
const REFERRAL = { code: "TN-REF5", discount: 0.05 };

const CATALOGUE_CATEGORIES = [
  { key: "all",         label: "All" },
  { key: "glp1",        label: "GLP-1 & metabolic" },
  { key: "growth",      label: "Growth axis" },
  { key: "recovery",    label: "Tissue recovery" },
  { key: "cognitive",   label: "Nootropic & cognitive" },
  { key: "endocrine",   label: "Hormones & endocrine" },
  { key: "cellular",    label: "Metabolic & cellular" },
  { key: "blends",      label: "Injectable blends" },
  { key: "accessories", label: "Accessories" }
];

/* Each entry maps a library compound to its catalogue category and the
   strengths the supplier lists. `ref` must match the `n` field in peptides.js
   exactly, or the entry is skipped and logged rather than rendered blank. */
const CATALOGUE = [
  { ref: "Semaglutide",                 cat: "glp1",      variants: [{ mg: 5, price: null }, { mg: 10, price: null }, { mg: 15, price: null }, { mg: 20, price: null }] },
  { ref: "Tirzepatide",                 cat: "glp1",      variants: [{ mg: 5, price: null }, { mg: 10, price: null }, { mg: 15, price: null }, { mg: 20, price: null }] },
  { ref: "Retatrutide",                 cat: "glp1",      variants: [{ mg: 5, price: null }, { mg: 10, price: null }, { mg: 15, price: null }, { mg: 20, price: null }] },
  { ref: "Cagrilintide",                cat: "glp1",      variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "AOD-9604",                    cat: "glp1",      variants: [{ mg: 5, price: null }] },
  { ref: "MOTS-c",                      cat: "cellular",  variants: [{ mg: 10, price: null }] },
  { ref: "SLU-PP-332 (MitoBurn)",       cat: "cellular",  variants: [{ mg: 10, price: null }] },
  { ref: "NAD+",                        cat: "cellular",  variants: [{ mg: 500, price: null }, { mg: 1000, price: null }] },
  { ref: "Epithalon",                   cat: "cellular",  variants: [{ mg: 10, price: null }, { mg: 50, price: null }] },

  { ref: "Tesamorelin",                 cat: "growth",    variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "Ipamorelin",                  cat: "growth",    variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "CJC-1295 (no DAC)",           cat: "growth",    variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "CJC-1295 (with DAC)",         cat: "growth",    variants: [{ mg: 2, price: null }, { mg: 5, price: null }] },
  { ref: "Sermorelin",                  cat: "growth",    variants: [{ mg: 5, price: null }, { mg: 15, price: null }] },
  { ref: "GHRP-2",                      cat: "growth",    variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "GHRP-6",                      cat: "growth",    variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "Hexarelin",                   cat: "growth",    variants: [{ mg: 2, price: null }, { mg: 5, price: null }] },
  { ref: "IGF-1 LR3",                   cat: "growth",    variants: [{ mg: 1, price: null }] },
  { ref: "Follistatin 344",             cat: "growth",    variants: [{ mg: 1, price: null }] },

  { ref: "BPC-157",                     cat: "recovery",  variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "TB-500",                      cat: "recovery",  variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "KPV",                         cat: "recovery",  variants: [{ mg: 10, price: null }] },
  { ref: "LL-37",                       cat: "recovery",  variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "Thymosin Alpha-1 (TA-1)",     cat: "recovery",  variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "GHK-Cu",                      cat: "recovery",  variants: [{ mg: 50, price: null }, { mg: 100, price: null }] },
  { ref: "AHK-Cu",                      cat: "recovery",  variants: [{ mg: 50, price: null }] },

  { ref: "Semax",                       cat: "cognitive", variants: [{ mg: 10, price: null }, { mg: 30, price: null }] },
  { ref: "Selank",                      cat: "cognitive", variants: [{ mg: 10, price: null }, { mg: 30, price: null }] },
  { ref: "Dihexa",                      cat: "cognitive", variants: [{ mg: 10, price: null }] },
  { ref: "DSIP",                        cat: "cognitive", variants: [{ mg: 5, price: null }] },

  { ref: "PT-141 (Bremelanotide)",      cat: "endocrine", variants: [{ mg: 10, price: null }] },
  { ref: "Kisspeptin-10",               cat: "endocrine", variants: [{ mg: 5, price: null }, { mg: 10, price: null }] },
  { ref: "Melanotan II (MT2)",          cat: "endocrine", variants: [{ mg: 10, price: null }] },

  { ref: "BPC-157 + TB-500 blend",      cat: "blends",    variants: [{ mg: 20, price: null }] },
  { ref: "CJC-1295 + Ipamorelin blend", cat: "blends",    variants: [{ mg: 10, price: null }] },
  { ref: "Semax + Selank blend",        cat: "blends",    variants: [{ mg: 20, price: null }] }
];

/* Accessories have no library entry, so they carry their own copy. */
const ACCESSORIES = [
  {
    ref: "Bacteriostatic Water",
    cat: "accessories",
    blurb: "Multi-use diluent for reconstitution. Benzyl alcohol preserved.",
    research: ["Reconstitution solvent", "Multi-use vial"],
    variants: [{ label: "3 ml", price: null }, { label: "10 ml", price: null }]
  },
  {
    ref: "Sterile Water",
    cat: "accessories",
    blurb: "Single-use sterile water for injection. No preservative.",
    research: ["Reconstitution solvent", "Single use"],
    variants: [{ label: "10 ml", price: null }]
  },
  {
    ref: "Acetic Acid Water",
    cat: "accessories",
    blurb: "Dilute acetic acid solvent for peptides with poor solubility in plain water.",
    research: ["Low-solubility reconstitution"],
    variants: [{ label: "10 ml", price: null }]
  },
  {
    ref: "Insulin Syringes (U-100)",
    cat: "accessories",
    blurb: "U-100 graduated syringes. Matches the unit scale used by the reconstitution calculator.",
    research: ["Measurement", "U-100 scale"],
    variants: [{ label: "100 pack", price: null }]
  }
];

/* Destinations offered by the supplier. Shipping is quoted by them, so this
   selection is carried into the enquiry rather than used to compute a cost
   here - a made-up shipping figure is worse than no figure. */
const SHIP_TO = [
  { code: "GB", label: "United Kingdom" },
  { code: "IE", label: "Ireland" },
  { code: "PL", label: "Poland" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "IT", label: "Italy" },
  { code: "NL", label: "Netherlands" },
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "NZ", label: "New Zealand" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "ZA", label: "South Africa" },
  { code: "SG", label: "Singapore" },
  { code: "OTHER", label: "Elsewhere (ask supplier)" }
];

const VIALS_PER_BOX = 10;

/* Merge the catalogue overlay onto the library so names, descriptions and
   research bullets have exactly one source. A ref that does not resolve is
   reported rather than silently dropped, because a silent drop looks like a
   supplier stock change instead of a typo. */
function buildCatalogue() {
  const byName = {};
  if (typeof PEPTIDES !== "undefined") {
    PEPTIDES.forEach((p) => { byName[p.n] = p; });
  }

  const unresolved = [];
  const items = CATALOGUE.map((entry) => {
    const p = byName[entry.ref];
    if (!p) { unresolved.push(entry.ref); return null; }
    return {
      ref: entry.ref,
      cat: entry.cat,
      blurb: p.ben[0] + ".",
      research: p.ben.slice(0, 3),
      route: p.route,
      half: p.half,
      evidence: typeof evidenceTier === "function" ? evidenceTier(p) : null,
      variants: entry.variants.map((v) => ({
        label: v.label || (v.mg + " mg"),
        price: v.price
      }))
    };
  }).filter(Boolean);

  if (unresolved.length && typeof console !== "undefined") {
    console.warn("Catalogue refs not found in the compound library:", unresolved);
  }

  const extras = ACCESSORIES.map((a) => ({
    ref: a.ref,
    cat: a.cat,
    blurb: a.blurb,
    research: a.research,
    route: null,
    half: null,
    evidence: null,
    variants: a.variants.map((v) => ({ label: v.label, price: v.price }))
  }));

  return items.concat(extras);
}

/* True once at least one real price exists, which flips the catalogue from
   enquiry-only presentation to showing totals. */
function cataloguePriced() {
  return buildCatalogue().some((i) => i.variants.some((v) => typeof v.price === "number"));
}
