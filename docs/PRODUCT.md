# Becoming — product (v1)

Codename history: "Goon App" (placeholder) → "Pacer" → **Becoming**.

## Positioning (Christian, 2026-11-14 — supersedes earlier wedge talk)

**Becoming is a scrapbook of your life that organizes itself, with a partner who knows you,
that becomes the next social platform once enough of your friends are on it.**

- **Why now:** people already log their lives (Beli, Strava, Letterboxd, Goodreads, Notes,
  camera rolls). Logging is identity. It's split across apps, none of them understands you, and
  none helps you stay close to the people in it.
- **Everyone joins for their own reason.** Lifts, restaurants, reading, staying close to
  friends from home. Becoming becomes *their* thing first, in their words, then widens.
  One product, a different way in for each person.
- **Differentiator 1: being known.** Pip remembers your real days, notices patterns, connects
  things to people, and gets better as models do. Cuteness is copyable (Finch); being known isn't.
- **Differentiator 2: relationships.** People are getting disconnected. "ask Sam how econ
  went" works on day one with zero friends on the app, and those people become the social graph.
- **Not a goal-achievement platform.** Directions with week / month / year horizons are
  optional and in your words; never the center.
- **Onboarding is almost none.** Open it, Pip says hi, start keeping. Pip proposes collections
  in your words after a few keeps. At most one optional question. Everything editable; nothing locked.
- **Build order:** today's page with live tags → people pages + nudges → 10pm wind-down (one
  good thing) → Yours as the scrapbook of you → the Sunday letter → zero-friction onboarding →
  ten real people → design the social layer from what they actually keep.

## Vision (short)

People in their twenties feel themselves drifting into empty routines and endless scrolling.
Blockers take distractions away, but there is always another one. Becoming adds something
in their place: **a running partner for your life**. It helps you see what matters to you,
sets a pace, checks in when you'd rather stop, and over time shows you who you're becoming.
Later, a social layer will help friends stay involved in each other's lives without posting
for an audience. v1 is the personal partner only, built for one user (Christian).

## Why the personal companion comes first (Christian, 2026-11-12)

Social apps die at the cold start: nobody wants to be the first user, and a feed with no friends
is empty. Becoming has to be worth opening **alone, on day one**: the capture, the collections,
the companion, the weekly reflection all pay off for a single person with zero friends on it.
That is the initial reason to use the app. Friends come later *because* you already use it,
not as the reason you start. Every v1 feature should pass the test: "is this valuable with one
user?" If not, it belongs to the social layer, later.

This is also why UI and the feeling of using it matter as much as any feature: for a solo
product, the experience *is* the retention.

## Distinctly human and homey (Christian, 2026-11-12)

As AI agents get better at remembering and tracking on their own, "an app that remembers
things about you" stops being a differentiator. What won't commoditize is how it *feels*:
Becoming should feel distinctly human and homey, a place rather than a feature. That is the
bar for every design choice.

Design direction agreed after two rounds of mockups:
- **Modern, natural, a little sexy.** Curves over corners, movement over static, warmth over
  minimalism. Simple like BeReal, fun like Duolingo, never as dense as Whoop. If it's boring,
  it's wrong; if it's complex, it's wrong.
- **Capture opens clean.** Just the box and what you kept. No greeting, no prompt, no agenda
  on the first screen. Direction and encouragement come from the companion's presence and from
  Look back, not from text at the top of Capture.
- **The companion is ambient, not chatty.** It pops, moves, reacts. It does not open every
  screen with a question. It speaks rarely, and when it does it matters.
- **Yours** (collections as colored tiles) is right. Keep refining, don't rethink.
- **Look back** leads with insights the app tracks automatically, through lenses the user chose
  ("how does the gym affect my mood", "am I seeing people enough"). The reflection
  conversation sits at the bottom, not the top.

## Benefit from better models, don't get replaced by them (Christian, 2026-11-12)

Models will keep getting better at remembering, noticing and advising. Becoming must get
*better* when that happens, not obsolete. Rules for building:
- **The partner's intelligence is swappable.** One module (`src/lib/partner/`) talks to the
  model; nothing else knows which model. A better model = a better Becoming, overnight.
- **Accumulate what models can't conjure:** years of captures, collections in the user's
  words, lenses they chose, next steps accepted or skipped. Structured, personal, consented.
  Every schema choice should make that record richer for whatever reads it later.
- **The feel is ours.** Character, motion, homeyness, the companion. A lab ships a chat box,
  not a place you'd want to live.
- **Later, the social graph:** who trusts whom with what. No model improvement produces it.
- **Never write cleverness the model will do better next year; always write structure the
  model will need forever.** No bespoke ML, no hand-tuned heuristics where a prompt will do.

Design decisions 2026-11-12, after round 4: **light theme** by default (dark follows the phone
later), monochrome base, color only from the user's photos and one accent on the companion and
active states, collections marked by a small dot not a tinted tile. The companion is a **circle**,
not a blob; its character gets its own pass later.

## Identity and references (Christian + Claude, 2026-11-12 evening)

- **Moat = habit + consented data + (later) network.** The human aspect earns the habit; it is
  not the moat on its own. Everything the model does is delivered through the companion, so the
  intelligence reads as a character, not a feature. Success test: "the little guy who checks
  in on me", not "an AI journal".
- **Intentionality, in order:** (1) a daily moment, BeReal-style, at a random time in the
  user's window; (2) a morning intention line on Keep, mornings only; (3) the companion reacts
  to your rhythm (arrival after quiet days = curious, never sad); (4) a week of seven soft dots
  on Yours, no counter; (5) curiosity about yourself from Look back. Never streaks.
- **Kawaii companion, hopecore voice.** Round, big eyes, soft, a little clumsy; copy is
  earnest and warm, "it's going to be okay", never ironic. This is the register for every
  word the app says.
- **Pinterest, gleaned:** keeping is an act of taste; collections get cover images from the
  user's photos; Yours should look like boards you're proud of; never a blank state. Not
  gleaned: the infinite feed. Our engagement is recognition, not discovery.
- **A student's week:** capture in the gaps (between classes, gym, meals, 1 a.m.), under ten
  seconds including unlock; camera-roll photo one tap; dictation works. Weekday = feed it,
  weekend = it feeds you.
- **Positive reinforcement, only what's supported:** immediate feedback (companion reaction),
  variable rewards (reactions vary), implementation intentions (morning line), spaced
  reflection (weekly Look back), self-affirmation (Yours). No overclaiming.
- **How We Feel, gleaned:** one-tap, one-word check-ins and emotional granularity work. Ours is
  an *optional* one-tap feeling after a keep (four soft colors, vanishes if ignored) that gives
  lenses a mood signal. Never required, never during.
- **Glass:** translucent layered surfaces over photos; try the bar first. It should feel
  current and cool to be on.
- **The partner gives, not just takes** (Christian, 2026-11-13). In a busy week there may be
  nothing to log. Then the partner hands you one small thing that serves a goal you named: a
  six-minute read, a video, an idea. Keeping or doing it counts. One thing, never a feed;
  optional; always tied to a collection or goal of yours. Needs the API.
- **The companion is the running partner** helping you reach the version of yourself you
  chose. Yours is the Pinterest board of who you are; keeping is pinning yourself.
- **Behavioral principles** get their own doc (`docs/BEHAVIOR.md`): only what has evidence,
  with sources, each mapped to where it shows up in the app.

## Notes-app feel, item structure (Christian, 2026-11-13)

Why here instead of Notes: this is your notes app, plus sorting, plus (later) social.
Nothing is locked: tap any kept thing to edit in place, add to it, delete it, move it. Keep
reads as today's page (lines, not cards). Underneath, each thing keeps its time and, once
filed, a collection; that is the only structure and it stays invisible until Look back or Yours
needs it. Filing is a suggestion you can change with a tap, never a lock. End of day, the
partner files what it can and leaves the rest with a one-tap chooser ("Filing tonight").
**Days close** (Christian, 2026-11-13): once a day is over, what you kept can't be rewritten,
only annotated: add a note to it later, from a later self. The record stays honest.

## Honest evaluation, 2026-11-13 (Claude, at Christian's request)
Less slick than BeReal, and color is ~20% of why. The rest: too many concepts on the first
screen (BeReal is one idea); photos aren't the hero (should be full-bleed); built from defaults,
not crafted (no transitions, pressed states, haptics); only seen in a desktop browser, never on
a phone; off-white + coral reads "wellness app". Plan: deploy to the phone first, then palette
(pure white / near-black, photos as the color, companion the one accent), then a subtraction
pass on Keep, then a craft pass.

## Evaluation and direction, 2026-11-13 night (Claude, at Christian's request)
Honest state: a nicer Notes app with a mascot. Students will use it when (1) it taps them once
a day at a moment they'd otherwise scroll, (2) Sunday says something true they didn't notice,
(3) it knows their people. Build order from here: deploy → **people as first-class** (a person
has a page: last seen, into, things to ask, something owed; entries can mention a person; the
partner notices silence) → Pip in code (spin, expressions from what you kept, "I'm sorry" for
hard things) → daily moment → lenses + the Sunday question.

Decided against (Christian's voice-memo idea, the half that doesn't fit): scoring mental health
or prescribing exercises. The partner is not a therapist; observation ("your lift days read
lighter"), never diagnosis. Kept: voice as a capture mode; a one-tap feeling after a keep;
feelings over time as a lens.

**Companion: Pip** (big eyes, blush, nothing else). It should spin, change expression with
what you kept, and say sorry when something is hard.

## Decisions 2026-11-14 (after round 5)

- **Day is home.** Today's page; earlier days below. Nothing needs filing.
- **The partner tags as you keep**: collection, people, goal. Tap a tag to change or remove it.
  Replaces File now, "Filing tonight" and the required collections picker.
- **Collections and people are views** of your days, never folders. Anything that mentions a
  person shows up on their page automatically (the relationships second brain).
- **Directions, not goals.** In your own words, no progress bars or percentages; under each,
  what you kept that moved you that way. A number only if you ask for one.
- **The weekly letter** is Look back: a few specific sentences from Pip, photos, people, one question.
- **Three touches a day, under two minutes**: the moment (random, daytime); the wind-down at
  **10pm** (mood + energy sliders with Pip's face following live, then one good thing); Pip's
  one suggestion whenever you open it. Plus resurfacing ("a month ago today").
- **Pip mirrors you, with care**: sleepy when you're tired, soft and close when you're low
  ("oh no. I'm sorry."), a hop when it's good, lights up when you come back. Never sad *at* you.
  Spins on keep, giggles when tapped, eyes follow, dozes after midnight.
- **Mental health, healthy version**: notice what lifts you; small good things; optional
  feeling naming; kindness on hard days; people as the strongest lever; rest counts. Mood data
  is private and never shown as a score. Distress → plainly an AI, 988.
- **Redirect, don't just block** (later): an opt-in iOS Shortcuts automation opens Becoming when
  you open Instagram/TikTok, with a memory, a friend to text or one good thing, and a
  "continue" button. Real interception (Screen Time API) needs a native app.
- **Facts and recommendations**: occasional (a fact at most every few days), tied to your
  interests and directions. Facts come from Wikipedia's "Did you know" / "On this day" (free to
  reuse with credit): fetched, the closest match picked by the partner, said in Pip's voice with
  the source one tap away. Never invented. Guinness and similar are linked to, never copied.
- **Voice: a kawaii C-3PO.** See `docs/VOICE.md`; enforced by `src/lib/voice.test.ts`.
- **Black by default.**

## Principles

1. **Seconds to capture.** Open, type or snap, done. No required fields.
2. **Success is life off the phone:** things done and a better understanding of yourself.
   Time in the app is not the goal.
3. **No streaks, no guilt.** A first attempt, a changing interest, or a hard week counts.
   Missing a day never erases anything.
4. **Your direction, not optimization.** There's no single best version of a person.
5. **A scrapbook, not a journal.** Photos, quotes, outfits, a restaurant, a lift PR all belong.

## The partner's character

- Openly an AI. **Never pretends to be human**, never claims feelings or a life of its own.
- **Not a therapist** and doesn't act like one: no diagnosing, no clinical framing.
  If someone seems to be in crisis, it says plainly that it's an AI and points to real help
  (in the US, call or text 988).
- Warm, brief, a little playful. Asks one good question rather than five.
- Has a small animated **companion** that lives in the app: hops between panes, says hello,
  reacts when you log something. It celebrates and keeps you company; it never nags or droops.
  Reminders come only through the check-ins you configured. It's the face of "openly an AI".
- **After, not during.** The partner never interrupts a moment. It catches up afterward:
  "anything from today worth keeping?", or, from a photo's time and place, "this looks like
  Bryant Park on Tuesday?". The app has a reserved slot for the companion from the shell on.
- Encourages real-world connection over talking to it.

## v1 core loop

1. **Drop it in.** Text and/or photo from the home screen in seconds. Voice = keyboard dictation
   for now; a real voice/talk-to-it mode is a later version (Christian, 2026-11-12).
2. **Collections, in your words.** (Decided 2026-11-12, replacing fixed Goals/Taste/People.)
   - **First open:** the partner asks one thing, "what do you want to keep track of?", and
     shows ~12 suggestions to tap into (lifts, places I ate, reading, people, ideas, outfits,
     quotes, art, work, places, small wins, questions) plus a box for your own. Starting with
     nothing is allowed. Nothing is permanent: rename, add, drop later.
   - **Any time:** "keep track of something new" on the You pane. Later: say it to the partner.
   - **Emergent (later, needs the API):** the partner proposes a collection when it notices a
     pattern ("you've logged four restaurants, want a place for them?"), and auto-files new
     captures into your collections with one tap to move. Collections are also the base for
     recommendations: it can only suggest ramen on Thursday if ramen is something you track.
   - Each collection records its `origin` (suggested / user / partner) so we can learn which
     ones actually get used.
3. **Three panes, bottom bar.** Decided 2026-11-12 with Christian:
   - **Capture** (landing): the box, with today's log underneath so a save is visibly real.
   - **You** (widgets): a Today widget plus one card per collection. Cards are summaries;
     tapping one opens that collection as a scrollable scrapbook. Check-ins join later.
   - Pane names are placeholders; Christian wants softer words. Decided in the design pass.
   - **Reflect**: "this week so far" (counts, a few recent photos, one line from the partner)
     until reflection unlocks after ~7 days; then reflections and insights live here.
   A bottom bar is the primary navigation (reliable on iOS, deep-linkable from notifications);
   swiping between panes is a bonus kept only if it doesn't fight vertical scrolling.
   UI quality is a top priority.
4. **Check-ins.** Push notifications: a morning "what do you want to get done today?" plus
   1–2 random check-ins in a window (default 10am–9pm), adjustable, with quiet hours.
   Tapping opens a quick reply; replies are saved as entries.
5. **Reflection.** Unlocks after ~7 days of logging, then weekly or on demand. One good question,
   a short back-and-forth (capped), ends with a small next step and/or an insight about yourself.
   Saved into the scrapbook.
6. **Keep pace.** Accepted next step is pinned to Today; done/skip (skip is information).
   Later check-ins and reflections follow up.

## Later (noted so v1 grows toward them)

- **Friends' companions.** The social layer's shape: your friend's companion is the one who
  tells you "btw, they finished the thing", with their permission and no audience tally.
  The v1 companion therefore needs an identity, not just an animation.
- **Place-aware catch-ups.** True "you just left Bryant Park" needs background location, which
  a home-screen web app can't do on iOS; a native app could. Meanwhile photo metadata (time,
  place) and, later, calendar access give most of the effect.

## Out of scope for v1

Social network or sharing, voice recording/transcription, native App Store app, "living map"
visualization, streaks or gamification, embeddings or semantic search, multi-user onboarding polish.
Trust/privacy basics are kept (RLS, private storage, export in M6) but aren't the focus yet.

## Milestones

- **M0** Repo scaffold, CI, docs
- **M1** Supabase schema + migrations + RLS, magic-link login, deploy to Vercel, install on phone
- **M2** Quick capture (text + photo), saved for real. Christian starts logging.
- **M3** Shell (three panes) → collections in your words → design pass (look, companion) → AI auto-sort
- **M4** Check-ins: web push, random-time scheduler (Supabase pg_cron), quick reply
- **M5** Reflection + next step/insight + keeping pace with goals
- **M6** Polish, data export, prompt tuning from real use
