import { describe, expect, it } from 'vitest'
import {
  makeCardId,
  parseConvert,
  parseTieredPoints,
  parseCardType,
  parseCost,
  parseEffects,
  parseMinPlayers,
  parsePoints,
  toCard,
  type RawCard,
} from './parse'

describe('parseCost', () => {
  it('treats a blank cost as free', () => {
    expect(parseCost('')).toEqual([])
    expect(parseCost('   ')).toEqual([])
  })

  it('parses a single good', () => {
    expect(parseCost('2 Wood')).toEqual([{ wood: 2 }])
  })

  it('treats commas as goods that must all be paid', () => {
    expect(parseCost('1 Reed,4 Clay')).toEqual([{ reed: 1, clay: 4 }])
  })

  it('treats a slash as a choice', () => {
    expect(parseCost('3 Wood/3 Clay')).toEqual([{ wood: 3 }, { clay: 3 }])
  })

  it('expands a choice combined with a fixed term', () => {
    expect(parseCost('2 Wood/2 Clay,1 Reed')).toEqual([
      { wood: 2, reed: 1 },
      { clay: 2, reed: 1 },
    ])
  })

  it('handles a four-part cost', () => {
    expect(parseCost('3 Wood,3 Clay,2 Reed,3 Stone')).toEqual([
      { wood: 3, clay: 3, reed: 2, stone: 3 },
    ])
  })

  it('keeps the payable half of an "or return a card" cost', () => {
    expect(parseCost('Return Fireplace or 4 Clay')).toEqual([{ clay: 4 }])
  })

  it('normalises vegetable plurals', () => {
    expect(parseCost('2 Vegetables')).toEqual([{ vegetable: 2 }])
  })
})

describe('parseMinPlayers', () => {
  it('reads a "3+" restriction', () => {
    expect(parseMinPlayers('3+')).toBe(3)
    expect(parseMinPlayers('4+')).toBe(4)
  })

  it('defaults to one player when unrestricted', () => {
    expect(parseMinPlayers('')).toBe(1)
    expect(parseMinPlayers('1+')).toBe(1)
  })
})

describe('parsePoints', () => {
  it('reads printed points including negatives', () => {
    expect(parsePoints('3')).toBe(3)
    expect(parsePoints('-3')).toBe(-3)
    expect(parsePoints(4)).toBe(4)
  })

  it('treats a blank as zero rather than guessing', () => {
    expect(parsePoints('')).toBe(0)
  })
})

describe('parseCardType', () => {
  it('maps the database type strings', () => {
    expect(parseCardType('Occupation')).toBe('occupation')
    expect(parseCardType('Minor Improvement')).toBe('minor')
    expect(parseCardType('Major Improvement')).toBe('major')
  })

  it('files dual-typed cards under their primary deck', () => {
    expect(parseCardType('Minor/Major Improvement')).toBe('minor')
    expect(parseCardType('Major Improvement/Occupation')).toBe('major')
  })

  it('rejects types the game does not use', () => {
    expect(parseCardType('Parent (Father)')).toBeNull()
  })
})

describe('makeCardId', () => {
  it('slugifies a title with its type', () => {
    expect(makeCardId('Clay Oven', 'minor', new Map())).toBe('minor-clay-oven')
  })

  it('disambiguates duplicate titles', () => {
    const seen = new Map<string, number>()
    expect(makeCardId('Cooking Hearth', 'major', seen)).toBe('major-cooking-hearth')
    expect(makeCardId('Cooking Hearth', 'major', seen)).toBe('major-cooking-hearth-2')
  })

  it('strips punctuation', () => {
    expect(makeCardId("Baker's Oven", 'minor', new Map())).toBe('minor-baker-s-oven')
  })
})

describe('parseEffects', () => {
  it('reads an immediate gain', () => {
    expect(parseEffects('When you play this card, take 1 Grain.')).toEqual([
      { kind: 'gain', goods: { grain: 1 } },
    ])
  })

  it('reads an immediate gain of several goods', () => {
    expect(
      parseEffects('When you play this card, you immediately get 3 Wood and 2 Clay.'),
    ).toEqual([{ kind: 'gain', goods: { wood: 3, clay: 2 } }])
  })

  it('reads an ongoing action-space bonus', () => {
    expect(
      parseEffects(
        'Whenever you use the "Day Laborer" Action space, you receive 3 additional Clay.',
      ),
    ).toEqual([{ kind: 'onAction', spaceId: 'day-laborer', goods: { clay: 3 } }])
  })

  it('reads a flat end-game bonus', () => {
    expect(parseEffects('At the end of the game, you receive 2 Bonus points.')).toEqual([
      { kind: 'points', points: 2 },
    ])
  })

  it('reads a per-unit scoring bonus', () => {
    expect(
      parseEffects(
        'At the end of the game, you receive 1 Bonus point for each room in your Stone house.',
      ),
    ).toEqual([{ kind: 'pointsPer', per: 'room', points: 1, each: 1 }])
  })

  it('leaves tiered bonuses to the players', () => {
    // "1/3/5 points for 5/6/7 improvements" needs judgement the engine lacks.
    expect(
      parseEffects(
        'At the end of the game, you receive 1/3/5/7/9 Bonus points for having 5/6/7/8/9+ Improvements in front of you.',
      ),
    ).toEqual([])
  })

  it('does not treat a conditional bonus as a flat award', () => {
    expect(
      parseEffects('At the end of the game, you receive 2 Bonus points if you have at least 5 fields.'),
    ).toEqual([])
  })

  it('returns nothing for text it cannot map', () => {
    expect(parseEffects('Something entirely unparseable happens here.')).toEqual([])
  })
})

describe('parseConvert', () => {
  it('reads a multi-good conversion table', () => {
    const rates = parseConvert(
      'At any time: Vegetable → 2 Food; Sheep → 2 Food; Wild boar → 2 Food; Cattle → 3 Food',
    )
    expect(rates).toEqual([
      { kind: 'convert', from: 'vegetable', to: 'food', rate: 2 },
      { kind: 'convert', from: 'sheep', to: 'food', rate: 2 },
      { kind: 'convert', from: 'boar', to: 'food', rate: 2 },
      { kind: 'convert', from: 'cattle', to: 'food', rate: 3 },
    ])
  })

  it('reads a colon-separated table', () => {
    const rates = parseConvert('Vegetables: 3 Food Sheep: 2 Food Cattle: 4 Food')
    expect(rates.map((r) => [r.from, r.rate])).toEqual([
      ['vegetable', 3],
      ['sheep', 2],
      ['cattle', 4],
    ])
  })

  it('keeps the use limit from "convert at most 1 Wood to 2 Food"', () => {
    expect(parseConvert('you can use the Joinery to convert at most 1 Wood to 2 Food.')).toEqual([
      { kind: 'convert', from: 'wood', to: 'food', rate: 2, limit: 1 },
    ])
  })

  it('never lists the same good twice', () => {
    const rates = parseConvert('Sheep → 2 Food; Sheep: 2 Food')
    expect(rates).toHaveLength(1)
  })

  it('returns nothing when no conversion is described', () => {
    expect(parseConvert('Plow one field.')).toEqual([])
  })
})

describe('parseTieredPoints', () => {
  it('reads the arrow form', () => {
    expect(parseTieredPoints('Scoring: 3/5/7 Wood → 1/2/3 bonus points')).toEqual({
      kind: 'pointsTiered',
      per: 'wood',
      tiers: [
        { min: 3, points: 1 },
        { min: 5, points: 2 },
        { min: 7, points: 3 },
      ],
    })
  })

  it('reads the points-first prose form', () => {
    expect(
      parseTieredPoints('At the end of the game, you receive 1/2/3 Bonus points for 2/4/5 Reed.'),
    ).toMatchObject({
      per: 'reed',
      tiers: [
        { min: 2, points: 1 },
        { min: 4, points: 2 },
        { min: 5, points: 3 },
      ],
    })
  })

  it('rejects mismatched tier lengths', () => {
    expect(parseTieredPoints('3/5/7 Wood → 1/2 bonus points')).toBeNull()
  })

  it('returns null when there is no tiered scoring', () => {
    expect(parseTieredPoints('You receive 2 bonus points.')).toBeNull()
  })
})

describe('toCard', () => {
  const raw: RawCard = {
    base_expansion: 'Base',
    card_title: 'Clay Pit',
    category: '',
    cost: '',
    players: '3+',
    text: 'Whenever you use the "Day Laborer" Action space, you receive 3 additional Clay.',
    type: 'Minor Improvement',
    vps: '1',
  }

  it('builds a typed card', () => {
    const card = toCard(raw, new Map())!
    expect(card).toMatchObject({
      id: 'minor-clay-pit',
      title: 'Clay Pit',
      type: 'minor',
      cost: [],
      points: 1,
      minPlayers: 3,
      enforced: true,
    })
  })

  it('marks a card unenforced when its text cannot be mapped', () => {
    const card = toCard({ ...raw, text: 'Something the engine cannot read.' }, new Map())!
    expect(card.enforced).toBe(false)
    expect(card.effects).toEqual([])
  })

  it('skips card types the game does not use', () => {
    expect(toCard({ ...raw, type: 'Parent (Father)' }, new Map())).toBeNull()
  })
})
