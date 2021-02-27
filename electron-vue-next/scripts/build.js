process.env.NODE_ENV = 'production'

const { join } = require('path')
const { build } = require('vite')
const chalk = require('chalk')
const { build: electronBuilder } = require('electron-builder')
const { stat, remove, copy, writeFile } = require('fs-extra')
const { rollup } = require('rollup')
const { loadPreloadInput, loadWorkerInput, loadRollupConfig } = require('./util')

/**
 * Generate the distribution version of package json
 */
async function generatePackageJson() {
  const original = require('../package.json')
  const result = {
    name: original.name,
    author: original.author,
    version: original.version,
    license: original.license,
    description: original.description,
    main: './electron/index.prod.js',
    dependencies: Object.entries(original.dependencies).filter(([name, version]) => original.external.indexOf(name) !== -1).reduce((object, entry) => ({ ...object, [entry[0]]: entry[1] }), {})
  }
  await writeFile('dist/package.json', JSON.stringify(result))
}

/**
 * Print the rollup output
 * @param {import('rollup').RollupOutput} output
 */
async function printOutput({ output }) {
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
}

/**
 * Use typescript to build preload
 * @param {import('rollup').RollupOptions} config
 */
async function buildPreload(config) {
  /**
   * @type {Record<string, string>}
   */
  const input = {}
  await loadPreloadInput(input)
  const bundle = await rollup({
    ...config,
    input
  })

  if (!config.output) {
    throw new Error('Unexpected rollup config to build!')
  }

  await printOutput(await bundle.write(config.output[0]))
}

/**
 * Use rollup to build main process
 * @param {import('rollup').RollupOptions} config
 */
async function buildMain(config) {
  await Promise.all([
    remove(join(__dirname, '../dist/electron/index.dev.js')),
    remove(join(__dirname, '../dist/electron/index.dev.js.map'))
  ])

  const input = {
    index: join(__dirname, '../src/main/index.prod.ts')
  }

  await loadWorkerInput(input)

  const bundle = await rollup({
    ...config,
    input
  })
  if (!config.output) {
    throw new Error('Unexpected rollup config to build!')
  }

  await printOutput(await bundle.write(config.output[0]))
}

/**
 * Use vite to build renderer process
 */
function buildRenderer() {
  const config = require('./vite.config')

  console.log(chalk.bold.underline('Build renderer process'))

  return build({
    ...config,
    mode: process.env.NODE_ENV
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

/**
 * Copy static files to the distrubution dir
 */
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

  const [mainConfig, preloadConfig] = await loadRollupConfig()

  console.log(chalk.bold.underline('Build main process & preload'))
  const startTime = Date.now()
  await Promise.all([buildMain(mainConfig), buildPreload(preloadConfig)])
  console.log(
    `Build completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s.\n`
  )
  await Promise.all([buildRenderer(), copyStatic()])

  console.log()
  if (process.env.BUILD_TARGET) {
    const config = loadElectronBuilderConfig()
    const dir = process.env.BUILD_TARGET === 'dir'
    await generatePackageJson()
    await buildElectron(config, dir)
  }
}

start().catch((e) => {
  console.error(chalk.red(e.toString()))
  process.exit(1)
})
