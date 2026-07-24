#!/usr/bin/env python3
"""
Static page generator for TRAINNORTH:LABS.

GitHub Pages serves files, it does not run a build, so every route has to
exist as a real HTML file. This script writes them from the same data the
single-page site uses, which keeps the evidence grading in one place instead
of copied into 36 hand-written pages that would drift apart within a week.

Run from the project root:   python tools/build_pages.py

Produces:
  /ai-training/index.html
  /contact/index.html
  /peptide-library/index.html          hub
  /peptide-library/<slug>/index.html   one per compound

Regenerate after changing peptides.js or products.js.
"""

import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://trainnorthlabs.com"
WA = "85256440181"
ASSET_V = "v=20260724a"

# --------------------------------------------------------------------------
# Read the JS data files rather than duplicating them
# --------------------------------------------------------------------------

def read(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return f.read()

def js_array(src, name):
    """Extract `const NAME = [ ... ];` and parse the object literal as JSON."""
    i = src.index("const %s = [" % name)
    i = src.index("[", i)
    depth, j = 0, i
    while j < len(src):
        if src[j] == "[": depth += 1
        elif src[j] == "]":
            depth -= 1
            if depth == 0: break
        j += 1
    body = src[i:j+1]
    body = re.sub(r"//.*", "", body)
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
    body = re.sub(r"([{,]\s*)([A-Za-z_][\w]*)\s*:", r'\1"\2":', body)
    body = re.sub(r",(\s*[}\]])", r"\1", body)
    return json.loads(body)

pep_src = read("assets/js/peptides.js")
prod_src = read("assets/js/products.js")
PEPTIDES = js_array(pep_src, "PEPTIDES")
PRODUCTS = js_array(prod_src, "PRODUCTS")

TIERS = {
    "approved":    ("Approved medicine",   "--ev-strong"),
    "clinical":    ("Human trial data",    "--ev-moderate"),
    "limited":     ("Limited human data",  "--ev-limited"),
    "preclinical": ("Preclinical only",    "--ev-preclinical"),
}

DENIES_TRIALS = re.compile(r"\bno\b[^.;]{0,24}\bhuman\b[^.;]{0,12}\b(trials?|data)\b|\bno human data\b")
DENIES_APPROVAL = re.compile(r"\b(not|never|no)\b[^.;]{0,24}\bapproved\b")
CLAIMS_LIMITED = re.compile(r"limited human|thin western|some human data|not replicated|inconsistent|self-reported|mostly topical|well-characterised|well-understood")
CLAIMS_APPROVAL = re.compile(r"\bapproved\b|\bprescribed\b|prescription medicine|zadaxin")
CLAIMS_TRIALS = re.compile(r"human trial|phase 2|phase 3|human fertility|human cardiology|human longevity|clinical data")
CLAIMS_PRE = re.compile(r"preclinical|animal data|animal-derived|animal model|emerging|rodent|extrapolated|hardcore|soft evidence|safety concerns|strong mechanism")

def tier(p):
    """Mirror of evidenceTier() in peptides.js. Denials resolve first."""
    raw = p["ev"].lower()
    if DENIES_TRIALS.search(raw): return "preclinical"
    if not DENIES_APPROVAL.search(raw) and CLAIMS_APPROVAL.search(raw): return "approved"
    if CLAIMS_LIMITED.search(raw): return "limited"
    if CLAIMS_TRIALS.search(raw): return "clinical"
    if CLAIMS_PRE.search(raw): return "preclinical"
    return "limited"

def slug(name):
    s = name.lower()
    s = s.replace("+", " plus ")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s

def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

# --------------------------------------------------------------------------
# Shared shell
# --------------------------------------------------------------------------

TICKER = "".join(
    '<span class="ticker__item">%s</span>' % t for t in
    ["For laboratory research use only", "Not for human consumption",
     "Not approved as a medicine", "Not medical advice", "18+ only"] * 2)

def head(title, desc, canonical, extra=""):
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#f4f5f7">
<meta property="og:type" content="article">
<meta property="og:site_name" content="TRAINNORTH:LABS">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canonical}">
<meta property="og:locale" content="en_GB">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/tokens.css?{ASSET_V}">
<link rel="stylesheet" href="/assets/css/base.css?{ASSET_V}">
<link rel="stylesheet" href="/assets/css/sections.css?{ASSET_V}">
<link rel="stylesheet" href="/assets/css/catalogue.css?{ASSET_V}">
<link rel="stylesheet" href="/assets/css/pages.css?{ASSET_V}">
<script defer data-domain="trainnorthlabs.com" src="https://plausible.io/js/script.outbound-links.tagged-events.js"></script>
<script>window.plausible=window.plausible||function(){{(window.plausible.q=window.plausible.q||[]).push(arguments)}}</script>
{extra}
</head>
<body class="subpage">
<a class="skip-link" href="#main">Skip to content</a>
<div class="atmosphere" aria-hidden="true"></div>

<div class="ticker" role="note" aria-label="Compliance notice">
  <div class="ticker__track">{TICKER}</div>
</div>

<header class="masthead" data-scrolled="false">
  <div class="shell masthead__inner">
    <a class="wordmark" href="/">
      <span class="wordmark__mark" aria-hidden="true"></span>
      <span class="wordmark__name">TRAINNORTH<span class="wordmark__sep">:</span>LABS</span>
    </a>
    <nav class="nav" aria-label="Main">
      <a href="/#timeline">Journey</a>
      <a href="/ai-training/">AI Training</a>
      <a href="/peptide-library/">Library</a>
      <a href="/#calculator">Calculator</a>
      <a href="/#supply">Research Materials</a>
    </nav>
    <a class="btn btn--sm btn--ghost masthead__contact" href="/contact/">Contact</a>
    <button class="burger" type="button" id="burger" aria-expanded="false" aria-controls="mobileMenu" aria-label="Open menu">
      <span class="burger__box" aria-hidden="true"><span class="burger__line"></span><span class="burger__line"></span><span class="burger__line"></span></span>
    </button>
  </div>
</header>

<div class="mobile-menu" id="mobileMenu" data-open="false" hidden>
  <nav class="mobile-menu__panel" aria-label="Sections">
    <ol class="mobile-menu__list">
      <li><a href="/">Home</a></li>
      <li><a href="/ai-training/">AI Training</a></li>
      <li><a href="/peptide-library/">Peptide Library</a></li>
      <li><a href="/#calculator">Calculator</a></li>
      <li><a href="/#supply">Research Materials</a></li>
      <li><a href="/contact/">Contact</a></li>
    </ol>
    <a class="btn btn--primary mobile-menu__cta" href="mailto:health@trainnorthlabs.com">health@trainnorthlabs.com</a>
  </nav>
</div>

<main id="main">
"""

FOOT = f"""</main>

<footer class="footer">
  <div class="shell">
    <div class="footer__grid">
      <div>
        <span class="wordmark__name" style="display:block; margin-bottom: var(--space-3)">TRAINNORTH<span class="wordmark__sep">:</span>LABS</span>
        <p class="dim" style="font-size: var(--text-sm)">A documented record and an evidence-graded research reference.</p>
      </div>
      <div>
        <h2>Reference</h2>
        <ul>
          <li><a href="/peptide-library/">Peptide library</a></li>
          <li><a href="/#calculator">Reconstitution calculator</a></li>
          <li><a href="/ai-training/">AI training method</a></li>
        </ul>
      </div>
      <div>
        <h2>Contact</h2>
        <ul>
          <li><a href="mailto:health@trainnorthlabs.com">health@trainnorthlabs.com</a></li>
          <li><a href="https://wa.me/{WA}" target="_blank" rel="noopener noreferrer">Supplier WhatsApp: +852 5644 0181</a></li>
          <li><a href="/contact/">Contact page</a></li>
        </ul>
      </div>
      <div>
        <h2>Site</h2>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/#supply">Research materials</a></li>
          <li><a href="/#faq">Questions</a></li>
        </ul>
      </div>
    </div>
    <p class="footer__legal">
      <strong>Research use only.</strong> All content on this site is educational
      documentation and general information. It is not medical advice, not a
      diagnosis, and not a treatment protocol. Compounds referenced are for
      laboratory research use only, are not for human consumption, and the majority
      are not approved as medicines in the United Kingdom. Nothing is sold from this
      site. Consult a qualified physician before making any health decision. 18+.
    </p>
  </div>
</footer>

<script src="/assets/js/backend.js?{ASSET_V}"></script>
<script src="/assets/js/peptides.js?{ASSET_V}"></script>
<script src="/assets/js/products.js?{ASSET_V}"></script>
<script src="/assets/js/pages.js?{ASSET_V}" defer></script>
</body>
</html>
"""

def write(path, html):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    return path

# --------------------------------------------------------------------------
# Compound pages
# --------------------------------------------------------------------------

def products_for(name):
    return [p for p in PRODUCTS if p.get("lib") == name]

def compound_page(p):
    t = tier(p)
    label, token = TIERS[t]
    sl = slug(p["n"])
    url = f"{SITE}/peptide-library/{sl}/"
    prods = products_for(p["n"])

    conc = p["mg"] / p["bac"] if p["bac"] else 0
    doses = "".join(
        f"<tr><td class='mono'>{d} mg</td><td class='mono'>{round(d/conc, 3) if conc else '-'} ml</td>"
        f"<td class='mono'><strong>{round(d/conc*100, 1) if conc else '-'} IU</strong></td></tr>"
        for d in p["steps"])

    buy = ""
    if prods:
        rows = "".join(
            "".join(
                f"<tr><td>{esc(pr['name'])}</td><td class='mono'>{v['label']} &times; {v.get('vials',10)}</td>"
                f"<td class='mono'>${v['price']}</td></tr>"
                for v in pr["variants"])
            for pr in prods)
        cheapest = min(v["price"] for pr in prods for v in pr["variants"])
        buy = f"""
      <section class="pg__block">
        <h2>Available as research material</h2>
        <div class="pg__tablewrap">
          <table class="pg__table">
            <thead><tr><th>Product</th><th>Specification</th><th>Per box</th></tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
        <p class="dim" style="font-size:var(--text-xs)">From ${cheapest} per box. One price is one box, not one vial. Supplied by an independent laboratory supplier, not by TRAINNORTH:LABS.</p>
        <a class="btn btn--primary btn--whatsapp" target="_blank" rel="noopener noreferrer"
           href="https://wa.me/{WA}?text={{WA_TEXT}}">Research enquiry via WhatsApp</a>
      </section>"""
        wa_text = ("Hello, I would like to make a research enquiry.%0A%0A"
                   f"Compound: {p['n']}%0A%0APlease confirm availability, pricing, shipping and certificate of "
                   "analysis. Research Use Only, not for human consumption.%0A%0ARef: TN-REF5")
        buy = buy.replace("{WA_TEXT}", wa_text)

    ld = json.dumps({
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        "@id": url + "#term",
        "name": p["n"],
        "description": f"{p['ben'][0]}. Evidence: {label}. {p['ev']} Research use only, not for human consumption.",
        "inDefinedTermSet": {
            "@type": "DefinedTermSet",
            "@id": SITE + "/peptide-library/#set",
            "name": "TRAINNORTH:LABS Research Compound Reference Library",
            "url": SITE + "/peptide-library/"
        }
    }, indent=1)

    breadcrumb = json.dumps({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Peptide library", "item": SITE + "/peptide-library/"},
            {"@type": "ListItem", "position": 3, "name": p["n"], "item": url}]
    }, indent=1)

    extra = f'<script type="application/ld+json">{ld}</script>\n<script type="application/ld+json">{breadcrumb}</script>'

    body = f"""
<article class="pg">
  <div class="shell">
    <nav class="pg__crumb" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <a href="/peptide-library/">Peptide library</a> <span aria-hidden="true">/</span>
      <span aria-current="page">{esc(p['n'])}</span>
    </nav>

    <header class="pg__head">
      <div class="pg__badges">
        <span class="pill">{esc(p['cat'])}</span>
        <span class="ev-badge" style="--ev-colour: var({token})">{label}</span>
      </div>
      <h1 class="display">{esc(p['n'])}</h1>
      <p class="lead">{esc(p['ben'][0])}. Researched under {esc(p['route'])} administration, reported half-life {esc(p['half'])}.</p>
      <p class="pg__ruo">Research use only. Not for human consumption. Not medical advice. 18+.</p>
    </header>

    <div class="pg__grid">
      <div>
        <section class="pg__block">
          <h2>Researched areas of interest</h2>
          <ul class="pg__list">{''.join('<li>%s</li>' % esc(b) for b in p['ben'])}</ul>
        </section>

        <section class="pg__block">
          <h2>Evidence status</h2>
          <p class="pg__ev"><span class="ev-badge" style="--ev-colour: var({token})">{label}</span></p>
          <p>{esc(p['ev'])}</p>
          <p class="dim" style="font-size:var(--text-sm)">Grades are assigned from the published evidence position, not from
          how widely a compound is discussed. <a href="/peptide-library/#grading">How grading works</a>.</p>
        </section>

        <section class="pg__block">
          <h2>Handling notes</h2>
          <p class="caution-note">{esc(p['caution'])}</p>
        </section>

        <section class="pg__block">
          <h2>Reconstitution reference</h2>
          <p class="muted">At the common presentation of {p['mg']} mg reconstituted with {p['bac']} ml of bacteriostatic
          water, the concentration is <strong>{round(conc,2)} mg/ml</strong>. Draw volumes on a U-100 syringe:</p>
          <div class="pg__tablewrap">
            <table class="pg__table">
              <thead><tr><th>Reference point</th><th>Volume</th><th>U-100 units</th></tr></thead>
              <tbody>{doses}</tbody>
            </table>
          </div>
          <p class="dim" style="font-size:var(--text-xs)">Arithmetic reference only. These are literature reference points,
          not a dosing recommendation. <a href="/#calculator">Open the full calculator</a>.</p>
        </section>
      </div>

      <aside class="pg__aside">
        <div class="card">
          <h2 class="pg__asideh">Reference data</h2>
          <ul class="spec-list">
            <li><span class="spec-list__key">Category</span><span class="spec-list__val">{esc(p['cat'])}</span></li>
            <li><span class="spec-list__key">Vial strength</span><span class="spec-list__val">{p['mg']} mg</span></li>
            <li><span class="spec-list__key">Diluent</span><span class="spec-list__val">{p['bac']} ml</span></li>
            <li><span class="spec-list__key">Route</span><span class="spec-list__val">{esc(p['route'])}</span></li>
            <li><span class="spec-list__key">Half-life</span><span class="spec-list__val">{esc(p['half'])}</span></li>
            <li><span class="spec-list__key">Co-studied</span><span class="spec-list__val">{esc(p['pairs'])}</span></li>
          </ul>
        </div>
      </aside>
    </div>
    {buy}

    <p class="pg__disclaimer">
      <strong>Disclaimer &mdash; Research Use Only.</strong> Materials referenced on this page are for laboratory
      research only. They are not intended for human consumption, are not approved as medicines in the United Kingdom
      unless explicitly stated, and nothing here is medical advice or a dosing protocol. Consult a qualified physician
      before making any health decision.
    </p>

    <a class="btn btn--ghost" href="/peptide-library/">&larr; Back to the library</a>
  </div>
</article>
"""
    return write(f"peptide-library/{sl}/index.html",
                 head(f"{p['n']} — Evidence, Handling & Reconstitution | TRAINNORTH:LABS",
                      f"{p['ben'][0]}. Evidence graded as {label.lower()}. Route {p['route']}, half-life {p['half']}. Research use only.",
                      url, extra) + body + FOOT)

# --------------------------------------------------------------------------
# Library hub
# --------------------------------------------------------------------------

def library_hub():
    counts = {}
    for p in PEPTIDES:
        counts[tier(p)] = counts.get(tier(p), 0) + 1

    cards = ""
    for p in sorted(PEPTIDES, key=lambda x: x["n"]):
        t = tier(p); label, token = TIERS[t]
        cards += f"""
      <a class="lib-card" href="/peptide-library/{slug(p['n'])}/">
        <span class="lib-card__name">{esc(p['n'])}</span>
        <span class="lib-card__meta mono">{p['mg']} mg &middot; {esc(p['route'])}</span>
        <span class="lib-card__blurb">{esc(p['ben'][0])}</span>
        <span class="ev-badge" style="--ev-colour: var({token})">{label}</span>
      </a>"""

    rows = "".join(
        f"<tr><td><span class='ev-badge' style='--ev-colour: var({TIERS[k][1]})'>{TIERS[k][0]}</span></td>"
        f"<td class='mono'>{counts.get(k,0)}</td><td>{d}</td></tr>"
        for k, d in [
            ("approved", "Approved by a recognised medicines regulator somewhere in the world."),
            ("clinical", "Human trial evidence exists and is not hedged, but the compound is not approved."),
            ("limited", "Some human evidence, explicitly hedged, unreplicated, or largely mechanistic."),
            ("preclinical", "Animal or mechanistic evidence only, with no completed human trials.")])

    ld = json.dumps({
        "@context": "https://schema.org", "@type": "DefinedTermSet",
        "@id": SITE + "/peptide-library/#set",
        "name": "TRAINNORTH:LABS Research Compound Reference Library",
        "url": SITE + "/peptide-library/",
        "description": "An evidence-graded reference library of 36 laboratory research compounds.",
        "hasDefinedTerm": [{"@type": "DefinedTerm", "name": p["n"],
                            "@id": f"{SITE}/peptide-library/{slug(p['n'])}/#term",
                            "url": f"{SITE}/peptide-library/{slug(p['n'])}/"} for p in PEPTIDES]
    }, indent=1)

    body = f"""
<article class="pg">
  <div class="shell">
    <nav class="pg__crumb" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <span aria-current="page">Peptide library</span>
    </nav>
    <header class="pg__head">
      <span class="eyebrow">{len(PEPTIDES)} compounds &middot; evidence graded</span>
      <h1 class="display">The peptide library</h1>
      <p class="lead">Every compound carries an explicit evidence grade, assigned from its published
      evidence position rather than from how widely it is discussed. Several of the most popular
      compounds here sit in the weakest two tiers.</p>
      <p class="pg__ruo">Research use only. Not for human consumption. Not medical advice. 18+.</p>
    </header>

    <section class="pg__block" id="grading">
      <h2>How grading works</h2>
      <p class="muted">Four tiers. A compound being widely sold does not raise its grade.</p>
      <div class="pg__tablewrap">
        <table class="pg__table">
          <thead><tr><th>Grade</th><th>Count</th><th>Meaning</th></tr></thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
      <p class="dim" style="font-size:var(--text-sm)">Grading is deliberately negation-aware: an evidence note
      reading &ldquo;no human trials&rdquo; or &ldquo;not yet approved&rdquo; is resolved as a denial before any
      positive match is considered, because those phrases contain the exact wording a naive classifier would
      match on and would otherwise invert the grade.</p>
    </section>

    <section class="pg__block">
      <h2>All compounds</h2>
      <div class="lib-grid">{cards}</div>
    </section>

    <p class="pg__disclaimer">
      <strong>Disclaimer &mdash; Research Use Only.</strong> This library is educational reference material.
      It is not medical advice and not a dosing protocol. Compounds referenced are for laboratory research
      only and are not intended for human consumption.
    </p>
  </div>
</article>
"""
    return write("peptide-library/index.html",
                 head("Peptide Library — 36 Compounds Graded by Evidence | TRAINNORTH:LABS",
                      "An evidence-graded reference library of 36 research compounds. Each entry states whether it is an approved medicine, has human trial data, limited human data, or is preclinical only.",
                      SITE + "/peptide-library/",
                      f'<script type="application/ld+json">{ld}</script>') + body + FOOT)

# --------------------------------------------------------------------------
# Run
# --------------------------------------------------------------------------

if __name__ == "__main__":
    written = [library_hub()]
    for p in PEPTIDES:
        written.append(compound_page(p))
    print("compound pages + hub: %d files" % len(written))
    for w in written[:3]:
        print("  ", w)
    print("   ...")
    print("tier spread:", {k: sum(1 for p in PEPTIDES if tier(p) == k) for k in TIERS})
