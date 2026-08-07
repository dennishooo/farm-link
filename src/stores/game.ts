import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  advanceTurn,
  completeHarvest,
  convertGoods,
  createGame,
  rearrangeAnimals,
  STATE_VERSION,
  takeAction,
  workersLeft,
  type ActionPayload,
} from '@/game/engine'
import type { ActionSpaceId, GameState } from '@/game/types'
import type { Payable } from '@/game/cards/types'

/** An illegal action, as a translation key plus its interpolation values. */
export type GameError = {
  key: string
  values?: Record<string, string | number>
}

type GameStore = {
  game: GameState | null
  /** Shown when an attempted action is illegal. */
  error: GameError | null

  startGame: (names: string[]) => void
  play: (spaceId: ActionSpaceId, payload?: ActionPayload) => void
  resolveHarvest: () => void
  skipWorker: () => void
  convert: (playerIndex: number, cardId: string, units: number, good?: Payable) => void
  moveAnimals: (playerIndex: number, fromKey: string, toKey: string, count: number) => void
  clearError: () => void
  abandon: () => void
}

/**
 * Structured-clone the state before mutating so React sees a new reference and
 * the engine can keep working with plain mutation.
 */
function draft(state: GameState): GameState {
  return structuredClone(state)
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,
      error: null,

      startGame: (names) => set({ game: createGame({ names }), error: null }),

      play: (spaceId, payload) => {
        const current = get().game
        if (!current) return

        const next = draft(current)
        const result = takeAction(next, spaceId, payload)
        if (!result.ok) {
          set({ error: { key: result.reason, values: result.values } })
          return
        }
        set({ game: next, error: null })
      },

      resolveHarvest: () => {
        const current = get().game
        if (!current || current.phase !== 'harvest') return
        const next = draft(current)
        completeHarvest(next)
        set({ game: next, error: null })
      },

      /** Pass on a worker that has no legal action left. */
      skipWorker: () => {
        const current = get().game
        if (!current || current.phase !== 'work') return
        const next = draft(current)
        const player = next.players[next.currentPlayerIndex]
        if (workersLeft(player) <= 0) return
        player.peoplePlaced += 1
        next.log.push({ round: next.round, key: 'pass', values: { name: player.name } })
        advanceTurn(next)
        set({ game: next, error: null })
      },

      /** Exchange goods for food using a played card, at any time. */
      convert: (playerIndex, cardId, units, good) => {
        const current = get().game
        if (!current) return

        const next = draft(current)
        const result = convertGoods(next, playerIndex, cardId, units, good)
        if (!result.ok) {
          set({ error: { key: result.reason, values: result.values } })
          return
        }
        set({ game: next, error: null })
      },

      /** Rearrange animals between pastures, stables and the house. */
      moveAnimals: (playerIndex, fromKey, toKey, count) => {
        const current = get().game
        if (!current) return

        const next = draft(current)
        const result = rearrangeAnimals(next, playerIndex, fromKey, toKey, count)
        if (!result.ok) {
          set({ error: { key: result.reason, values: result.values } })
          return
        }
        set({ game: next, error: null })
      },

      clearError: () => set({ error: null }),
      abandon: () => set({ game: null, error: null }),
    }),
    {
      name: 'farmlink-game',
      version: STATE_VERSION,
      // A saved game from an older engine cannot be replayed safely.
      migrate: () => ({ game: null }),
      // Persist only the game itself; actions are recreated on every load.
      partialize: (state) => ({ game: state.game }),
      // Merge explicitly so rehydration never replaces the action functions
      // with the persisted slice alone.
      merge: (persisted, current) => ({
        ...current,
        game: (persisted as { game?: GameState | null } | undefined)?.game ?? null,
      }),
    },
  ),
)
