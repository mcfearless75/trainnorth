/* ==========================================================================
   Catalogue, basket and enquiry compiler

   The basket never takes payment. It assembles a structured enquiry and hands
   it to the supplier over WhatsApp, which is why totals are labelled as
   indicative and shipping is left for the supplier to quote.

   Kept in its own file rather than added to app.js, which is already carrying
   chrome, reveal staging, the library, the drawer, the calculator and video.
   ========================================================================== */

(function () {
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const STORAGE_KEY = "tnl.basket.v1";
const WHATSAPP_NUMBER = "85256440181";

let items = [];
let filter = "all";
let basket = [];
let shipTo = "";

/* --- Money ---------------------------------------------------------------
   Prices arrive from a spreadsheet, so treat anything non-numeric as absent
   rather than coercing it to zero. A silent zero would show a free product. */
function isPriced(v) {
  return typeof v === "number" && isFinite(v) && v > 0;
}

function money(n) {
  return CURRENCY.symbol + n.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function priceLabel(v) {
  return isPriced(v.price) ? money(v.price) : "On enquiry";
}

/* --- Persistence --------------------------------------------------------- */

function loadBasket() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    basket = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(basket)) basket = [];
  } catch (e) {
    basket = [];
  }
}

function saveBasket() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
  } catch (e) {
    /* Private browsing or a full quota. The basket still works for this
       session; losing persistence is not worth surfacing an error for. */
  }
}

/* --- Rendering ----------------------------------------------------------- */

function categoryTabs() {
  const bar = $("#catFilters");
  if (!bar) return;

  const counts = {};
  items.forEach((i) => { counts[i.cat] = (counts[i.cat] || 0) + 1; });

  bar.innerHTML = CATALOGUE_CATEGORIES
    .filter((c) => c.key === "all" || counts[c.key])
    .map((c) => {
      const n = c.key === "all" ? items.length : counts[c.key];
      return `<button class="filter" type="button" data-cat="${c.key}"
                aria-pressed="${c.key === filter}">${c.label} ${n}</button>`;
    }).join("");
}

function productCard(item, index) {
  const from = item.variants
    .map((v) => v.price)
    .filter(isPriced)
    .sort((a, b) => a - b)[0];

  const boxOf = item.variants[0] ? (item.variants[0].vials || 10) : 10;

  const priceLine = isPriced(from)
    ? `<span class="prod__from">from <strong>${money(from)}</strong> <span class="prod__unit">per box of ${boxOf}</span></span>`
    : `<span class="prod__from prod__from--tbc">Price on enquiry</span>`;

  const ev = item.evidence && typeof EVIDENCE_TIERS !== "undefined" && EVIDENCE_TIERS[item.evidence];

  /* Graded products link back to their library entry. Ungraded ones say so
     plainly rather than showing a blank space where a grade should be, which
     would read as an oversight instead of a deliberate gap. */
  const badge = ev
    ? `<button class="ev-badge ev-badge--link" type="button" data-evidence="${encodeURIComponent(item.lib)}"
         style="--ev-colour: var(${ev.token})" title="See the evidence for ${item.lib}">${ev.label}</button>`
    : `<span class="ev-badge ev-badge--none">Not yet reviewed</span>`;

  return `
    <article class="prod" style="animation-delay:${Math.min(index * 18, 360)}ms">
      <div class="prod__head">
        <h3 class="prod__name">${item.name}</h3>
        ${badge}
      </div>
      <p class="prod__blurb">${item.blurb}</p>
      <ul class="prod__research">
        ${item.research.map((r) => `<li>${r}</li>`).join("")}
      </ul>
      <div class="prod__strengths">${item.variants.map((v) => `<span>${v.label}</span>`).join("")}</div>
      <div class="prod__foot">
        ${priceLine}
        <button class="btn btn--sm btn--primary" type="button" data-spec="${encodeURIComponent(item.name)}">
          Select
        </button>
      </div>
    </article>`;
}

function renderCatalogue() {
  const grid = $("#catGrid");
  if (!grid) return;

  const shown = filter === "all" ? items : items.filter((i) => i.cat === filter);
  grid.innerHTML = shown.length
    ? shown.map(productCard).join("")
    : `<p class="library__empty">Nothing in this category yet.</p>`;

  const count = $("#catCount");
  if (count) count.textContent = `${shown.length} / ${items.length} listed`;
}

/* --- Specification modal ------------------------------------------------- */

let specRef = null;

function openSpec(ref) {
  const item = items.find((i) => i.name === ref);
  const modal = $("#specModal");
  const body = $("#specBody");
  if (!item || !modal || !body) return;

  specRef = ref;

  body.innerHTML = `
    <span class="eyebrow">Select specification</span>
    <h3 class="display" style="margin:var(--space-2) 0 var(--space-2)">${item.name}</h3>
    <p class="muted" style="font-size:var(--text-sm)">${item.blurb}</p>
    ${item.lib ? `<button class="spec__evidence" type="button" data-evidence="${encodeURIComponent(item.lib)}">See the evidence for ${item.lib} &rarr;</button>` : ""}

    <div class="field" style="margin-top:var(--space-5)">
      <label for="specShip">Shipping destination</label>
      <select id="specShip">
        <option value="">Select destination</option>
        ${SHIP_TO.map((s) => `<option value="${s.code}" ${s.code === shipTo ? "selected" : ""}>${s.label}</option>`).join("")}
      </select>
    </div>

    <div class="spec__variants">
      ${item.variants.map((v, i) => `
        <label class="spec__variant">
          <input type="radio" name="specVariant" value="${i}" ${i === 0 ? "checked" : ""}>
          <span class="spec__variant-label">${v.label} &times; ${v.vials || 10} vials</span>
          <span class="spec__variant-price">
            ${priceLabel(v)}
            <span class="spec__variant-unit">per box of ${v.vials || 10}, not per vial</span>
          </span>
        </label>`).join("")}
    </div>

    <div class="spec__qty">
      <span class="vital__label">Boxes</span>
      <div class="stepper">
        <button type="button" data-step="-1" aria-label="Fewer boxes">&minus;</button>
        <input id="specQty" type="number" min="1" max="99" value="1" inputmode="numeric">
        <button type="button" data-step="1" aria-label="More boxes">+</button>
      </div>
      <span class="dim" style="font-size:var(--text-xs)">Quantity is boxes, not single vials</span>
    </div>

    <button class="btn btn--primary" type="button" id="specAdd" style="margin-top:var(--space-5); width:100%; justify-content:center">
      Add to enquiry
    </button>`;

  modal.dataset.open = "true";
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  $("#specClose")?.focus();
}

function closeSpec() {
  const modal = $("#specModal");
  if (!modal || modal.dataset.open !== "true") return;
  modal.dataset.open = "false";
  document.body.style.overflow = "";
  setTimeout(() => { if (modal.dataset.open === "false") modal.hidden = true; }, 300);
}

function addFromSpec() {
  const item = items.find((i) => i.name === specRef);
  if (!item) return;

  const chosen = $('input[name="specVariant"]:checked');
  const qtyEl = $("#specQty");
  const idx = chosen ? parseInt(chosen.value, 10) : 0;
  const qty = Math.max(1, Math.min(99, parseInt(qtyEl?.value, 10) || 1));
  const variant = item.variants[idx];
  if (!variant) return;

  shipTo = $("#specShip")?.value || shipTo;

  const key = item.name + "|" + variant.label;
  const existing = basket.find((b) => b.key === key);
  if (existing) existing.qty = Math.min(99, existing.qty + qty);
  else basket.push({ key, ref: item.name, label: variant.label, vials: variant.vials || 10, price: variant.price, qty });

  saveBasket();
  renderBasket();
  renderBar();
  closeSpec();
}

/* --- Basket -------------------------------------------------------------- */

function basketTotals() {
  // Only priced lines contribute. Unpriced lines are carried into the enquiry
  // for the supplier to quote, and are counted separately so the totals never
  // imply the basket is fully costed when it is not.
  let subtotal = 0;
  let unpriced = 0;
  basket.forEach((b) => {
    if (isPriced(b.price)) subtotal += b.price * b.qty;
    else unpriced += b.qty;
  });
  const discount = subtotal * REFERRAL.discount;
  return { subtotal, discount, total: subtotal - discount, unpriced };
}

function renderBasket() {
  const wrap = $("#basket");
  const list = $("#basketList");
  const badge = $("#basketCount");
  if (!wrap || !list) return;

  const boxes = basket.reduce((n, b) => n + b.qty, 0);
  if (badge) badge.textContent = boxes;
  wrap.dataset.empty = basket.length ? "false" : "true";

  if (!basket.length) {
    list.innerHTML = `<p class="dim" style="font-size:var(--text-sm)">No items selected yet. Choose a specification to start an enquiry.</p>`;
    $("#basketTotals").innerHTML = "";
    return;
  }

  list.innerHTML = basket.map((b) => `
    <li class="basket__line">
      <div>
        <span class="basket__name">${b.ref}</span>
        <span class="basket__meta mono">${b.label} &times; ${b.vials || 10} &middot; ${b.qty} box${b.qty === 1 ? "" : "es"}</span>
      </div>
      <div class="basket__right">
        <span class="mono">${isPriced(b.price) ? money(b.price * b.qty) : "On enquiry"}</span>
        <button class="basket__remove" type="button" data-remove="${encodeURIComponent(b.key)}" aria-label="Remove ${b.ref}">&times;</button>
      </div>
    </li>`).join("");

  const t = basketTotals();
  $("#basketTotals").innerHTML = `
    ${t.subtotal > 0 ? `
      <div class="basket__row"><span>Subtotal</span><span class="mono">${money(t.subtotal)}</span></div>
      <div class="basket__row basket__row--credit"><span>Referral ${REFERRAL.code} (&minus;${REFERRAL.discount * 100}%)</span><span class="mono">&minus;${money(t.discount)}</span></div>
      <div class="basket__row basket__row--total"><span>Indicative total</span><span class="mono">${money(t.total)}</span></div>
    ` : ""}
    ${t.unpriced ? `<p class="dim" style="font-size:var(--text-xs); margin-top:var(--space-3)">${t.unpriced} box${t.unpriced === 1 ? "" : "es"} priced on enquiry.</p>` : ""}
    <p class="dim" style="font-size:var(--text-xs); margin-top:var(--space-2)">
      Shipping is quoted by the supplier and is not included. No payment is taken on this site.
    </p>`;
}

/* --- Enquiry compiler ---------------------------------------------------- */

function buildEnquiry() {
  const t = basketTotals();
  const dest = SHIP_TO.find((s) => s.code === shipTo);

  const lines = [
    "Hello, I would like to make a research enquiry.",
    "",
    "Referral code: " + REFERRAL.code,
    dest ? "Shipping destination: " + dest.label : null,
    "",
    "Items (Research Use Only, not for human consumption):"
  ].filter((l) => l !== null);

  basket.forEach((b) => {
    lines.push(`- ${b.ref} ${b.label} x ${b.vials || 10} vials, ${b.qty} box${b.qty === 1 ? "" : "es"}${isPriced(b.price) ? " (" + money(b.price) + " per box)" : ""}`);
  });

  if (t.subtotal > 0) {
    lines.push("");
    lines.push(`Indicative total after referral discount: ${money(t.total)}`);
  }

  lines.push("");
  lines.push("Please confirm availability, current pricing, shipping cost and certificate of analysis.");

  return lines.join("\n");
}

/* --- Sticky summary bar --------------------------------------------------
   A fixed bar rather than only a sidebar. On a phone the sidebar scrolls away
   behind 58 products and the reader loses any sense that a selection exists;
   the bar keeps the running total and the way out permanently in view. It is
   removed from the accessibility tree entirely while empty so a screen reader
   never meets an empty toolbar. */

function renderBar() {
  const bar = $("#catBar");
  if (!bar) return;

  const boxes = basket.reduce((n, b) => n + b.qty, 0);
  if (!boxes) {
    bar.hidden = true;
    return;
  }

  const t = basketTotals();
  bar.hidden = false;
  $("#barCount").textContent = `${basket.length} item${basket.length === 1 ? "" : "s"} · ${boxes} box${boxes === 1 ? "" : "es"}`;
  $("#barTotal").textContent = t.subtotal > 0 ? money(t.total) : "On enquiry";
  $("#barNote").textContent = t.subtotal > 0
    ? `after ${REFERRAL.code} −${REFERRAL.discount * 100}%, shipping quoted separately`
    : "priced on enquiry";
}

function sendEnquiry() {
  if (!basket.length) return;
  // Hand off to /order/ rather than opening WhatsApp here. The supplier needs
  // a destination and contact details to quote, and collecting them after the
  // message has already opened means asking twice.
  window.location.href = "/order/";
}

/* --- Wiring -------------------------------------------------------------- */

function init() {
  const grid = $("#catGrid");
  if (!grid || typeof buildCatalogue !== "function") return;

  items = buildCatalogue();
  loadBasket();
  categoryTabs();
  renderCatalogue();
  renderBasket();

  $("#catFilters")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    filter = btn.dataset.cat;
    $$("#catFilters .filter").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    renderCatalogue();
  });

  /* Catalogue -> library. The evidence badge is the hinge between the two
     halves of the site: a price is only meaningful next to what the evidence
     actually supports, so every graded product can reach its library entry. */
  document.addEventListener("click", (e) => {
    const ev = e.target.closest("[data-evidence]");
    if (ev) {
      e.preventDefault();
      closeSpec();
      const name = decodeURIComponent(ev.dataset.evidence);
      if (typeof window.openCompound === "function") window.openCompound(name);
      return;
    }

    /* Library -> catalogue: opening the spec modal straight from the drawer
       means a reader can go from evidence to purchase without hunting for the
       product in the grid. */
    const buy = e.target.closest("[data-open-product]");
    if (buy) {
      e.preventDefault();
      if (typeof window.closeCompound === "function") window.closeCompound();
      openSpec(decodeURIComponent(buy.dataset.openProduct));
    }
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-spec]");
    if (btn) openSpec(decodeURIComponent(btn.dataset.spec));
  });

  $("#specModal")?.addEventListener("click", (e) => {
    if (e.target.closest("#specClose") || e.target.closest(".spec__scrim")) return closeSpec();
    if (e.target.closest("#specAdd")) return addFromSpec();

    const step = e.target.closest("[data-step]");
    if (step) {
      const input = $("#specQty");
      const next = (parseInt(input.value, 10) || 1) + parseInt(step.dataset.step, 10);
      input.value = Math.max(1, Math.min(99, next));
    }
  });

  $("#basketList")?.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    if (!rm) return;
    const key = decodeURIComponent(rm.dataset.remove);
    basket = basket.filter((b) => b.key !== key);
    saveBasket();
    renderBasket();
    renderBar();
  });

  $("#basketClear")?.addEventListener("click", () => {
    basket = [];
    saveBasket();
    renderBasket();
    renderBar();
  });

  $("#basketSend")?.addEventListener("click", sendEnquiry);
  $("#barSend")?.addEventListener("click", sendEnquiry);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSpec();
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();

})();
