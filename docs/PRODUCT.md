# Becoming — product (v1)

Codename history: "Goon App" (placeholder) → "Pacer" → **Becoming**.

## Vision (short)

People in their twenties feel themselves drifting into empty routines and endless scrolling.
Blockers take distractions away, but there is always another one. Becoming adds something
in their place: **a running partner for your life**. It helps you see what matters to you,
sets a pace, checks in when you'd rather stop, and over time shows you who you're becoming.
Later, a social layer will help friends stay involved in each other's lives without posting
for an audience. v1 is the personal partner only, built for one user (Christian).

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
