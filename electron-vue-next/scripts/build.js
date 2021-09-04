const chalk = require('chalk')
const { build: electronBuilder } = require('electron-builder')
const { build: esbuild } = require('esbuild')
const fsExtra = require('fs-extra')
const path = require('path')
const { build } = require('vite')
const esbuildConfig = require('./esbuild.config')
const config = require('./vite.config')

const { remove, stat } = fsExtra

process.env.NODE_ENV = 'production'

/**
 * Use esbuild to build main process
 * @param {import('esbuild').BuildOptions} options
 */
async function buildMain(options) {
  const result = await esbuild({
    ...options,
    sourceRoot: path.join(__dirname, '../src'),
    entryPoints: [path.join(__dirname, '../src/main/index.dev.ts')]
  })

  if (!result.metafile) {
    throw new Error('Unexpected rollup config to build!')
  }

  /**
   * Print the esbuild output
 * @param {import('esbuild').Metafile} options
   */
  async function printOutput(options) {
    for (const [file, chunk] of Object.entries(options.outputs)) {
      // const filepath = join('dist', chunk.fileName)
      // const { size } = await stat(join(__dirname, '..', filepath))
      console.log(
        `${chalk.gray('[write]')} ${chalk.cyan(file)}  ${(
          chunk.bytes / 1024
        ).toFixed(2)}kb`
      )
    }
  }
  // console.log(result.metafile?.outputs)
  if (result.metafile) {
    await printOutput(result.metafile)
  }
}

/**
 * Use vite to build renderer process
 */
function buildRenderer() {
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

  await remove(path.join(__dirname, '../dist'))

  console.log(chalk.bold.underline('Build main process & preload'))
  const startTime = Date.now()
  await buildMain(esbuildConfig)
  console.log(
    `Build completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s.\n`
  )
  await buildRenderer()

  console.log()
  if (process.env.BUILD_TARGET) {
    const config = loadElectronBuilderConfig()
    const dir = process.env.BUILD_TARGET === 'dir'
    // await generatePackageJson()
    await buildElectron(config, dir)
  }
}

start().catch((e) => {
  console.error(chalk.red(e.toString()))
  process.exit(1)
})
