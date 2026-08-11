# FarmLink — project notes for Claude

## Stack

Versions from `package.json` (bun is the package manager and runtime; `bun.lock` present):

- **Vite 8** — base is `/farm-link/` for GitHub Pages; build with `BASE_PATH=/` for self-hosting.
  Dev server proxies `/ws` → `ws://localhost:8787` for the multiplayer server.
- **React 19** + **TypeScript 6** — strict, `erasableSyntaxOnly` (no enums/param properties),
  `verbatimModuleSyntax` (use `type` imports). Three tsconfig projects: app, node, server.
- **Tailwind CSS 4** via `@tailwindcss/vite` — oklch tokens, light/dark via `data-theme`.
- **Zustand 5** — `src/stores/game.ts` (local game, `persist` to localStorage),
  `src/stores/session.ts` (online session, not persisted; seat token in sessionStorage).
- **i18next 26 / react-i18next 17** — bundles in `src/lib/i18n/{en,zh-HK}.ts`; tests enforce both
  files declare identical key paths and placeholders. Engine emits translation keys, not sentences.
- **Vitest 4** + Testing Library — jsdom, globals on, colocated `*.test.ts(x)`.
- **vite-plugin-pwa 1** — Workbox precache; single-device mode is fully offline.
- **Bun 1.3** — `server/index.ts` uses `Bun.serve` with the `websocket` handlers and serves `dist/`
  when present. `@types/bun` provides types (`"types": ["bun"]` in tsconfig.server.json).

## Architecture invariants

- The rules engine (`src/game/`) is pure TS, framework-free and deterministic
  (`createGame({ names, random })`). It must stay importable from both the browser bundle and the
  Bun server — no DOM or Bun APIs in `src/game/` or `src/multiplayer/`.
- All game mutations flow through engine functions returning `ActionResult`
  (`{ ok } | { ok: false, reason /* errors.* i18n key */, values }`).
- Multiplayer is server-authoritative: clients send `Intent`s (see `src/multiplayer/protocol.ts`),
  the server applies them via `src/multiplayer/apply.ts` (seat/turn/host authorisation) and
  broadcasts the whole `GameState`. Never mutate an online game locally.
- `server/rooms.ts` is platform-free (unit-tested in vitest); only `server/index.ts` touches Bun.
- Room-level and rule-level failures both use `errors.*` translation keys — new keys must be added
  to **both** language bundles or the i18n tests fail.

## Workflow

- CI (`.github/workflows/ci.yml`): lint, type-check, test, build — all must pass.
- `bun run dev` (+ `bun run server` for online play), `bun run test`, `bun run lint`,
  `bun run type-check`.
