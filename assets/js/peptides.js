/* ==========================================================================
   Compound reference dataset — 36 entries.
   Ported from the CC PEP reference & reconstitution tool.

   Field key:
     n       display name
     mg      typical vial strength (mg)
     bac     default bacteriostatic water volume (ml)
     blend   true when the vial is a fixed-ratio combination
     cat     library category
     route   administration route studied in the literature
     half    reported half-life
     ben     researched areas of interest
     pairs   commonly co-studied compounds
     caution handling / risk notes
     ev      evidence status summary
     steps   reference dose points (mg) used by the calculator
   ========================================================================== */

const CATEGORIES = {
  Recovery:      { colour: "oklch(76% 0.115 178)", label: "Recovery & repair" },
  Metabolic:     { colour: "oklch(78% 0.140 75)",  label: "Metabolic" },
  GH:            { colour: "oklch(72% 0.120 300)", label: "Growth hormone axis" },
  Cosmetic:      { colour: "oklch(74% 0.130 355)", label: "Cosmetic & dermal" },
  Nootropic:     { colour: "oklch(72% 0.115 250)", label: "Cognitive" },
  "Weight loss": { colour: "oklch(76% 0.125 155)", label: "Weight & appetite" },
  Sleep:         { colour: "oklch(70% 0.105 275)", label: "Sleep & circadian" },
  Other:         { colour: "oklch(68% 0.030 265)", label: "Other" }
};

/* Evidence tiering — derived from the `ev` narrative so the library can sort
   and filter on rigour rather than on marketing appeal. */
const EVIDENCE_TIERS = {
  approved:    { label: "Approved medicine", rank: 4, token: "--ev-strong" },
  clinical:    { label: "Human trial data", rank: 3, token: "--ev-moderate" },
  limited:     { label: "Limited human data", rank: 2, token: "--ev-limited" },
  preclinical: { label: "Preclinical only", rank: 1, token: "--ev-preclinical" }
};

/* Grading is deliberately negation-aware. "Not yet approved", "never an
   approved therapy" and "trials completed but not approved" all contain the
   word "approved" — treating them as approved medicines would invert the
   meaning of the grade on exactly the compounds where accuracy matters most.
   Negations are stripped before any positive pattern is tested. */
const DENIES_HUMAN_TRIALS = /\bno\b[^.;]{0,24}\bhuman\b[^.;]{0,12}\b(trials?|data)\b|\bnot\b[^.;]{0,16}\bin humans\b/;
const DENIES_APPROVAL     = /\b(not|never|no)\b[^.;]{0,24}\bapproved\b/;
const CLAIMS_LIMITED      = /limited human|thin western|some human data|not replicated|inconsistent|self-reported|mostly topical|well-characterised|well-understood/;
const CLAIMS_APPROVAL     = /\bapproved\b|\bprescribed\b|prescription medicine|zadaxin/;
const CLAIMS_HUMAN_TRIALS = /human trial|phase 2|phase 3|human fertility|human cardiology|human longevity|clinical data/;
const CLAIMS_PRECLINICAL  = /preclinical|animal data|animal-derived|animal model|emerging|rodent|extrapolated|hardcore|soft evidence|safety concerns|strong mechanism/;

function evidenceTier(peptide) {
  const raw = peptide.ev.toLowerCase();

  // 1. An explicit denial of human evidence settles the grade immediately.
  //    Checked first because "no human trials" contains "human trial", and
  //    every positive pattern below would otherwise match it.
  if (DENIES_HUMAN_TRIALS.test(raw)) return "preclinical";

  // 2. Approval, but only where the sentence is not denying it
  //    ("not yet approved", "never an approved therapy").
  if (!DENIES_APPROVAL.test(raw) && CLAIMS_APPROVAL.test(raw)) return "approved";

  // 3. Explicitly hedged human evidence is "limited", never "human trial data".
  //    Runs before the trial test so "limited human trials" cannot be promoted
  //    by the word "trials" sitting next to its own hedge.
  if (CLAIMS_LIMITED.test(raw)) return "limited";

  // 4. Unhedged human trial evidence.
  if (CLAIMS_HUMAN_TRIALS.test(raw)) return "clinical";

  // 5. Animal or mechanistic evidence only.
  if (CLAIMS_PRECLINICAL.test(raw)) return "preclinical";

  return "limited";
}

const PEPTIDES = [
  {"n":"BPC-157","mg":10,"bac":2,"cat":"Recovery","route":"SubQ","half":"~4 hrs","ben":["Tendon, ligament & muscle tissue repair","Gut lining healing & GI protection","Anti-inflammatory action","Joint & injury recovery support"],"pairs":"TB-500, KPV","caution":"Generally well tolerated in research. Research-use only.","ev":"Strong animal data; limited human trials.","steps":[0.25,0.5,1]},
  {"n":"TB-500","mg":10,"bac":2,"cat":"Recovery","route":"SubQ","half":"~2–3 days","ben":["Soft-tissue & muscle repair","Improved flexibility & range of motion","Reduced inflammation","Systemic recovery support"],"pairs":"BPC-157 (classic healing stack)","caution":"Research-use only. Not typically run long-term.","ev":"Animal-derived; limited human data.","steps":[1,2.5,5]},
  {"n":"BPC-157 + TB-500 blend","mg":20,"bac":4,"blend":true,"cat":"Recovery","route":"SubQ","half":"mixed","ben":["Combined tissue + soft-tissue repair","Gut & systemic recovery in one vial","The go-to injury/recovery stack"],"pairs":"KPV (for gut/skin focus)","caution":"1:1 blend. Shelf life follows the shorter-lived peptide.","ev":"Based on each component's animal data.","steps":[0.5,1,2]},
  {"n":"KPV","mg":10,"bac":2,"cat":"Recovery","route":"SubQ","half":"short","ben":["Gut inflammation & IBD support","Immune modulation","Skin inflammation support"],"pairs":"BPC-157","caution":"Research-use only.","ev":"Preclinical; emerging.","steps":[0.1,0.2,0.4]},
  {"n":"MOTS-c","mg":10,"bac":1,"cat":"Metabolic","route":"SubQ","half":"short","ben":["Mitochondrial function & energy","Improved insulin sensitivity","Fat metabolism / exercise-mimetic effects","Endurance support"],"pairs":"SLU-PP-332, NAD+","caution":"May affect glucose — relevant if monitoring blood sugar.","ev":"Mostly animal data; no completed human trials.","steps":[2,5,10]},
  {"n":"GHK-Cu","mg":50,"bac":5,"cat":"Cosmetic","route":"SubQ / topical","half":"short","ben":["Collagen & elastin stimulation","Wound healing & skin repair","Anti-ageing / skin firmness","Hair follicle & scalp support"],"pairs":"BPC-157, AHK-Cu","caution":"Can be used topically or injected. Copper peptide.","ev":"Some human skin/cosmetic data — better evidenced than most.","steps":[1,2,3]},
  {"n":"Semax","mg":10,"bac":2,"cat":"Nootropic","route":"SubQ / intranasal","half":"short","ben":["Focus, drive & mental clarity","Cognition & memory support","Neuroprotection (BDNF)","Mood support"],"pairs":"Selank ('focus & calm')","caution":"Acts on brain chemistry. Research-use only.","ev":"Approved/prescribed in Russia; thin Western trial data.","steps":[0.3,0.5,1]},
  {"n":"Selank","mg":10,"bac":2,"cat":"Nootropic","route":"SubQ / intranasal","half":"short","ben":["Anxiety reduction without sedation","Calm & stress resilience","Mood support","Mild immune modulation"],"pairs":"Semax","caution":"Acts on mood/anxiety systems. Research-use only.","ev":"Approved/prescribed in Russia; thin Western trial data.","steps":[0.25,0.5,1]},
  {"n":"Semax + Selank blend","mg":20,"bac":4,"blend":true,"cat":"Nootropic","route":"SubQ / intranasal","half":"short","ben":["'Switched-on but calm' — focus + anxiolytic","Cognition with stress reduction","One-vial nootropic stack"],"pairs":"—","caution":"1:1 blend acting on brain chemistry.","ev":"Russian clinical pedigree; self-reported for nootropic use.","steps":[0.5,1,2]},
  {"n":"Tesamorelin","mg":10,"bac":2,"cat":"GH","route":"SubQ","half":"~26 min","ben":["GH / IGF-1 increase","Visceral (belly) fat reduction","Body recomposition","Cognitive support (studied in HIV/ageing)"],"pairs":"Ipamorelin, CJC-1295","caution":"Prescription medicine. Monitor IGF-1 & glucose; contraindicated around active cancer.","ev":"FDA-approved (lipodystrophy); off-label otherwise.","steps":[1,2,4]},
  {"n":"Retatrutide","mg":30,"bac":3,"cat":"Weight loss","route":"SubQ","half":"~6 days","ben":["Significant appetite suppression","Strong weight reduction","Improved glycaemic control","Triple agonist (GLP-1/GIP/glucagon)"],"pairs":"—","caution":"Prescription medicine. Titrate slowly; GI side effects; manage hydration/diet.","ev":"In human trials; not yet approved.","steps":[2,4,8]},
  {"n":"Semaglutide","mg":10,"bac":1,"cat":"Weight loss","route":"SubQ","half":"~7 days","ben":["Appetite suppression","Weight management","Glycaemic control","Best-known GLP-1"],"pairs":"Cagrilintide (CagriSema)","caution":"Prescription medicine. GI side effects common; titrate.","ev":"FDA/MHRA-approved.","steps":[0.25,0.5,1]},
  {"n":"Tirzepatide","mg":30,"bac":3,"cat":"Weight loss","route":"SubQ","half":"~5 days","ben":["Powerful appetite suppression","Strong weight reduction","Glycaemic control","Dual agonist (GLP-1/GIP)"],"pairs":"—","caution":"Prescription medicine. GI side effects; titrate slowly.","ev":"FDA/MHRA-approved.","steps":[2.5,5,10]},
  {"n":"Cagrilintide","mg":10,"bac":1,"cat":"Weight loss","route":"SubQ","half":"long","ben":["Appetite & satiety control","Weight management","Amylin analogue — complements GLP-1s"],"pairs":"Semaglutide (CagriSema)","caution":"Research-use. Often run with a GLP-1.","ev":"In human trials.","steps":[0.5,1,2]},
  {"n":"IGF-1 LR3","mg":1,"bac":1,"cat":"GH","route":"SubQ","half":"~20–30 hrs","ben":["Muscle growth & hyperplasia","Cellular repair","Anabolic signalling","Nutrient partitioning"],"pairs":"—","caution":"Potent. Hypoglycaemia risk; contraindicated around cancer; monitor closely.","ev":"Strong mechanism; high-risk, hardcore use.","steps":[0.02,0.04,0.06]},
  {"n":"SLU-PP-332 (MitoBurn)","mg":10,"bac":2,"cat":"Metabolic","route":"SubQ / oral","half":"short","ben":["Fat oxidation & endurance","Mitochondrial biogenesis","Metabolic health markers","Exercise-mimetic (ERRα agonist)"],"pairs":"MOTS-c","caution":"Largely animal data. WADA doping-flagged — relevant for tested athletes.","ev":"Preclinical; no human trials.","steps":[0.5,1,2]},
  {"n":"CJC-1295 (no DAC)","mg":5,"bac":2,"cat":"GH","route":"SubQ","half":"~30 min","ben":["Pulsatile GH release","Recovery & sleep quality","Body composition support","Mimics natural GH rhythm"],"pairs":"Ipamorelin (the classic stack)","caution":"Short-acting (multi-jab protocol). GH-axis caution; cancer contraindication.","ev":"Well-understood mechanism; convention dosing.","steps":[0.1,0.2,0.3]},
  {"n":"Ipamorelin","mg":5,"bac":2,"cat":"GH","route":"SubQ","half":"~2 hrs","ben":["Selective GH release","Recovery & sleep","Clean profile (low cortisol/prolactin)"],"pairs":"CJC-1295 (no DAC)","caution":"GH-axis caution; cancer contraindication.","ev":"Well-characterised GHRP.","steps":[0.1,0.2,0.3]},
  {"n":"CJC-1295 + Ipamorelin blend","mg":10,"bac":2,"blend":true,"cat":"GH","route":"SubQ","half":"mixed","ben":["Synergistic GH pulse (two pathways)","Recovery, sleep & body comp","Best-selling GH stack in one vial"],"pairs":"—","caution":"1:1 blend. Multi-jab protocol; GH-axis & cancer caution.","ev":"Component mechanisms well-understood.","steps":[0.2,0.25,0.3]},
  {"n":"NAD+","mg":1000,"bac":5,"cat":"Metabolic","route":"SubQ / IV","half":"short","ben":["Cellular energy (NAD repletion)","Mitochondrial support","Longevity / healthspan interest","Cognitive & metabolic support"],"pairs":"MOTS-c, 5-amino-1MQ","caution":"Confirm COA shows NAD+ disodium salt (not NADH / precursor). SubQ can sting.","ev":"Mechanism sound; clinical claims mostly extrapolated.","steps":[50,100,250]},
  {"n":"Melanotan II (MT2)","mg":10,"bac":2,"cat":"Other","route":"SubQ","half":"~1 hr","ben":["Skin tanning / pigmentation","Libido enhancement","Appetite suppression"],"pairs":"—","caution":"Start low. Monitor moles/skin changes; nausea & flushing common; use SPF.","ev":"Known mechanism; safety concerns with darkening moles.","steps":[0.25,0.5,1]},
  {"n":"DSIP","mg":5,"bac":2,"cat":"Sleep","route":"SubQ","half":"short","ben":["Sleep onset & quality","Stress / cortisol modulation","Recovery support"],"pairs":"—","caution":"Research-use. Effects inconsistent in studies.","ev":"Old, soft evidence; never an approved therapy.","steps":[0.1,0.25,0.5]},
  {"n":"PT-141 (Bremelanotide)","mg":10,"bac":2,"cat":"Other","route":"SubQ","half":"~2–3 hrs","ben":["Sexual arousal & function (men & women)","Central (brain) mechanism, not vascular"],"pairs":"—","caution":"Nausea & transient blood-pressure rise common. Is an approved drug (Vyleesi).","ev":"FDA-approved for HSDD in women.","steps":[0.5,1,2]},
  {"n":"GHRP-6","mg":5,"bac":2,"cat":"GH","route":"SubQ","half":"~15 min","ben":["Strong GH release","Significant appetite stimulation (hunger hormone effect)","Recovery & sleep quality","IGF-1 increase"],"pairs":"CJC-1295 (no DAC), GHRP-2","caution":"Strongest hunger drive of the GHRPs — dose before meals. Raises cortisol & prolactin more than Ipamorelin. GH-axis caution; cancer contraindication.","ev":"Extensively studied; the original GHRP with decades of research data.","steps":[0.1,0.2,0.3]},
  {"n":"GHRP-2","mg":5,"bac":2,"cat":"GH","route":"SubQ","half":"~15 min","ben":["Strong GH release","Recovery & sleep quality","Body recomposition","Less appetite drive than GHRP-6"],"pairs":"CJC-1295 (no DAC), Ipamorelin","caution":"Raises cortisol & prolactin (less than GHRP-6). GH-axis caution; cancer contraindication.","ev":"Well-characterised; strong preclinical and some human data.","steps":[0.1,0.2,0.3]},
  {"n":"Hexarelin","mg":2,"bac":1,"cat":"GH","route":"SubQ","half":"~15 min","ben":["Most potent GHRP for GH release","Cardioprotective properties (unique among GHRPs)","Recovery & body composition","Scar & cardiac tissue research"],"pairs":"CJC-1295 (no DAC)","caution":"Desensitises faster than other GHRPs — shorter cycles recommended. Raises cortisol & prolactin. GH-axis caution; cancer contraindication.","ev":"Well-characterised; notable human cardiology data.","steps":[0.05,0.1,0.2]},
  {"n":"Sermorelin","mg":15,"bac":3,"cat":"GH","route":"SubQ","half":"~10–20 min","ben":["Natural GHRH analogue (29 amino acids)","Pulsatile GH release — mimics physiology","Recovery, sleep & body composition","Preferred by anti-ageing clinics for milder profile"],"pairs":"Ipamorelin, GHRP-2","caution":"Short-acting multi-jab protocol. GH-axis caution; cancer contraindication.","ev":"FDA-approved (paediatric GHD); widely prescribed off-label in adults.","steps":[0.1,0.2,0.3]},
  {"n":"CJC-1295 (with DAC)","mg":2,"bac":1,"cat":"GH","route":"SubQ","half":"~6–8 days","ben":["Sustained GH & IGF-1 elevation","Once or twice-weekly protocol","Recovery, sleep & body composition","Long-acting GHRH analogue"],"pairs":"Ipamorelin, GHRP-2","caution":"Long half-life — side effects persist if they occur. Water retention common. GH-axis caution; cancer contraindication.","ev":"Well-characterised DAC mechanism; widely used in research settings.","steps":[0.5,1,2]},
  {"n":"AOD-9604","mg":5,"bac":2,"cat":"Weight loss","route":"SubQ","half":"~30 min","ben":["Targeted fat burning / lipolysis","GH fragment — no IGF-1 or anabolic effect","Cartilage & joint repair potential","Safer fat-loss profile than full GH"],"pairs":"CJC-1295 + Ipamorelin","caution":"Research-use. No blood glucose impact. Phase 2/3 obesity trials completed but not approved.","ev":"Best-evidenced fat-loss peptide — Phase 2/3 human trial data.","steps":[0.5,1,1.5]},
  {"n":"Thymosin Alpha-1 (TA-1)","mg":10,"bac":2,"cat":"Recovery","route":"SubQ","half":"~2 hrs","ben":["Immune system activation & modulation","Antiviral & antibacterial support","Chronic illness & post-viral recovery","Cancer adjunct therapy (studied)"],"pairs":"BPC-157, KPV","caution":"Very well-tolerated. Approved as Zadaxin in ~40 countries. Research-use in US/UK.","ev":"Extensive clinical data; prescription medicine in many countries.","steps":[0.5,1,2]},
  {"n":"Epithalon","mg":10,"bac":2,"cat":"Other","route":"SubQ","half":"short","ben":["Telomere elongation & longevity interest","Melatonin regulation & sleep quality","Anti-ageing / cellular health","Retinal & eye health research"],"pairs":"DSIP","caution":"Typical protocol: 5–10mg/day for 10–20 day courses. Research-use only. Well-tolerated in trials.","ev":"Russian-origin; strong animal data; human longevity studies — not replicated in Western trials.","steps":[5,10,20]},
  {"n":"LL-37","mg":10,"bac":2,"cat":"Recovery","route":"SubQ / topical","half":"short","ben":["Antimicrobial & antiviral peptide","Gut lining support & barrier function","Wound healing & tissue repair","Immune modulation & anti-inflammatory"],"pairs":"BPC-157, KPV","caution":"Can cause injection-site reactions. Research-use only. Preclinical for most injectable applications.","ev":"Strong preclinical; limited injectable human data; topical wound evidence emerging.","steps":[0.5,1,2]},
  {"n":"AHK-Cu","mg":50,"bac":5,"cat":"Cosmetic","route":"SubQ / topical","half":"short","ben":["Hair follicle stimulation & growth","Scalp blood flow & follicle anchoring","Collagen synthesis support","Pairs with GHK-Cu for full cosmetic stack"],"pairs":"GHK-Cu","caution":"Copper peptide. Topical or injected. Research-use.","ev":"Cosmetic/hair data mostly topical; stronger evidence for topical than injectable use.","steps":[1,2,3]},
  {"n":"Kisspeptin-10","mg":5,"bac":2,"cat":"Other","route":"SubQ","half":"~28 min","ben":["LH & testosterone pulse stimulation","Fertility support (male & female)","Libido & HPG axis activation","Post-cycle or low-T support"],"pairs":"PT-141","caution":"Acts on HPG axis — relevant if on TRT or hormonal therapy. Research-use. Being studied for hypogonadism & fertility.","ev":"Human fertility & hypogonadism trials ongoing; well-characterised mechanism.","steps":[0.1,0.5,1]},
  {"n":"Follistatin 344","mg":1,"bac":1,"cat":"GH","route":"SubQ","half":"short","ben":["Myostatin inhibition","Muscle growth & hyperplasia potential","Body composition & strength","Anabolic stack with IGF-1 LR3"],"pairs":"IGF-1 LR3","caution":"Potent myostatin inhibitor. Cardiac tissue concerns at high doses in animal models. Very limited human data. High-risk, hardcore use.","ev":"Strong animal data; no human trials.","steps":[0.05,0.1,0.2]},
  {"n":"Dihexa","mg":10,"bac":2,"cat":"Nootropic","route":"SubQ / topical","half":"long","ben":["Extremely potent HGF / BDNF cognitive enhancer","Neurogenesis & synapse formation","Memory formation & recall","Neuroprotection & post-injury repair"],"pairs":"Semax","caution":"Research-use only. Claimed millions of times more potent than BDNF in vitro — very low doses. No human trial data. Long-term effects unknown.","ev":"Strong rodent data (WSU research); no human trials.","steps":[0.5,1,2]}
];
