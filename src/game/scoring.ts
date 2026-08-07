/**
 * End-game scoring, per the appendix section "The Scoring in Detail".
 */

import { SPACE_COUNT } from './geometry'
import { countKind, pastureInfo } from './farm'
import {
  BEGGING_PENALTY,
  BOAR_SCORE,
  CATTLE_SCORE,
  FIELD_SCORE,
  GRAIN_SCORE,
  MAX_FENCED_STABLE_POINTS,
  PASTURE_SCORE,
  POINTS_PER_CLAY_ROOM,
  POINTS_PER_FENCED_STABLE,
  POINTS_PER_PERSON,
  POINTS_PER_STONE_ROOM,
  SHEEP_SCORE,
  VEGETABLE_SCORE,
  scoreFromTable,
} from './rules'
import type { Player, ScoreBreakdown } from './types'

/**
 * Grain and vegetables score from the player's supply *and* whatever is still
 * growing on their fields.
 */
export function cropTotal(player: Player, crop: 'grain' | 'vegetable'): number {
  const inFields = player.farm.reduce(
    (sum, space) => (space.kind === 'field' && space.crop === crop ? sum + (space.cropCount ?? 0) : sum),
    0,
  )
  return player[crop] + inFields
}

/**
 * A space counts as used when covered by a room, field, or stable, or when it
 * lies inside a pasture. Everything else costs a point.
 */
export function unusedSpaceCount(player: Player): number {
  const fenced = new Set(pastureInfo(player).flatMap((p) => p.spaces))
  let unused = 0
  for (let index = 0; index < SPACE_COUNT; index++) {
    const occupied = player.farm[index].kind !== 'empty'
    if (!occupied && !fenced.has(index)) unused++
  }
  return unused
}

/** Stables lying inside a pasture, capped at 4 points. */
export function fencedStableCount(player: Player): number {
  return pastureInfo(player).reduce((sum, pasture) => sum + pasture.stables, 0)
}

export function scorePlayer(player: Player): ScoreBreakdown {
  const rooms = countKind(player.farm, 'room')
  const grain = cropTotal(player, 'grain')
  const vegetables = cropTotal(player, 'vegetable')

  const breakdown: Omit<ScoreBreakdown, 'total'> = {
    fields: scoreFromTable(FIELD_SCORE, countKind(player.farm, 'field')),
    pastures: scoreFromTable(PASTURE_SCORE, pastureInfo(player).length),
    grain: scoreFromTable(GRAIN_SCORE, grain),
    vegetables: scoreFromTable(VEGETABLE_SCORE, vegetables),
    sheep: scoreFromTable(SHEEP_SCORE, player.sheep),
    boar: scoreFromTable(BOAR_SCORE, player.boar),
    cattle: scoreFromTable(CATTLE_SCORE, player.cattle),
    unusedSpaces: -unusedSpaceCount(player),
    fencedStables: Math.min(
      fencedStableCount(player) * POINTS_PER_FENCED_STABLE,
      MAX_FENCED_STABLE_POINTS,
    ),
    clayRooms: player.house === 'clay' ? rooms * POINTS_PER_CLAY_ROOM : 0,
    stoneRooms: player.house === 'stone' ? rooms * POINTS_PER_STONE_ROOM : 0,
    people: player.people * POINTS_PER_PERSON,
    beggingMarkers: player.beggingMarkers * BEGGING_PENALTY,
  }

  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0)
  return { ...breakdown, total }
}

/**
 * Final standings. Ties break on building resources left in supply; players
 * still tied after that share a rank.
 */
export function rankPlayers(players: Player[]): { player: Player; score: ScoreBreakdown; rank: number }[] {
  const scored = players.map((player) => ({
    player,
    score: scorePlayer(player),
    resources: player.wood + player.clay + player.reed + player.stone,
  }))

  scored.sort((a, b) => b.score.total - a.score.total || b.resources - a.resources)

  let rank = 0
  let previous: { total: number; resources: number } | null = null
  return scored.map((entry, index) => {
    const tied =
      previous !== null && previous.total === entry.score.total && previous.resources === entry.resources
    if (!tied) rank = index + 1
    previous = { total: entry.score.total, resources: entry.resources }
    return { player: entry.player, score: entry.score, rank }
  })
}
