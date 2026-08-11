/**
 * The wire protocol between the multiplayer client and server.
 *
 * Both sides import from here (the server via a relative path, so it needs no
 * bundler alias). Messages are JSON; the game state itself is the engine's
 * serialisable `GameState`, broadcast whole after every accepted intent so
 * clients never have to replay anything.
 */

import type { ActionSpaceId, GameState } from '../game/types'
import type {
  ActionPayload,
  AdjustableGood,
  CardAction,
  CardActionPayload,
} from '../game/engine'
import type { Payable } from '../game/cards/types'

/**
 * Bumped whenever a message shape changes incompatibly. The server refuses
 * mismatched clients up front, which beats a cryptic failure mid-game.
 */
export const PROTOCOL_VERSION = 1

/** Room codes avoid ambiguous glyphs (0/O, 1/I/L) so they survive being read aloud. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const ROOM_CODE_LENGTH = 4

export const MAX_SEATS = 4
export const MIN_SEATS_TO_START = 2

/** Everything a player can do to the game, as data. Mirrors the store's actions. */
export type Intent =
  | { kind: 'play'; spaceId: ActionSpaceId; payload?: ActionPayload }
  | { kind: 'skipWorker' }
  | { kind: 'resolveHarvest' }
  | { kind: 'convert'; playerIndex: number; cardId: string; units: number; good?: Payable }
  | {
      kind: 'adjustForCard'
      playerIndex: number
      cardId: string
      good: AdjustableGood
      delta: number
    }
  | { kind: 'moveAnimals'; playerIndex: number; fromKey: string; toKey: string; count: number }
  | {
      kind: 'cardAction'
      playerIndex: number
      cardId: string
      action: CardAction
      payload?: CardActionPayload
    }
  /**
   * A card that moves goods between two farms. The sender must be one of the
   * two seats — either side may hold the card, since "buy their grain" is
   * played by the buyer and "give 1 food to each player" by the giver.
   */
  | {
      kind: 'transfer'
      fromIndex: number
      toIndex: number
      cardId: string
      good: AdjustableGood
      amount: number
    }

export type ClientMessage =
  | { type: 'create'; protocol: number; name: string }
  | { type: 'join'; protocol: number; code: string; name: string }
  /** Reclaim a seat after a dropped connection or page reload. */
  | { type: 'rejoin'; protocol: number; code: string; token: string }
  | { type: 'start' }
  | { type: 'intent'; intent: Intent }
  /** Host only: end the game for everyone and dissolve the room. */
  | { type: 'end' }

/** One seat as the lobby and header show it. */
export type RoomPlayer = {
  name: string
  connected: boolean
}

export type ServerMessage =
  /** You have a seat. `token` reclaims it after a disconnect. */
  | { type: 'joined'; code: string; seat: number; token: string }
  /** Lobby/seating changed. Personalised: `seat` is the recipient's own. */
  | { type: 'room'; players: RoomPlayer[]; host: number; seat: number }
  /** The authoritative game after an accepted intent (or on start/rejoin). */
  | { type: 'state'; game: GameState }
  /** Sent only to the client whose request failed. Same shape as `GameError`. */
  | { type: 'error'; key: string; values?: Record<string, string | number> }
  /** The room is gone; clients should return to setup. */
  | { type: 'ended'; reason: 'host' | 'expired' }

export function randomRoomCode(random: () => number = Math.random): string {
  let code = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    code += ROOM_CODE_ALPHABET[Math.floor(random() * ROOM_CODE_ALPHABET.length)]
  }
  return code
}

export function normaliseRoomCode(raw: string): string {
  return raw.trim().toUpperCase()
}
