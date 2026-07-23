#!/usr/bin/env python3
"""
Generates /order/ - the two-step research enquiry hand-off.

Step 1 reviews the basket carried over from the catalogue. Step 2 collects the
details the supplier would otherwise have to ask for, then opens WhatsApp with
the whole thing written out.

Deliberately not a checkout. No payment is taken, no data reaches this site,
and the visitor sends the message themselves.

Run:  python tools/build_order.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_pages import head, FOOT, write, SITE, WA, ASSET_V  # noqa: E402

WA_ICON = (
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" '
    'focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15'
    '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48'
    '-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497'
    '.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371'
    '-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074'
    '.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758'
    '-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 '
    '9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 '
    '4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 '
    '9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 '
    '4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893'
    '-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>'
)

NEXT_STEPS = [
    "Your enquiry opens in WhatsApp, addressed to the independent supplier. You send it.",
    "The supplier confirms availability and gives you a final quotation.",
    "Payment instructions come from the supplier, never from this site.",
    "Once payment is confirmed with them, the order is prepared.",
    "Tracking is shared by the supplier when it is available.",
]


def build() -> str:
    url = f"{SITE}/order/"

    steps = "".join(
        f'<li><span class="ord-next__n">{i + 1}</span><p>{s}</p></li>'
        for i, s in enumerate(NEXT_STEPS)
    )

    body = f"""
<article class="pg ord">
  <div class="shell shell--narrow">
    <nav class="pg__crumb" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <a href="/research-materials/">Research materials</a> <span aria-hidden="true">/</span>
      <span aria-current="page">Research enquiry</span>
    </nav>

    <header class="pg__head ord__head">
      <span class="eyebrow">Research enquiry &middot; 2 steps</span>
      <h1 class="display">Research enquiry</h1>
      <p class="lead">Review your selection, add the shipping details, then open WhatsApp to the
        independent supplier. The message is written for you and you send it yourself. This is not
        a checkout, and TRAINNORTH:LABS is not a pharmacy.</p>
      <p class="pg__ruo">For laboratory research use only &middot; not for human consumption &middot;
        reference prices are per box of ten vials &middot; 18+</p>
    </header>

    <ol class="ord-stepper" aria-label="Progress">
      <li class="ord-stepper__dot" data-step="1" data-state="current"><span>1</span><em>Materials</em></li>
      <li class="ord-stepper__dot" data-step="2" data-state="todo"><span>2</span><em>Shipping</em></li>
    </ol>

    <!-- Step 1 -->
    <section class="ord-step" data-step="1">
      <div class="ord-card">
        <div class="ord-card__head">
          <h2>1. Your materials</h2>
          <a href="/research-materials/">&larr; Price list</a>
        </div>
        <div id="ordLines"></div>
        <div id="ordTotals"></div>
        <p id="ordEmpty" hidden class="dim">
          Your enquiry is empty. <a href="/research-materials/">Choose research materials</a> first.
        </p>
      </div>

      <div class="field" style="margin-top: var(--space-5)">
        <label for="ordCountry">Shipping country</label>
        <select id="ordCountry"></select>
      </div>

      <div class="ord-actions">
        <button class="btn btn--primary" type="button" id="ordNext">Next: shipping &rarr;</button>
      </div>
    </section>

    <!-- Step 2 -->
    <section class="ord-step" data-step="2" hidden>
      <div class="ord-note">
        <strong>Why this is asked for</strong>
        <p>These details go into the WhatsApp message so the supplier can quote immediately instead
          of asking you for the same information twice. Nothing is submitted to this website and
          nothing is stored here.</p>
      </div>

      <div class="ord-card">
        <h2>Contact details</h2>
        <div class="field">
          <label for="ordName">Full name <span class="req">*</span></label>
          <input id="ordName" type="text" autocomplete="name" placeholder="Jane Smith">
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ordEmail">Email <span class="req">*</span></label>
            <input id="ordEmail" type="email" autocomplete="email" placeholder="you@example.com">
          </div>
          <div class="field">
            <label for="ordPhone">Phone (with country code) <span class="req">*</span></label>
            <input id="ordPhone" type="tel" autocomplete="tel" placeholder="+44 7700 900123">
          </div>
        </div>
        <div class="field">
          <label for="ordAddress">Address <span class="req">*</span></label>
          <input id="ordAddress" type="text" autocomplete="street-address" placeholder="12 Example Street">
        </div>
        <div class="field-row">
          <div class="field">
            <label for="ordCity">City <span class="req">*</span></label>
            <input id="ordCity" type="text" autocomplete="address-level2" placeholder="Manchester">
          </div>
          <div class="field">
            <label for="ordRegion">County / region</label>
            <input id="ordRegion" type="text" autocomplete="address-level1" placeholder="Greater Manchester">
          </div>
          <div class="field">
            <label for="ordPostcode">Postcode <span class="req">*</span></label>
            <input id="ordPostcode" type="text" autocomplete="postal-code" placeholder="M1 1AA">
          </div>
        </div>
        <div class="field">
          <label for="ordNotes">Notes (optional)</label>
          <textarea id="ordNotes" placeholder="Certificate of analysis, batch questions, delivery preferences"></textarea>
        </div>
      </div>

      <div class="ord-card">
        <h2>Delivery address</h2>
        <p class="muted">Is the address above also where the shipment should go?</p>
        <label class="ord-opt">
          <input type="radio" name="ordDeliver" value="same" checked>
          <span><strong>Yes, use the same address</strong><em>Contact address is the delivery address</em></span>
        </label>
        <label class="ord-opt">
          <input type="radio" name="ordDeliver" value="different">
          <span><strong>No, ship somewhere else</strong><em>Enter a separate delivery address</em></span>
        </label>

        <div id="ordAlt" hidden style="margin-top: var(--space-4)">
          <div class="field">
            <label for="ordAltAddress">Delivery address</label>
            <input id="ordAltAddress" type="text">
          </div>
          <div class="field-row">
            <div class="field"><label for="ordAltCity">City</label><input id="ordAltCity" type="text"></div>
            <div class="field"><label for="ordAltRegion">County / region</label><input id="ordAltRegion" type="text"></div>
            <div class="field"><label for="ordAltPostcode">Postcode</label><input id="ordAltPostcode" type="text"></div>
          </div>
          <div class="field">
            <label for="ordAltCountry">Country</label>
            <input id="ordAltCountry" type="text">
          </div>
        </div>
      </div>

      <div class="ord-card">
        <h2>Payment preference</h2>
        <p class="muted">A preference passed to the supplier. No payment is processed on this
          website and none of these details reach TRAINNORTH:LABS.</p>
        <label class="ord-opt">
          <input type="radio" name="ordPay" value="USDT" checked>
          <span><strong>USDT</strong><em>No commercial transaction fee applied by the supplier</em></span>
        </label>
        <label class="ord-opt">
          <input type="radio" name="ordPay" value="Bank transfer">
          <span><strong>Bank transfer</strong><em>The supplier adds a commercial handling fee, around 5%</em></span>
        </label>
      </div>

      <div class="ord-card">
        <h2>What happens next</h2>
        <ol class="ord-next">{steps}</ol>
      </div>

      <p class="ord-error" id="ordError" hidden>Please complete the required fields marked with an asterisk.</p>

      <div class="ord-actions ord-actions--split">
        <button class="btn btn--ghost" type="button" id="ordBack">&larr; Back</button>
        <button class="btn btn--primary btn--whatsapp" type="button" id="ordSend">{WA_ICON} Contact supplier</button>
      </div>

      <p class="dim" style="font-size:var(--text-xs); text-align:center; margin-top:var(--space-4)">
        Nothing is sent automatically. WhatsApp opens with the message written out and
        <strong>you approve and send it</strong>.
      </p>
    </section>

    <p class="pg__disclaimer">
      <strong>Disclaimer &mdash; Research Use Only.</strong> Materials are supplied for laboratory
      research only, are not intended for human consumption, and the majority are not approved as
      medicines in the United Kingdom. Several are prescription-only medicines. Totals shown are
      estimates; the independent supplier confirms final pricing, shipping and availability, and
      handles all payment and dispatch. TRAINNORTH:LABS holds no stock, takes no payment and
      receives a referral benefit on orders placed with the code. Nothing here is medical advice.
      Consult a qualified physician before making any health decision. 18+.
    </p>
  </div>
</article>

<script src="/assets/js/order.js?{ASSET_V}" defer></script>
"""

    return write(
        "order/index.html",
        head(
            "Research Enquiry — Review and Send | TRAINNORTH:LABS",
            "Review your selected research materials, add shipping details, and send the enquiry "
            "to the independent supplier by WhatsApp. Not a checkout. Research use only. 18+.",
            url,
            '<meta name="robots" content="noindex, follow">',
        ) + body + FOOT,
    )


if __name__ == "__main__":
    print("written:", build())
