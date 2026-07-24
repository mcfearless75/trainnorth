/* ==========================================================================
   Catalogue data - generated from the supplier product list

   PRICING
   Prices are per BOX (vial count stated per variant), in USD, and represent
   the supplier list price plus 50%. Only this single tier is present in this
   file. The supplier's own cost and the intermediate tier are deliberately
   NOT included: this is a public repository serving a static site, so anything
   stored here is readable by any visitor, and shipping the cost column would
   publish the margin.

   EXCLUDED FROM THE SUPPLIER LIST
   HGH (somatropin), HCG, and every multi-ingredient injectable blend
   containing albuterol or lidocaine. These are controlled or prescription-only
   medicines rather than research compounds, and carry a different legal
   exposure from the rest of the catalogue. Do not re-add them without advice.

   GRADING
   `lib` points at the matching entry in the 36-compound library, which
   supplies the description, research areas and evidence tier. `lib: null`
   means the product has no library entry yet and renders as "Not yet
   reviewed" rather than borrowing a grade it has not earned.
   ========================================================================== */

const CURRENCY = { code: "USD", symbol: "$" };
/* Supplier-side attribution tag. Appended quietly to outgoing enquiries so
   referral commission reconciles. No customer discount is attached to it and
   it is never marketed on the page. */
const REF_TAG = "TN-REF5";

const CATALOGUE_CATEGORIES = [
  { key: "all",         label: "All" },
  { key: "glp1",        label: "GLP-1 & metabolic" },
  { key: "growth",      label: "Growth axis" },
  { key: "recovery",    label: "Tissue recovery" },
  { key: "cognitive",   label: "Nootropic & cognitive" },
  { key: "endocrine",   label: "Hormones & endocrine" },
  { key: "cellular",    label: "Metabolic & cellular" },
  { key: "cosmetic",    label: "Cosmetic & dermal" },
  { key: "accessories", label: "Accessories" }
];

const PRODUCTS = [
  { name: "Acetic Acid Water",                       cat: "accessories", lib: null,                            variants: [{ label: "3ml", vials: 10, price: 15 }, { label: "10ml", vials: 10, price: 21 }] },
  { name: "Bacteriostatic Water",                    cat: "accessories", lib: null,                            variants: [{ label: "10ml", vials: 10, price: 21 }, { label: "3ml", vials: 10, price: 15 }] },
  { name: "Sterile Water",                           cat: "accessories", lib: null,                            variants: [{ label: "10ml", vials: 10, price: 15 }] },
  { name: "5-Amino-1MQ",                             cat: "cellular",    lib: null,                            variants: [{ label: "5mg", vials: 10, price: 70.5 }, { label: "10mg", vials: 10, price: 87 }, { label: "20mg", vials: 10, price: 100.5 }, { label: "50mg", vials: 10, price: 162 }] },
  { name: "AICAR",                                   cat: "cellular",    lib: null,                            variants: [{ label: "50mg", vials: 10, price: 151.5 }, { label: "100mg", vials: 10, price: 226.5 }] },
  { name: "Epithalon",                               cat: "cellular",    lib: "Epithalon",                     variants: [{ label: "10mg", vials: 10, price: 87 }, { label: "50mg", vials: 10, price: 324 }] },
  { name: "FOXO4",                                   cat: "cellular",    lib: null,                            variants: [{ label: "2mg", vials: 10, price: 151.5 }, { label: "10mg", vials: 10, price: 703.5 }] },
  { name: "Glutathione",                             cat: "cellular",    lib: null,                            variants: [{ label: "1500mg", vials: 10, price: 141 }, { label: "600mg", vials: 10, price: 81 }] },
  { name: "L-Carnitine",                             cat: "cellular",    lib: null,                            variants: [{ label: "10ml 600mg/ml", vials: 1, price: 118.5 }] },
  { name: "MOTS-c",                                  cat: "cellular",    lib: "MOTS-c",                        variants: [{ label: "10mg", vials: 10, price: 124.5 }, { label: "20mg", vials: 10, price: 249 }, { label: "40mg", vials: 10, price: 367.5 }] },
  { name: "NAD+",                                    cat: "cellular",    lib: "NAD+",                          variants: [{ label: "500mg", vials: 10, price: 97.5 }, { label: "1000mg", vials: 10, price: 151.5 }] },
  { name: "SLU-PP-332 (MitoBurn)",                   cat: "cellular",    lib: "SLU-PP-332 (MitoBurn)",         variants: [{ label: "5mg", vials: 10, price: 205.5 }] },
  { name: "Vitamin B12",                             cat: "cellular",    lib: null,                            variants: [{ label: "10ml", vials: 10, price: 97.5 }] },
  { name: "Adamax",                                  cat: "cognitive",   lib: null,                            variants: [{ label: "5mg", vials: 10, price: 157.5 }, { label: "10mg", vials: 10, price: 276 }] },
  { name: "Cerebrolysin",                            cat: "cognitive",   lib: null,                            variants: [{ label: "60mg", vials: 6, price: 87 }] },
  { name: "DSIP",                                    cat: "cognitive",   lib: "DSIP",                          variants: [{ label: "5mg", vials: 10, price: 97.5 }, { label: "10mg", vials: 10, price: 151.5 }, { label: "15mg", vials: 10, price: 216 }] },
  { name: "PE 22-28",                                cat: "cognitive",   lib: null,                            variants: [{ label: "10mg", vials: 10, price: 157.5 }] },
  { name: "Pinealon",                                cat: "cognitive",   lib: null,                            variants: [{ label: "10mg", vials: 10, price: 130.5 }] },
  { name: "Selank",                                  cat: "cognitive",   lib: "Selank",                        variants: [{ label: "5mg", vials: 10, price: 82.5 }, { label: "10mg", vials: 10, price: 132 }] },
  { name: "Semax",                                   cat: "cognitive",   lib: "Semax",                         variants: [{ label: "5mg", vials: 10, price: 72 }, { label: "10mg", vials: 10, price: 111 }] },
  { name: "Semax + Selank blend",                    cat: "cognitive",   lib: "Semax + Selank blend",          variants: [{ label: "20mg", vials: 10, price: 216 }] },
  { name: "AHK-Cu",                                  cat: "cosmetic",    lib: "AHK-Cu",                        variants: [{ label: "50mg", vials: 10, price: 97.5 }, { label: "100mg", vials: 10, price: 130.5 }] },
  { name: "GHK-Cu",                                  cat: "cosmetic",    lib: "GHK-Cu",                        variants: [{ label: "50mg", vials: 10, price: 60 }, { label: "100mg", vials: 10, price: 66 }] },
  { name: "Lemon Bottle",                            cat: "cosmetic",    lib: null,                            variants: [{ label: "10ml", vials: 10, price: 108 }] },
  { name: "Matrixyl",                                cat: "cosmetic",    lib: null,                            variants: [{ label: "10mg", vials: 10, price: 81 }] },
  { name: "PNC 27",                                  cat: "cosmetic",    lib: null,                            variants: [{ label: "5mg", vials: 10, price: 195 }, { label: "10mg", vials: 10, price: 355.5 }] },
  { name: "SNAP-8",                                  cat: "cosmetic",    lib: null,                            variants: [{ label: "10mg", vials: 10, price: 87 }] },
  { name: "Kisspeptin-10",                           cat: "endocrine",   lib: "Kisspeptin-10",                 variants: [{ label: "5mg", vials: 10, price: 97.5 }, { label: "10mg", vials: 10, price: 159 }] },
  { name: "Melatonin I",                             cat: "endocrine",   lib: null,                            variants: [{ label: "10mg", vials: 10, price: 108 }] },
  { name: "Melatonin II",                            cat: "endocrine",   lib: null,                            variants: [{ label: "10mg", vials: 10, price: 108 }] },
  { name: "Oxytocin Acetate",                        cat: "endocrine",   lib: null,                            variants: [{ label: "5mg", vials: 10, price: 96 }, { label: "10mg", vials: 10, price: 126 }] },
  { name: "PT-141 (Bremelanotide)",                  cat: "endocrine",   lib: "PT-141 (Bremelanotide)",        variants: [{ label: "10mg", vials: 10, price: 118.5 }] },
  { name: "VIP",                                     cat: "endocrine",   lib: null,                            variants: [{ label: "5mg", vials: 10, price: 189 }, { label: "10mg", vials: 10, price: 286.5 }] },
  { name: "AOD-9604",                                cat: "glp1",        lib: "AOD-9604",                      variants: [{ label: "5mg", vials: 10, price: 199.5 }, { label: "10mg", vials: 10, price: 361.5 }] },
  { name: "Cagrilintide",                            cat: "glp1",        lib: "Cagrilintide",                  variants: [{ label: "5mg", vials: 10, price: 205.5 }, { label: "10mg", vials: 10, price: 330 }] },
  { name: "HGH Fragment 176-191",                    cat: "glp1",        lib: null,                            variants: [{ label: "1mg", vials: 10, price: 55.5 }, { label: "2mg", vials: 10, price: 75 }, { label: "5mg", vials: 10, price: 148.5 }, { label: "10mg", vials: 10, price: 265.5 }, { label: "12mg", vials: 10, price: 298.5 }, { label: "15mg", vials: 10, price: 372 }] },
  { name: "Retatrutide",                             cat: "glp1",        lib: "Retatrutide",                   variants: [{ label: "5mg", vials: 10, price: 93 }, { label: "10mg", vials: 10, price: 148.5 }, { label: "15mg", vials: 10, price: 216 }, { label: "20mg", vials: 10, price: 267 }, { label: "30mg", vials: 10, price: 364.5 }, { label: "40mg", vials: 10, price: 447 }, { label: "50mg", vials: 10, price: 517.5 }, { label: "60mg", vials: 10, price: 592.5 }] },
  { name: "Retatrutide + Cagrilintide blend",        cat: "glp1",        lib: null,                            variants: [{ label: "10mg", vials: 10, price: 313.5 }] },
  { name: "Semaglutide",                             cat: "glp1",        lib: "Semaglutide",                   variants: [{ label: "5mg", vials: 10, price: 54 }, { label: "10mg", vials: 10, price: 81 }, { label: "15mg", vials: 10, price: 103.5 }, { label: "20mg", vials: 10, price: 124.5 }, { label: "30mg", vials: 10, price: 189 }, { label: "50mg", vials: 10, price: 243 }] },
  { name: "Tirzepatide",                             cat: "glp1",        lib: "Tirzepatide",                   variants: [{ label: "5mg", vials: 10, price: 66 }, { label: "10mg", vials: 10, price: 90 }, { label: "15mg", vials: 10, price: 118.5 }, { label: "20mg", vials: 10, price: 141 }, { label: "30mg", vials: 10, price: 195 }, { label: "40mg", vials: 10, price: 237 }, { label: "50mg", vials: 10, price: 303 }, { label: "60mg", vials: 10, price: 334.5 }, { label: "80mg", vials: 10, price: 388.5 }, { label: "100mg", vials: 10, price: 486 }, { label: "120mg", vials: 10, price: 592.5 }] },
  { name: "ACE-031",                                 cat: "growth",      lib: null,                            variants: [{ label: "1mg", vials: 10, price: 108 }] },
  { name: "CJC-1295 (no DAC)",                       cat: "growth",      lib: "CJC-1295 (no DAC)",             variants: [{ label: "5mg", vials: 10, price: 162 }, { label: "10mg", vials: 10, price: 297 }] },
  { name: "CJC-1295 (with DAC)",                     cat: "growth",      lib: "CJC-1295 (with DAC)",           variants: [{ label: "2mg", vials: 10, price: 189 }, { label: "5mg", vials: 10, price: 340.5 }, { label: "10mg", vials: 10, price: 646.5 }] },
  { name: "CJC-1295 + Ipamorelin blend",             cat: "growth",      lib: "CJC-1295 + Ipamorelin blend",   variants: [{ label: "10mg", vials: 10, price: 216 }] },
  { name: "IGF-1 LR3",                               cat: "growth",      lib: "IGF-1 LR3",                     variants: [{ label: "0.1mg", vials: 10, price: 70.5 }, { label: "1mg", vials: 10, price: 378 }] },
  { name: "Ipamorelin",                              cat: "growth",      lib: "Ipamorelin",                    variants: [{ label: "5mg", vials: 10, price: 79.5 }, { label: "10mg", vials: 10, price: 118.5 }] },
  { name: "Tesamorelin",                             cat: "growth",      lib: "Tesamorelin",                   variants: [{ label: "5mg", vials: 10, price: 208.5 }, { label: "10mg", vials: 10, price: 351 }, { label: "20mg", vials: 10, price: 646.5 }] },
  { name: "Ara-290",                                 cat: "recovery",    lib: null,                            variants: [{ label: "10mg", vials: 10, price: 151.5 }] },
  { name: "BPC-157",                                 cat: "recovery",    lib: "BPC-157",                       variants: [{ label: "5mg", vials: 10, price: 87 }, { label: "10mg", vials: 10, price: 118.5 }, { label: "20mg", vials: 10, price: 205.5 }] },
  { name: "BPC-157 + GHK-Cu + TB-500 + KPV blend",   cat: "recovery",    lib: null,                            variants: [{ label: "80mg", vials: 10, price: 442.5 }] },
  { name: "BPC-157 + GHK-Cu + TB-500 blend",         cat: "recovery",    lib: null,                            variants: [{ label: "70mg", vials: 10, price: 378 }] },
  { name: "BPC-157 + TB-500 blend (10+10)",          cat: "recovery",    lib: "BPC-157 + TB-500 blend",        variants: [{ label: "20mg", vials: 10, price: 367.5 }] },
  { name: "BPC-157 + TB-500 blend (5+5)",            cat: "recovery",    lib: "BPC-157 + TB-500 blend",        variants: [{ label: "10mg", vials: 10, price: 199.5 }] },
  { name: "KPV",                                     cat: "recovery",    lib: "KPV",                           variants: [{ label: "10mg", vials: 10, price: 108 }] },
  { name: "SS-31",                                   cat: "recovery",    lib: null,                            variants: [{ label: "10mg", vials: 10, price: 162 }, { label: "50mg", vials: 10, price: 592.5 }] },
  { name: "TB-500",                                  cat: "recovery",    lib: "TB-500",                        variants: [{ label: "5mg", vials: 10, price: 157.5 }, { label: "10mg", vials: 10, price: 264 }] },
  { name: "Thymalin",                                cat: "recovery",    lib: null,                            variants: [{ label: "10mg", vials: 10, price: 132 }] },
  { name: "Thymosin Alpha-1 (TA-1)",                 cat: "recovery",    lib: "Thymosin Alpha-1 (TA-1)",       variants: [{ label: "5mg", vials: 10, price: 189 }, { label: "10mg", vials: 10, price: 345 }] }
];

/* Destinations offered by the supplier. Shipping is quoted by them, so the
   selection is carried into the enquiry rather than costed here - an invented
   shipping figure is worse than no figure. */
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

/* Merge each product with its library entry so descriptions, research areas
   and evidence tiers have exactly one source and cannot drift apart. A `lib`
   value that fails to resolve is reported rather than silently dropped,
   because a silent drop looks like a supplier stock change, not a typo. */
function buildCatalogue() {
  const byName = {};
  if (typeof PEPTIDES !== "undefined") PEPTIDES.forEach((p) => { byName[p.n] = p; });

  const unresolved = [];

  const items = PRODUCTS.map((prod) => {
    const p = prod.lib ? byName[prod.lib] : null;
    if (prod.lib && !p) unresolved.push(prod.lib);

    return {
      name: prod.name,
      cat: prod.cat,
      lib: p ? prod.lib : null,
      blurb: p ? p.ben[0] + "." : "Listed by the supplier. Not yet reviewed against the evidence library.",
      research: p ? p.ben.slice(0, 3) : [],
      route: p ? p.route : null,
      half: p ? p.half : null,
      evidence: p && typeof evidenceTier === "function" ? evidenceTier(p) : null,
      // Live price override when the backend has loaded it, embedded price
      // otherwise. Keeps the catalogue working with no network.
      variants: prod.variants.map((v) => ({
        ...v,
        price: (window.TNL_BACKEND
          ? window.TNL_BACKEND.priceFor(prod.name, v.label, v.price)
          : v.price)
      }))
    };
  });

  if (unresolved.length && typeof console !== "undefined") {
    console.warn("Catalogue lib refs not found in the compound library:", unresolved);
  }
  return items;
}

/* Products carrying a given library compound, used to link a library entry to
   everything purchasable that contains it. */
function productsForCompound(libName) {
  return PRODUCTS.filter((p) => p.lib === libName);
}
