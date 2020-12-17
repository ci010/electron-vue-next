import pluginAlias from '@rollup/plugin-alias'
import pluginCommonJs from '@rollup/plugin-commonjs'
import pluginJson from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import pluginTypescript from '@rollup/plugin-typescript'
import builtins from 'builtin-modules'
import chalk from 'chalk'
import { startService } from 'esbuild'
import { extname, join, relative } from 'path'
import { createReplacePlugin } from 'vite/dist/node/build/buildPluginReplace.js'

import { external } from '../package.json'
const env = require('./env.js')

// user env variables loaded from .env files.
// only those prefixed with VITE_ are exposed.
const userClientEnv = {}
const userEnvReplacements = {}
Object.keys(env).forEach((key) => {
  userEnvReplacements[`import.meta.env.${key}`] = JSON.stringify(env[key])
  userClientEnv[key] = env[key]
})

const resolvedMode = process.env.VITE_ENV || env.VITE_ENV || process.env.NODE_ENV

const builtInClientEnv = {
  BASE_URL: '',
  MODE: process.env.NODE_ENV,
  DEV: resolvedMode !== 'production',
  PROD: resolvedMode === 'production'
}
const builtInEnvReplacements = {}
Object.keys(builtInClientEnv).forEach((key) => {
  builtInEnvReplacements[`import.meta.env.${key}`] = JSON.stringify(
    builtInClientEnv[key]
  )
})

const typescriptPluginInstance = pluginTypescript({
  tsconfig: join(__dirname, '../src/main/tsconfig.json')
})

// typescript plugin only for typecheck, it should not affect the code transform
delete typescriptPluginInstance.load
delete typescriptPluginInstance.generateBundle

let compileFailedCount = 0

/**
 * @type {import('rollup').RollupOptions}
 */
const config = ({
  output: {
    dir: join(__dirname, '../dist/electron'),
    format: 'cjs'
  },
  onwarn: (warning) => {
    if (warning.plugin === 'typescript') {
      // @ts-ignore
      console.log(`${chalk.cyan(relative(join(__dirname, '..'), warning.loc.file))}:${chalk.yellow(warning.loc.line)}:${chalk.yellow(warning.loc.column)} - ${warning.message}`)
      console.log(warning.frame)
      compileFailedCount++
    } else {
      console.log(chalk.yellow(warning.toString()))
    }
  },
  external: [...builtins, 'electron', ...external],
  plugins: [
    {
      name: 'typechecker',
      generateBundle() {
        if (compileFailedCount) {
          const count = compileFailedCount
          compileFailedCount = 0
          throw new Error(`Fail to compile the project. Found ${count} errors.`)
        }
      }
    },
    pluginAlias({
      entries: {
        '/@main': join(__dirname, '../src/main'),
        '/@shared': join(__dirname, '../src/shared')
      }
    }),
    createReplacePlugin(
      (id) => id.endsWith('.ts') || id.endsWith('.js'),
      {
        ...userEnvReplacements,
        ...builtInEnvReplacements,
        'import.meta.env.': '({}).',
        'import.meta.env': JSON.stringify({
          ...userClientEnv,
          ...builtInClientEnv
        })
      },
      true),
    typescriptPluginInstance,
    {
      name: 'main:esbuild',
      async buildStart() {
        this.cache.set('service', await startService())
      },
      buildEnd(error) {
        // Stop the service early if there's error
        if (error && !this.meta.watchMode) {
          this.cache.get('service').stop()
        }
      },
      generateBundle() {
        if (!this.meta.watchMode) {
          this.cache.get('service').stop()
        }
      },
      async resolveId(id, importer) {
        if (id.endsWith('.ts')) {
          return
        }
        const tsResult = await this.resolve(`${id}.ts`, importer, { skipSelf: true })
        if (tsResult) {
          return tsResult
        }
        const indexTsResult = await this.resolve(`${id}/index.ts`, importer, { skipSelf: true })
        if (indexTsResult) {
          return indexTsResult
        }
      },
      async transform(code, id) {
        if (id.endsWith('js') || id.endsWith('js?commonjs-proxy')) {
          return
        }
        function printMessage(m, code) {
          console.error(chalk.yellow(m.text))
          if (m.location) {
            const lines = code.split(/\r?\n/g)
            const line = Number(m.location.line)
            const column = Number(m.location.column)
            const offset =
              lines
                .slice(0, line - 1)
                .map((l) => l.length)
                .reduce((total, l) => total + l + 1, 0) + column
            console.error(
              require('@vue/compiler-dom').generateCodeFrame(code, offset, offset + 1)
            )
          }
        }
        try {
          const service = this.cache.get('service')
          const result = await service.transform(code, {
            // @ts-ignore
            loader: extname(id).slice(1),
            sourcemap: true,
            sourcefile: id,
            target: 'es2020'
          })
          if (result.warnings.length) {
            console.error(`[main] warnings while transforming ${id} with esbuild:`)
            result.warnings.forEach((m) => printMessage(m, code))
          }
          return {
            code: result.js,
            map: result.jsSourceMap
          }
        } catch (e) {
          console.error(
            chalk.red(`[main] error while transforming ${id} with esbuild:`)
          )
          if (e.errors) {
            e.errors.forEach((m) => printMessage(m, code))
          } else {
            console.error(e)
          }
          return {
            code: '',
            map: undefined
          }
        }
      }
    },
    nodeResolve({
      browser: false
    }),
    pluginCommonJs({
      extensions: ['.js', '.cjs']
    }),
    pluginJson({
      preferConst: true,
      indent: '  ',
      compact: false,
      namedExports: true
    })
  ]
})

export default config
