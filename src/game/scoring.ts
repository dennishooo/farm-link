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
import { cardById } from './cards'
import type { Player, ScoreBreakdown } from './types'

/**
 * Points from cards played face up: their printed value plus any bonus the
 * engine can compute. Bonuses whose text the parser could not read are left
 * out, since guessing them would silently distort the final score.
 */
export function cardPoints(player: Player): number {
  let total = 0

  for (const id of player.played) {
    const card = cardById(id)
    if (!card) continue
    total += card.points

    for (const effect of card.effects) {
      if (effect.kind === 'points') total += effect.points
      else if (effect.kind === 'pointsPer') {
        total += Math.floor(countUnit(player, effect.per) / effect.each) * effect.points
      } else if (effect.kind === 'pointsTiered') {
        // Only the highest threshold the player reaches scores.
        const quantity = countUnit(player, effect.per)
        const reached = effect.tiers.filter((tier) => quantity >= tier.min)
        if (reached.length > 0) total += reached[reached.length - 1].points
      }
    }
  }

  return total
}

function countUnit(player: Player, per: string): number {
  switch (per) {
    case 'room':
      return countKind(player.farm, 'room')
    case 'field':
      return countKind(player.farm, 'field')
    case 'pasture':
      return pastureInfo(player).length
    case 'grain':
      return cropTotal(player, 'grain')
    case 'vegetable':
      return cropTotal(player, 'vegetable')
    case 'sheep':
      return player.sheep
    case 'boar':
      return player.boar
    case 'cattle':
      return player.cattle
    // Building resources left in supply, which the craft buildings score on.
    case 'wood':
      return player.wood
    case 'clay':
      return player.clay
    case 'reed':
      return player.reed
    case 'stone':
      return player.stone
    case 'food':
      return player.food
    case 'person':
      return player.people
    case 'improvement':
      return player.played.filter((id) => cardById(id)?.type !== 'occupation').length
    case 'occupation':
      return player.played.filter((id) => cardById(id)?.type === 'occupation').length
    default:
      return 0
  }
}

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
    cards: cardPoints(player),
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
