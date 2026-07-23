/* ==========================================================================
   Sub-page behaviour: masthead, mobile menu, prompt copying, contact gate.

   Deliberately standalone rather than reusing app.js, which is built around
   the single-page site's library, drawer, calculator and video wall. None of
   that exists here, and loading it would run a dozen initialisers against
   elements that are not on the page.
   ========================================================================== */

(function () {
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const WA = "85256440181";

/* --- Masthead ------------------------------------------------------------ */

const masthead = $(".masthead");
if (masthead) {
  let ticking = false;
  const update = () => { masthead.dataset.scrolled = window.scrollY > 24 ? "true" : "false"; ticking = false; };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* --- Mobile menu --------------------------------------------------------- */

(function menu() {
  const burger = $("#burger");
  const panel = $("#mobileMenu");
  if (!burger || !panel) return;

  let open = false;
  function setOpen(next) {
    open = next;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(() => { panel.dataset.open = "true"; });
      document.body.style.overflow = "hidden";
      panel.querySelector("a")?.focus();
    } else {
      panel.dataset.open = "false";
      document.body.style.overflow = "";
      setTimeout(() => { if (!open) panel.hidden = true; }, 320);
      burger.focus();
    }
  }
  burger.addEventListener("click", () => setOpen(!open));
  panel.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setOpen(false); });
})();

/* --- Prompt copy ---------------------------------------------------------
   Falls back to a hidden textarea and execCommand where the async clipboard
   API is unavailable, which is still the case on some in-app browsers and on
   any page not served over HTTPS. */

$$("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const src = document.getElementById(btn.dataset.copy);
    if (!src) return;
    const text = src.textContent;

    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch (e) { ok = false; }

    if (!ok) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
    }

    btn.textContent = ok ? "Copied" : "Select and copy";
    btn.dataset.copied = String(ok);
    setTimeout(() => { btn.textContent = "Copy"; btn.dataset.copied = "false"; }, 2200);
  });
});

/* --- Contact: age gate and enquiry ---------------------------------------
   The gate is a genuine control, not decoration: the form does not exist in
   the DOM's accessibility tree until every statement is confirmed. */

(function contact() {
  const gate = $("#gate");
  const form = $("#enquiry");
  if (!gate || !form) return;

  const checks = $$("[data-gate]", gate);
  const btn = $("#gateBtn");

  const sync = () => { btn.disabled = !checks.every((c) => c.checked); };
  checks.forEach((c) => c.addEventListener("change", sync));
  sync();

  btn.addEventListener("click", () => {
    form.hidden = false;
    gate.hidden = true;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    $("#eqMaterial")?.focus();
  });

  // Country list comes from the catalogue data so the two cannot diverge.
  const sel = $("#eqCountry");
  if (sel && typeof SHIP_TO !== "undefined") {
    sel.innerHTML = '<option value="">Select destination</option>' +
      SHIP_TO.map((s) => `<option value="${s.label}">${s.label}</option>`).join("");
  }

  function compose() {
    const v = (id) => ($(id)?.value || "").trim();
    const lines = [
      "Hello, I would like to make a research enquiry.",
      "",
      "Referral code: TN-REF5",
      v("#eqCountry") ? "Shipping destination: " + v("#eqCountry") : null,
      "",
      "Research material (Research Use Only, not for human consumption):",
      "- " + (v("#eqMaterial") || "[to be confirmed]") + " x " + (v("#eqQty") || "1") + " box(es)",
      "",
      v("#eqEmail") ? "Contact email: " + v("#eqEmail") : null,
      v("#eqNotes") ? "Notes: " + v("#eqNotes") : null,
      "",
      "Please confirm availability, pricing, shipping cost and certificate of analysis."
    ].filter((l) => l !== null);
    return lines.join("\n");
  }

  $("#eqWhatsapp")?.addEventListener("click", () => {
    // Product interest only in the props; the visitor's email never goes to analytics.
    if (window.plausible) {
      window.plausible("Enquiry: WhatsApp", { props: {
        source: "contact",
        material: ($("#eqMaterial")?.value || "unspecified").trim() || "unspecified",
        country: $("#eqCountry")?.value || "unset"
      }});
    }
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(compose()), "_blank", "noopener,noreferrer");
  });

  $("#eqEmailBtn")?.addEventListener("click", () => {
    if (window.plausible) {
      window.plausible("Enquiry: Email", { props: { source: "contact" } });
    }
    window.location.href = "mailto:health@trainnorthlabs.com" +
      "?subject=" + encodeURIComponent("Research enquiry") +
      "&body=" + encodeURIComponent(compose());
  });
})();

})();
