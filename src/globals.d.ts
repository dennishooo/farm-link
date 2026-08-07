declare module '*.css' {
  const content: string
  export default content
}

/** Injected at build time from package.json. */
declare const __APP_VERSION__: string
/** ISO date (YYYY-MM-DD) the bundle was built. */
declare const __BUILD_DATE__: string
