import { defineConfig, devices } from '@playwright/test'

/**
 * Visual regression, separate from the Vitest suite.
 *
 * Every bug this project shipped in the last redesign was one no unit test
 * could see: fields textured like decking, crop pips too pale to read, header
 * buttons that ended up cream on cream. Those were caught by looking at
 * screenshots, which is not a thing to rely on a person remembering to do.
 *
 * Screenshots are browser-build specific, so the baselines are only meaningful
 * when compared against the same Chromium that produced them. CI installs the
 * build this Playwright pins; if you regenerate baselines somewhere else, they
 * will differ by antialiasing alone — hence the tolerance below, and hence
 * `bun run test:visual:update` running in the same place CI does.
 */
export default defineConfig({
  testDir: './visual',
  // The whole point is comparing against a committed baseline, so a missing
  // one is a failure to fix rather than a file to quietly write.
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  expect: {
    toHaveScreenshot: {
      // Tight by default, because the ratio is of the whole image: on a
      // full-page shot 2% is sixty thousand pixels, which is enough to hide a
      // button whose text has gone invisible. That is not hypothetical — the
      // first version of this config passed exactly that bug. Full-page shots
      // opt into a looser number individually; they are there to catch layout
      // coming apart, and the detail is checked on the component shots.
      maxDiffPixelRatio: 0.004,
      threshold: 0.2,
      // Decorative motion is disabled while shooting, so nothing is caught
      // mid-transition.
      animations: 'disabled',
      caret: 'hide',
    },
  },

  use: {
    baseURL: 'http://localhost:4173/farm-link/',
    // Scale 1 keeps the committed baselines small; the bugs this catches are
    // not subpixel ones.
    deviceScaleFactor: 1,
    ...devices['Desktop Chrome'],
    // This machine may ship a different Chromium build to the one Playwright
    // pins. CI installs the pinned one and leaves this unset.
    launchOptions: process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : undefined,
  },

  // Screenshot the built app rather than the dev server: it is what ships, and
  // it is what the service worker will precache.
  //
  // Never reuse a server already on the port. The obvious `!process.env.CI`
  // silently skips the rebuild, so a local run compares baselines against
  // whatever was built last — which passed a deliberately broken button
  // straight through when this was written.
  webServer: {
    command: 'bun run build && bun run preview --port 4173',
    url: 'http://localhost:4173/farm-link/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
