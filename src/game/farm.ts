/**
 * Farmyard queries: placement legality, animal capacity, and housing.
 */

import { adjacentIndices, findPastures, SPACE_COUNT, type Pasture } from './geometry'
import { ANIMALS_PER_PASTURE_SPACE, PET_CAPACITY, UNFENCED_STABLE_CAPACITY } from './rules'
import type { AnimalType, FarmSpace, Player } from './types'

export function emptySpaces(farm: FarmSpace[]): number[] {
  return farm.flatMap((space, index) => (space.kind === 'empty' ? [index] : []))
}

export function countKind(farm: FarmSpace[], kind: FarmSpace['kind']): number {
  return farm.filter((space) => space.kind === kind).length
}

/**
 * Rooms and fields must each be placed adjacent to an existing tile of the
 * same kind. The first tile of a kind may go anywhere empty. Stables are
 * explicitly exempt from the adjacency rule.
 */
export function canPlace(farm: FarmSpace[], index: number, kind: 'room' | 'field' | 'stable'): boolean {
  if (index < 0 || index >= SPACE_COUNT) return false
  if (farm[index].kind !== 'empty') return false
  if (kind === 'stable') return true

  const existing = farm.flatMap((space, i) => (space.kind === kind ? [i] : []))
  if (existing.length === 0) return true
  return adjacentIndices(index).some((neighbour) => farm[neighbour].kind === kind)
}

export function legalPlacements(farm: FarmSpace[], kind: 'room' | 'field' | 'stable'): number[] {
  const result: number[] = []
  for (let index = 0; index < SPACE_COUNT; index++) {
    if (canPlace(farm, index, kind)) result.push(index)
  }
  return result
}

export type PastureInfo = Pasture & {
  /** Stables built inside this pasture. */
  stables: number
  /** Maximum animals of a single type this pasture can hold. */
  capacity: number
}

/**
 * Pastures with their capacity. Each pasture space holds 2 animals, and each
 * stable inside the pasture doubles the whole pasture's capacity.
 */
export function pastureInfo(player: Player): PastureInfo[] {
  return findPastures(player.fences).map((pasture) => {
    const stables = pasture.spaces.filter((index) => player.farm[index].kind === 'stable').length
    const capacity = pasture.spaces.length * ANIMALS_PER_PASTURE_SPACE * 2 ** stables
    return { ...pasture, stables, capacity }
  })
}

/** Stables that are not inside any pasture; each holds exactly 1 animal. */
export function unfencedStables(player: Player): number[] {
  const fenced = new Set(pastureInfo(player).flatMap((p) => p.spaces))
  return player.farm.flatMap((space, index) =>
    space.kind === 'stable' && !fenced.has(index) ? [index] : [],
  )
}

/**
 * Total animals a farm can accommodate, ignoring the single-type-per-pasture
 * restriction. Used for quick capacity checks and UI hints.
 */
export function totalAnimalCapacity(player: Player): number {
  const pastures = pastureInfo(player).reduce((sum, p) => sum + p.capacity, 0)
  const stables = unfencedStables(player).length * UNFENCED_STABLE_CAPACITY
  return pastures + stables + PET_CAPACITY
}

export function animalsOf(player: Player, type: AnimalType): number {
  return player[type]
}

export function totalAnimals(player: Player): number {
  return player.sheep + player.boar + player.cattle
}

/**
 * How many animals of `type` the farm can hold, given what is already housed.
 * Each pasture holds a single type, so a pasture already holding another type
 * contributes nothing. The house pet slot takes any one animal.
 */
export function capacityFor(player: Player, type: AnimalType): number {
  const placements = new Map(player.animalPlacement.map((p) => [p.key, p]))
  let capacity = 0

  for (const pasture of pastureInfo(player)) {
    const occupant = placements.get(pasture.key)
    if (!occupant || occupant.count === 0) capacity += pasture.capacity
    else if (occupant.type === type) capacity += pasture.capacity
  }

  for (const index of unfencedStables(player)) {
    const occupant = placements.get(`stable:${index}`)
    if (!occupant || occupant.count === 0 || occupant.type === type) {
      capacity += UNFENCED_STABLE_CAPACITY
    }
  }

  const pet = placements.get('pet')
  if (!pet || pet.count === 0 || pet.type === type) capacity += PET_CAPACITY

  return capacity
}

/**
 * Distribute `count` animals of `type` across available housing, greedily
 * filling the largest matching space first. Returns how many could not be
 * housed — the caller decides whether that is a blocked action or a loss.
 */
export function houseAnimals(player: Player, type: AnimalType, count: number): number {
  let remaining = count
  const placements = new Map(player.animalPlacement.map((p) => [p.key, { ...p }]))

  const candidates = [
    ...pastureInfo(player)
      .map((p) => ({ key: p.key, capacity: p.capacity }))
      .sort((a, b) => b.capacity - a.capacity),
    ...unfencedStables(player).map((index) => ({
      key: `stable:${index}`,
      capacity: UNFENCED_STABLE_CAPACITY,
    })),
    { key: 'pet', capacity: PET_CAPACITY },
  ]

  for (const candidate of candidates) {
    if (remaining <= 0) break
    const existing = placements.get(candidate.key)
    if (existing && existing.count > 0 && existing.type !== type) continue

    const used = existing?.count ?? 0
    const room = candidate.capacity - used
    if (room <= 0) continue

    const added = Math.min(room, remaining)
    placements.set(candidate.key, { key: candidate.key, type, count: used + added })
    remaining -= added
  }

  player.animalPlacement = [...placements.values()].filter((p) => p.count > 0)
  return remaining
}

/** Recount a player's animal totals from their placements. */
export function syncAnimalTotals(player: Player): void {
  player.sheep = 0
  player.boar = 0
  player.cattle = 0
  for (const placement of player.animalPlacement) {
    player[placement.type] += placement.count
  }
}
