import { describe, expect, it } from 'vitest'
import {
  CARDS,
  MAJOR_IMPROVEMENTS,
  MINOR_IMPROVEMENTS,
  OCCUPATIONS,
  OCCUPATIONS_PER_PLAYER,
  MINORS_PER_PLAYER,
  actionBonuses,
  affordableOptions,
  canAfford,
  cardById,
  dealCards,
  payOption,
} from './index'
import { createGame, occupationCost, takeAction, currentPlayer } from '../engine'
import { cardPoints } from '../scoring'
import type { Card } from './types'

const deterministic = () => 0.42

describe('card data', () => {
  it('ships the full base-game pool', () => {
    expect(CARDS.length).toBeGreaterThan(380)
    expect(OCCUPATIONS.length).toBeGreaterThan(190)
    expect(MINOR_IMPROVEMENTS.length).toBeGreaterThan(180)
    expect(MAJOR_IMPROVEMENTS.length).toBeGreaterThan(0)
  })

  it('gives every card a unique id', () => {
    expect(new Set(CARDS.map((card) => card.id)).size).toBe(CARDS.length)
  })

  it('gives every card a title and text', () => {
    for (const card of CARDS) {
      expect(card.title.length, card.id).toBeGreaterThan(0)
      expect(typeof card.text).toBe('string')
    }
  })

  it('never produces a negative cost amount', () => {
    for (const card of CARDS) {
      for (const option of card.cost) {
        for (const [good, amount] of Object.entries(option)) {
          expect(amount, `${card.id} ${good}`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('marks a card enforced exactly when it has effects', () => {
    for (const card of CARDS) {
      expect(card.enforced, card.id).toBe(card.effects.length > 0)
    }
  })
})

describe('dealing', () => {
  it('deals seven of each deck per player', () => {
    const { hands } = dealCards(4, deterministic)
    expect(hands).toHaveLength(4)
    for (const hand of hands) {
      expect(hand.occupations).toHaveLength(OCCUPATIONS_PER_PLAYER)
      expect(hand.minors).toHaveLength(MINORS_PER_PLAYER)
    }
  })

  it('never deals the same card to two players', () => {
    const { hands } = dealCards(4, deterministic)
    const all = hands.flatMap((hand) => [...hand.occupations, ...hand.minors])
    expect(new Set(all).size).toBe(all.length)
  })

  it('excludes cards that need more players than are in the game', () => {
    const { hands } = dealCards(2, deterministic)
    const dealt = hands.flatMap((hand) => [...hand.occupations, ...hand.minors])
    for (const id of dealt) {
      expect(cardById(id)!.minPlayers, id).toBeLessThanOrEqual(2)
    }
  })

  it('offers the major improvements as a shared pool', () => {
    const { majors } = dealCards(2, deterministic)
    expect(majors.length).toBeGreaterThan(0)
    for (const id of majors) expect(cardById(id)!.type).toBe('major')
  })
})

describe('paying for cards', () => {
  const player = () => createGame({ names: ['A'], random: deterministic }).players[0]

  it('treats a free card as always affordable', () => {
    const free: Card = { ...CARDS[0], cost: [] }
    expect(canAfford(player(), free)).toBe(true)
    expect(affordableOptions(player(), free)).toEqual([{}])
  })

  it('rejects a card the player cannot pay for', () => {
    const costly: Card = { ...CARDS[0], cost: [{ wood: 5 }] }
    expect(canAfford(player(), costly)).toBe(false)
  })

  it('offers only the alternatives the player can pay', () => {
    const p = player()
    p.wood = 3
    p.clay = 0
    const either: Card = { ...CARDS[0], cost: [{ wood: 3 }, { clay: 3 }] }
    expect(affordableOptions(p, either)).toEqual([{ wood: 3 }])
  })

  it('deducts exactly the chosen option', () => {
    const p = player()
    p.wood = 4
    p.reed = 2
    payOption(p, { wood: 3, reed: 1 })
    expect(p.wood).toBe(1)
    expect(p.reed).toBe(1)
  })
})

describe('occupation cost', () => {
  it('makes the first occupation free on the base space', () => {
    expect(occupationCost(2, 'lessons', 0)).toBe(0)
    expect(occupationCost(2, 'lessons', 1)).toBe(1)
  })

  it('charges 2 food on the extra space in a 3-player game', () => {
    expect(occupationCost(3, 'lessons-2', 0)).toBe(2)
  })

  it('charges 1 food for the first two on the extra space with 4 players', () => {
    expect(occupationCost(4, 'lessons-2', 0)).toBe(1)
    expect(occupationCost(4, 'lessons-2', 1)).toBe(1)
    expect(occupationCost(4, 'lessons-2', 2)).toBe(2)
  })
})

describe('playing cards through the engine', () => {
  it('plays an occupation from hand for free the first time', () => {
    const state = createGame({ names: ['Ann', 'Bo'], random: deterministic })
    const player = currentPlayer(state)
    const cardId = player.hand.occupations[0]
    const foodBefore = player.food

    expect(takeAction(state, 'lessons', { cardId })).toEqual({ ok: true })
    expect(state.players[0].played).toContain(cardId)
    expect(state.players[0].hand.occupations).not.toContain(cardId)
    expect(state.players[0].food).toBe(foodBefore)
  })

  it('refuses an occupation that is not in hand', () => {
    const state = createGame({ names: ['Ann', 'Bo'], random: deterministic })
    const notInHand = OCCUPATIONS.find(
      (card) => !state.players[0].hand.occupations.includes(card.id),
    )!
    expect(takeAction(state, 'lessons', { cardId: notInHand.id })).toEqual({
      ok: false,
      reason: 'That occupation is not in your hand.',
    })
  })

  it('requires a card to be chosen', () => {
    const state = createGame({ names: ['Ann', 'Bo'], random: deterministic })
    expect(takeAction(state, 'lessons', {})).toEqual({
      ok: false,
      reason: 'Choose an occupation to play.',
    })
  })

  it('applies an immediate gain when the card is played', () => {
    const state = createGame({ names: ['Ann', 'Bo'], random: deterministic })
    const player = state.players[0]
    // Force a known card with an immediate gain into hand.
    const gainCard = CARDS.find(
      (card) => card.type === 'occupation' && card.effects.some((e) => e.kind === 'gain'),
    )!
    player.hand.occupations = [gainCard.id]
    const gain = gainCard.effects.find((e) => e.kind === 'gain')
    if (gain?.kind !== 'gain') return
    const [good, amount] = Object.entries(gain.goods)[0] as [keyof typeof player, number]
    const before = player[good] as number

    takeAction(state, 'lessons', { cardId: gainCard.id })
    expect(state.players[0][good]).toBe(before + amount)
  })

  it('takes a major improvement out of the shared pool', () => {
    const state = createGame({ names: ['Ann', 'Bo'], random: deterministic })
    state.revealed.push('major-improvement')
    const player = state.players[0]

    // Pick an affordable major and stock the player with its cost.
    const major = cardById(state.majorsAvailable[0])!
    for (const option of major.cost.slice(0, 1)) {
      for (const [good, amount] of Object.entries(option)) {
        ;(player as unknown as Record<string, number>)[good] = amount + 5
      }
    }

    const result = takeAction(state, 'major-improvement', { cardId: major.id })
    expect(result.ok).toBe(true)
    expect(state.majorsAvailable).not.toContain(major.id)
    expect(state.players[0].played).toContain(major.id)
  })

  it('refuses an improvement the player cannot afford', () => {
    const state = createGame({ names: ['Ann', 'Bo'], random: deterministic })
    state.revealed.push('major-improvement')
    const costly = state.majorsAvailable
      .map((id) => cardById(id)!)
      .find((card) => card.cost.length > 0)

    if (costly) {
      const result = takeAction(state, 'major-improvement', { cardId: costly.id })
      expect(result.ok).toBe(false)
    }
  })
})

describe('ongoing card effects', () => {
  it('grants bonus goods when the matching action space is used', () => {
    const bonusCard = CARDS.find((card) =>
      card.effects.some((e) => e.kind === 'onAction' && e.spaceId === 'day-laborer'),
    )
    if (!bonusCard) return

    const state = createGame({ names: ['Ann', 'Bo'], random: deterministic })
    state.players[0].played.push(bonusCard.id)
    const effect = bonusCard.effects.find(
      (e) => e.kind === 'onAction' && e.spaceId === 'day-laborer',
    )
    if (effect?.kind !== 'onAction') return
    const [good, amount] = Object.entries(effect.goods)[0] as ['clay', number]
    const before = state.players[0][good]

    takeAction(state, 'day-laborer')
    expect(state.players[0][good]).toBe(before + amount)
  })

  it('reports no bonuses for a space no card mentions', () => {
    expect(actionBonuses([], 'forest')).toEqual({})
  })
})

describe('card scoring', () => {
  it('scores nothing when no cards are played', () => {
    const state = createGame({ names: ['A'], random: deterministic })
    expect(cardPoints(state.players[0])).toBe(0)
  })

  it('adds the printed points of played cards', () => {
    const state = createGame({ names: ['A'], random: deterministic })
    const scoring = CARDS.filter((card) => card.points > 0 && card.effects.length === 0).slice(0, 2)
    state.players[0].played = scoring.map((card) => card.id)
    const expected = scoring.reduce((sum, card) => sum + card.points, 0)
    expect(cardPoints(state.players[0])).toBe(expected)
  })

  it('adds per-unit bonuses based on what the player owns', () => {
    const state = createGame({ names: ['A'], random: deterministic })
    const player = state.players[0]
    const perRoom = CARDS.find((card) =>
      card.effects.some((e) => e.kind === 'pointsPer' && e.per === 'room'),
    )
    if (!perRoom) return

    player.played = [perRoom.id]
    const effect = perRoom.effects.find((e) => e.kind === 'pointsPer')
    if (effect?.kind !== 'pointsPer') return
    // Two starting rooms.
    expect(cardPoints(player)).toBe(perRoom.points + 2 * effect.points)
  })
})
