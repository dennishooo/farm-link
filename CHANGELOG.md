# Changelog

All notable changes to FarmLink are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The version shown in the app footer comes from `package.json`, so it always matches the build you
are looking at.

## [Unreleased]

### Added

- Version number and build date in the app footer, linking to this changelog.

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

[#1]: https://github.com/dennishooo/farm-link/issues/1
[#2]: https://github.com/dennishooo/farm-link/issues/2
[Unreleased]: https://github.com/dennishooo/farm-link/compare/v3.3.0...HEAD
[3.3.0]: https://github.com/dennishooo/farm-link/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/dennishooo/farm-link/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/dennishooo/farm-link/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/dennishooo/farm-link/releases/tag/v3.0.0
