import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  adjustForCard,
  advanceTurn,
  completeHarvest,
  convertGoods,
  createGame,
  rearrangeAnimals,
  STATE_VERSION,
  takeAction,
  workersLeft,
  type ActionPayload,
  type AdjustableGood,
} from '@/game/engine'
import type { ActionSpaceId, GameState, LogEntry } from '@/game/types'
import type { Payable } from '@/game/cards/types'

/** An illegal action, as a translation key plus its interpolation values. */
export type GameError = {
  key: string
  values?: Record<string, string | number>
}

/**
 * A state to go back to, and the line the log gets if the players go back to
 * it. The line is written when the move is made rather than when it is taken
 * back, because that is where the store still knows who acted and on what.
 */
export type HistoryEntry = {
  state: GameState
  entry: LogEntry
}

/** The slice written to localStorage; the actions are rebuilt on every load. */
type PersistedGame = {
  game: GameState | null
  history: HistoryEntry[]
}

/**
 * How many moves back the players may go.
 *
 * This is pass-and-play: one device, one group, and a misclick is usually
 * noticed within a move or two. Ten is well past that and still small — a
 * three-player state is under 4 KB, so the whole history costs less than the
 * card database the app already ships.
 */
export const HISTORY_LIMIT = 10

type GameStore = {
  game: GameState | null
  /** Shown when an attempted action is illegal. */
  error: GameError | null
  /** Most recent last. Empty when there is nothing to take back. */
  history: HistoryEntry[]

  startGame: (names: string[]) => void
  play: (spaceId: ActionSpaceId, payload?: ActionPayload) => void
  resolveHarvest: () => void
  skipWorker: () => void
  convert: (playerIndex: number, cardId: string, units: number, good?: Payable) => void
  adjustForCard: (
    playerIndex: number,
    cardId: string,
    good: AdjustableGood,
    delta: number,
  ) => void
  moveAnimals: (playerIndex: number, fromKey: string, toKey: string, count: number) => void
  undo: () => void
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

/**
 * The result of a successful move: swap in the new state, and remember the old
 * one along with the line the log gets if it is taken back.
 *
 * `previous` is kept by reference rather than cloned. The engine only ever
 * mutates the draft, so the state React was last rendering is already frozen
 * in practice and re-cloning it would double the cost of every move.
 */
function commit(
  previous: GameState,
  next: GameState,
  history: HistoryEntry[],
  key: string,
  values?: Record<string, string | number>,
): Pick<GameStore, 'game' | 'error' | 'history'> {
  const remembered: HistoryEntry = {
    state: previous,
    // Stamped with the round being returned to, so the line sits in the round
    // play actually resumes in rather than the one the move led to.
    entry: { round: previous.round, key, values },
  }
  return {
    game: next,
    error: null,
    history: [...history, remembered].slice(-HISTORY_LIMIT),
  }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,
      error: null,
      history: [],

      startGame: (names) => set({ game: createGame({ names }), error: null, history: [] }),

      play: (spaceId, payload) => {
        const current = get().game
        if (!current) return

        const actor = current.players[current.currentPlayerIndex].name
        const next = draft(current)
        const result = takeAction(next, spaceId, payload)
        if (!result.ok) {
          set({ error: { key: result.reason, values: result.values } })
          return
        }
        set(commit(current, next, get().history, 'undo', { name: actor, space: spaceId }))
      },

      resolveHarvest: () => {
        const current = get().game
        if (!current || current.phase !== 'harvest') return
        const next = draft(current)
        completeHarvest(next)
        set(commit(current, next, get().history, 'undoHarvest'))
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
        set(commit(current, next, get().history, 'undoPass', { name: player.name }))
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
        set(
          commit(current, next, get().history, 'undoCard', {
            name: current.players[playerIndex].name,
            cardId,
          }),
        )
      },

      /** Record the outcome of a card the engine cannot enforce on its own. */
      adjustForCard: (playerIndex, cardId, good, delta) => {
        const current = get().game
        if (!current) return

        const next = draft(current)
        const result = adjustForCard(next, playerIndex, cardId, good, delta)
        if (!result.ok) {
          set({ error: { key: result.reason, values: result.values } })
          return
        }
        set(
          commit(current, next, get().history, 'undoCard', {
            name: current.players[playerIndex].name,
            cardId,
          }),
        )
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
        set(
          commit(current, next, get().history, 'undoAnimals', {
            name: current.players[playerIndex].name,
          }),
        )
      },

      /**
       * Take back the last move.
       *
       * Everything rewinds except the log, which is append-only: the move that
       * was taken back keeps its line, and the revert is written underneath it.
       * A shared device means anyone can quietly undo anyone's turn, so the
       * record of it is the point, not a side effect.
       */
      undo: () => {
        const { game, history } = get()
        const last = history[history.length - 1]
        if (!game || !last) return

        set({
          game: { ...last.state, log: [...game.log, last.entry] },
          history: history.slice(0, -1),
          error: null,
        })
      },

      clearError: () => set({ error: null }),
      abandon: () => set({ game: null, error: null, history: [] }),
    }),
    {
      name: 'farmlink-game',
      version: STATE_VERSION,
      // A saved game from an older engine cannot be replayed safely, and
      // neither can the moves leading up to it.
      migrate: (): PersistedGame => ({ game: null, history: [] }),
      // Persist the game and what can be taken back. Undo survives a reload
      // because everything else about this app does — a saved game whose undo
      // silently evaporated would be a worse surprise than the few kilobytes
      // it costs.
      partialize: (state): PersistedGame => ({ game: state.game, history: state.history }),
      // Merge explicitly so rehydration never replaces the action functions
      // with the persisted slice alone.
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedGame> | undefined
        return {
          ...current,
          game: saved?.game ?? null,
          // Absent in saves written before undo existed.
          history: saved?.history ?? [],
        }
      },
    },
  ),
)
