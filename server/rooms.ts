/**
 * Room registry: the server's whole brain, kept free of Bun APIs so vitest
 * can drive it with fake transports.
 *
 * One room = one game. The creator holds seat 0 and is the host; seats fill
 * in join order. The server owns the authoritative `GameState`: clients send
 * intents, the registry validates them through the same engine the
 * single-device mode uses, and broadcasts the whole state back on success.
 * Failures go only to the sender, as `errors.*` translation keys, so each
 * device renders them in its own language.
 */

import { createGame } from '../src/game/engine'
import type { GameState } from '../src/game/types'
import { applyIntent } from '../src/multiplayer/apply'
import {
  MAX_SEATS,
  MIN_SEATS_TO_START,
  normaliseRoomCode,
  PROTOCOL_VERSION,
  randomRoomCode,
  type ClientMessage,
  type ServerMessage,
} from '../src/multiplayer/protocol'

/** The one thing the registry needs from a socket. */
export type Transport = {
  send(message: ServerMessage): void
}

type Seat = {
  name: string
  token: string
  transport: Transport | null
}

type Room = {
  code: string
  seats: Seat[]
  game: GameState | null
  /** Timestamp of the last message touching this room, for expiry. */
  lastActivity: number
}

/** Rooms idle this long are swept regardless of state. */
export const ROOM_TTL_MS = 2 * 60 * 60 * 1000
/** Rooms where everyone has disconnected are swept after this much quiet. */
export const ABANDONED_TTL_MS = 10 * 60 * 1000

export class RoomRegistry {
  private rooms = new Map<string, Room>()
  private memberships = new Map<Transport, { room: Room; seat: Seat }>()
  private random: () => number
  private uuid: () => string

  constructor(options?: { random?: () => number; uuid?: () => string }) {
    this.random = options?.random ?? Math.random
    this.uuid = options?.uuid ?? (() => crypto.randomUUID())
  }

  roomCount(): number {
    return this.rooms.size
  }

  handleMessage(transport: Transport, raw: unknown, now = Date.now()): void {
    const message = parseMessage(raw)
    if (!message) return

    switch (message.type) {
      case 'create':
        return this.create(transport, message, now)
      case 'join':
        return this.join(transport, message, now)
      case 'rejoin':
        return this.rejoin(transport, message, now)
      case 'start':
        return this.start(transport, now)
      case 'intent':
        return this.intent(transport, message, now)
      case 'end':
        return this.end(transport)
    }
  }

  handleClose(transport: Transport): void {
    const membership = this.memberships.get(transport)
    if (!membership) return
    this.memberships.delete(transport)

    const { room, seat } = membership
    seat.transport = null

    if (room.game) {
      // Mid-game the seat is kept for a rejoin; just show the drop.
      this.broadcastRoom(room)
      return
    }

    // In the lobby a dropped player simply leaves. The host role follows
    // seat 0, so if the host leaves the next player inherits it.
    room.seats = room.seats.filter((s) => s !== seat)
    if (room.seats.length === 0) {
      this.rooms.delete(room.code)
      return
    }
    this.broadcastRoom(room)
  }

  /** Drop rooms nobody is coming back to. Called on an interval by the server. */
  sweep(now = Date.now()): void {
    for (const room of [...this.rooms.values()]) {
      const abandoned = room.seats.every((seat) => seat.transport === null)
      const idleFor = now - room.lastActivity
      if (idleFor > ROOM_TTL_MS || (abandoned && idleFor > ABANDONED_TTL_MS)) {
        this.dissolve(room, 'expired')
      }
    }
  }

  private create(
    transport: Transport,
    message: Extract<ClientMessage, { type: 'create' }>,
    now: number,
  ): void {
    if (!this.checkProtocol(transport, message.protocol)) return
    if (this.memberships.has(transport)) return transport.send(error('alreadyInRoom'))

    let code = randomRoomCode(this.random)
    while (this.rooms.has(code)) code = randomRoomCode(this.random)

    const seat: Seat = { name: cleanName(message.name, 1), token: this.uuid(), transport }
    const room: Room = { code, seats: [seat], game: null, lastActivity: now }
    this.rooms.set(code, room)
    this.memberships.set(transport, { room, seat })

    transport.send({ type: 'joined', code, seat: 0, token: seat.token })
    this.broadcastRoom(room)
  }

  private join(
    transport: Transport,
    message: Extract<ClientMessage, { type: 'join' }>,
    now: number,
  ): void {
    if (!this.checkProtocol(transport, message.protocol)) return
    if (this.memberships.has(transport)) return transport.send(error('alreadyInRoom'))

    const code = normaliseRoomCode(message.code)
    const room = this.rooms.get(code)
    if (!room) return transport.send(error('roomNotFound', { code }))
    if (room.game) return transport.send(error('roomStarted'))
    if (room.seats.length >= MAX_SEATS) return transport.send(error('roomFull'))

    const seat: Seat = {
      name: cleanName(message.name, room.seats.length + 1),
      token: this.uuid(),
      transport,
    }
    room.seats.push(seat)
    room.lastActivity = now
    this.memberships.set(transport, { room, seat })

    transport.send({ type: 'joined', code, seat: room.seats.length - 1, token: seat.token })
    this.broadcastRoom(room)
  }

  private rejoin(
    transport: Transport,
    message: Extract<ClientMessage, { type: 'rejoin' }>,
    now: number,
  ): void {
    if (!this.checkProtocol(transport, message.protocol)) return

    const code = normaliseRoomCode(message.code)
    const room = this.rooms.get(code)
    const seat = room?.seats.find((s) => s.token === message.token)
    if (!room || !seat) return transport.send(error('cannotRejoin'))

    // A stale socket may still be bound to the seat (e.g. a phone that lost
    // radio without a clean close). The new connection wins.
    if (seat.transport) this.memberships.delete(seat.transport)
    seat.transport = transport
    room.lastActivity = now
    this.memberships.set(transport, { room, seat })

    transport.send({ type: 'joined', code, seat: room.seats.indexOf(seat), token: seat.token })
    this.broadcastRoom(room)
    if (room.game) transport.send({ type: 'state', game: room.game })
  }

  private start(transport: Transport, now: number): void {
    const membership = this.memberships.get(transport)
    if (!membership) return transport.send(error('notInRoom'))

    const { room, seat } = membership
    if (room.seats.indexOf(seat) !== 0) return transport.send(error('hostOnly'))
    if (room.game) return transport.send(error('roomStarted'))
    if (room.seats.length < MIN_SEATS_TO_START) return transport.send(error('needTwoPlayers'))

    room.game = createGame({ names: room.seats.map((s) => s.name), random: this.random })
    room.lastActivity = now
    this.broadcastState(room)
  }

  private intent(
    transport: Transport,
    message: Extract<ClientMessage, { type: 'intent' }>,
    now: number,
  ): void {
    const membership = this.memberships.get(transport)
    if (!membership) return transport.send(error('notInRoom'))

    const { room, seat } = membership
    if (!room.game) return transport.send(error('gameNotStarted'))

    // Same draft discipline as the local store: the engine mutates a clone,
    // and a failed intent leaves the authoritative state untouched.
    const draft = structuredClone(room.game)
    const seatIndex = room.seats.indexOf(seat)
    let result
    try {
      result = applyIntent(draft, message.intent, {
        seat: seatIndex,
        isHost: seatIndex === 0,
      })
    } catch {
      // A structurally invalid intent must not take the room down with it.
      result = undefined
    }
    if (!result) return transport.send(error('badRequest'))
    if (!result.ok) {
      return transport.send({ type: 'error', key: result.reason, values: result.values })
    }

    room.game = draft
    room.lastActivity = now
    this.broadcastState(room)
  }

  private end(transport: Transport): void {
    const membership = this.memberships.get(transport)
    if (!membership) return transport.send(error('notInRoom'))

    const { room, seat } = membership
    if (room.seats.indexOf(seat) !== 0) return transport.send(error('hostOnly'))
    this.dissolve(room, 'host')
  }

  private dissolve(room: Room, reason: 'host' | 'expired'): void {
    for (const seat of room.seats) {
      seat.transport?.send({ type: 'ended', reason })
      if (seat.transport) this.memberships.delete(seat.transport)
    }
    this.rooms.delete(room.code)
  }

  private checkProtocol(transport: Transport, protocol: number): boolean {
    if (protocol === PROTOCOL_VERSION) return true
    transport.send(error('protocolMismatch'))
    return false
  }

  private broadcastRoom(room: Room): void {
    const players = room.seats.map((seat) => ({
      name: seat.name,
      connected: seat.transport !== null,
    }))
    room.seats.forEach((seat, index) => {
      seat.transport?.send({ type: 'room', players, host: 0, seat: index })
    })
  }

  private broadcastState(room: Room): void {
    if (!room.game) return
    for (const seat of room.seats) {
      seat.transport?.send({ type: 'state', game: room.game })
    }
  }
}

function error(key: string, values?: Record<string, string | number>): ServerMessage {
  return { type: 'error', key, values }
}

/** Names come from clients: trim, cap like the local setup screen, never empty. */
function cleanName(raw: string, seatNumber: number): string {
  const name = raw.trim().slice(0, 16)
  return name || `Player ${seatNumber}`
}

function parseMessage(raw: unknown): ClientMessage | null {
  let value: unknown = raw
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (typeof value !== 'object' || value === null) return null
  const type = (value as { type?: unknown }).type
  if (typeof type !== 'string') return null
  // Field-level validation happens where each message is handled; the engine
  // rejects anything structurally wrong with a normal error result.
  return value as ClientMessage
}
