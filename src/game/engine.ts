/**
 * The game engine's public surface.
 *
 * The implementation lives in three modules — `result` (the shared outcome
 * type), `state` (setup, rounds, harvest) and `actions` (worker placement) —
 * but callers import from here, so the split stays an internal detail.
 */

export type { ActionResult } from './result'
export * from './state'
export * from './actions'
