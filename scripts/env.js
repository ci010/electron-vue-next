const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

/**
 * @param {string} dir
 * @param {string[]} formats
 * @param {boolean} pathOnly
 * @return {string|undefined}
 */
function lookupFile(
  dir,
  formats,
  pathOnly = false
) {
  for (const format of formats) {
    const fullPath = path.join(dir, format)
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return pathOnly ? fullPath : fs.readFileSync(fullPath, 'utf-8')
    }
  }
  const parentDir = path.dirname(dir)
  if (parentDir !== dir) {
    return lookupFile(parentDir, formats, pathOnly)
  }
}

function loadEnv(mode, root) {
  if (mode === 'local') {
    throw new Error(
      '"local" cannot be used as a mode name because it conflicts with ' +
      'the .local postfix for .env files.'
    )
  }

  const clientEnv = {}
  const envFiles = [
    /** mode local file */ `.env.${mode}.local`,
    /** mode file */ `.env.${mode}`,
    /** local file */ '.env.local',
    /** default file */ '.env'
  ]

  for (const file of envFiles) {
    const path = lookupFile(root, [file], true)
    if (path) {
      // NOTE: this mutates process.env
      const { parsed, error } = dotenv.config({
        debug: !!process.env.DEBUG || undefined,
        path
      })

      if (!parsed) {
        throw error
      }

      // set NODE_ENV under a different key so that we know this is set from
      // vite-loaded .env files. Some users may have default NODE_ENV set in
      // their system.
      if (parsed.NODE_ENV) {
        if (process.env.VITE_ENV === undefined) {
          process.env.VITE_ENV = parsed.NODE_ENV
        }

        if (clientEnv.VITE_ENV === undefined) {
          clientEnv.VITE_ENV = parsed.NODE_ENV
        }
      }

      // only keys that start with VITE_ are exposed.
      for (const [key, value] of Object.entries(parsed)) {
        clientEnv[key] = value
      }
    }
  }

  return clientEnv
}

/**
 *
 * @param {string} mode
 * @param {Record<string, unknown>} env
 *
 * @see https://github.com/vitejs/vite/blob/bc1a8eeef725de57d0e74d7eb43803f3ea929ac8/src/node/build/index.ts#L479-L499
 */
function getReplaceMap(configMode, env = {}) {
  // user env variables loaded from .env files.
  // only those prefixed with VITE_ are exposed.
  const userClientEnv = {}
  const userEnvReplacements = {}
  Object.keys(env).forEach((key) => {
    userEnvReplacements[`import.meta.env.${key}`] = JSON.stringify(env[key])
    userClientEnv[key] = env[key]
  })

  const resolvedMode = process.env.VITE_ENV || env.VITE_ENV || configMode

  const builtInClientEnv = {
    BASE_URL: '',
    MODE: configMode,
    DEV: resolvedMode !== 'production',
    PROD: resolvedMode === 'production'
  }
  const builtInEnvReplacements = {}
  Object.keys(builtInClientEnv).forEach((key) => {
    builtInEnvReplacements[`import.meta.env.${key}`] = JSON.stringify(
      builtInClientEnv[key]
    )
  })

  return {
    ...userEnvReplacements,
    ...builtInEnvReplacements,
    'import.meta.env.': '({}).',
    'import.meta.env': JSON.stringify({
      ...userClientEnv,
      ...builtInClientEnv
    })
  }
}

module.exports = {
  getReplaceMap,
  loadEnv
}
