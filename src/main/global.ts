/* eslint-disable no-unused-vars */

// declare electron static for static file serving
/**
 * The path to static resource directory
 */
declare const __static: string
/**
 * The window url records.
 */
declare const __windowUrls: Record<string, string>

declare namespace NodeJS {
  interface Global {
      __static: string
      __windowUrls: Record<string, string>
  }
}

/**
 * @see https://github.com/vitejs/vite/blob/03acecd797d8393e38c8a78f920c8e0927762018/importMeta.d.ts
 */
declare interface ImportMetaEnv {
  [key: string]: string | boolean | undefined
  BASE_URL: string
  MODE: string
  DEV: boolean
  PROD: boolean
}

/**
 * @see https://github.com/vitejs/vite/blob/03acecd797d8393e38c8a78f920c8e0927762018/importMeta.d.ts
 */
declare interface ImportMeta {
  readonly hot?: {
    readonly data: any

    accept(): void
    accept(cb: (mod: any) => void): void

    acceptDeps(dep: string, cb: (mod: any) => void): void
    acceptDeps(deps: readonly string[], cb: (mods: any[]) => void): void

    dispose(cb: (data: any) => void): void
    decline(): void
    invalidate(): void

    on(event: string, cb: (...args: any[]) => void): void
  }

  readonly env: ImportMetaEnv
}
