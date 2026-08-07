import '@testing-library/jest-dom/vitest'

/**
 * jsdom has no matchMedia, and the theme code calls it on render. Without this
 * every component test that mounts the theme toggle dies before asserting
 * anything. Defaults to light; tests that care override `matches`.
 */
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
