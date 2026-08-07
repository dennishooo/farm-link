/**
 * The result type every engine action returns, and the helpers for building it.
 *
 * Its own module because setup, turns, harvest and actions all need it, and
 * importing it from any one of them would tie those modules together for no
 * reason.
 */

/**
 * Failures carry a translation key under `errors.*` plus its values, so the UI
 * renders them in the player's language rather than a baked-in English string.
 */
export type ActionResult =
  | { ok: true }
  | { ok: false; reason: string; values?: Record<string, string | number> }

export const ok: ActionResult = { ok: true }

export const fail = (
  reason: string,
  values?: Record<string, string | number>,
): ActionResult => ({ ok: false, reason, values })
