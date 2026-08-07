/**
 * Theme handling. The app follows the OS setting by default and remembers an
 * explicit override, matching how the rest of the UI persists state locally.
 */

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'farmlink-theme'

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark')
}

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

export function setStoredTheme(theme: Theme): void {
  if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
  else localStorage.setItem(STORAGE_KEY, theme)
  applyTheme(theme)
}

/**
 * Apply the theme on boot and keep following the OS while no explicit
 * override is set.
 */
export function initTheme(): void {
  applyTheme(getStoredTheme())
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (getStoredTheme() === 'system') applyTheme('system')
    })
}
