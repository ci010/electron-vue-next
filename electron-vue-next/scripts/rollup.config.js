import pluginAlias from '@rollup/plugin-alias'
import pluginCommonJs from '@rollup/plugin-commonjs'
import pluginJson from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import builtins from 'builtin-modules'
import chalk from 'chalk'
import { join } from 'path'
import pluginEsbuild from 'rollup-plugin-esbuild'
import { external } from '../package.json'
import pluginResolve from './rollup.resolve.plugin'
import pluginWorker from './rollup.worker.plugin'
import pluginTypescript from './rollup.typescript.plugin'

/**
 * @type {import('rollup').RollupOptions[]}
 */
const config = [{
  // this is the rollup config of main process
  output: {
    dir: join(__dirname, '../dist/electron'),
    format: 'cjs'
  },
  onwarn: (warning) => {
    if (warning.plugin === 'typescript:checker') {
      console.log(chalk.yellow(warning.message))
    } else {
      console.log(chalk.yellow(warning.toString()))
    }
  },
  external: [...builtins, 'electron', ...external],
  plugins: [
    pluginAlias({
      entries: {
        '/@main': join(__dirname, '../src/main'),
        '/@shared': join(__dirname, '../src/shared'),
        '/@static': join(__dirname, '../static'),
        '/@renderer': join(__dirname, '../src/renderer'),
        '/@preload': join(__dirname, '../src/preload')
      }
    }),
    pluginResolve(),
    pluginTypescript({
      tsconfig: join(__dirname, '../src/main/tsconfig.json')
    }),
    pluginEsbuild({
      target: 'esnext',
      sourceMap: true,
      tsconfig: join(__dirname, '../src/main/tsconfig.json'),
      loaders: {
        '.json': 'json'
      }
    }),
    pluginWorker(),
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
}, {
  // this is the rollup config of preload
  output: {
    dir: join(__dirname, '../dist/electron'),
    format: 'cjs'
  },
  onwarn: (warning) => {
    if (warning.plugin === 'typescript:checker') {
      console.log(chalk.yellow(warning.message))
    } else {
      console.log(chalk.yellow(warning.toString()))
    }
  },
  external: [...builtins, 'electron', ...external],
  plugins: [
    pluginAlias({
      entries: {
        '/@main': join(__dirname, '../src/main'),
        '/@shared': join(__dirname, '../src/shared')
      }
    }),
    pluginTypescript({
      tsconfig: join(__dirname, '../src/preload/tsconfig.json')
    }),
    pluginEsbuild(),
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
}]

export default config
