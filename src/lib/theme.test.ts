import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, getStoredTheme, resolveTheme, setStoredTheme } from './theme'

/** jsdom has no real matchMedia, so drive it explicitly per test. */
function mockPrefersDark(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  )
}

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    mockPrefersDark(false)
  })

  it('defaults to following the system', () => {
    expect(getStoredTheme()).toBe('system')
  })

  it('resolves system to the OS preference', () => {
    mockPrefersDark(true)
    expect(resolveTheme('system')).toBe('dark')
    mockPrefersDark(false)
    expect(resolveTheme('system')).toBe('light')
  })

  it('honours an explicit choice over the OS preference', () => {
    mockPrefersDark(true)
    expect(resolveTheme('light')).toBe('light')
  })

  it('toggles the dark class on the document', () => {
    applyTheme('dark')
    expect(document.documentElement).toHaveClass('dark')
    applyTheme('light')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('persists an explicit theme and clears it for system', () => {
    setStoredTheme('dark')
    expect(getStoredTheme()).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')

    setStoredTheme('system')
    expect(localStorage.getItem('farmlink-theme')).toBeNull()
    expect(getStoredTheme()).toBe('system')
  })

  it('ignores a corrupted stored value', () => {
    localStorage.setItem('farmlink-theme', 'chartreuse')
    expect(getStoredTheme()).toBe('system')
  })
})
