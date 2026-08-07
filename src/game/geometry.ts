/**
 * Farmyard geometry: a 3-row x 5-column grid whose fences sit on the edges
 * *between* spaces. This is what allows genuine Agricola pasture rules —
 * enclosure detection, pasture subdivision, and shared fences between
 * adjacent pastures.
 *
 * Edge keys:
 *   h:<row>:<col>  horizontal fence above row `row` in column `col` (row 0..3)
 *   v:<row>:<col>  vertical fence left of column `col` in row `row` (col 0..5)
 */

import type { FenceEdge } from './types'

export const ROWS = 3
export const COLS = 5
export const SPACE_COUNT = ROWS * COLS

export function toIndex(row: number, col: number): number {
  return row * COLS + col
}

export function toCoord(index: number): { row: number; col: number } {
  return { row: Math.floor(index / COLS), col: index % COLS }
}

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS
}

export function horizontalEdge(row: number, col: number): FenceEdge {
  return `h:${row}:${col}`
}

export function verticalEdge(row: number, col: number): FenceEdge {
  return `v:${row}:${col}`
}

/** Every fence slot that exists on the board (20 horizontal + 18 vertical). */
export function allEdges(): FenceEdge[] {
  const edges: FenceEdge[] = []
  for (let row = 0; row <= ROWS; row++) {
    for (let col = 0; col < COLS; col++) edges.push(horizontalEdge(row, col))
  }
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col <= COLS; col++) edges.push(verticalEdge(row, col))
  }
  return edges
}

/** The four edges bounding a single space. */
export function edgesOfSpace(index: number): {
  top: FenceEdge
  bottom: FenceEdge
  left: FenceEdge
  right: FenceEdge
} {
  const { row, col } = toCoord(index)
  return {
    top: horizontalEdge(row, col),
    bottom: horizontalEdge(row + 1, col),
    left: verticalEdge(row, col),
    right: verticalEdge(row, col + 1),
  }
}

export type Neighbour = { index: number | null; edge: FenceEdge }

/** Orthogonal neighbours of a space, each with the fence edge between them. */
export function neighbours(index: number): Neighbour[] {
  const { row, col } = toCoord(index)
  const e = edgesOfSpace(index)
  return [
    { index: inBounds(row - 1, col) ? toIndex(row - 1, col) : null, edge: e.top },
    { index: inBounds(row + 1, col) ? toIndex(row + 1, col) : null, edge: e.bottom },
    { index: inBounds(row, col - 1) ? toIndex(row, col - 1) : null, edge: e.left },
    { index: inBounds(row, col + 1) ? toIndex(row, col + 1) : null, edge: e.right },
  ]
}

/** Orthogonally adjacent space indices, ignoring fences. */
export function adjacentIndices(index: number): number[] {
  return neighbours(index)
    .map((n) => n.index)
    .filter((i): i is number => i !== null)
}

export type Pasture = {
  /** Sorted space indices making up this enclosed region. */
  spaces: number[]
  /** Stable, sorted, comma-joined identity for this pasture. */
  key: string
}

/**
 * Find every fully-enclosed region of the farmyard.
 *
 * A region is a pasture when flood fill from any of its spaces can never
 * escape the board: every step out is blocked by a fence, and no step leads
 * off the board edge without a fence. Board borders are only "closed" when a
 * fence is actually built there, matching the rulebook requirement that a
 * pasture have fences on all sides.
 */
export function findPastures(fences: Iterable<FenceEdge>): Pasture[] {
  const fenceSet = new Set(fences)
  const seen = new Set<number>()
  const pastures: Pasture[] = []

  for (let start = 0; start < SPACE_COUNT; start++) {
    if (seen.has(start)) continue

    const region: number[] = []
    const queue = [start]
    const visited = new Set<number>([start])
    let enclosed = true

    while (queue.length) {
      const current = queue.pop()!
      region.push(current)

      for (const { index, edge } of neighbours(current)) {
        if (fenceSet.has(edge)) continue // fence blocks movement — stays enclosed
        if (index === null) {
          enclosed = false // escaped off the board with no fence
          continue
        }
        if (!visited.has(index)) {
          visited.add(index)
          queue.push(index)
        }
      }
    }

    for (const index of region) seen.add(index)
    if (enclosed) {
      const spaces = [...region].sort((a, b) => a - b)
      pastures.push({ spaces, key: spaces.join(',') })
    }
  }

  return pastures
}

/** Spaces that sit inside some pasture. */
export function fencedSpaces(fences: Iterable<FenceEdge>): Set<number> {
  const result = new Set<number>()
  for (const pasture of findPastures(fences)) {
    for (const index of pasture.spaces) result.add(index)
  }
  return result
}
