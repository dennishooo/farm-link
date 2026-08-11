/**
 * The multiplayer server: a Bun WebSocket endpoint at /ws plus, when a build
 * exists, static hosting of `dist/` so one process can serve a whole LAN game
 * night. All the actual room logic lives in rooms.ts; this file only adapts
 * Bun sockets to the registry's Transport interface.
 *
 * Run with `bun run server` (after `BASE_PATH=/ bun run build` if you want it
 * to serve the app too). PORT overrides the default 8787.
 */

import { normalize, join } from 'node:path'
import { RoomRegistry, type Transport } from './rooms'
import type { ServerMessage } from '../src/multiplayer/protocol'

const port = Number(process.env.PORT ?? 8787)
const registry = new RoomRegistry()
const distDir = new URL('../dist', import.meta.url).pathname

// Bun's ws `data` generics vary across versions; a WeakMap sidesteps them.
const transports = new WeakMap<object, Transport>()

const server = Bun.serve({
  port,
  async fetch(request, server) {
    const url = new URL(request.url)

    if (url.pathname === '/ws') {
      if (server.upgrade(request)) return undefined
      return new Response('WebSocket upgrade required', { status: 426 })
    }

    if (url.pathname === '/healthz') {
      return Response.json({ ok: true, rooms: registry.roomCount() })
    }

    return serveStatic(url.pathname)
  },
  websocket: {
    open(ws) {
      transports.set(ws, {
        send(message: ServerMessage) {
          ws.send(JSON.stringify(message))
        },
      })
    },
    message(ws, raw) {
      const transport = transports.get(ws)
      if (transport) registry.handleMessage(transport, typeof raw === 'string' ? raw : '')
    },
    close(ws) {
      const transport = transports.get(ws)
      if (transport) registry.handleClose(transport)
    },
  },
})

async function serveStatic(pathname: string): Promise<Response> {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^\/+/, '')
  const resolved = join(distDir, relative)
  if (resolved.startsWith(distDir) && relative !== '') {
    const file = Bun.file(resolved)
    if (await file.exists()) return new Response(file)
  }

  // Single-page app: anything unknown falls back to the built index, and a
  // missing build gets a hint instead of a bare 404.
  const index = Bun.file(join(distDir, 'index.html'))
  if (await index.exists()) return new Response(index)
  return new Response(
    'FarmLink multiplayer server is running. Build the app with `BASE_PATH=/ bun run build` to serve it from here, or connect via the Vite dev server.',
    { status: 200, headers: { 'content-type': 'text/plain' } },
  )
}

// Rooms nobody returns to are reclaimed in the background.
setInterval(() => registry.sweep(), 60_000)

console.log(`FarmLink multiplayer server listening on http://localhost:${server.port} (ws at /ws)`)
