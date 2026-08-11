/**
 * Applies a player's intent to the game with the authorisation checks that
 * only exist in multiplayer: you may act only on your own turn, touch only
 * your own farm, and only the host resolves the shared harvest step.
 *
 * The single-device mode needs none of this — one screen means whoever holds
 * the device is trusted — so these checks live here rather than in the engine.
 */

import {
  adjustForCard,
  applyCardAction,
  completeHarvest,
  convertGoods,
  passWorker,
  rearrangeAnimals,
  takeAction,
  transferForCard,
  type ActionResult,
} from '../game/engine'
import { fail, ok } from '../game/result'
import type { GameState } from '../game/types'
import type { Intent } from './protocol'

export type IntentContext = {
  /** The seat (player index) the sender owns. */
  seat: number
  /** Whether the sender created the room. */
  isHost: boolean
}

/** Mutates `state` on success; returns a failure without touching it otherwise. */
export function applyIntent(state: GameState, intent: Intent, ctx: IntentContext): ActionResult {
  switch (intent.kind) {
    case 'play':
      if (state.currentPlayerIndex !== ctx.seat) return fail('notYourTurn')
      return takeAction(state, intent.spaceId, intent.payload)

    case 'skipWorker':
      if (state.currentPlayerIndex !== ctx.seat) return fail('notYourTurn')
      return passWorker(state)

    case 'resolveHarvest':
      if (!ctx.isHost) return fail('hostOnly')
      if (state.phase !== 'harvest') return fail('notHarvestPhase')
      completeHarvest(state)
      return ok

    case 'convert':
      if (intent.playerIndex !== ctx.seat) return fail('notYourFarm')
      return convertGoods(state, intent.playerIndex, intent.cardId, intent.units, intent.good)

    case 'adjustForCard':
      if (intent.playerIndex !== ctx.seat) return fail('notYourFarm')
      return adjustForCard(state, intent.playerIndex, intent.cardId, intent.good, intent.delta)

    case 'moveAnimals':
      if (intent.playerIndex !== ctx.seat) return fail('notYourFarm')
      return rearrangeAnimals(
        state,
        intent.playerIndex,
        intent.fromKey,
        intent.toKey,
        intent.count,
      )

    case 'cardAction':
      if (intent.playerIndex !== ctx.seat) return fail('notYourFarm')
      return applyCardAction(
        state,
        intent.playerIndex,
        intent.cardId,
        intent.action,
        intent.payload,
      )

    case 'transfer':
      // Either seat in the exchange may hold the card, so the sender only has
      // to be one of the two — but never a bystander moving other people's
      // goods around.
      if (intent.fromIndex !== ctx.seat && intent.toIndex !== ctx.seat) {
        return fail('notYourFarm')
      }
      return transferForCard(
        state,
        intent.fromIndex,
        intent.toIndex,
        intent.cardId,
        intent.good,
        intent.amount,
      )
  }
}
