# FarmLink

An offline-playable implementation of the **Agricola (Revised Edition)** base game, built for
pass-and-play on a single device.

Fourteen rounds, six harvests, real fence geometry, and the exact scoring tables from the official
rulebook. No server, no network calls: it installs as a PWA, cold-starts with no connection, and
saves your game to `localStorage`.

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8 |
| UI | React 19 + TypeScript 6 |
| Styling | Tailwind CSS 4 (oklch tokens, light + dark) |
| State | Zustand 5 with `persist` |
| i18n | i18next + react-i18next (English, 繁體中文) |
| Offline | vite-plugin-pwa (Workbox precache, installable) |
| Tests | Vitest 4 + Testing Library |

The project mirrors the conventions of the Broadway client: `cn()` for class merging, `@/` path
alias, colocated `*.test.ts` files, and zustand stores under `src/stores`.

## Getting started

```bash
bun install
```

```bash
bun run dev
```

Then open http://localhost:5173.

## Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Dev server with HMR |
| `bun run build` | Type-check and produce a static `dist/` |
| `bun run test` | Run the test suite |
| `bun run test:coverage` | Tests with coverage |
| `bun run lint` | ESLint |
| `bun run type-check` | `tsc --noEmit` |

## Project layout

```
src/
  game/        Rules engine — pure, framework-free, fully unit tested
    geometry   3x5 farmyard, fence edges, pasture enclosure detection
    rules      Rulebook constants: costs, scoring tables, action spaces
    farm       Placement legality, animal capacity and housing
    engine     Setup, worker placement, harvest phases, round flow
    scoring    End-game scoring and tie-breaking
    cards/     Card data, cost/effect parsing, dealing and payment
  components/  React components
  stores/      Zustand state with localStorage persistence
  lib/         Shared helpers
scripts/       Card data generator and its raw source dump
legacy/        The original single-file v2.8 prototype, kept for reference
```

The engine is deliberately independent of React, so the rules can be tested without rendering
anything — see `src/game/*.test.ts`.

## Languages

The interface ships in English and Traditional Chinese (繁體中文), switchable from the header on
both the setup screen and the board. The choice is detected from the browser on first visit and then
remembered in `localStorage`.

Because the game log has to re-render in whichever language is active, log entries and error
messages are stored as translation keys plus their values rather than as finished sentences — see
`src/lib/i18n/format.ts`. Switching language mid-game therefore retranslates the entire history,
including the goods and action-space names interpolated into it.

Card titles and rules text remain in English: they come from the community card database, which has
no Chinese translation. Everything the app itself writes is translated.

Translations live in `src/lib/i18n/en.ts` and `src/lib/i18n/zh-HK.ts`. Tests assert that both files
declare identical key paths and identical placeholders, so a key added to one and forgotten in the
other fails CI rather than silently falling back.

## Cards

The deck is the classic **Base** set as labelled on the source card list — 337 cards: 181
occupations, 146 minor improvements, and all 10 major improvements. (The two ovens are pulled back
in by name; the source database misfiles them under an expansion.) Revised Edition additions are
excluded so the deck matches one printed set.

Hands of 7 occupations and 7 minor improvements are dealt at setup; majors are a shared pool. Costs,
victory points, and player-count restrictions are all enforced, and the Lessons spaces charge the
correct occupation cost for the player count.

### Which effects actually work

66 cards have effects the engine applies for you, including all ten major improvements:

| Effect | Example |
| --- | --- |
| Immediate gain on play | Lumber — take 3 wood |
| Bonus on an action space | Clay Pit — +3 clay whenever you use Day Laborer |
| Goods on future round spaces | Wood Collector — 1 wood at the start of each of the next 5 rounds |
| Exchange goods for food | Clay Oven — 1 grain becomes 5 food, any time |
| Build and renovation discounts | Stonecutter — every room and renovation costs 1 stone less |
| Scoring bonuses | Mansion — 2 extra points per stone room |
| Multi-good cooking tables | Cooking Hearth — vegetable 3, sheep 2, boar 3, cattle 4 |
| Tiered scoring | Joinery — 3/5/7 wood scores 1/2/3 points |

Exchanges appear as buttons under your farm, since they are anytime actions in Agricola rather than
worker placements.

The remaining cards are dealt, played, and scored for their printed points, but their ongoing text
is left to the players — clearly marked in the picker and repeated in the log. The parser
deliberately refuses anything it cannot read exactly: tiered wording ("1/3/6/9 rounds → 1/2/3/4
wood"), player choices ("either 1 stone or 1 reed"), conditions ("once you live in a clay hut"), and
effects that count things the engine does not track. Guessing at those would quietly corrupt scores,
which is worse than asking players to apply them.

Card data is generated from the [agricolacards.com](https://www.agricolacards.com/list) community
database into `src/game/cards/data.ts` and committed, so the app needs no network at runtime:

```bash
bun run cards:build
```

### Card translations

Chinese card text lives in `src/game/cards/translations.ts`, hand-written rather than generated —
card rules are the text players read most closely, and a machine translation that subtly changes a
rule is worse than showing English. **All 337 cards are translated.**

Two tests keep it that way: one fails if a card lacks a translation, the other rejects stray English
words inside the Chinese strings. The English fallback and its "translation pending" label remain
for any card added later.

## What is implemented

- 1–4 players, with the solo variant's harsher rules (adults eat 3 food, Forest grows 2 wood)
- 14 rounds with stage cards revealed one per round in randomised within-stage order
- Accumulation spaces that replenish every round
- Real fence geometry: fences on edges, shared borders, pasture subdivision, enclosure detection
- Stables doubling pasture capacity; unfenced stables holding one animal; one house pet
- Rooms and fields with adjacency rules; renovation from wood to clay to stone
- Family growth with and without rooms, capped at five people
- All three harvest phases: field, feeding (with begging markers), and breeding
- Moving animals between pastures, stables and the house at any time
- Taking back the last ten moves, each revert written into the game log
- Exact Revised Edition scoring, including the -1 penalties and category caps

## Not yet implemented

- The ongoing text of cards outside the enforced patterns described above
- Inter-player card effects (e.g. Corn Profiteer, where another player may buy your grain)

Travelling improvements — the cards that pass to the player on your left — are marked in the
printed game with a left-arrow icon that the source card database does not carry, and no card in
this 337-card deck has the passing text. There is nothing to implement for the base deck.

## Versioning and changelog

The app footer shows the running version and build date, linking to
[CHANGELOG.md](CHANGELOG.md). The version is injected at build time from `package.json`, so what
the footer reports always matches the bundle — useful because the service worker updates the app in
the background and "latest" is otherwise ambiguous.

Releases follow [Semantic Versioning](https://semver.org/) and are tagged `vX.Y.Z`.

## Offline and installing

The build registers a service worker that precaches every asset, so after one visit the app opens
with no network at all — verified by killing the server, clearing storage, and cold-loading a new
game. On phones it can be added to the home screen and runs standalone.

Updates are picked up automatically on the next load (`registerType: 'autoUpdate'`).

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to
GitHub Pages. The Vite `base` is set from the repository name at build time; override it with
`BASE_PATH=/` for a custom domain.

## Rulebook

Implemented from the official Agricola Revised Edition rule book and appendix. Those PDFs are
copyright Lookout Games and are intentionally not committed to this repository.

## License

The code in this repository is MIT licensed. Agricola, its rules, and its artwork remain the
property of Lookout Games and Uwe Rosenberg; this is an unofficial hobby implementation and is not
affiliated with or endorsed by the publisher.
