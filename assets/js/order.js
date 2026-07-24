/* ==========================================================================
   Research enquiry — two-step review and hand-off

   Step 1 reads the basket saved by the catalogue and shows the line items and
   totals. Step 2 collects the details the supplier will otherwise have to ask
   for, then writes everything into a WhatsApp message the visitor sends
   themselves.

   PRIVACY: nothing on this page is transmitted to this website, and the
   personal fields are never written to storage. The basket persists because it
   is anonymous product data; a name, address and phone number are not, so they
   live only in memory for the life of the page. Closing the tab discards them.
   ========================================================================== */

(function () {
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const STORAGE_KEY = "tnl.basket.v1";
const WHATSAPP_NUMBER = "85256440181";
/* Attribution tag only. No discount is offered or calculated; the tag is
   appended to the enquiry so supplier-side referrals reconcile. */
const REF_TAG = "TN-REF5";

/* Shipping is quoted by the supplier. Populate this table only with rates
   confirmed by them: an invented delivery cost on a live price list is worse
   than no figure, because the visitor budgets against it.
   Shape: { GB: { cost: 60, days: "8-12" } } */
const SHIPPING = {};

let basket = [];

function isPriced(n) { return typeof n === "number" && isFinite(n) && n > 0; }
function money(n) { return "$" + n.toLocaleString("en-GB", { maximumFractionDigits: 2 }); }

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    basket = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(basket)) basket = [];
  } catch (e) { basket = []; }
}

function countryCode() {
  return $("#ordCountry")?.value || "";
}

function totals() {
  let products = 0, unpriced = 0;
  basket.forEach((b) => {
    if (isPriced(b.price)) products += b.price * b.qty;
    else unpriced += b.qty;
  });
  const ship = SHIPPING[countryCode()];
  const shipping = ship ? ship.cost : null;
  const total = products + (shipping || 0);
  return { products, shipping, total, unpriced };
}

/* --- Step 1: materials --------------------------------------------------- */

function renderMaterials() {
  const list = $("#ordLines");
  const sum = $("#ordTotals");
  if (!list) return;

  if (!basket.length) {
    list.innerHTML = `<p class="dim">Nothing selected yet.</p>`;
    sum.innerHTML = "";
    $("#ordNext").disabled = true;
    $("#ordEmpty").hidden = false;
    return;
  }

  $("#ordEmpty").hidden = true;
  $("#ordNext").disabled = false;

  list.innerHTML = basket.map((b) => `
    <div class="ord-line">
      <span>${b.ref} &mdash; ${b.label} &times; ${b.vials || 10} vials <span class="dim">&times;${b.qty}</span></span>
      <span class="mono">${isPriced(b.price) ? money(b.price * b.qty) : "On enquiry"}</span>
    </div>`).join("");

  const t = totals();
  const ship = SHIPPING[countryCode()];

  sum.innerHTML = `
    ${t.products > 0 ? `
      <div class="ord-row"><span>Products</span><span class="mono">${money(t.products)}</span></div>
      <div class="ord-row"><span>Shipping${countryName() ? " (" + countryName() + ")" : ""}</span>
        <span class="mono">${ship ? money(ship.cost) + " · " + ship.days + " days" : "Quoted by supplier"}</span></div>
      <div class="ord-row ord-row--total"><span>${ship ? "Estimated total" : "Estimated total excl. shipping"}</span><span class="mono">${money(t.total)} USD</span></div>
    ` : ""}
    ${t.unpriced ? `<p class="dim" style="font-size:var(--text-xs); margin-top:var(--space-3)">${t.unpriced} box${t.unpriced === 1 ? "" : "es"} priced on enquiry.</p>` : ""}
    <p class="dim" style="font-size:var(--text-xs); margin-top:var(--space-2)">
      Estimate only. The supplier confirms final pricing, shipping and availability. No payment is taken on this site.
    </p>`;
}

function countryName() {
  const sel = $("#ordCountry");
  return sel && sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].text : "";
}

/* --- Steps --------------------------------------------------------------- */

function goStep(n) {
  $$(".ord-step").forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
  $$(".ord-stepper__dot").forEach((d) => {
    const i = Number(d.dataset.step);
    d.dataset.state = i === n ? "current" : (i < n ? "done" : "todo");
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* --- Compose ------------------------------------------------------------- */

function val(id) { return ($(id)?.value || "").trim(); }

function compose() {
  const t = totals();
  const ship = SHIPPING[countryCode()];
  const sameAddress = $('input[name="ordDeliver"]:checked')?.value !== "different";
  const payment = $('input[name="ordPay"]:checked')?.value || "USDT";

  const lines = [
    "RESEARCH ENQUIRY (Research Use Only, not for human consumption)",
    "",
    "MATERIALS:"
  ];

  basket.forEach((b) => {
    lines.push(`- ${b.ref} ${b.label} x ${b.vials || 10} vials, ${b.qty} box${b.qty === 1 ? "" : "es"}` +
      (isPriced(b.price) ? ` (${money(b.price)}/box)` : " (price on enquiry)"));
  });

  if (t.products > 0) {
    lines.push("");
    lines.push("Products: " + money(t.products));
    lines.push("Shipping: " + (ship ? money(ship.cost) + " (" + ship.days + " days)" : "to be quoted"));
    lines.push("Estimated total: " + money(t.total) + " USD");
  }

  lines.push("");
  lines.push("CONTACT:");
  lines.push("Name: " + (val("#ordName") || "-"));
  lines.push("Email: " + (val("#ordEmail") || "-"));
  lines.push("Phone: " + (val("#ordPhone") || "-"));

  lines.push("");
  lines.push("SHIPPING ADDRESS:");
  if (sameAddress) {
    lines.push(val("#ordAddress") || "-");
    lines.push([val("#ordCity"), val("#ordRegion"), val("#ordPostcode")].filter(Boolean).join(", "));
    lines.push(countryName() || "-");
  } else {
    lines.push(val("#ordAltAddress") || "-");
    lines.push([val("#ordAltCity"), val("#ordAltRegion"), val("#ordAltPostcode")].filter(Boolean).join(", "));
    lines.push(val("#ordAltCountry") || countryName() || "-");
  }

  lines.push("");
  lines.push("Payment preference: " + payment);

  if (val("#ordNotes")) {
    lines.push("");
    lines.push("Notes: " + val("#ordNotes"));
  }

  lines.push("");
  lines.push("Please confirm availability, final pricing, shipping cost and certificate of analysis.");
  lines.push("");
  lines.push("Ref: " + REF_TAG);

  return lines.join("\n");
}

function required() {
  return ["#ordName", "#ordEmail", "#ordPhone", "#ordAddress", "#ordCity", "#ordPostcode"];
}

function validate() {
  let ok = true;
  required().forEach((id) => {
    const el = $(id);
    if (!el) return;
    const bad = !el.value.trim();
    el.setAttribute("aria-invalid", String(bad));
    if (bad) ok = false;
  });
  if (!countryCode()) {
    $("#ordCountry")?.setAttribute("aria-invalid", "true");
    ok = false;
  }
  return ok;
}

/* --- Init ---------------------------------------------------------------- */

function init() {
  if (!$("#ordLines")) return;
  load();

  // Live shipping rates, if the supplier's table has any. Absent rates keep
  // the "quoted by supplier" wording; present rates complete the estimate.
  if (window.TNL_BACKEND) {
    window.TNL_BACKEND.loadShipping().then((rates) => {
      Object.assign(SHIPPING, rates);
      renderMaterials();
    });
  }

  const sel = $("#ordCountry");
  if (sel && typeof SHIP_TO !== "undefined") {
    sel.innerHTML = '<option value="">Select country</option>' +
      SHIP_TO.map((s) => `<option value="${s.code}">${s.label}</option>`).join("");
    sel.addEventListener("change", () => {
      renderMaterials();
      sel.setAttribute("aria-invalid", "false");
    });
  }

  renderMaterials();

  $("#ordNext")?.addEventListener("click", () => goStep(2));
  $("#ordBack")?.addEventListener("click", () => goStep(1));

  // Toggle the alternate address block
  $$('input[name="ordDeliver"]').forEach((r) => {
    r.addEventListener("change", () => {
      $("#ordAlt").hidden = $('input[name="ordDeliver"]:checked')?.value !== "different";
    });
  });

  required().forEach((id) => {
    $(id)?.addEventListener("input", (e) => e.target.setAttribute("aria-invalid", "false"));
  });

  $("#ordSend")?.addEventListener("click", () => {
    if (!validate()) {
      $("#ordError").hidden = false;
      $('[aria-invalid="true"]')?.focus();
      return;
    }
    $("#ordError").hidden = true;

    if (window.TNL_BACKEND) {
      const tl = totals();
      window.TNL_BACKEND.logEnquiry({
        source: "order",
        items: basket.map((b) => ({ ref: b.ref, label: b.label, qty: b.qty })),
        boxes: basket.reduce((n, b) => n + b.qty, 0),
        value_usd: Math.round(tl.total),
        country: countryCode() || "unset"
      });
    }

    /* Commission signal. Records that an enquiry left for the supplier, with
       enough to reconcile against their referral statements: value, size and
       destination. Deliberately NO personal fields - name, address and phone
       never reach analytics. A click proves an enquiry opened, not that it
       was sent or paid; the TN-REF5 code inside the message is what ties an
       actual order back for commission. */
    if (window.plausible) {
      const t = totals();
      window.plausible("Enquiry: WhatsApp", { props: {
        source: "order",
        items: basket.length,
        boxes: basket.reduce((n, b) => n + b.qty, 0),
        value_usd: Math.round(t.total),
        country: countryCode() || "unset"
      }});
    }

    window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(compose()),
                "_blank", "noopener,noreferrer");
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();

})();
