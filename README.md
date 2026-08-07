# FarmLink

An offline-playable implementation of the **Agricola (Revised Edition)** base game, built for
pass-and-play on a single device.

Fourteen rounds, six harvests, real fence geometry, and the exact scoring tables from the official
rulebook. No server, no network calls — once the page has loaded it runs entirely in the browser and
saves your game to `localStorage`.

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8 |
| UI | React 19 + TypeScript 6 |
| Styling | Tailwind CSS 4 (oklch tokens, light + dark) |
| State | Zustand 5 with `persist` |
| i18n | i18next + react-i18next (English, 繁體中文) |
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

All 394 base-game cards ship with the app — 202 occupations, 184 minor improvements, and 8 major
improvements. Hands of 7 occupations and 7 minor improvements are dealt at setup; majors are a
shared pool. Costs, victory points, and player-count restrictions are enforced, and the Lessons
spaces charge the correct occupation cost for the player count.

Card effects fall into two groups. Where the printed text maps cleanly onto a mechanic — an
immediate gain, a bonus whenever a given action space is used, a flat or per-unit scoring bonus —
the engine applies it automatically. The rest are dealt, played, and scored for their printed
points, but their ongoing text is left to the players; those cards say so in the picker and the game
log repeats the text when one is played. Enforcing the remainder would mean guessing at conditional
and tiered wording, which would quietly distort scores.

Card data is generated from the [agricolacards.com](https://www.agricolacards.com/list) community
database into `src/game/cards/data.ts` and committed, so the app needs no network at runtime:

```bash
bun run cards:build
```

Note that the source database cannot identify the exact 120-card Revised Edition deck — it splits
base-game cards between "Base" and "Base (Revised)" and carries no RE card codes. This build
therefore uses the whole base-game pool rather than the precise RE subset.

## What is implemented

- 1–4 players, with the solo variant's harsher rules (adults eat 3 food, Forest grows 2 wood)
- 14 rounds with stage cards revealed one per round in randomised within-stage order
- Accumulation spaces that replenish every round
- Real fence geometry: fences on edges, shared borders, pasture subdivision, enclosure detection
- Stables doubling pasture capacity; unfenced stables holding one animal; one house pet
- Rooms and fields with adjacency rules; renovation from wood to clay to stone
- Family growth with and without rooms, capped at five people
- All three harvest phases: field, feeding (with begging markers), and breeding
- Exact Revised Edition scoring, including the -1 penalties and category caps

## Not yet implemented

- Bread baking, which depends on major improvement effects the engine does not yet apply
- The ongoing text of cards outside the enforced patterns described above
- Travelling minor improvements that pass to the player on your left

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
