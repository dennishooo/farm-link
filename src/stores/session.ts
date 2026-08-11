/**
 * Online play: the room session and its socket.
 *
 * Deliberately separate from the single-device store — the local store owns
 * the offline game and its localStorage persistence, and an online game must
 * never overwrite that save. Here the server is the source of truth: every
 * action becomes an intent on the wire, and `game` is only ever what the
 * server last broadcast.
 *
 * The seat token lives in sessionStorage so a page reload (or a phone that
 * dropped its radio) can reclaim the same seat; sessionStorage rather than
 * localStorage so two tabs on one device can hold two different seats.
 */

import { create } from 'zustand'
import type { GameState } from '@/game/types'
import {
  normaliseRoomCode,
  PROTOCOL_VERSION,
  type ClientMessage,
  type Intent,
  type RoomPlayer,
  type ServerMessage,
} from '@/multiplayer/protocol'
import type { GameError } from '@/stores/game'

export type SessionStatus = 'idle' | 'connecting' | 'lobby' | 'playing' | 'ended'

type SessionData = {
  status: SessionStatus
  code: string | null
  /** The seat this device owns. Seat 0 is always the host. */
  seat: number
  players: RoomPlayer[]
  game: GameState | null
  error: GameError | null
  /** The socket is down and being retried in the background. */
  reconnecting: boolean
  endedReason: 'host' | 'expired' | null
}

type SessionStore = SessionData & {
  createRoom: (name: string) => void
  joinRoom: (code: string, name: string) => void
  start: () => void
  sendIntent: (intent: Intent) => void
  /** Host only: dissolve the room for everyone. */
  endGame: () => void
  /** Leave the session on this device; the room lives on for the others. */
  leave: () => void
  clearError: () => void
  /** Reclaim a stored seat after a reload. Called once at app boot. */
  resume: () => void
  /** Dismiss the 'ended' notice and return to setup. */
  acknowledgeEnd: () => void
}

/** Everything a fresh session starts from. */
const RESET: SessionData = {
  status: 'idle',
  code: null,
  seat: 0,
  players: [],
  game: null,
  error: null,
  reconnecting: false,
  endedReason: null,
}

const STORAGE_KEY = 'farmlink-online'
const RECONNECT_DELAY_MS = 3000

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
/** Only reconnect once a seat was actually granted. */
let hasSeat = false

function serverUrl(): string {
  const override = import.meta.env?.VITE_WS_URL
  if (override) return override
  const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${scheme}://${window.location.host}/ws`
}

type StoredSeat = { code: string; token: string }

function storedSeat(): StoredSeat | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredSeat) : null
  } catch {
    return null
  }
}

function rememberSeat(seat: StoredSeat | null): void {
  try {
    if (seat) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seat))
    else window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage being unavailable only costs reload-resume, not the session.
  }
}

function send(message: ClientMessage): void {
  if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message))
}

function teardown(): void {
  hasSeat = false
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (socket) {
    socket.onclose = null
    socket.close()
    socket = null
  }
}

export const useSessionStore = create<SessionStore>()((set, get) => {
  function handleMessage(message: ServerMessage): void {
    switch (message.type) {
      case 'joined':
        hasSeat = true
        rememberSeat({ code: message.code, token: message.token })
        set({ code: message.code, seat: message.seat, reconnecting: false })
        return

      case 'room':
        set({
          players: message.players,
          seat: message.seat,
          status: get().game ? 'playing' : 'lobby',
        })
        return

      case 'state':
        set({ game: message.game, status: 'playing', error: null })
        return

      case 'error': {
        const error: GameError = { key: message.key, values: message.values }
        if (message.key === 'cannotRejoin') {
          // The room is gone (server restart or sweep) — stop retrying.
          const wasPlaying = get().status === 'playing' || get().game !== null
          teardown()
          rememberSeat(null)
          set(
            wasPlaying
              ? { ...RESET, status: 'ended', endedReason: 'expired' }
              : { ...RESET, error },
          )
          return
        }
        if (get().status === 'connecting') {
          // Failures before a seat was granted end the whole attempt.
          teardown()
          set({ status: 'idle', error })
        } else {
          // In-game failures are ordinary illegal moves.
          set({ error })
        }
        return
      }

      case 'ended':
        teardown()
        rememberSeat(null)
        set({ ...RESET, status: 'ended', endedReason: message.reason })
        return
    }
  }

  function connect(onOpen: () => void): void {
    teardown()
    let ws: WebSocket
    try {
      ws = new WebSocket(serverUrl())
    } catch {
      set({ status: 'idle', error: { key: 'connectionFailed' } })
      return
    }
    socket = ws

    ws.onopen = onOpen
    ws.onmessage = (event) => {
      try {
        handleMessage(JSON.parse(String(event.data)) as ServerMessage)
      } catch {
        // Ignore anything unparseable; the server only speaks JSON.
      }
    }
    ws.onclose = () => {
      if (socket !== ws) return
      socket = null
      const seat = storedSeat()
      if (hasSeat && seat) {
        // Dropped mid-session: keep the seat and retry in the background.
        set({ reconnecting: true })
        reconnectTimer = setTimeout(() => {
          connect(() =>
            send({
              type: 'rejoin',
              protocol: PROTOCOL_VERSION,
              code: seat.code,
              token: seat.token,
            }),
          )
        }, RECONNECT_DELAY_MS)
      } else if (get().status === 'connecting') {
        set({ status: 'idle', error: { key: 'connectionFailed' } })
      }
    }
  }

  return {
    ...RESET,

    createRoom: (name) => {
      set({ ...RESET, status: 'connecting' })
      connect(() => send({ type: 'create', protocol: PROTOCOL_VERSION, name }))
    },

    joinRoom: (code, name) => {
      set({ ...RESET, status: 'connecting' })
      connect(() =>
        send({ type: 'join', protocol: PROTOCOL_VERSION, code: normaliseRoomCode(code), name }),
      )
    },

    start: () => send({ type: 'start' }),

    sendIntent: (intent) => {
      set({ error: null })
      send({ type: 'intent', intent })
    },

    endGame: () => send({ type: 'end' }),

    leave: () => {
      teardown()
      rememberSeat(null)
      set({ ...RESET })
    },

    clearError: () => set({ error: null }),

    resume: () => {
      const seat = storedSeat()
      if (!seat || get().status !== 'idle') return
      set({ ...RESET, status: 'connecting' })
      connect(() =>
        send({ type: 'rejoin', protocol: PROTOCOL_VERSION, code: seat.code, token: seat.token }),
      )
    },

    acknowledgeEnd: () => set({ status: 'idle', endedReason: null }),
  }
})
