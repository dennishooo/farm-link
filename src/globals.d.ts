declare module '*.css' {
  const content: string
  export default content
}

/** Injected at build time from package.json. */
declare const __APP_VERSION__: string
/** ISO date (YYYY-MM-DD) the bundle was built. */
declare const __BUILD_DATE__: string

/** The slice of Vite's import.meta.env the app reads. */
interface ImportMetaEnv {
  /** Multiplayer server override, e.g. wss://farm.example.com/ws. Defaults to same-origin /ws. */
  readonly VITE_WS_URL?: string
}

interface ImportMeta {
  readonly env?: ImportMetaEnv
}
