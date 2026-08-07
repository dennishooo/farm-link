import { describe, expect, it } from 'vitest'
import { CARDS, MAJOR_IMPROVEMENTS, cardById } from './index'
import { CARD_TRANSLATIONS, cardTranslation } from './translations'
import { localiseCard } from '@/lib/i18n/format'

describe('card translations', () => {
  it('only names cards that exist in the deck', () => {
    for (const id of Object.keys(CARD_TRANSLATIONS)) {
      expect(cardById(id), id).toBeDefined()
    }
  })

  it('translates every major improvement', () => {
    // Majors are the cards players interact with most, so they are complete.
    for (const card of MAJOR_IMPROVEMENTS) {
      expect(cardTranslation(card.id), card.title).not.toBeNull()
    }
  })

  it('gives every translation a non-empty title and text', () => {
    for (const [id, translation] of Object.entries(CARD_TRANSLATIONS)) {
      expect(translation.title.trim(), id).not.toBe('')
      expect(translation.text.trim(), id).not.toBe('')
    }
  })

  it('writes translations in Chinese, not English', () => {
    for (const [id, translation] of Object.entries(CARD_TRANSLATIONS)) {
      expect(/[一-鿿]/.test(translation.title), `${id} title`).toBe(true)
      expect(/[一-鿿]/.test(translation.text), `${id} text`).toBe(true)
    }
  })

  it('leaves no stray English words in the Chinese text', () => {
    // Proper nouns and units legitimately stay in Latin script; anything else
    // is a slip. Two have shipped this way, so it is checked rather than eyed.
    const allowed = /^(FarmLink|Agricola|v?\d+(\.\d+)*)$/
    for (const [id, translation] of Object.entries(CARD_TRANSLATIONS)) {
      for (const field of [translation.title, translation.text]) {
        const words = field.match(/[A-Za-z][A-Za-z'-]*/g) ?? []
        const stray = words.filter((word) => !allowed.test(word))
        expect(stray, `${id}: ${stray.join(', ')}`).toEqual([])
      }
    }
  })

  it('translates every card whose effect the engine enforces', () => {
    // If the engine acts on a card, players must be able to read why in their
    // own language — otherwise goods appear with no explanation they can read.
    const missing = CARDS.filter((card) => card.enforced && !cardTranslation(card.id))
    expect(missing.map((card) => card.id)).toEqual([])
  })
})

describe('localiseCard', () => {
  const card = { id: 'major-clay-oven', title: 'Clay Oven', text: 'English text' }

  it('returns English unchanged for English', () => {
    expect(localiseCard(card, 'en')).toEqual({
      title: 'Clay Oven',
      text: 'English text',
      translated: true,
    })
  })

  it('returns the Chinese text when one exists', () => {
    const result = localiseCard(card, 'zh-HK')
    expect(result.title).toBe('黏土烤爐')
    expect(result.translated).toBe(true)
  })

  it('falls back to English and flags an untranslated card', () => {
    // Every shipped card is translated, so this uses a synthetic id to keep
    // the fallback path covered for any card added later.
    const result = localiseCard(
      { id: 'minor-not-yet-translated', title: 'Untranslated', text: 'English text' },
      'zh-HK',
    )
    expect(result.title).toBe('Untranslated')
    expect(result.text).toBe('English text')
    expect(result.translated).toBe(false)
  })

  it('has a translation for every card in the deck', () => {
    const missing = CARDS.filter((card) => !cardTranslation(card.id))
    expect(missing.map((card) => card.id)).toEqual([])
  })

  it('treats any zh variant as Chinese', () => {
    expect(localiseCard(card, 'zh-TW').title).toBe('黏土烤爐')
    expect(localiseCard(card, 'zh').title).toBe('黏土烤爐')
  })
})
