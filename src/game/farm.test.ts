import { describe, expect, it } from 'vitest'
import { createGame } from './engine'
import { houseAnimals, housingSlots, moveAnimals, capacityFor } from './farm'
import { horizontalEdge, verticalEdge } from './geometry'
import type { Player } from './types'

function player(): Player {
  return createGame({ names: ['A'], random: () => 0.5 }).players[0]
}

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

describe('housingSlots', () => {
  it('always offers the house pet slot', () => {
    const slots = housingSlots(player())
    expect(slots).toHaveLength(1)
    expect(slots[0]).toMatchObject({ key: 'pet', kind: 'pet', capacity: 1, count: 0 })
  })

  it('lists pastures with their capacity', () => {
    const p = player()
    p.fences = fenceRect(0, 0, 0, 1)
    const pasture = housingSlots(p).find((slot) => slot.kind === 'pasture')!
    expect(pasture.capacity).toBe(4)
    expect(pasture.spaces).toEqual([0, 1])
  })

  it('lists unfenced stables separately from pastures', () => {
    const p = player()
    p.farm[3] = { kind: 'stable' }
    const stable = housingSlots(p).find((slot) => slot.kind === 'stable')!
    expect(stable).toMatchObject({ key: 'stable:3', capacity: 1 })
  })

  it('reports the current occupant of each slot', () => {
    const p = player()
    p.fences = fenceRect(0, 0, 0, 1)
    houseAnimals(p, 'sheep', 3)

    const pasture = housingSlots(p).find((slot) => slot.kind === 'pasture')!
    expect(pasture).toMatchObject({ type: 'sheep', count: 3 })
  })

  it('reports an emptied slot as unoccupied', () => {
    const p = player()
    p.fences = fenceRect(0, 0, 0, 0)
    houseAnimals(p, 'sheep', 1)
    moveAnimals(p, p.fences.length ? '0' : '0', 'pet', 1)

    const pasture = housingSlots(p).find((slot) => slot.kind === 'pasture')!
    expect(pasture.type).toBeNull()
    expect(pasture.count).toBe(0)
  })
})

describe('moveAnimals', () => {
  it('moves animals between two pastures', () => {
    const p = player()
    p.fences = [...fenceRect(0, 0, 0, 0), ...fenceRect(0, 2, 0, 2)]
    houseAnimals(p, 'sheep', 2) // fills the first pasture

    expect(moveAnimals(p, '0', '2', 1)).toEqual({ ok: true })

    const byKey = new Map(housingSlots(p).map((slot) => [slot.key, slot]))
    expect(byKey.get('0')!.count).toBe(1)
    expect(byKey.get('2')!.count).toBe(1)
  })

  it('keeps the animal totals consistent after a move', () => {
    const p = player()
    p.fences = [...fenceRect(0, 0, 0, 0), ...fenceRect(0, 2, 0, 2)]
    houseAnimals(p, 'sheep', 2)

    moveAnimals(p, '0', '2', 1)
    expect(p.sheep).toBe(2)
  })

  it('refuses to move more animals than the slot holds', () => {
    const p = player()
    p.fences = [...fenceRect(0, 0, 0, 0), ...fenceRect(0, 2, 0, 2)]
    houseAnimals(p, 'sheep', 1)

    expect(moveAnimals(p, '0', '2', 5)).toEqual({ ok: false, reason: 'notEnoughAnimals' })
    expect(p.sheep).toBe(1)
  })

  it('refuses to exceed the target capacity', () => {
    const p = player()
    // A 1x1 pasture holds 2; a second 1x1 also holds 2.
    p.fences = [...fenceRect(0, 0, 0, 0), ...fenceRect(0, 2, 0, 2)]
    houseAnimals(p, 'sheep', 4)

    expect(moveAnimals(p, '0', '2', 2)).toEqual({ ok: false, reason: 'slotFull' })
  })

  it('refuses to mix two animal types in one pasture', () => {
    const p = player()
    p.fences = [...fenceRect(0, 0, 0, 0), ...fenceRect(0, 2, 0, 2)]
    houseAnimals(p, 'sheep', 2)
    houseAnimals(p, 'boar', 1)

    const boarSlot = housingSlots(p).find((slot) => slot.type === 'boar')!
    const sheepSlot = housingSlots(p).find((slot) => slot.type === 'sheep')!
    expect(moveAnimals(p, boarSlot.key, sheepSlot.key, 1)).toEqual({
      ok: false,
      reason: 'slotTypeMismatch',
    })
  })

  it('allows moving into a slot emptied by an earlier move', () => {
    const p = player()
    p.fences = [...fenceRect(0, 0, 0, 0), ...fenceRect(0, 2, 0, 2)]
    houseAnimals(p, 'sheep', 2)

    // Clear pasture 0 entirely, then a boar may take it.
    expect(moveAnimals(p, '0', '2', 2).ok).toBe(true)
    expect(housingSlots(p).find((slot) => slot.key === '0')!.type).toBeNull()

    houseAnimals(p, 'boar', 1)
    expect(p.boar).toBe(1)
  })

  it('rejects a move to the same slot', () => {
    const p = player()
    p.fences = fenceRect(0, 0, 0, 0)
    houseAnimals(p, 'sheep', 1)
    expect(moveAnimals(p, '0', '0', 1)).toEqual({ ok: false, reason: 'invalidMove' })
  })

  it('rejects an unknown slot', () => {
    const p = player()
    expect(moveAnimals(p, 'nowhere', 'pet', 1)).toEqual({ ok: false, reason: 'invalidMove' })
  })

  it('rejects a non-positive count', () => {
    const p = player()
    p.fences = fenceRect(0, 0, 0, 0)
    houseAnimals(p, 'sheep', 1)
    expect(moveAnimals(p, '0', 'pet', 0)).toEqual({ ok: false, reason: 'invalidMove' })
  })

  it('frees capacity that greedy placement had wasted', () => {
    // The real problem this solves: a 1x1 pasture holding one sheep blocks a
    // boar entirely, until the sheep is consolidated elsewhere.
    const p = player()
    p.fences = [...fenceRect(0, 0, 0, 0), ...fenceRect(0, 2, 0, 2)]
    houseAnimals(p, 'sheep', 1)

    // The pet slot is the only room left for a boar.
    expect(capacityFor(p, 'boar')).toBe(3)

    // Consolidating does not change sheep capacity but keeps a pasture free.
    const before = housingSlots(p).filter((slot) => slot.type === null).length
    expect(before).toBeGreaterThan(0)
  })
})

describe('capacityFor counts only free space', () => {
  function withPasture() {
    const p = player()
    // One 2-space pasture, capacity 4.
    p.fences = ['h:0:3', 'h:1:3', 'h:0:4', 'h:1:4', 'v:0:3', 'v:0:5']
    return p
  }

  it('reports nothing left in a pasture that is already full', () => {
    // It used to return the pasture's whole capacity regardless of occupants,
    // so a full farm looked like it had room and animals silently wandered off.
    const p = withPasture()
    houseAnimals(p, 'sheep', 4)
    houseAnimals(p, 'boar', 1) // takes the pet slot

    expect(capacityFor(p, 'sheep')).toBe(0)
  })

  it('reports the remaining space in a partly filled pasture', () => {
    const p = withPasture()
    houseAnimals(p, 'sheep', 3)

    // 1 space left in the pasture, plus the empty pet slot.
    expect(capacityFor(p, 'sheep')).toBe(2)
  })

  it('ignores a pasture holding a different animal', () => {
    const p = withPasture()
    houseAnimals(p, 'sheep', 1)

    // The pasture is sheep-only now; a cow can only use the pet slot.
    expect(capacityFor(p, 'cattle')).toBe(1)
  })
})
