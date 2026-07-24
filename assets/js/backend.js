/* ==========================================================================
   Backend bridge — Supabase, progressive enhancement

   The site stays fully functional with no network: prices ship embedded in
   products.js as the fallback, and every enquiry path works offline. This
   layer, when it loads, does three optional things:

     1. Overrides embedded prices with the live `prices` table, so a price can
        be changed without a redeploy.
     2. Loads supplier shipping rates into the order page, so its "estimated
        total" can include shipping when rates exist.
     3. Logs each enquiry to a commission ledger via the log-enquiry edge
        function - PRODUCT DATA ONLY. Names, addresses and phone numbers are
        never sent; the function drops anything outside its allow-list, so the
        "nothing personal is stored" promise holds on both ends.

   The publishable key below is designed to be public. It is rate-limited and
   gated by row-level security: it can read prices and shipping, and insert
   into the ledger, and nothing else. It cannot read the ledger back.
   ========================================================================== */

window.TNL_BACKEND = (function () {
  "use strict";

  const URL = "https://mbkkzseigcklinnbqlwr.supabase.co";
  const KEY = "sb_publishable_-m7nP9v1ACF8Leg4mnGj8A_d4EQXCxI";
  const REST = URL + "/rest/v1/";
  const HEADERS = { apikey: KEY, Authorization: "Bearer " + KEY };

  /* Live prices, keyed "Product|label". Populated on first fetch; a miss falls
     through to the embedded price, so a partial or failed fetch never blanks a
     product. */
  const livePrices = new Map();
  let pricesReady = false;

  /* WhatsApp number pool. Enquiries are spread across these so no single
     supplier number collects enough cold first-contacts to get flagged. The
     fallback is the first pooled number, so even with no network an enquiry
     still reaches an intended destination rather than breaking. */
  const DEFAULT_WA = "85267941621";
  let waPool = [DEFAULT_WA];

  async function loadNumbers() {
    try {
      const r = await fetch(REST + "whatsapp_numbers?select=number&active=eq.true", { headers: HEADERS });
      if (!r.ok) return;
      const rows = await r.json();
      const nums = rows.map((row) => String(row.number).replace(/[^0-9]/g, "")).filter(Boolean);
      if (nums.length) {
        waPool = nums;
        rewriteLinks();
      }
    } catch (e) { /* offline: fallback pool stands */ }
  }

  function pickNumber() {
    return waPool[Math.floor(Math.random() * waPool.length)] || DEFAULT_WA;
  }

  /* Static "message the supplier" links carry data-wa. Each gets a freshly
     picked number on load, keeping any pre-filled ?text= intact. */
  function rewriteLinks() {
    document.querySelectorAll("a[data-wa]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const text = href.includes("?") ? href.slice(href.indexOf("?")) : "";
      a.setAttribute("href", "https://wa.me/" + pickNumber() + text);
    });
  }

  async function loadPrices() {
    try {
      const r = await fetch(REST + "prices?select=product_name,variant_label,price_usd", { headers: HEADERS });
      if (!r.ok) return;
      const rows = await r.json();
      rows.forEach((row) => livePrices.set(row.product_name + "|" + row.variant_label, Number(row.price_usd)));
      pricesReady = true;
      // Let any already-rendered catalogue refresh itself.
      window.dispatchEvent(new CustomEvent("tnl:prices"));
    } catch (e) { /* offline: embedded prices stand */ }
  }

  function priceFor(name, label, fallback) {
    const v = livePrices.get(name + "|" + label);
    return typeof v === "number" && isFinite(v) ? v : fallback;
  }

  async function loadShipping() {
    try {
      const r = await fetch(REST + "shipping_rates?select=country_code,cost_usd,days_label", { headers: HEADERS });
      if (!r.ok) return {};
      const rows = await r.json();
      const out = {};
      rows.forEach((row) => { out[row.country_code] = { cost: Number(row.cost_usd), days: row.days_label }; });
      return out;
    } catch (e) { return {}; }
  }

  /* Fire-and-forget ledger write. Never blocks the WhatsApp hand-off and never
     surfaces an error to the visitor - a failed log must not stop an enquiry.
     Only product fields are passed; the edge function enforces this too. */
  function logEnquiry(payload) {
    try {
      const body = JSON.stringify({
        source: payload.source,
        items: (payload.items || []).map((i) => ({ ref: i.ref, label: i.label, qty: i.qty })),
        boxes: payload.boxes || 0,
        value_usd: payload.value_usd || 0,
        country: payload.country || "unset",
        wa_number: payload.wa_number || "unset"
      });
      // keepalive lets the request survive the tab navigating to WhatsApp.
      fetch(URL + "/functions/v1/log-enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true
      }).catch(() => {});
    } catch (e) { /* logging is best-effort */ }
  }

  loadPrices();
  loadNumbers();

  return { priceFor, loadShipping, logEnquiry, pickNumber, pricesReady: () => pricesReady };
})();
