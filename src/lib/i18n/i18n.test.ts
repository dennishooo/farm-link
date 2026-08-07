import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import i18n, { SUPPORTED_LANGUAGES } from './index'
import en from './en'
import zhHK from './zh-HK'
import { formatError, formatLogEntry } from './format'
import { BASE_ACTION_SPACES, STAGE_ACTION_SPACES } from '@/game/rules'

/** Every leaf key path in a nested translation object. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix]
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  )
}

/** Placeholders like {{name}} used by a translation string. */
function placeholders(text: string): string[] {
  return [...text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]).sort()
}

function leaves(value: unknown, prefix = ''): [string, string][] {
  if (typeof value === 'string') return [[prefix, value]]
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([key, child]) =>
    leaves(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('translation bundles', () => {
  it('offers English and Traditional Chinese', () => {
    expect(SUPPORTED_LANGUAGES.map((language) => language.code)).toEqual(['en', 'zh-HK'])
  })

  it('defines exactly the same keys in both languages', () => {
    const enKeys = keyPaths(en).sort()
    const zhKeys = keyPaths(zhHK).sort()

    expect(zhKeys.filter((key) => !enKeys.includes(key))).toEqual([])
    expect(enKeys.filter((key) => !zhKeys.includes(key))).toEqual([])
  })

  it('uses the same placeholders in both languages', () => {
    const zhByKey = new Map(leaves(zhHK))
    for (const [key, text] of leaves(en)) {
      const translated = zhByKey.get(key)
      if (!translated) continue
      expect(placeholders(translated), key).toEqual(placeholders(text))
    }
  })

  it('leaves no English text untranslated in the Chinese bundle', () => {
    const enByKey = new Map(leaves(en))
    const shared = [
      'app.title', // The product name stays in Latin script.
      'farm.cropCount', // Placeholders and a multiplication sign only.
    ]

    for (const [key, text] of leaves(zhHK)) {
      if (shared.includes(key)) continue
      expect(text, key).not.toBe(enByKey.get(key))
    }
  })

  it('translates every action space in both languages', () => {
    const spaces = [...BASE_ACTION_SPACES, ...STAGE_ACTION_SPACES]
    for (const space of spaces) {
      expect(keyPaths(en), space.id).toContain(`spaces.${space.id}.name`)
      expect(keyPaths(zhHK), space.id).toContain(`spaces.${space.id}.name`)
    }
  })
})

describe('engine keys', () => {
  it('has a translation for every key the engine logs or fails with', async () => {
    // Vitest runs from the project root, so these paths are stable.
    const engine = await readFile('src/game/engine.ts', 'utf-8')
    const store = await readFile('src/stores/game.ts', 'utf-8')
    const source = engine + store

    const logKeys = [...source.matchAll(/logMessage\(\s*\w+,\s*'([\w-]+)'/g)].map((m) => m[1])
    const passKey = [...source.matchAll(/key:\s*'([\w-]+)'/g)].map((m) => m[1])
    const errorKeys = [...source.matchAll(/fail\('([\w-]+)'/g)].map((m) => m[1])

    expect(logKeys.length).toBeGreaterThan(10)
    expect(errorKeys.length).toBeGreaterThan(20)

    for (const key of [...logKeys, ...passKey]) {
      expect(Object.keys(en.log), `log.${key}`).toContain(key)
      expect(Object.keys(zhHK.log), `log.${key}`).toContain(key)
    }
    for (const key of errorKeys) {
      expect(Object.keys(en.errors), `errors.${key}`).toContain(key)
      expect(Object.keys(zhHK.errors), `errors.${key}`).toContain(key)
    }
  })
})

describe('language resolution', () => {
  it('actually resolves zh-HK rather than falling back to English', async () => {
    // Regression: nonExplicitSupportedLngs narrowed zh-HK to zh, which was not
    // in supportedLngs, so every string silently rendered in English.
    await i18n.changeLanguage('zh-HK')
    expect(i18n.resolvedLanguage).toBe('zh-HK')
    expect(i18n.t('game.farms')).toBe('農場')
  })

  it('maps a plain zh browser locale onto Traditional Chinese', async () => {
    await i18n.changeLanguage('zh')
    expect(i18n.t('game.farms')).toBe('農場')
  })

  it('switches back to English cleanly', async () => {
    await i18n.changeLanguage('en')
    expect(i18n.resolvedLanguage).toBe('en')
    expect(i18n.t('game.farms')).toBe('Farms')
  })
})

describe('formatting game text', () => {
  it('renders a log entry in English', async () => {
    await i18n.changeLanguage('en')
    const text = formatLogEntry({ round: 1, key: 'plow', values: { name: 'Ann' } }, i18n.getFixedT(null, 'translation'))
    expect(text).toBe('Ann plows a field.')
  })

  it('renders the same entry in Traditional Chinese', async () => {
    await i18n.changeLanguage('zh-HK')
    const text = formatLogEntry({ round: 1, key: 'plow', values: { name: 'Ann' } }, i18n.getFixedT(null, 'translation'))
    expect(text).toContain('開墾')
    expect(text).toContain('Ann')
  })

  it('translates goods inside log values', async () => {
    await i18n.changeLanguage('zh-HK')
    const text = formatLogEntry(
      { round: 1, key: 'takeGoods', values: { name: 'Ann', amount: 3, good: 'wood' } },
      i18n.getFixedT(null, 'translation'),
    )
    expect(text).toContain('木材')
    expect(text).not.toContain('wood')
  })

  it('translates action space ids inside log values', async () => {
    await i18n.changeLanguage('zh-HK')
    const text = formatLogEntry({ round: 1, key: 'spaceRevealed', values: { space: 'forest' } }, i18n.getFixedT(null, 'translation'))
    expect(text).toContain('森林')
  })

  it('never translates a player name that collides with a goods key', async () => {
    await i18n.changeLanguage('zh-HK')
    const text = formatLogEntry({ round: 1, key: 'plow', values: { name: 'wood' } }, i18n.getFixedT(null, 'translation'))
    expect(text).toContain('wood')
    expect(text).not.toContain('木材')
  })

  it('translates a card id inside a log entry', async () => {
    await i18n.changeLanguage('zh-HK')
    const text = formatLogEntry(
      {
        round: 1,
        key: 'convert',
        values: { name: 'Ann', amount: 1, good: 'grain', count: 5, cardId: 'major-clay-oven' },
      },
      i18n.getFixedT(null, 'translation'),
    )
    expect(text).toContain('黏土烤爐')
    expect(text).toContain('穀物')
    expect(text).not.toContain('Clay Oven')
  })

  it('renders an error with its interpolated values', async () => {
    await i18n.changeLanguage('en')
    const text = formatError({ key: 'stablesRemaining', values: { count: 2 } }, i18n.getFixedT(null, 'translation'))
    expect(text).toBe('You only have 2 stable(s) left.')
  })

  it('translates the material inside an error', async () => {
    await i18n.changeLanguage('zh-HK')
    const text = formatError({ key: 'renovationCost', values: { count: 2, material: 'clay' } }, i18n.getFixedT(null, 'translation'))
    expect(text).toContain('黏土')
  })
})
