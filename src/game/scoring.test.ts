import { describe, expect, it } from 'vitest'
import { createGame } from './engine'
import { cardPoints, cropTotal, fencedStableCount, rankPlayers, scorePlayer, unusedSpaceCount } from './scoring'
import { horizontalEdge, verticalEdge } from './geometry'
import type { Player } from './types'

function newPlayer(): Player {
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

describe('scoring tables', () => {
  it('penalises an empty farm in every goods category', () => {
    const player = newPlayer()
    const score = scorePlayer(player)
    expect(score.fields).toBe(-1)
    expect(score.pastures).toBe(-1)
    expect(score.grain).toBe(-1)
    expect(score.vegetables).toBe(-1)
    expect(score.sheep).toBe(-1)
    expect(score.boar).toBe(-1)
    expect(score.cattle).toBe(-1)
  })

  it('scores fields on the rulebook curve', () => {
    const cases: [number, number][] = [
      [0, -1],
      [1, -1],
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4],
      [6, 4],
    ]
    for (const [count, expected] of cases) {
      const player = newPlayer()
      for (let i = 0; i < count; i++) player.farm[i] = { kind: 'field' }
      expect(scorePlayer(player).fields, `${count} fields`).toBe(expected)
    }
  })

  it('scores grain on the 1/4/6/8 thresholds', () => {
    const cases: [number, number][] = [
      [0, -1],
      [1, 1],
      [3, 1],
      [4, 2],
      [5, 2],
      [6, 3],
      [7, 3],
      [8, 4],
      [20, 4],
    ]
    for (const [count, expected] of cases) {
      const player = newPlayer()
      player.grain = count
      expect(scorePlayer(player).grain, `${count} grain`).toBe(expected)
    }
  })

  it('scores cattle on the 1/2/4/6 thresholds', () => {
    const cases: [number, number][] = [
      [0, -1],
      [1, 1],
      [2, 2],
      [3, 2],
      [4, 3],
      [5, 3],
      [6, 4],
    ]
    for (const [count, expected] of cases) {
      const player = newPlayer()
      player.cattle = count
      expect(scorePlayer(player).cattle, `${count} cattle`).toBe(expected)
    }
  })

  it('caps pastures at 4 points however many are built', () => {
    const player = newPlayer()
    player.fences = [
      ...fenceRect(0, 0, 0, 0),
      ...fenceRect(0, 1, 0, 1),
      ...fenceRect(0, 2, 0, 2),
      ...fenceRect(0, 3, 0, 3),
      ...fenceRect(0, 4, 0, 4),
    ]
    expect(scorePlayer(player).pastures).toBe(4)
  })

  it('counts crops still growing in fields', () => {
    const player = newPlayer()
    player.grain = 1
    player.farm[0] = { kind: 'field', crop: 'grain', cropCount: 3 }
    expect(cropTotal(player, 'grain')).toBe(4)
    expect(scorePlayer(player).grain).toBe(2)
  })
})

describe('farmyard scoring', () => {
  it('loses a point per unused space', () => {
    const player = newPlayer()
    // Two starting rooms leave 13 unused spaces.
    expect(unusedSpaceCount(player)).toBe(13)
    expect(scorePlayer(player).unusedSpaces).toBe(-13)
  })

  it('treats fenced empty spaces as used', () => {
    const player = newPlayer()
    player.fences = fenceRect(0, 0, 0, 0)
    expect(unusedSpaceCount(player)).toBe(12)
  })

  it('counts only stables inside pastures, capped at 4 points', () => {
    const player = newPlayer()
    player.farm[0] = { kind: 'stable' }
    expect(fencedStableCount(player)).toBe(0)
    expect(scorePlayer(player).fencedStables).toBe(0)

    player.fences = fenceRect(0, 0, 0, 0)
    expect(fencedStableCount(player)).toBe(1)
    expect(scorePlayer(player).fencedStables).toBe(1)
  })

  it('scores rooms by house type', () => {
    const player = newPlayer()
    expect(scorePlayer(player).clayRooms).toBe(0)
    expect(scorePlayer(player).stoneRooms).toBe(0)

    player.house = 'clay'
    expect(scorePlayer(player).clayRooms).toBe(2)

    player.house = 'stone'
    expect(scorePlayer(player).stoneRooms).toBe(4)
  })

  it('scores 3 points per person and -3 per begging marker', () => {
    const player = newPlayer()
    player.people = 5
    player.beggingMarkers = 2
    const score = scorePlayer(player)
    expect(score.people).toBe(15)
    expect(score.beggingMarkers).toBe(-6)
  })

  it('sums the breakdown into the total', () => {
    const player = newPlayer()
    const score = scorePlayer(player)
    const { total, ...parts } = score
    expect(Object.values(parts).reduce((a, b) => a + b, 0)).toBe(total)
  })
})

describe('rankPlayers', () => {
  it('breaks ties on leftover building resources', () => {
    const state = createGame({ names: ['A', 'B'], random: () => 0.5 })
    state.players[1].wood = 5
    const ranked = rankPlayers(state.players)
    expect(ranked[0].player.name).toBe('B')
    expect(ranked[0].rank).toBe(1)
  })

  it('shares a rank when players are tied on both score and resources', () => {
    const state = createGame({ names: ['A', 'B'], random: () => 0.5 })
    // Equalise the asymmetric starting food, which does not score anyway.
    state.players[1].food = state.players[0].food
    const ranked = rankPlayers(state.players)
    expect(ranked[0].score.total).toBe(ranked[1].score.total)
    expect(ranked[0].rank).toBe(1)
    expect(ranked[1].rank).toBe(1)
  })
})

describe('card scoring by unit', () => {
  it('scores craft buildings on the resources still in supply', () => {
    // Regression: countUnit had no case for building resources and always
    // counted zero, so the craft buildings never scored their tiers at all.
    const player = newPlayer()
    player.played = ['major-joinery']
    player.wood = 5

    // Joinery is worth 2 points itself, plus 3/5/7 wood → 1/2/3 bonus points,
    // awarding only the highest tier reached.
    expect(cardPoints(player)).toBe(4)
  })

  it('awards nothing below the first threshold', () => {
    const player = newPlayer()
    player.played = ['major-joinery']
    player.wood = 2

    // Below 3 wood only the card's own 2 points count.
    expect(cardPoints(player)).toBe(2)
  })

  it('scores pottery on clay and the basketmaker on reed', () => {
    const potter = newPlayer()
    potter.played = ['major-pottery']
    potter.clay = 7
    expect(cardPoints(potter)).toBeGreaterThan(0)

    const weaver = newPlayer()
    weaver.played = ['major-basketmaker-s-workshop']
    weaver.reed = 7
    expect(cardPoints(weaver)).toBeGreaterThan(0)
  })

  it('scores per room', () => {
    const player = newPlayer()
    player.played = ['minor-mansion']
    const base = cardPoints(player)

    player.farm[0] = { kind: 'room' }
    expect(cardPoints(player)).toBeGreaterThan(base)
  })

  it('counts a card that is worth flat points', () => {
    const player = newPlayer()
    player.played = ['major-clay-oven']
    expect(cardPoints(player)).toBe(2)
  })

  it('scores nothing for a player holding no cards', () => {
    expect(cardPoints(newPlayer())).toBe(0)
  })
})
