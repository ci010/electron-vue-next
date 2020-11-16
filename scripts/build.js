process.env.NODE_ENV = 'production'

const { join } = require('path')
const { build } = require('vite')
const chalk = require('chalk')
const { build: electronBuilder } = require('electron-builder')
const { stat, remove, copy, writeFile } = require('fs-extra')
const { rollup } = require('rollup')
const loadConfigFile = require('rollup/dist/loadConfigFile')
const env = require('./env')

/**
 * Load rollup config
 * @returns {Promise<import('rollup').RollupOptions>}
 */
async function loadRollupConfig() {
  console.log(chalk.bold.underline('Build main process'))

  const { options, warnings } = await loadConfigFile(join(process.cwd(), './rollup.config.js'))

  warnings.flush()

  return options[0]
}

/**
 * Generate the distribution version of package json
 */
// async function generatePackageJson() {
//   const original = require('../package.json')
//   const result = {
//     name: original.name,
//     author: original.author,
//     version: original.version,
//     license: original.license,
//     description: original.description,
//     main: './electron/index.prod.js',
//     dependencies: Object.entries(original.dependencies).filter(([name, version]) => original.external.indexOf(name) !== -1).reduce((object, entry) => ({ ...object, [entry[0]]: entry[1] }), {})
//   }
//   await writeFile('dist/package.json', JSON.stringify(result))
// }

/**
 * Use typescript to build main process
 * @param {import('rollup').RollupOptions} config
 */
async function buildMain(config) {
  // await Promise.all([
  //   remove(join(__dirname, '../dist/electron/index.dev.js')),
  //   remove(join(__dirname, '../dist/electron/index.dev.js.map'))
  // ])
  const start = Date.now()

  const bundle = await rollup(config)
  await bundle.generate(config.output[0])
  const { output } = await bundle.write(config.output[0])

  // for (const chunk of output) {
  //   if (chunk.type === 'chunk') {
  //     const filepath = join('dist', 'electron', chunk.fileName)
  //     const { size } = await stat(join(__dirname, '..', filepath))
  //     console.log(
  //       `${chalk.gray('[write]')} ${chalk.cyan(filepath)}  ${(
  //         size / 1024
  //       ).toFixed(2)}kb`
  //     )
  //   }
  // }
  console.log(
    `Build completed in ${((Date.now() - start) / 1000).toFixed(2)}s.\n`
  )
}

/**
 * Use vite to build renderer process
 */
function buildRenderer() {
  const config = require('../vite.config.js')

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
  })
}

/**
 * Use electron builder to build your app to installer, zip, or etc.
 *
 * @param {import('electron-builder').Configuration} config The electron builder config
 * @param {boolean} dir Use dir mode to build
 */
async function buildElectron() {
  console.log(chalk.bold.underline('Build electron'))
  const start = Date.now()
  const files = await electronBuilder({ publish: 'never' })

  // for (const file of files) {
  //   const fstat = await stat(file)
  //   console.log(
  //     `${chalk.gray('[write]')} ${chalk.yellow(file)} ${(
  //       fstat.size /
  //       1024 /
  //       1024
  //     ).toFixed(2)}mb`
  //   )
  // }

  console.log(
    `Build completed in ${((Date.now() - start) / 1000).toFixed(2)}s.`
  )
}

async function copyStatic() {
  await remove(join(__dirname, '../dist/source/static'))
  await copy(
    join(__dirname, '../static'),
    join(__dirname, '../dist/source/static')
  )
}

async function start() {
  /**
   * Load electron-builder Configuration
   */
  // function loadElectronBuilderConfig() {
  //   switch (process.env.BUILD_TARGET) {
  //     case 'production':
  //       return require('./build.config')
  //     default:
  //       return require('./build.lite.config')
  //   }
  // }

  const rollupConfig = await loadRollupConfig()

  // await buildMain(rollupConfig)
  await Promise.all([buildRenderer(), copyStatic()])

  if (process.env.BUILD_TARGET) {
    // const config = loadElectronBuilderConfig()
    // const dir = process.env.BUILD_TARGET === 'dir'
  //   await generatePackageJson()
    await buildElectron()
  }
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
