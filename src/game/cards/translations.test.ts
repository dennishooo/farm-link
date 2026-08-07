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
    const untranslated = CARDS.find((entry) => !cardTranslation(entry.id))!
    const result = localiseCard(untranslated, 'zh-HK')
    expect(result.title).toBe(untranslated.title)
    expect(result.translated).toBe(false)
  })

  it('treats any zh variant as Chinese', () => {
    expect(localiseCard(card, 'zh-TW').title).toBe('黏土烤爐')
    expect(localiseCard(card, 'zh').title).toBe('黏土烤爐')
  })
})
