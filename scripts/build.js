process.env.NODE_ENV = 'production'

const { join, relative, sep } = require('path')
const { build } = require('vite')
const chalk = require('chalk')
const { build: electronBuilder } = require('electron-builder')
const { stat, remove, copy } = require('fs-extra')
const { rollup } = require('rollup')
const loadConfigFile = require('rollup/dist/loadConfigFile')
const env = require('./env')
const builtins = require('builtin-modules')

/**
 * Load rollup config
 * @returns {Promise<import('rollup').RollupOptions>}
 */
async function loadRollupConfig() {
  console.log(chalk.bold.underline('Build main process'))

  const { options, warnings } = await loadConfigFile(join(__dirname, 'rollup.config.js'), {
    input: join(__dirname, '../src/main/index.prod.ts')
  })

  warnings.flush()

  return options[0]
}

/**
 * Resolve all dependencies used by main process
 * @param {import('rollup').RollupOptions} config
 */
async function analyzeDependencies(config) {
  const dir = join(__dirname, '..')
  const builtinSet = new Set([...builtins, 'electron'])
  const resultSet = new Set()
  const includedPackages = new Set()
  const { dependencies } = require('../package-lock.json')
  await rollup({
    ...config,
    onwarn(warn) { /* ignore */ },
    external(source, importer, resolved) {
      if (builtinSet.has(source)) {
        return true
      }
      const relativePath = relative(dir, source)
      if (relativePath.startsWith('node_modules') && resolved) {
        const [, nameOrOrg, ...rest] = relativePath.split(sep)
        if (nameOrOrg.startsWith('@')) {
          resultSet.add('node_modules' + sep + nameOrOrg + sep + rest[0] + sep + 'package.json')
          includedPackages.add(`${nameOrOrg}/${rest[0]}`)
        } else {
          resultSet.add('node_modules' + sep + nameOrOrg + sep + 'package.json')
          includedPackages.add(nameOrOrg)
        }
        resultSet.add(relativePath)
      }
      return false
    }
  }).catch((e) => { })
  return [
    // @ts-ignore
    ...[...includedPackages].map((name) => `node_modules/${name}`),
    ...Object.keys(dependencies).filter((name) => !includedPackages.has(name)).map((name) => `!node_modules/${name}`)
  ]
}

/**
 * Use typescript to build main process
 * @param {import('rollup').RollupOptions} config
 */
async function buildMain(config) {
  await Promise.all([
    remove(join(__dirname, '../dist/electron/index.dev.js')),
    remove(join(__dirname, '../dist/electron/index.dev.js.map'))
  ])
  const start = Date.now()

  const bundle = await rollup(config)
  // @ts-expect-error
  await bundle.generate(config.output[0])
  // @ts-expect-error
  const { output } = await bundle.write(config.output[0])
  for (const chunk of output) {
    if (chunk.type === 'chunk') {
      const filepath = join('dist', 'electron', chunk.fileName)
      const { size } = await stat(join(__dirname, '..', filepath))
      console.log(
        `${chalk.gray('[write]')} ${chalk.cyan(filepath)}  ${(
          size / 1024
        ).toFixed(2)}kb`
      )
    }
  }
  console.log(
    `Build completed in ${((Date.now() - start) / 1000).toFixed(2)}s.\n`
  )
}

/**
 * Use vite to build renderer process
 */
function buildRenderer() {
  const config = require('./vite.config')

  config.env = config.env || {}

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('VITE_')) {
      config.env[key] = value
    }
  }

  console.log(chalk.bold.underline('Build renderer process'))

  return build({
    ...config,
    mode: process.env.NODE_ENV,
    outDir: join(__dirname, '../dist/electron/renderer'),
    assetsInlineLimit: 0
  })
}

/**
 * Use electron builder to build your app to installer, zip, or etc.
 *
 * @param {import('electron-builder').Configuration} config The electron builder config
 * @param {boolean} dir Use dir mode to build
 */
async function buildElectron(config, dir) {
  console.log(chalk.bold.underline('Build electron'))
  const start = Date.now()
  const files = await electronBuilder({ publish: 'never', config, dir })

  for (const file of files) {
    const fstat = await stat(file)
    console.log(
      `${chalk.gray('[write]')} ${chalk.yellow(file)} ${(
        fstat.size /
        1024 /
        1024
      ).toFixed(2)}mb`
    )
  }

  console.log(
    `Build completed in ${((Date.now() - start) / 1000).toFixed(2)}s.`
  )
}

async function copyStatic() {
  await remove(join(__dirname, '../dist/electron/static'))
  await copy(
    join(__dirname, '../static'),
    join(__dirname, '../dist/electron/static')
  )
}

async function start() {
  /**
   * Load electron-builder Configuration
   */
  function loadElectronBuilderConfig() {
    switch (process.env.BUILD_TARGET) {
      case 'production':
        return require('./build.config')
      default:
        return require('./build.lite.config')
    }
  }

  const rollupConfig = await loadRollupConfig()

  await buildMain(rollupConfig)
  await Promise.all([buildRenderer(), copyStatic()])

  const result = await analyzeDependencies(rollupConfig)
  if (process.env.BUILD_TARGET) {
    const config = loadElectronBuilderConfig()
    if (config.files instanceof Array) {
      config.files.push(...result)
    }
    const dir = process.env.BUILD_TARGET === 'dir'
    await buildElectron(config, dir)
  }
}

start().catch((e) => {
  console.error(chalk.red(e.toString()))
  process.exit(1)
})
