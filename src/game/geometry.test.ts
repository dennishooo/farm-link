import { describe, expect, it } from 'vitest'
import {
  allEdges,
  edgesOfSpace,
  fencedSpaces,
  findPastures,
  horizontalEdge,
  neighbours,
  toCoord,
  toIndex,
  verticalEdge,
} from './geometry'

/** Fully fence a rectangular block of spaces, returning the edges required. */
function fenceRect(row0: number, col0: number, row1: number, col1: number): string[] {
  const edges: string[] = []
  for (let col = col0; col <= col1; col++) {
    edges.push(horizontalEdge(row0, col), horizontalEdge(row1 + 1, col))
  }
  for (let row = row0; row <= row1; row++) {
    edges.push(verticalEdge(row, col0), verticalEdge(row, col1 + 1))
  }
  return edges
}

describe('coordinates', () => {
  it('round-trips index and coordinate', () => {
    for (let i = 0; i < 15; i++) {
      const { row, col } = toCoord(i)
      expect(toIndex(row, col)).toBe(i)
    }
  })

  it('has 38 fence slots on a 3x5 board', () => {
    // 4 horizontal rows x 5 cols = 20, plus 3 rows x 6 vertical slots = 18.
    expect(allEdges()).toHaveLength(38)
    expect(new Set(allEdges()).size).toBe(38)
  })

  it('gives corner spaces two off-board neighbours', () => {
    const offBoard = neighbours(0).filter((n) => n.index === null)
    expect(offBoard).toHaveLength(2)
  })

  it('shares an edge between adjacent spaces', () => {
    // Space 0 and space 1 are horizontally adjacent, sharing one vertical edge.
    expect(edgesOfSpace(0).right).toBe(edgesOfSpace(1).left)
  })
})

describe('findPastures', () => {
  it('finds nothing when no fences are built', () => {
    expect(findPastures([])).toEqual([])
  })

  it('does not enclose a region left open on one side', () => {
    const edges = fenceRect(0, 0, 0, 0).filter((e) => e !== verticalEdge(0, 1))
    expect(findPastures(edges)).toEqual([])
  })

  it('encloses a single fully-fenced space', () => {
    const pastures = findPastures(fenceRect(0, 0, 0, 0))
    expect(pastures).toHaveLength(1)
    expect(pastures[0].spaces).toEqual([0])
  })

  it('encloses a 1x2 pasture as one region, not two', () => {
    const pastures = findPastures(fenceRect(0, 0, 0, 1))
    expect(pastures).toHaveLength(1)
    expect(pastures[0].spaces).toEqual([0, 1])
  })

  it('splits a pasture in two when subdivided by an interior fence', () => {
    // A 1x2 pasture with a fence down the middle becomes two 1x1 pastures.
    const edges = [...fenceRect(0, 0, 0, 1), verticalEdge(0, 1)]
    const pastures = findPastures(edges)
    expect(pastures).toHaveLength(2)
    expect(pastures.map((p) => p.spaces)).toEqual([[0], [1]])
  })

  it('treats adjacent pastures as sharing their common fence', () => {
    // Two 1x1 pastures side by side need only 7 fences because they share one.
    const edges = new Set([...fenceRect(0, 0, 0, 0), ...fenceRect(0, 1, 0, 1)])
    expect(edges.size).toBe(7)
    expect(findPastures(edges)).toHaveLength(2)
  })

  it('encloses a 2x2 block as a single pasture of four spaces', () => {
    const pastures = findPastures(fenceRect(0, 0, 1, 1))
    expect(pastures).toHaveLength(1)
    expect(pastures[0].spaces).toEqual([0, 1, 5, 6])
  })

  it('reports fenced spaces across multiple pastures', () => {
    const edges = new Set([...fenceRect(0, 0, 0, 0), ...fenceRect(2, 4, 2, 4)])
    expect([...fencedSpaces(edges)].sort((a, b) => a - b)).toEqual([0, 14])
  })

  it('does not treat the board border as an implicit fence', () => {
    // Fencing only the interior side of a corner space must not enclose it.
    const edges = [horizontalEdge(1, 0), verticalEdge(0, 1)]
    expect(findPastures(edges)).toEqual([])
  })

  it('gives a pasture a stable identity key', () => {
    const [pasture] = findPastures(fenceRect(0, 0, 0, 1))
    expect(pasture.key).toBe('0,1')
  })
})
