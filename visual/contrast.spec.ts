import { test, expect, type Page } from '@playwright/test'
import { savedGame } from './fixtures'

/**
 * Text that cannot be read against what is behind it.
 *
 * This exists because the screenshot suite could not catch the bug that
 * prompted it. When the dark header arrived, the outline buttons inherited its
 * cream text and sat on their own cream background — genuinely invisible, at a
 * contrast ratio of 1.06 to 1. Pixel diffing missed it in both directions: a
 * whole-page tolerance is worth tens of thousands of pixels, and even cropped
 * to the header, the glyphs of "Pass worker" come to about four hundred, which
 * is under any tolerance loose enough to survive a font-hinting difference
 * between two Chromium builds.
 *
 * So this measures the thing directly instead. It needs no baseline, it cannot
 * drift, and it says which element failed and by how much rather than handing
 * over two images to compare by eye.
 */

/** WCAG AA: 4.5 for body text, 3.0 for large text and interface components. */
const MINIMUM = 4.5
const MINIMUM_LARGE = 3

async function open(page: Page, theme: 'light' | 'dark') {
  await page.addInitScript(
    ({ saved, theme }) => {
      localStorage.setItem('farmlink-game', saved)
      localStorage.setItem('farmlink-theme', theme)
    },
    { saved: savedGame(), theme },
  )
  await page.goto('./', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
}

type Finding = { text: string; ratio: number; color: string; background: string; where: string }

/**
 * Every leaf element holding visible text, with the contrast of its own colour
 * against the nearest painted background behind it.
 */
async function unreadableText(page: Page, minimum: number, minimumLarge: number) {
  return page.evaluate(
    ({ minimum, minimumLarge }) => {
      // The whole palette is `oklch(...)`, and reading `fillStyle` back does
      // not convert it — the first version of this did that and scored every
      // colour as black, so everything looked like a contrast ratio of 1. Paint
      // one pixel and read it instead: rasterising is the conversion.
      const canvas = document.createElement('canvas').getContext('2d', {
        willReadFrequently: true,
      })!
      function channels(colour: string): [number, number, number, number] | null {
        if (!colour || colour === 'transparent') return null
        canvas.clearRect(0, 0, 1, 1)
        canvas.fillStyle = colour
        canvas.fillRect(0, 0, 1, 1)
        const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data
        return [r, g, b, a / 255]
      }

      function luminance([r, g, b]: [number, number, number, number]): number {
        const linear = [r, g, b].map((channel) => {
          const c = channel / 255
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
      }

      /** The first ancestor that actually paints something behind this text. */
      function backdrop(element: Element): string {
        let node: Element | null = element
        while (node) {
          const colour = channels(getComputedStyle(node).backgroundColor)
          if (colour && colour[3] > 0.5) return getComputedStyle(node).backgroundColor
          node = node.parentElement
        }
        return getComputedStyle(document.body).backgroundColor
      }

      const findings: Finding[] = []
      for (const element of document.querySelectorAll<HTMLElement>('body *')) {
        // Leaves only: a wrapper's `textContent` is its children's.
        const own = [...element.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent?.trim() ?? '')
          .join(' ')
          .trim()
        if (!own) continue

        const style = getComputedStyle(element)
        if (style.visibility === 'hidden' || style.display === 'none') continue
        if (Number(style.opacity) < 0.1) continue
        const box = element.getBoundingClientRect()
        if (box.width < 2 || box.height < 2) continue
        // Screen-reader-only text is not painted, so contrast is meaningless.
        if (box.width <= 1 && box.height <= 1) continue
        if (style.clip === 'rect(0px, 0px, 0px, 0px)') continue

        const foreground = channels(style.color)
        const background = channels(backdrop(element))
        if (!foreground || !background) continue
        // Text can legitimately be faded out; that is a deliberate choice and
        // the element underneath it is what matters.
        if (foreground[3] < 0.6) continue

        const lighter = Math.max(luminance(foreground), luminance(background))
        const darker = Math.min(luminance(foreground), luminance(background))
        const ratio = (lighter + 0.05) / (darker + 0.05)

        const size = parseFloat(style.fontSize)
        const bold = Number(style.fontWeight) >= 700
        const isLarge = size >= 24 || (bold && size >= 18.66)
        const floor = isLarge ? minimumLarge : minimum

        if (ratio < floor) {
          findings.push({
            text: own.slice(0, 40),
            ratio: Math.round(ratio * 100) / 100,
            color: style.color,
            background: backdrop(element),
            where: `${element.tagName.toLowerCase()}.${element.className.toString().split(' ')[0]}`,
          })
        }
      }
      return findings
    },
    { minimum, minimumLarge },
  )
}

for (const theme of ['light', 'dark'] as const) {
  test(`every word on the board can be read (${theme})`, async ({ page }) => {
    await open(page, theme)

    const findings = await unreadableText(page, MINIMUM, MINIMUM_LARGE)

    expect(findings, JSON.stringify(findings, null, 2)).toEqual([])
  })

  test(`every word in the card panel can be read (${theme})`, async ({ page }) => {
    // The panel is closed by default, and half of it only exists once open.
    await open(page, theme)
    await page.getByText('Apply a card effect').first().click()
    await page.getByText('Score so far').first().click()

    const findings = await unreadableText(page, MINIMUM, MINIMUM_LARGE)

    expect(findings, JSON.stringify(findings, null, 2)).toEqual([])
  })
}
