const { join } = require('path')
const { build } = require('vite')
const chalk = require('chalk').default
const { build: electronBuilder } = require('electron-builder')
const { move, readdir, stat, remove, copy } = require('fs-extra')
const { rollup } = require('rollup')
const loadConfigFile = require('rollup/dist/loadConfigFile')

/**
 * Use typescript to build main process
 */
async function buildMain() {
  await Promise.all([remove(join(__dirname, '../dist/electron/index.dev.js')), remove(join(__dirname, '../dist/electron/index.dev.js.map'))])
  const start = Date.now()
  console.log(chalk.bold.underline('Build main process'))
  const { options, warnings } = await loadConfigFile(join(__dirname, 'rollup.config.js'), {
    input: join(__dirname, '../src/main/index.prod.ts')
  })
  warnings.flush()
  /**
   * @type {import('rollup').RollupOptions}
   */
  const config = options[0]
  const bundle = await rollup(config)
  // @ts-ignore
  await bundle.generate(config.output[0])
  // @ts-ignore
  const { output } = await bundle.write(config.output[0])
  for (const chunk of output) {
    if (chunk.type === 'chunk') {
      const filepath = join('dist', 'electron', chunk.fileName)
      const { size } = await stat(join(__dirname, '..', filepath))
      console.log(`${chalk.gray('[write]')} ${chalk.cyan(filepath)}  ${(size / 1024).toFixed(2)}kb`)
    }
  }
  console.log(`Build completed in ${((Date.now() - start) / 1000).toFixed(2)}s.`)
  console.log()
}

/**
 * Use vite to build renderer process
 */
async function buildRenderer() {
  const config = require('./vite.config')
  console.log(chalk.bold.underline('Build renderer process'))
  await build({
    ...config,
    mode: 'production',
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
  /**
   * Rename files so the real name aligns to the url in github assets
   */
  async function renameFiles(s) {
    const files = await readdir('build')
    for (const file of files) {
      if (file.indexOf(' ') !== -1) {
        await move(`build/${file}`, `build/${file.replace(/ /g, '-')}`)
      }
    }
    return s
  }
  console.log(chalk.bold.underline('Build electron'))
  const start = Date.now()
  await electronBuilder({ publish: 'never', config, dir }).then(renameFiles).then(async (files) => {
    for (const file of files) {
      const fstat = await stat(file)
      console.log(`${chalk.gray('[write]')} ${chalk.yellow(file)} ${(fstat.size / 1024 / 1024).toFixed(2)}mb`)
    }
  })
  console.log(`Build completed in ${((Date.now() - start) / 1000).toFixed(2)}s.`)
}

async function copyStatic() {
  await remove(join(__dirname, '../dist/electron/static'))
  await copy(join(__dirname, '../static'), join(__dirname, '../dist/electron/static'))
}

async function start() {
  /**
   * Load electron-builder Configuration
   */
  function loadConfig() {
    switch (process.env.BUILD_TARGET) {
      case 'production':
        return require('./build.config')
      default:
        return require('./build.lite.config')
    }
  }

  await buildMain()
  await Promise.all([buildRenderer(), copyStatic()])

  if (process.env.BUILD_TARGET) {
    const config = loadConfig()
    const dir = process.env.BUILD_TARGET === 'dir'
    await buildElectron(config, dir)
  }
}

start()
