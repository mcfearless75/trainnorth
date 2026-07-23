#!/usr/bin/env python3
"""
Generates the two hand-written sub-pages: /ai-training/ and /contact/.
Shares the shell from build_pages.py so header, footer and compliance
furniture stay identical across every route.

Run:  python tools/build_static.py
"""

import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_pages import head, FOOT, write, SITE, WA, esc  # noqa

# --------------------------------------------------------------------------
# AI training
# --------------------------------------------------------------------------

BENEFITS = [
    ("Session memory", "The log remembers the last time you trained the same movement, so the comparison is against a record rather than a recollection."),
    ("Progress beyond the top set", "An extra rep at the same load, a cleaner last set, or less fatigue at the same volume all count as progress and all get noticed."),
    ("A plan built for the day", "Poor sleep, a sore shoulder, a busier gym. The session adapts to the conditions instead of overriding them."),
    ("Weekly volume tracking", "Sets per muscle group per week, so a priority area cannot quietly get neglected for a month."),
    ("Realistic load selection", "Suggested weights come from what you actually lifted last time, not from a percentage of a max you set two years ago."),
    ("Equipment substitution", "A taken rack or a different gym produces a sensible alternative rather than a skipped exercise."),
    ("Bad day versus real plateau", "Distinguishing a genuinely stalled lift from one bad session is the single most useful thing a written record does."),
    ("A finished session report", "Paste the results in and get a summary, what moved, and a starting point for next time."),
]

STEPS = [
    ("Name the session", "Push, pull, legs, cardio, or a specific accessory day."),
    ("Add the conditions", "Energy, sleep, any pain, time available, which gym, and what you want to prioritise."),
    ("Let it read the history", "Previous loads and reps for the same movements, and where the trend is going."),
    ("Take the plan", "Exercises, sets, rep ranges and a starting load for each."),
    ("Log as you go", "Every set, live, in whatever shorthand you can type between sets."),
    ("Get the review", "What improved, what held, what to change, and what to watch."),
    ("Carry it forward", "The review becomes the opening context for the next session."),
]

PROMPTS = [
    ("Set up the log (use once)",
     """You are my training log and planning assistant. You are not my coach, my physiotherapist or my doctor, and you must not give medical advice.

My details:
- Age: [AGE]
- Height and current weight: [HEIGHT] / [WEIGHT]
- Sessions per week: [NUMBER]
- Split: [e.g. push / pull, upper / lower, full body]
- Session length: [MINUTES]
- Main goal this block: [e.g. keep muscle while losing fat]
- Priority areas: [e.g. upper back, lateral delts]
- Injuries or limitations: [LIST, or "none"]
- Equipment available: [commercial gym / home setup / list]

Rules I want you to follow:
1. Compare every session against my previous logged session for the same movements.
2. Treat extra reps, better control, or lower fatigue at the same load as progress.
3. Never suggest a load I have not worked up to from my own logged history.
4. If I report pain, reduce or substitute the movement and say why.
5. Keep the plan inside my stated session length.

Confirm you have this, then wait for my first session."""),

    ("Before a session",
     """Today: [SESSION TYPE].

Conditions:
- Sleep: [HOURS / quality]
- Energy out of 10: [N]
- Pain or niggles: [WHERE, or "none"]
- Time available: [MINUTES]
- Gym: [usual / different / home]

Give me the session: exercises, sets, rep ranges and a starting load for each, based on what I lifted last time. Flag anything you have changed because of the conditions above."""),

    ("Logging as you go",
     """[EXERCISE] [LOAD] x [REPS], [LOAD] x [REPS], [LOAD] x [REPS]

Example format: Incline dumbbell press 32kg x 9, 32kg x 8, 30kg x 9

Just record it. Do not comment until I ask for the review."""),

    ("After the session",
     """Session finished. Here is everything I logged:

[PASTE THE SETS]

Give me:
1. What genuinely progressed against last time, and by how much.
2. What held steady.
3. Anything that went backwards, and the most likely reason.
4. The starting point for next time on each movement.

Be specific about numbers. Do not pad it with encouragement."""),

    ("When a lift stalls",
     """[EXERCISE] has not moved for [NUMBER] sessions. Here is the history:

[PASTE THE LAST 4-6 SESSIONS FOR THAT MOVEMENT]

Is this a genuine plateau or noise from fatigue, sleep or session order? If it is a real plateau, give me two options to break it that fit my current split and session length."""),

    ("Weekly review",
     """Here is the whole week:

[PASTE ALL SESSIONS]

Give me: total working sets per muscle group, whether my stated priority areas got enough volume, anything that is drifting, and one change for next week. One change, not five."""),
]

FAQ = [
    ("Can AI actually coach me?",
     "No. It cannot see you move, does not know your history, and has no idea what a set felt like unless you tell it. What it can do is remember every session you have logged and compare them without flattering you. Treat it as a very good training diary that does arithmetic, not as a coach."),
    ("Does this replace a personal trainer?",
     "No. A trainer watches the rep and corrects it in real time. That is a different job and this does not do it. If something hurts, or a movement feels wrong, that is a question for a coach or a physiotherapist, not a chat window."),
    ("How detailed does the log need to be?",
     "More detail gives better output, but the floor is low. Exercise, load, sets and reps is enough to be useful. Adding energy, sleep and any pain is what turns it from a record into something that can explain a bad session."),
    ("What if I train somewhere different?",
     "Say so before the session. Machines differ between gyms and a higher number on an unfamiliar machine is not evidence of a stronger muscle. A log that does not know you changed gym will read the change as progress."),
    ("Can it assess my technique?",
     "Not from text, and video analysis is a specialist skill. If a movement is painful or feels wrong, stop asking software and ask a professional."),
    ("Does this work while cutting as well as bulking?",
     "Yes, provided you state which one you are in. Holding a load during a deficit is progress, and a log that has not been told about the deficit will record it as stalling."),
]

def ai_training():
    benefits = "".join(
        f"""<article class="feature"><div class="feature__index">{i+1:02d}</div>
        <h3>{esc(t)}</h3><p>{esc(d)}</p></article>""" for i, (t, d) in enumerate(BENEFITS))

    steps = "".join(f"<li><div><h3>{esc(t)}</h3><p>{esc(d)}</p></div></li>" for t, d in STEPS)

    prompts = ""
    for i, (title, text) in enumerate(PROMPTS):
        prompts += f"""
      <div class="prompt">
        <div class="prompt__head">
          <span class="prompt__title">{esc(title)}</span>
          <button class="btn btn--sm btn--ghost prompt__copy" type="button" data-copy="p{i}">Copy</button>
        </div>
        <pre id="p{i}">{esc(text)}</pre>
      </div>"""

    faq = "".join(
        f"<details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in FAQ)

    body = f"""
<article class="pg">
  <div class="shell">
    <nav class="pg__crumb" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <span aria-current="page">AI training</span>
    </nav>

    <header class="pg__head">
      <span class="eyebrow">The method</span>
      <h1 class="display">The plan is written <em>after</em> the session.</h1>
      <p class="lead">Not a rigid twelve-week programme. A session journal that remembers what
      you actually lifted, compares it honestly, and builds the next day from the result.
      Every prompt below is published in full, free, with nothing held back.</p>
      <p class="pg__ruo">AI assists with planning and record-keeping. It does not replace a coach,
      a physiotherapist or a doctor.</p>
    </header>

    <section class="pg__block">
      <h2>Why a log, not a coach</h2>
      <p class="muted">The useful thing here is memory, not intelligence. Most training stalls
      because nobody can remember what they did five weeks ago, so the comparison never happens
      and the same three loads get repeated indefinitely. Written down, that becomes obvious in
      a fortnight.</p>
      <p class="muted">The quality of what comes back is entirely a function of what goes in.
      Exercise, load, sets, reps, energy and any pain. Vague input produces confident nonsense,
      which is worse than no plan at all.</p>
    </section>

    <section class="pg__block">
      <h2>What it actually gives you</h2>
      <div class="feature-grid">{benefits}</div>
    </section>

    <section class="pg__block">
      <h2>The process</h2>
      <ol class="steps">{steps}</ol>
    </section>

    <section class="pg__block">
      <h2>The prompts</h2>
      <p class="muted">Copy these into any assistant. Fill in anything in [square brackets].
      Start with the setup prompt once, then use the others per session.</p>
      {prompts}
    </section>

    <section class="pg__block">
      <h2>Questions</h2>
      <div class="faq">{faq}</div>
    </section>

    <p class="pg__disclaimer">
      <strong>Not medical or clinical advice.</strong> This describes a personal record-keeping
      method. It is not a training prescription, not physiotherapy, and not suitable as a
      substitute for professional assessment of pain or injury.
    </p>
  </div>
</article>
"""
    return write("ai-training/index.html",
                 head("AI-Assisted Training — The Method and Every Prompt | TRAINNORTH:LABS",
                      "A session journal method using AI as a training log rather than a coach. The full prompt set published free: setup, pre-session, live logging, post-session review, plateau diagnosis and weekly review.",
                      SITE + "/ai-training/") + body + FOOT)

# --------------------------------------------------------------------------
# Contact
# --------------------------------------------------------------------------

def contact():
    body = f"""
<article class="pg">
  <div class="shell">
    <nav class="pg__crumb" aria-label="Breadcrumb">
      <a href="/">Home</a> <span aria-hidden="true">/</span>
      <span aria-current="page">Contact</span>
    </nav>

    <header class="pg__head">
      <span class="eyebrow">Get in touch</span>
      <h1 class="display">Contact</h1>
      <p class="lead">Questions about the library, the grading, or the research materials.
      No medical consultations and no dosing advice, in either direction.</p>
      <p class="pg__ruo">18+ only. Research use only. Not for human consumption. Not medical advice.</p>
    </header>

    <div class="contact-cards">
      <a class="contact-card" href="mailto:health@trainnorthlabs.com">
        <h2>Email</h2>
        <p>Research, content and correction enquiries. Corrections with a citation are genuinely welcome.</p>
        <span class="contact-card__val">health@trainnorthlabs.com</span>
      </a>
      <a class="contact-card" href="https://wa.me/{WA}" target="_blank" rel="noopener noreferrer">
        <h2>Supplier WhatsApp</h2>
        <p>Goes to the independent supplier, not to TRAINNORTH:LABS. Availability, pricing and shipping.</p>
        <span class="contact-card__val">+852 5644 0181</span>
      </a>
    </div>

    <section class="pg__block">
      <h2>Research enquiry</h2>
      <p class="muted">Confirm the statements below to open the enquiry form. This form takes no
      payment and stores nothing: it assembles a message that you send yourself.</p>

      <div class="gate" id="gate">
        <span class="eyebrow">Before you continue</span>
        <label class="gate__check">
          <input type="checkbox" data-gate>
          <span>I am 18 or over.</span>
        </label>
        <label class="gate__check">
          <input type="checkbox" data-gate>
          <span>I understand these materials are supplied for laboratory research only and are not for human consumption.</span>
        </label>
        <label class="gate__check">
          <input type="checkbox" data-gate>
          <span>I understand TRAINNORTH:LABS is not a pharmacy, does not sell or dispatch anything, and does not provide medical advice.</span>
        </label>
        <button class="btn btn--primary gate__btn" type="button" id="gateBtn" disabled>Open the enquiry form</button>
      </div>

      <form class="enquiry" id="enquiry" hidden onsubmit="return false">
        <div class="field">
          <label for="eqMaterial">Research material</label>
          <input id="eqMaterial" type="text" placeholder="e.g. BPC-157 10mg" autocomplete="off">
        </div>
        <div class="field-row">
          <div class="field">
            <label for="eqQty">Quantity (boxes)</label>
            <input id="eqQty" type="number" min="1" value="1" inputmode="numeric">
          </div>
          <div class="field">
            <label for="eqCountry">Shipping country</label>
            <select id="eqCountry"></select>
          </div>
        </div>
        <div class="field">
          <label for="eqEmail">Your email</label>
          <input id="eqEmail" type="email" placeholder="you@example.com" autocomplete="email">
        </div>
        <div class="field">
          <label for="eqNotes">Anything else</label>
          <textarea id="eqNotes" placeholder="Certificate of analysis, batch questions, timing"></textarea>
        </div>

        <div class="hero__actions">
          <button class="btn btn--primary btn--whatsapp" type="button" id="eqWhatsapp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Send via WhatsApp
          </button>
          <button class="btn btn--ghost" type="button" id="eqEmailBtn">Send by email instead</button>
        </div>

        <p class="dim" style="font-size:var(--text-xs); margin-top:var(--space-4)">
          Nothing is submitted to this website and no data is stored here. The button opens
          WhatsApp or your mail client with the message pre-written, and you send it yourself.
          The supplier is an independent third party; TRAINNORTH:LABS receives a referral
          benefit on orders placed with the code TN-REF5.
        </p>
      </form>
    </section>

    <p class="pg__disclaimer">
      <strong>No medical consultations.</strong> Questions about whether something is suitable
      for you, what to take, or how much, cannot be answered here and will not be. Those belong
      with a qualified physician who knows your history. Corrections to the research notes,
      with a citation, are always welcome.
    </p>
  </div>
</article>
"""
    return write("contact/index.html",
                 head("Contact — Research Enquiries | TRAINNORTH:LABS",
                      "Contact TRAINNORTH:LABS about the compound library, evidence grading or research materials. 18+ only. No medical consultations or dosing advice.",
                      SITE + "/contact/") + body + FOOT)


if __name__ == "__main__":
    print("written:", ai_training())
    print("written:", contact())
