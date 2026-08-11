import { describe, expect, it } from 'vitest'
import {
  ABANDONED_TTL_MS,
  ROOM_TTL_MS,
  RoomRegistry,
  type Transport,
} from './rooms'
import { PROTOCOL_VERSION, type ServerMessage } from '../src/multiplayer/protocol'

class FakeTransport implements Transport {
  sent: ServerMessage[] = []
  send(message: ServerMessage): void {
    this.sent.push(message)
  }
  ofType<T extends ServerMessage['type']>(type: T): Extract<ServerMessage, { type: T }>[] {
    return this.sent.filter((m) => m.type === type) as Extract<ServerMessage, { type: T }>[]
  }
  last(): ServerMessage | undefined {
    return this.sent[this.sent.length - 1]
  }
}

/** Deterministic registry: cycling random (codes stay unique), counting uuids. */
function makeRegistry(): RoomRegistry {
  let seed = 0
  let tokens = 0
  return new RoomRegistry({
    random: () => {
      seed = (seed + 13) % 97
      return seed / 97
    },
    uuid: () => `token-${tokens++}`,
  })
}

function createRoom(registry: RoomRegistry, name = 'Ann') {
  const host = new FakeTransport()
  registry.handleMessage(host, { type: 'create', protocol: PROTOCOL_VERSION, name }, 0)
  const code = host.ofType('joined')[0].code
  return { host, code }
}

function joinRoom(registry: RoomRegistry, code: string, name = 'Bo') {
  const guest = new FakeTransport()
  registry.handleMessage(guest, { type: 'join', protocol: PROTOCOL_VERSION, code, name }, 0)
  return guest
}

describe('creating and joining', () => {
  it('seats the creator as host with a room code', () => {
    const registry = makeRegistry()
    const { host } = createRoom(registry)

    const joined = host.ofType('joined')[0]
    expect(joined.code).toMatch(/^[A-Z2-9]{4}$/)
    expect(joined.seat).toBe(0)
    expect(host.ofType('room')[0]).toMatchObject({ host: 0, seat: 0 })
  })

  it('adds a joiner to the next seat and tells everyone', () => {
    const registry = makeRegistry()
    const { host, code } = createRoom(registry)
    const guest = joinRoom(registry, code)

    expect(guest.ofType('joined')[0].seat).toBe(1)
    const hostView = host.ofType('room').at(-1)
    expect(hostView?.players.map((p) => p.name)).toEqual(['Ann', 'Bo'])
    expect(guest.ofType('room').at(-1)?.seat).toBe(1)
  })

  it('accepts a lowercase room code', () => {
    const registry = makeRegistry()
    const { code } = createRoom(registry)
    const guest = joinRoom(registry, code.toLowerCase())
    expect(guest.ofType('joined')).toHaveLength(1)
  })

  it('rejects an unknown room code', () => {
    const registry = makeRegistry()
    const guest = joinRoom(registry, 'XXXX')
    expect(guest.last()).toMatchObject({ type: 'error', key: 'roomNotFound' })
  })

  it('rejects a fifth player', () => {
    const registry = makeRegistry()
    const { code } = createRoom(registry)
    joinRoom(registry, code, 'Bo')
    joinRoom(registry, code, 'Cy')
    joinRoom(registry, code, 'Di')
    const fifth = joinRoom(registry, code, 'Ed')
    expect(fifth.last()).toMatchObject({ type: 'error', key: 'roomFull' })
  })

  it('rejects mismatched protocol versions', () => {
    const registry = makeRegistry()
    const stale = new FakeTransport()
    registry.handleMessage(stale, { type: 'create', protocol: PROTOCOL_VERSION + 1, name: 'X' }, 0)
    expect(stale.last()).toMatchObject({ type: 'error', key: 'protocolMismatch' })
    expect(registry.roomCount()).toBe(0)
  })

  it('ignores unparseable messages', () => {
    const registry = makeRegistry()
    const noisy = new FakeTransport()
    registry.handleMessage(noisy, 'not json {', 0)
    registry.handleMessage(noisy, '42', 0)
    expect(noisy.sent).toHaveLength(0)
  })
})

describe('starting a game', () => {
  it('needs the host and at least two players', () => {
    const registry = makeRegistry()
    const { host, code } = createRoom(registry)

    registry.handleMessage(host, { type: 'start' }, 0)
    expect(host.last()).toMatchObject({ type: 'error', key: 'needTwoPlayers' })

    const guest = joinRoom(registry, code)
    registry.handleMessage(guest, { type: 'start' }, 0)
    expect(guest.last()).toMatchObject({ type: 'error', key: 'hostOnly' })

    registry.handleMessage(host, { type: 'start' }, 0)
    const state = host.ofType('state')[0]
    expect(state.game.players.map((p) => p.name)).toEqual(['Ann', 'Bo'])
    expect(guest.ofType('state')).toHaveLength(1)
  })

  it('locks the room once the game has started', () => {
    const registry = makeRegistry()
    const { host, code } = createRoom(registry)
    joinRoom(registry, code)
    registry.handleMessage(host, { type: 'start' }, 0)

    const late = joinRoom(registry, code, 'Late')
    expect(late.last()).toMatchObject({ type: 'error', key: 'roomStarted' })
  })
})

describe('intents', () => {
  function startedGame() {
    const registry = makeRegistry()
    const { host, code } = createRoom(registry)
    const guest = joinRoom(registry, code)
    registry.handleMessage(host, { type: 'start' }, 0)
    return { registry, host, guest, code }
  }

  it('applies a legal intent and broadcasts the new state to everyone', () => {
    const { registry, host, guest } = startedGame()

    registry.handleMessage(host, { type: 'intent', intent: { kind: 'skipWorker' } }, 0)

    expect(host.ofType('state').at(-1)?.game.currentPlayerIndex).toBe(1)
    expect(guest.ofType('state').at(-1)?.game.currentPlayerIndex).toBe(1)
  })

  it('sends a rejection only to the offender and keeps the state', () => {
    const { registry, host, guest } = startedGame()
    const statesBefore = host.ofType('state').length

    // Seat 1 tries to act on seat 0's turn.
    registry.handleMessage(guest, { type: 'intent', intent: { kind: 'skipWorker' } }, 0)

    expect(guest.last()).toMatchObject({ type: 'error', key: 'notYourTurn' })
    expect(host.ofType('state')).toHaveLength(statesBefore)
  })

  it('survives a structurally broken intent', () => {
    const { registry, host } = startedGame()
    registry.handleMessage(
      host,
      { type: 'intent', intent: { kind: 'nonsense' } as never },
      0,
    )
    expect(host.last()).toMatchObject({ type: 'error', key: 'badRequest' })
    expect(registry.roomCount()).toBe(1)
  })

  it('rejects intents before the game starts', () => {
    const registry = makeRegistry()
    const { host } = createRoom(registry)
    registry.handleMessage(host, { type: 'intent', intent: { kind: 'skipWorker' } }, 0)
    expect(host.last()).toMatchObject({ type: 'error', key: 'gameNotStarted' })
  })
})

describe('leaving and reconnecting', () => {
  it('removes a lobby player who disconnects', () => {
    const registry = makeRegistry()
    const { host, code } = createRoom(registry)
    const guest = joinRoom(registry, code)

    registry.handleClose(guest)

    expect(host.ofType('room').at(-1)?.players).toHaveLength(1)
  })

  it('passes the host role on when the host leaves the lobby', () => {
    const registry = makeRegistry()
    const { host, code } = createRoom(registry)
    const guest = joinRoom(registry, code)

    registry.handleClose(host)

    // The remaining player now sits in seat 0, which is the host seat.
    expect(guest.ofType('room').at(-1)).toMatchObject({ seat: 0, host: 0 })
  })

  it('dissolves an empty lobby', () => {
    const registry = makeRegistry()
    const { host } = createRoom(registry)
    registry.handleClose(host)
    expect(registry.roomCount()).toBe(0)
  })

  it('keeps a mid-game seat for its token and restores it on rejoin', () => {
    const registry = makeRegistry()
    const { host, code } = createRoom(registry)
    const guest = joinRoom(registry, code)
    registry.handleMessage(host, { type: 'start' }, 0)
    const token = guest.ofType('joined')[0].token

    registry.handleClose(guest)
    expect(host.ofType('room').at(-1)?.players[1]).toMatchObject({ connected: false })

    const phone = new FakeTransport()
    registry.handleMessage(phone, { type: 'rejoin', protocol: PROTOCOL_VERSION, code, token }, 0)

    expect(phone.ofType('joined')[0].seat).toBe(1)
    expect(phone.ofType('state')).toHaveLength(1)
    expect(host.ofType('room').at(-1)?.players[1]).toMatchObject({ connected: true })
  })

  it('rejects a rejoin with a stale token', () => {
    const registry = makeRegistry()
    const { code } = createRoom(registry)
    const phone = new FakeTransport()
    registry.handleMessage(
      phone,
      { type: 'rejoin', protocol: PROTOCOL_VERSION, code, token: 'nope' },
      0,
    )
    expect(phone.last()).toMatchObject({ type: 'error', key: 'cannotRejoin' })
  })
})

describe('ending and sweeping', () => {
  it('lets only the host end the room, telling everyone', () => {
    const registry = makeRegistry()
    const { host, code } = createRoom(registry)
    const guest = joinRoom(registry, code)

    registry.handleMessage(guest, { type: 'end' }, 0)
    expect(guest.last()).toMatchObject({ type: 'error', key: 'hostOnly' })

    registry.handleMessage(host, { type: 'end' }, 0)
    expect(host.last()).toMatchObject({ type: 'ended', reason: 'host' })
    expect(guest.last()).toMatchObject({ type: 'ended', reason: 'host' })
    expect(registry.roomCount()).toBe(0)
  })

  it('sweeps a room everyone abandoned mid-game', () => {
    const registry = makeRegistry()
    const { host, code } = createRoom(registry)
    const guest = joinRoom(registry, code)
    registry.handleMessage(host, { type: 'start' }, 0)
    registry.handleClose(host)
    registry.handleClose(guest)

    registry.sweep(ABANDONED_TTL_MS - 1)
    expect(registry.roomCount()).toBe(1)

    registry.sweep(ABANDONED_TTL_MS + 1)
    expect(registry.roomCount()).toBe(0)
  })

  it('sweeps any room after the long idle limit', () => {
    const registry = makeRegistry()
    const { host } = createRoom(registry)

    registry.sweep(ROOM_TTL_MS + 1)

    expect(registry.roomCount()).toBe(0)
    expect(host.last()).toMatchObject({ type: 'ended', reason: 'expired' })
  })
})
