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
