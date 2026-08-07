import { describe, expect, it } from 'vitest'
import { APP_VERSION, BUILD_DATE, CHANGELOG_URL } from './version'

describe('build identity', () => {
  it('resolves without throwing when Vite has not injected the globals', () => {
    // Vitest does not apply the `define` replacement, so this exercises the
    // fallback path rather than the built values.
    expect(typeof APP_VERSION).toBe('string')
    expect(APP_VERSION.length).toBeGreaterThan(0)
  })

  it('always reports a build date', () => {
    expect(typeof BUILD_DATE).toBe('string')
    expect(BUILD_DATE.length).toBeGreaterThan(0)
  })

  it('points at the changelog on the default branch', () => {
    expect(CHANGELOG_URL).toMatch(/^https:\/\/github\.com\/.+\/CHANGELOG\.md$/)
  })
})
