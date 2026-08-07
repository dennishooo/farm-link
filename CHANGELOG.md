# Changelog

All notable changes to FarmLink are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The version shown in the app footer comes from `package.json`, so it always matches the build you
are looking at.

## [Unreleased]

### Changed

- **Restyled to the Cloud Mountain / farmbank references.** The palette is now bone cream, deep
  forest green and terracotta — three colours doing the work, with the material palette pulled into
  the same family rather than sitting beside it. Dark mode follows farmbank's warm brown ground
  instead of a green-black one, and carries the same cream, so the two themes read as one product.
  Labels are set in the references' heavy tracked uppercase, which cost nothing here: Geist is
  already variable, so no second font enters a bundle that has to work offline.
- **The board sits on a ground now.** Cream panels on a cream page left the farmyard with nothing
  to sit against, which is the one thing both references never do — each puts light pieces on a
  deep saturated field. The farmyard and the header share a stippled deep ground, so the spaces
  read as pieces laid on a board rather than panels cut out of the panel behind them. The stipple
  is Cloud Mountain's, and the setup screen's illustration became the oval badge that identity is
  built out of.
- **Drew the board instead of colouring it in.** Every farmyard space now renders as its material —
  soil with furrows, pasture with tufts of grass, courses of clay or stone for a house, timber
  bracing over the grass for a stable — so a field reads as a field before its label is read. The
  patterns are CSS gradients rather than images: nothing to fetch, sharp at any tile size, and the
  app still cold-starts offline. Fences gained lit rails and a post at every corner where two rails
  meet, which is what tells a closed pasture from four separate lines.
- **Replaced every emoji with a drawn glyph** (`components/ui/icons.tsx`). Emoji are rendered by the
  platform, so the board looked like a different game on each device, and they carry their own
  colour — a wood chip could not be tinted with the wood token, so nothing on screen matched
  anything else. The new glyphs are silhouettes in `currentColor`, which is what lets a resource
  chip, an action space's stripe and the fence rails all come from one variable.
- **One herd per pasture.** The animal chip repeated on every space of a pasture, so three sheep in
  a 2x2 pasture drew four "×3" chips and read as four separate herds. It now draws once.
- **Sown fields show their crop as pips** — one glyph per unit in the crop's own colour, the way the
  goods sit on the physical card, falling back to a glyph and a number past four. The localised
  "grain ×3" stays in the accessibility tree either way.
- **A round track in the header.** Fourteen pips with the six harvests drawn wider: "Round 3 of 14"
  said where you were but not how close the next feeding was.
- **Player colours.** Each panel carries a band in its player's colour, so four farms side by side
  can be told apart without reading the names.
- **Depth and feedback throughout** — tinted elevation shadows (a grey shadow over green reads as
  dirt), buttons that press on tap, tiles that lift when selectable, sheets that slide up, a
  hatched fill on action spaces another player has taken, and stripes in the good's own colour on
  the spaces that hand goods out. All motion is decorative and is dropped entirely under
  `prefers-reduced-motion`.
- **Legibility fixes found by looking at it.** Wood, field and sheep were too light for the white
  text and pale chips sitting on them; field furrows were drawn as a dark line plus a light line
  per row, which at tile size stopped reading as soil and started reading as decking; dark mode had
  no hairline between a dark tile and the dark gap beside it, so a farmyard collapsed into one
  shape.
- **Split the card database into its own bundle chunk.** The deck and its translations are ~200 KB
  of generated data that changes only when the deck is regenerated, while the app around it changes
  every release. Keeping them apart means a release invalidates the app chunk alone, so a returning
  player's service worker re-downloads ~118 KB gzipped instead of ~150 KB and keeps the cards it
  already has. It does not defer the download — the cards are a static dependency of the engine, and
  the app precaches everything by design; deferring them would need a loading gate that would cost
  more on every reload than it saved on first visit.
- **Split `engine.ts`** (1050 lines) into `result.ts` (the shared outcome type), `state.ts` (setup,
  round progression, harvest) and `actions.ts` (worker placement and the action handlers).
  `engine.ts` remains as a barrel, so every import site is untouched and the public surface is
  byte-for-byte identical. Setup, rounds and harvest stayed together deliberately: they form a
  cycle, and separating them would only turn it into a circular import.

### Added

- **Undo, on the record.** An "Undo" button in the header takes back the last move — a worker
  placement, a pass, an anytime card exchange, an animal move, a resolved harvest — and restores
  the board exactly as it was. The log is the exception: it never rewinds. What was taken back
  keeps its line and the revert is written underneath it ("Ann takes back their move on Forest"),
  because on a shared device anyone can quietly rewind anyone's turn, and the record of that is the
  point rather than a side effect. The last ten moves are kept, and they persist with the save, so
  undo survives a reload like everything else in this app. Actions the engine refused are not
  remembered — there is nothing to take back from a move that never happened.
- **Redo**, for the undo that went one step too far. It gets its own line in the log for the same
  reason the revert does, so a taken-back-and-put-back move reads as the round trip it was. Making
  a different move drops what was taken back, as undo stacks normally do.
- **Component and integration tests** — 144 of them, covering every component and the App shell.
  There were none before, and the components are where nearly every bug this project has shipped
  actually lived: the tooltip that never appeared on touch, Cultivation refusing to sow, Farm
  Expansion looking unresponsive. Each fix from v4.2.0 now has a test that fails against the old
  code.
- Parser tests for `parseRoundDrip`, `parseDiscount` and `normaliseGood`, concentrating on the
  wordings they are supposed to *refuse* — a parser that quietly guesses is the failure mode that
  matters here.
- Store tests for the no-game guards and the conversion paths, taking that layer from 64% to 97%.

### Fixed

- **The stage-card shuffle was thrown away on the first move of every game.** The reveal order was
  held in a `WeakMap` keyed by the state object, but the store structured-clones the state on every
  move — so move one produced an object the map had never seen, and the order was rebuilt in
  canonical stage order. The rebuild was written for reloads and ran on move one instead, which
  meant every game revealed the same cards in the same sequence from round 2 on. The order is now
  part of the state, so it survives a copy, a reload and an undo. Games saved without one still
  rebuild it, so nothing in progress breaks.
- **The resource chips said what they were only in a `title` tooltip** — the same hover-only trap
  the card rules text fell into in v4.2.0, and one this pass made easier to hit by replacing the
  emoji with icons. Each chip now carries its own label. The animals in a pasture had the same
  problem and no fix available inside the tile, since a tile's own label overrides anything within
  it, so the herd is named in the label itself: "Space 4: empty, 2 Sheep".
- **Fence rails sat slightly off the edges they mark.** They were positioned as a fraction of the
  grid, which stops being the boundary once the grid has a gutter — the tracks are narrower than an
  even share by the gaps between them, so every rail after the first drifted, by up to two pixels at
  the right-hand edge. The gutter is now part of the arithmetic; measured drift is zero.
- `type-check` ran `tsc --noEmit` against a root config with `"files": []`, so it checked nothing.
  Type errors in test files only surfaced later, during the build. It now runs `tsc -b`, matching
  what the build does.
- jsdom has no `matchMedia`, so any test mounting the theme toggle died before asserting anything.
  The shared test setup now provides it.
- The engine-key translation test read `engine.ts` alone, so when that became a barrel it silently
  scanned nothing. It now reads every module in `src/game`, and its match for directly-pushed log
  entries is anchored on the push so it cannot pick up unrelated `key:` fields.

## [4.2.0] — 2026-08-08

Fixes for the nine issues reported after v4.1.0. Two were rules-data errors checked against the
Revised Edition appendix; the rest were things the interface never told the player.

### Fixed

- **Cultivation could not sow** ([#6]). The dialog only offered empty spaces to plow, so the "and/or
  sow" half of the action was unreachable. Fields are now selectable in the same dialog.
- **Two action space cards appeared in the wrong stage** ([#5]). Cultivation is stage 5 and Western
  Quarry stage 2; they were swapped, so Cultivation arrived in round 5 instead of round 12 and the
  second stone quarry only appeared at the endgame. A test now checks every card against the
  appendix.
- **`capacityFor` ignored animals already housed**, reporting a full pasture's entire capacity as
  free. Anything relying on it to decide whether animals would fit was wrong whenever a pasture was
  occupied.
- **Card text was unreadable on a phone** ([#3], [#4]). Rules text lived in a `title` tooltip, which
  never appears on touch. Played cards are now tappable and show their text, marked when the engine
  does not apply the effect for you.
- **Animals could wander off with no warning** ([#9]). Taking animals you cannot house loses them
  (rulebook p.7), but nothing said so beforehand. Animal spaces now warn how many would be lost.
- **Breeding failed silently** ([#8]). A pair with nowhere to put a newborn does not breed, which
  looked like a bug. The harvest log now says it happened and why.
- **Farm Expansion looked unresponsive** ([#10]). Cost was only checked after choosing a space, so
  an unaffordable build read as the board ignoring you. Options are disabled up front with the
  reason shown.
- Animal names in the breeding log rendered as raw English ids in both languages.

### Added

- **Grove, Hollow and Resource Market** ([#5]) — three action spaces the appendix lists for 3+
  players that were missing entirely, leaving larger games short of wood, clay and stone.
- **Live scoring** ([#7]). Each farm shows its running total, with the full breakdown a tap away.

### Notes

Harvest yields were reported as too low ([#11]), but "take exactly 1 crop from each of your fields"
is the printed rule (rulebook p.8) and matches what the engine does. Four sown fields give 4 crops,
not 4 per field. No change made.

## [4.1.0] — 2026-08-07

### Added

- **A way to actually play the 267 cards the engine does not enforce.** Those cards state their
  effect in prose the parser deliberately refuses to interpret, so until now they could be read but
  never acted on. Each farm has an "Apply a card effect" panel: pick one of your played cards, a
  good, and an amount, then gain or spend it. The log names the card, so the history stays
  auditable and reads correctly in both languages.
- Animals are deliberately excluded from the panel — they live in housing placements with capacity
  rules, and granting them there would leave the farm and the counters disagreeing. The animal
  panel already handles them.

### Fixed

- Card names in the game log always came from the Chinese translation table, so an English game
  showed Chinese card names ("Player 1 takes 2 Wood for 學者"). This affected every log line naming
  a card, including the existing exchange entries. A regression test now covers both languages.

## [4.0.0] — 2026-08-07

### Added

- **Every card is now in Traditional Chinese.** All 337 — 181 occupations, 146 minor improvements
  and 10 majors — are hand-translated, so nothing falls back to English any more. A test fails the
  build if a card is ever added without a translation.
- A test that rejects stray English words inside the Chinese strings, allowing only proper nouns
  and version numbers. It caught three slips while the remaining cards were being translated.

## [3.5.0] — 2026-08-07

### Added

- Traditional Chinese for 75 more minor improvements, taking card coverage to 145 of 337. The rest
  still fall back to English and say so in the picker.

## [3.4.0] — 2026-08-07

### Added

- Version number and build date in the app footer, linking to this changelog. The version is
  injected from `package.json` at build time, so it always matches the running bundle — the service
  worker updates in the background, which makes "latest" ambiguous when reporting a problem.
- This changelog, reconstructed from the commit history, and `vX.Y.Z` release tags.

## [3.3.0] — 2026-08-07

### Added

- **Multi-good conversion tables.** Fireplace and Cooking Hearth print a separate rate for each
  animal type. The effect model now holds a list of rates rather than one, so all ten major
  improvements are fully enforced and enforced-card coverage rose from 46 to 70.
- **Tiered scoring.** Joinery, Pottery, Basketmaker's Workshop and Sawmill score on thresholds
  (`3/5/7 wood → 1/2/3 points`). Only the highest threshold reached is awarded.
- **Offline install.** The build now registers a service worker that precaches every asset, so the
  app opens with no network at all and can be added to a phone's home screen. Verified by stopping
  the server, clearing storage, and cold-loading a new game.

### Fixed

- Exchanging goods used the first conversion rate printed on a card, so every button on Cooking
  Hearth traded vegetables — clicking "1 sheep → 2 food" with no vegetables silently did nothing.
- Craft buildings never scored their tiers, because the scoring helper had no case for building
  resources and always counted zero wood, clay, reed or stone.
- Cooking an animal now removes it from its pasture rather than only decrementing a counter, so the
  board and the totals cannot disagree.

### Notes

Travelling improvements are not implemented because there is nothing to implement: they are
identified in the printed game by a left-arrow icon the source card database does not carry, and no
card in the 337-card base deck has the passing text.

## [3.2.0] — 2026-08-07

### Added

- **Moving animals.** Animals are the only components Agricola lets you rearrange at any time.
  Without it, automatic placement could strand capacity — one sheep dropped into its own pasture
  reserved that whole pasture for sheep, so a later boar had nowhere to go even with room on the
  farm. Tap a slot holding animals, then tap a destination; illegal targets are disabled rather
  than failing after the fact.

### Fixed

- Housing animals updated their placements but left the per-type counters stale, so every caller
  had to remember to re-sync separately.

## [3.1.0] — 2026-08-07

### Added

- Per-round accumulation rates on every gathering space ([#1]), read from the same helper the
  engine uses so the displayed number cannot drift from what is actually paid out.

### Fixed

- Fences that enclosed nothing could be built and paid for, as long as the same action also
  completed a legal pasture ([#2]). Every new fence must now border a pasture, and the fencing
  dialog reports dangling segments before the wood is spent.
- Clay Oven and Stone Oven were in the deck but never dealt, because they inherited a "6+ players"
  restriction from their expansion listing — bread baking was quietly impossible.

## [3.0.0] — 2026-08-07

A ground-up rebuild. The previous single-file prototype approximated Agricola with tile-based
pastures and invented costs; this replaces it with the real rules, transcribed from the official
Revised Edition rulebook.

### Added

- **Real farmyard geometry.** Fences live on the edges between spaces rather than occupying spaces,
  which is what makes genuine Agricola rules possible: enclosure detection, fences shared between
  adjacent pastures, subdivision, and stables that double a pasture's capacity.
- Fourteen rounds with stage cards revealed one per round, accumulating action spaces, all three
  harvest phases, renovation through wood/clay/stone, family growth, and the solo variant.
- Exact Revised Edition scoring, including the negative points and category caps.
- **The base card deck** — 337 cards: 181 occupations, 146 minor improvements and all 10 majors,
  generated from the community card database and committed so the app needs no network.
- **Traditional Chinese**, switchable in the header. Log entries and errors are stored as
  translation keys rather than finished sentences, so switching language retranslates the whole
  game history.
- Dark theme following the OS, with a manual override.

### Fixed

- The prototype's save-code import was broken in every case: a local HTML-escaping helper shadowed
  the global `escape` used to decode it.

[#3]: https://github.com/dennishooo/farm-link/issues/3
[#4]: https://github.com/dennishooo/farm-link/issues/4
[#5]: https://github.com/dennishooo/farm-link/issues/5
[#6]: https://github.com/dennishooo/farm-link/issues/6
[#7]: https://github.com/dennishooo/farm-link/issues/7
[#8]: https://github.com/dennishooo/farm-link/issues/8
[#9]: https://github.com/dennishooo/farm-link/issues/9
[#10]: https://github.com/dennishooo/farm-link/issues/10
[#11]: https://github.com/dennishooo/farm-link/issues/11
[#1]: https://github.com/dennishooo/farm-link/issues/1
[#2]: https://github.com/dennishooo/farm-link/issues/2
[Unreleased]: https://github.com/dennishooo/farm-link/compare/v4.2.0...HEAD
[4.2.0]: https://github.com/dennishooo/farm-link/compare/v4.1.0...v4.2.0
[4.1.0]: https://github.com/dennishooo/farm-link/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/dennishooo/farm-link/compare/v3.5.0...v4.0.0
[3.5.0]: https://github.com/dennishooo/farm-link/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/dennishooo/farm-link/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/dennishooo/farm-link/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/dennishooo/farm-link/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/dennishooo/farm-link/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/dennishooo/farm-link/releases/tag/v3.0.0
