/* ==========================================================================
   Application logic
     - scroll progress + chapter tracking
     - reveal-on-scroll staging
     - animated metric counters
     - compound library: search, filter, detail drawer
     - reconstitution calculator
   No dependencies. Classic script - peptides.js must load first.

   Deliberately not an ES module: the site has to run correctly when opened
   directly from disk (file://), where module imports are blocked by CORS.
   ========================================================================== */

(function () {
"use strict";

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ==========================================================================
   Chrome - masthead state, scroll progress, active chapter
   ========================================================================== */

function initChrome() {
  const masthead = $(".masthead");
  const fill = $(".progress-rail__fill");
  const chapters = $$(".chapter[id]");
  const navLinks = $$(".nav a[href^='#']");

  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    masthead.dataset.scrolled = y > 24 ? "true" : "false";
    if (fill) fill.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;

    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();

  /* Active chapter: the one occupying the middle of the viewport. Drives both
     the rail number colour and the nav underline. */
  if ("IntersectionObserver" in window && chapters.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.setAttribute("aria-current", link.getAttribute("href") === `#${entry.target.id}` ? "true" : "false");
        });
      });
    }, { rootMargin: "-45% 0px -45% 0px" });

    chapters.forEach((c) => observer.observe(c));
  }
}

/* ==========================================================================
   Reveal staging - elements enter as the reader reaches them
   ========================================================================== */

function initReveal() {
  const targets = $$("[data-reveal]");
  if (REDUCED || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      obs.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });

  targets.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   Metric counters - count up once, when the panel is first seen
   ========================================================================== */

function countTo(el, target, decimals) {
  if (REDUCED) {
    el.textContent = target.toFixed(decimals);
    return;
  }

  const duration = 1400;
  const start = performance.now();

  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    // easeOutExpo - fast arrival, soft settle
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    el.textContent = (target * eased).toFixed(decimals);
    if (t < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = $$("[data-count]");
  if (!counters.length) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    countTo(el, target, decimals);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(run);
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));

  // Delta bar fills alongside the counters
  const bar = $(".delta-bar__fill");
  if (bar) {
    const barObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        bar.style.width = `${bar.dataset.fill || 0}%`;
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    barObserver.observe(bar);
  }
}

/* ==========================================================================
   Compound library
   ========================================================================== */

const libraryState = {
  query: "",
  category: "all"
};

function evidenceMarkup(peptide) {
  const tierKey = evidenceTier(peptide);
  const tier = EVIDENCE_TIERS[tierKey];
  const bars = [1, 2, 3, 4]
    .map((i) => `<span class="ev-badge__bar${i <= tier.rank ? " is-on" : ""}"></span>`)
    .join("");

  return `
    <span class="ev-badge" style="--ev-colour: var(${tier.token})">
      <span class="ev-badge__bars" aria-hidden="true">${bars}</span>
      ${tier.label}
    </span>`;
}

function compoundCard(peptide, index) {
  const colour = CATEGORIES[peptide.cat]?.colour || "var(--signal)";
  const delay = Math.min(index * 22, 420);

  return `
    <button class="compound" type="button"
            data-compound="${peptide.n}"
            style="--cat-colour: ${colour}; animation-delay: ${REDUCED ? 0 : delay}ms"
            aria-haspopup="dialog">
      <span class="compound__name">${peptide.n}</span>
      <span class="compound__meta">
        <span>${peptide.mg} mg vial</span>
        <span>${peptide.route}</span>
        <span>t½ ${peptide.half}</span>
      </span>
      <p class="compound__lead">${peptide.ben[0]}${peptide.ben[1] ? ` · ${peptide.ben[1]}` : ""}</p>
      <span class="compound__foot">
        ${evidenceMarkup(peptide)}
        <span class="pill" style="color: ${colour}; border-color: currentColor">
          <span class="pill__dot"></span>${peptide.cat}
        </span>
      </span>
    </button>`;
}

function renderLibrary() {
  const grid = $("#libraryGrid");
  const count = $("#libraryCount");
  if (!grid) return;

  const q = libraryState.query.trim().toLowerCase();

  const matches = PEPTIDES.filter((p) => {
    if (libraryState.category !== "all" && p.cat !== libraryState.category) return false;
    if (!q) return true;
    const haystack = [p.n, p.cat, p.route, p.pairs, p.ev, ...p.ben].join(" ").toLowerCase();
    return haystack.includes(q);
  });

  grid.innerHTML = matches.length
    ? matches.map(compoundCard).join("")
    : `<p class="library__empty">No compound matches that search. Try a category, a route, or a research area such as “recovery” or “appetite”.</p>`;

  if (count) {
    count.textContent = `${matches.length} / ${PEPTIDES.length} compounds`;
  }
}

function initLibrary() {
  const grid = $("#libraryGrid");
  if (!grid) return;

  // Build category filters from the dataset rather than hard-coding them
  const filterBar = $("#libraryFilters");
  if (filterBar) {
    const used = [...new Set(PEPTIDES.map((p) => p.cat))];
    filterBar.innerHTML = [
      `<button class="filter" type="button" data-cat="all" aria-pressed="true">All ${PEPTIDES.length}</button>`,
      ...used.map((cat) => {
        const n = PEPTIDES.filter((p) => p.cat === cat).length;
        const colour = CATEGORIES[cat]?.colour || "var(--text-dim)";
        return `<button class="filter" type="button" data-cat="${cat}" aria-pressed="false">
                  <span class="filter__swatch" style="--swatch: ${colour}"></span>${cat} ${n}
                </button>`;
      })
    ].join("");

    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      libraryState.category = btn.dataset.cat;
      $$(".filter", filterBar).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      renderLibrary();
    });
  }

  const search = $("#librarySearch");
  if (search) {
    let debounce;
    search.addEventListener("input", (e) => {
      clearTimeout(debounce);
      const value = e.target.value;
      debounce = setTimeout(() => {
        libraryState.query = value;
        renderLibrary();
      }, 130);
    });
  }

  grid.addEventListener("click", (e) => {
    const card = e.target.closest("[data-compound]");
    if (card) openDrawer(card.dataset.compound, card);
  });

  renderLibrary();
}

/* ==========================================================================
   Detail drawer
   ========================================================================== */

let lastFocused = null;

function openDrawer(name, trigger) {
  const peptide = PEPTIDES.find((p) => p.n === name);
  const drawer = $("#drawer");
  const body = $("#drawerBody");
  if (!peptide || !drawer || !body) return;

  lastFocused = trigger || document.activeElement;
  const colour = CATEGORIES[peptide.cat]?.colour || "var(--signal)";

  body.innerHTML = `
    <span class="pill" style="color: ${colour}; border-color: currentColor">
      <span class="pill__dot"></span>${peptide.cat}${peptide.blend ? " · blend" : ""}
    </span>
    <h3 id="drawerTitle" class="display" style="margin-top: var(--space-3)">${peptide.n}</h3>
    ${evidenceMarkup(peptide)}

    <div class="drawer__section">
      <h4>Handling reference</h4>
      <ul class="spec-list">
        <li><span class="spec-list__key">Vial strength</span><span class="spec-list__val">${peptide.mg} mg</span></li>
        <li><span class="spec-list__key">Default diluent</span><span class="spec-list__val">${peptide.bac} ml BAC</span></li>
        <li><span class="spec-list__key">Route studied</span><span class="spec-list__val">${peptide.route}</span></li>
        <li><span class="spec-list__key">Half-life</span><span class="spec-list__val">${peptide.half}</span></li>
        <li><span class="spec-list__key">Co-studied with</span><span class="spec-list__val">${peptide.pairs}</span></li>
      </ul>
    </div>

    <div class="drawer__section">
      <h4>Researched areas of interest</h4>
      <ul>${peptide.ben.map((b) => `<li>${b}</li>`).join("")}</ul>
    </div>

    <div class="drawer__section">
      <h4>Evidence status</h4>
      <p class="muted" style="font-size: var(--text-sm)">${peptide.ev}</p>
    </div>

    <div class="drawer__section">
      <h4>Handling notes</h4>
      <p class="caution-note">${peptide.caution}</p>
    </div>

    <div class="drawer__section">
      <button class="btn btn--primary" type="button" data-send-to-calc="${peptide.n}">
        Load into calculator
      </button>
    </div>

    <p class="dim" style="font-size: var(--text-xs); margin-top: var(--space-5)">
      Reference information for laboratory research use only. Not a protocol,
      not a dosing recommendation, and not medical advice.
    </p>`;

  drawer.dataset.open = "true";
  document.body.style.overflow = "hidden";
  $(".drawer__close", drawer)?.focus();
}

function closeDrawer() {
  const drawer = $("#drawer");
  if (!drawer || drawer.dataset.open !== "true") return;
  drawer.dataset.open = "false";
  document.body.style.overflow = "";
  lastFocused?.focus();
}

function initDrawer() {
  const drawer = $("#drawer");
  if (!drawer) return;

  drawer.addEventListener("click", (e) => {
    if (e.target.closest(".drawer__scrim") || e.target.closest(".drawer__close")) {
      closeDrawer();
      return;
    }

    const send = e.target.closest("[data-send-to-calc]");
    if (send) {
      closeDrawer();
      loadIntoCalculator(send.dataset.sendToCalc);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
}

/* ==========================================================================
   Reconstitution calculator

   Core relationship:
     concentration (mg/ml) = vial strength (mg) / diluent volume (ml)
     volume to draw (ml)   = dose (mg) / concentration
     insulin units (IU)    = volume (ml) × 100      [U-100 syringe]
   ========================================================================== */

function calcFields() {
  return {
    select: $("#calcCompound"),
    vial: $("#calcVial"),
    bac: $("#calcBac"),
    dose: $("#calcDose"),
    steps: $("#calcSteps"),
    iu: $("#calcIU"),
    conc: $("#calcConc"),
    volume: $("#calcVolume"),
    doses: $("#calcDoses"),
    fill: $("#syringeFill")
  };
}

function recalculate() {
  const f = calcFields();
  if (!f.iu) return;

  const vial = parseFloat(f.vial.value);
  const bac = parseFloat(f.bac.value);
  const dose = parseFloat(f.dose.value);

  const valid = [vial, bac, dose].every((n) => Number.isFinite(n) && n > 0);
  if (!valid) {
    f.iu.textContent = "-";
    f.conc.textContent = "-";
    f.volume.textContent = "-";
    f.doses.textContent = "-";
    f.fill.style.width = "0%";
    return;
  }

  const concentration = vial / bac;          // mg per ml
  const volumeMl = dose / concentration;     // ml to draw
  const iu = volumeMl * 100;                 // U-100 insulin syringe units
  const dosesPerVial = Math.floor(vial / dose);

  f.iu.textContent = iu < 10 ? iu.toFixed(1) : Math.round(iu).toString();
  f.conc.textContent = `${concentration.toFixed(2)} mg/ml`;
  f.volume.textContent = `${volumeMl.toFixed(3)} ml`;
  f.doses.textContent = `${dosesPerVial} dose${dosesPerVial === 1 ? "" : "s"}`;

  // Syringe barrel is drawn as a 100 IU capacity
  f.fill.style.width = `${Math.min(100, iu)}%`;
}

function loadIntoCalculator(name) {
  const peptide = PEPTIDES.find((p) => p.n === name);
  const f = calcFields();
  if (!peptide || !f.select) return;

  f.select.value = name;
  applyCompoundDefaults(peptide);

  $("#calculator")?.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
}

function applyCompoundDefaults(peptide) {
  const f = calcFields();
  f.vial.value = peptide.mg;
  f.bac.value = peptide.bac;
  f.dose.value = peptide.steps[1] ?? peptide.steps[0];

  // Reference dose points come from the compound record, so the quick-select
  // chips always match the literature range for that specific peptide.
  f.steps.innerHTML = peptide.steps
    .map((s) => `<button class="filter" type="button" data-step="${s}">${s} mg</button>`)
    .join("");

  recalculate();
}

function initCalculator() {
  const f = calcFields();
  if (!f.select) return;

  f.select.innerHTML = PEPTIDES
    .map((p) => `<option value="${p.n}">${p.n} - ${p.mg} mg</option>`)
    .join("");

  f.select.addEventListener("change", () => {
    const peptide = PEPTIDES.find((p) => p.n === f.select.value);
    if (peptide) applyCompoundDefaults(peptide);
  });

  [f.vial, f.bac, f.dose].forEach((input) => {
    input.addEventListener("input", recalculate);
  });

  f.steps.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-step]");
    if (!btn) return;
    f.dose.value = btn.dataset.step;
    $$("[data-step]", f.steps).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    recalculate();
  });

  applyCompoundDefaults(PEPTIDES[0]);
}

/* ==========================================================================
   Video wall - shuffled creator coverage, click-to-load facade

   Rotation uses a Fisher-Yates shuffle so the order genuinely varies per
   visit rather than drifting toward the same few entries. Thumbnails come
   straight from YouTube's image CDN; the player iframe is only injected on
   click, so no third-party script or cookie loads until the visitor asks.
   ========================================================================== */

function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function videoCard(video) {
  return `
    <article class="vid" data-video="${video.id}">
      <button class="vid__trigger" type="button" data-play="${video.id}"
              aria-label="Play: ${video.title}">
        <img class="vid__thumb"
             src="https://i.ytimg.com/vi/${video.id}/hqdefault.jpg"
             alt="" loading="lazy" width="480" height="360">
        <span class="vid__play" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"></path>
          </svg>
        </span>
        <span class="vid__topic">${video.topic}</span>
      </button>
      <div class="vid__body">
        <h3 class="vid__title">${video.title}</h3>
        <p class="vid__summary">${video.summary}</p>
        <span class="vid__channel mono">${video.channel}</span>
      </div>
    </article>`;
}

function renderVideos() {
  const wall = document.getElementById("videoWall");
  if (!wall || typeof liveVideos !== "function") return;

  const available = liveVideos();

  if (!available.length) {
    wall.innerHTML = `<p class="library__empty">Creator coverage is being reviewed. New episodes are added as they are verified.</p>`;
    return;
  }

  wall.innerHTML = shuffle(available).slice(0, 6).map(videoCard).join("");
}

function initVideos() {
  const wall = document.getElementById("videoWall");
  if (!wall) return;

  renderVideos();

  wall.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-play]");
    if (!trigger) return;

    const id = trigger.dataset.play;
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.title = "YouTube video player";
    frame.loading = "lazy";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
    frame.allowFullscreen = true;
    frame.className = "vid__frame";
    trigger.replaceWith(frame);
  });

  document.getElementById("videoShuffle")?.addEventListener("click", renderVideos);
}

/* ==========================================================================
   Boot
   ========================================================================== */

function boot() {
  initChrome();
  initReveal();
  initCounters();
  initLibrary();
  initDrawer();
  initCalculator();
  initVideos();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

})();
