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
/**
 * The preload script entries
 */
declare const __preloads: Record<string, string>
/**
 * The worker script entries
 */
declare const __workers: Record<string, string>

declare namespace NodeJS {
  interface Global {
      __static: string
      __windowUrls: Record<string, string>
      __preloads: Record<string, string>
      __workers: Record<string, string>
  }
}
