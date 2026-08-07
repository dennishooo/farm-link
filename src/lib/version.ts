/**
 * Build identity, injected by Vite from package.json.
 *
 * Read through these helpers rather than the globals directly: unit tests run
 * without Vite's `define`, so the raw identifiers are not declared there.
 */

export const APP_VERSION: string =
  typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0-dev'

export const BUILD_DATE: string =
  typeof __BUILD_DATE__ === 'string' ? __BUILD_DATE__ : 'dev'

export const CHANGELOG_URL = 'https://github.com/dennishooo/farm-link/blob/main/CHANGELOG.md'
