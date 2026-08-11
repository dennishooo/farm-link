import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSessionStore } from './session'
import { PROTOCOL_VERSION } from '@/multiplayer/protocol'
import type { GameState } from '@/game/types'
import { createGame } from '@/game/engine'

/**
 * The store drives a real WebSocket in the browser; here a hand-cranked fake
 * lets each test play the server's side of the conversation.
 */
class FakeWebSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3
  static instances: FakeWebSocket[] = []
  static latest(): FakeWebSocket {
    return FakeWebSocket.instances[FakeWebSocket.instances.length - 1]
  }

  url: string
  readyState = FakeWebSocket.CONNECTING
  sent: string[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onclose: (() => void) | null = null

  constructor(url: string) {
    this.url = url
    FakeWebSocket.instances.push(this)
  }

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    this.readyState = FakeWebSocket.CLOSED
  }

  // Test drivers.
  open(): void {
    this.readyState = FakeWebSocket.OPEN
    this.onopen?.()
  }

  receive(message: unknown): void {
    this.onmessage?.({ data: JSON.stringify(message) })
  }

  /** A drop the client did not ask for, e.g. the server or radio went away. */
  drop(): void {
    this.readyState = FakeWebSocket.CLOSED
    this.onclose?.()
  }

  messages(): { type: string; [key: string]: unknown }[] {
    return this.sent.map((raw) => JSON.parse(raw))
  }
}

function testGame(): GameState {
  return createGame({ names: ['Ann', 'Bo'], random: () => 0.42 })
}

/** Open the socket and walk through create → seat granted → lobby. */
function seatInLobby() {
  useSessionStore.getState().createRoom('Ann')
  const socket = FakeWebSocket.latest()
  socket.open()
  socket.receive({ type: 'joined', code: 'ABCD', seat: 0, token: 'tok-1' })
  socket.receive({
    type: 'room',
    players: [{ name: 'Ann', connected: true }],
    host: 0,
    seat: 0,
  })
  return socket
}

beforeEach(() => {
  vi.stubGlobal('WebSocket', FakeWebSocket)
  FakeWebSocket.instances = []
  sessionStorage.clear()
})

afterEach(() => {
  useSessionStore.getState().leave()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('creating and joining', () => {
  it('sends a create message once the socket opens', () => {
    useSessionStore.getState().createRoom('Ann')
    expect(useSessionStore.getState().status).toBe('connecting')

    const socket = FakeWebSocket.latest()
    socket.open()

    expect(socket.messages()).toEqual([
      { type: 'create', protocol: PROTOCOL_VERSION, name: 'Ann' },
    ])
  })

  it('normalises the room code when joining', () => {
    useSessionStore.getState().joinRoom(' abcd ', 'Bo')
    const socket = FakeWebSocket.latest()
    socket.open()
    expect(socket.messages()[0]).toMatchObject({ type: 'join', code: 'ABCD' })
  })

  it('reaches the lobby with a remembered seat', () => {
    seatInLobby()

    const state = useSessionStore.getState()
    expect(state.status).toBe('lobby')
    expect(state.code).toBe('ABCD')
    expect(state.seat).toBe(0)
    expect(JSON.parse(sessionStorage.getItem('farmlink-online') ?? '{}')).toEqual({
      code: 'ABCD',
      token: 'tok-1',
    })
  })

  it('returns to idle with the error when the server refuses', () => {
    useSessionStore.getState().joinRoom('XXXX', 'Bo')
    const socket = FakeWebSocket.latest()
    socket.open()
    socket.receive({ type: 'error', key: 'roomNotFound', values: { code: 'XXXX' } })

    const state = useSessionStore.getState()
    expect(state.status).toBe('idle')
    expect(state.error).toEqual({ key: 'roomNotFound', values: { code: 'XXXX' } })
  })

  it('reports an unreachable server', () => {
    useSessionStore.getState().createRoom('Ann')
    FakeWebSocket.latest().drop()

    const state = useSessionStore.getState()
    expect(state.status).toBe('idle')
    expect(state.error).toEqual({ key: 'connectionFailed' })
  })
})

describe('playing', () => {
  it('enters play when the state broadcast arrives', () => {
    const socket = seatInLobby()
    socket.receive({ type: 'state', game: testGame() })

    const state = useSessionStore.getState()
    expect(state.status).toBe('playing')
    expect(state.game?.players.map((p) => p.name)).toEqual(['Ann', 'Bo'])
  })

  it('sends intents over the wire', () => {
    const socket = seatInLobby()
    socket.receive({ type: 'state', game: testGame() })

    useSessionStore.getState().sendIntent({ kind: 'skipWorker' })

    expect(socket.messages().at(-1)).toEqual({
      type: 'intent',
      intent: { kind: 'skipWorker' },
    })
  })

  it('keeps playing through an in-game rejection', () => {
    const socket = seatInLobby()
    socket.receive({ type: 'state', game: testGame() })
    socket.receive({ type: 'error', key: 'notYourTurn' })

    const state = useSessionStore.getState()
    expect(state.status).toBe('playing')
    expect(state.error).toEqual({ key: 'notYourTurn', values: undefined })
  })

  it('clears the session when the room ends', () => {
    const socket = seatInLobby()
    socket.receive({ type: 'state', game: testGame() })
    socket.receive({ type: 'ended', reason: 'host' })

    const state = useSessionStore.getState()
    expect(state.status).toBe('ended')
    expect(state.endedReason).toBe('host')
    expect(state.game).toBeNull()
    expect(sessionStorage.getItem('farmlink-online')).toBeNull()

    state.acknowledgeEnd()
    expect(useSessionStore.getState().status).toBe('idle')
  })
})

describe('reconnecting', () => {
  it('retries with the seat token after an unexpected drop', () => {
    vi.useFakeTimers()
    const socket = seatInLobby()

    socket.drop()
    expect(useSessionStore.getState().reconnecting).toBe(true)

    vi.advanceTimersByTime(3000)
    const retry = FakeWebSocket.latest()
    expect(retry).not.toBe(socket)
    retry.open()

    expect(retry.messages()[0]).toEqual({
      type: 'rejoin',
      protocol: PROTOCOL_VERSION,
      code: 'ABCD',
      token: 'tok-1',
    })

    retry.receive({ type: 'joined', code: 'ABCD', seat: 0, token: 'tok-1' })
    expect(useSessionStore.getState().reconnecting).toBe(false)
  })

  it('resumes a stored seat at boot', () => {
    sessionStorage.setItem('farmlink-online', JSON.stringify({ code: 'ABCD', token: 'tok-9' }))

    useSessionStore.getState().resume()
    const socket = FakeWebSocket.latest()
    socket.open()

    expect(socket.messages()[0]).toEqual({
      type: 'rejoin',
      protocol: PROTOCOL_VERSION,
      code: 'ABCD',
      token: 'tok-9',
    })
  })

  it('gives up quietly when the seat is gone', () => {
    sessionStorage.setItem('farmlink-online', JSON.stringify({ code: 'ABCD', token: 'tok-9' }))
    useSessionStore.getState().resume()
    const socket = FakeWebSocket.latest()
    socket.open()

    socket.receive({ type: 'error', key: 'cannotRejoin' })

    const state = useSessionStore.getState()
    expect(state.status).toBe('idle')
    expect(sessionStorage.getItem('farmlink-online')).toBeNull()
  })

  it('does not resume when nothing was stored', () => {
    useSessionStore.getState().resume()
    expect(FakeWebSocket.instances).toHaveLength(0)
    expect(useSessionStore.getState().status).toBe('idle')
  })
})
