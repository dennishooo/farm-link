import { test, expect, type Page } from '@playwright/test'
import { savedGame } from './fixtures'

/**
 * One screenshot per view that a change could plausibly wreck, in both themes.
 *
 * Kept deliberately few: every baseline is a file somebody has to look at when
 * it changes, and a suite nobody trusts gets `--update-snapshots` run on it
 * without reading the diff, which is worse than having none.
 */

/** The footer carries the version and build date, which change on their own. */
const VOLATILE = (page: Page) => [page.locator('footer, p:has(a[href*="CHANGELOG"])')]

/**
 * A whole page is millions of pixels, so a proportional tolerance there is
 * worth tens of thousands of them. These shots are for layout falling apart;
 * anything smaller is caught by the component shots below, at the default.
 */
const LAYOUT = { maxDiffPixelRatio: 0.02 }

async function open(page: Page, { theme, game }: { theme: 'light' | 'dark'; game: boolean }) {
  await page.addInitScript(
    ({ saved, theme, game }) => {
      if (game) localStorage.setItem('farmlink-game', saved)
      else localStorage.removeItem('farmlink-game')
      localStorage.setItem('farmlink-theme', theme)
    },
    { saved: savedGame(), theme, game },
  )
  await page.goto('./', { waitUntil: 'networkidle' })
  // The bundled font must be in before anything is measured, or the first
  // screenshot is of a fallback face.
  await page.evaluate(() => document.fonts.ready)
}

for (const theme of ['light', 'dark'] as const) {
  test(`setup screen (${theme})`, async ({ page }) => {
    await open(page, { theme, game: false })
    await expect(page).toHaveScreenshot(`setup-${theme}.png`, {
      fullPage: true,
      mask: VOLATILE(page),
      ...LAYOUT,
    })
  })

  test(`board (${theme})`, async ({ page }) => {
    await open(page, { theme, game: true })
    await expect(page).toHaveScreenshot(`board-${theme}.png`, {
      fullPage: true,
      mask: VOLATILE(page),
      ...LAYOUT,
    })
  })

  test(`header controls (${theme})`, async ({ page }) => {
    // Small, and the part most likely to break silently: these controls sit on
    // a dark ground and once shipped with cream text on cream buttons.
    await open(page, { theme, game: true })
    await expect(page.locator('header').first()).toHaveScreenshot(`header-${theme}.png`)
  })
}

test('a farm on its own, where the materials have to read', async ({ page }) => {
  // The farmyard is where the texture work lives, and where a palette change
  // does the most damage. Shot on its own so the diff is not diluted.
  await open(page, { theme: 'light', game: true })
  // `.last()`, because the section wrapping every farm also contains this
  // text; the innermost match is the one player's card.
  const farm = page.locator('section').filter({ hasText: 'To act' }).last()
  await expect(farm).toHaveScreenshot('farm-panel.png')
})

test('the fencing picker over the board', async ({ page }) => {
  await open(page, { theme: 'light', game: true })
  await page.getByText('Apply a card effect').first().click()
  await page.getByRole('button', { name: 'Build fences' }).first().click()
  await expect(page.getByRole('dialog')).toHaveScreenshot('fence-dialog.png')
})

test('board on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, { theme: 'light', game: true })
  await expect(page).toHaveScreenshot('board-mobile.png', {
    fullPage: true,
    mask: VOLATILE(page),
    ...LAYOUT,
  })
})
