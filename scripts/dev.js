process.env.NODE_ENV = 'development'

const electron = require('electron')
const { spawn } = require('child_process')
const { join } = require('path')
const { createServer } = require('vite')
const chalk = require('chalk')
const loadConfigFile = require('rollup/dist/loadConfigFile')
const { watch } = require('rollup')
const { EOL } = require('os')

const env = require('./env')

const manualRestart = false

/**
 * @type {import('child_process').ChildProcessWithoutNullStreams  | null}
 */
let electronProcess = null

/**
 * Start electron process and inspect port 5858 with 9222 as debug port.
 */
function startElectron() {
  /** @type {any} */
  const electronPath = electron
  const spawnProcess = spawn(
    electronPath,
    ['--inspect=5858', '--remote-debugging-port=9222', join(__dirname, '../dist/electron/index.dev.js')]
  )

  /**
   * @param {string | Buffer} data
   */
  function electronLog(data) {
    const colorize = (line) => {
      if (line.startsWith('[INFO]')) {
        return chalk.green('[INFO]') + line.substring(6)
      } else if (line.startsWith('[WARN]')) {
        return chalk.yellow('[WARN]') + line.substring(6)
      } else if (line.startsWith('[ERROR]')) {
        return chalk.red('[ERROR]') + line.substring(7)
      }
      return chalk.grey('[console] ') + line
    }
    console.log(
      data.toString()
        .split(EOL)
        .filter(s => s.trim() !== '')
        .map(colorize).join(EOL)
    )
  }

  spawnProcess.stdout.on('data', electronLog)
  spawnProcess.stderr.on('data', electronLog)
  spawnProcess.on('exit', (_, signal) => {
    if (!manualRestart) {
      // if (!devtoolProcess.killed) {
      //     devtoolProcess.kill(0);
      // }

      if (!signal) { // Manual close
        process.exit(0)
      }
    }
  })

  electronProcess = spawnProcess
}

/**
 * Kill and restart electron process
 */
function reloadElectron() {
  if (electronProcess) {
    electronProcess.kill('SIGTERM')
    console.log(chalk.bold.underline.green('Electron App Restarted'))
  } else {
    console.log(chalk.bold.underline.green('Electron App Started'))
  }
  startElectron()
}

/**
 * Start vite dev server for renderer process and listen 8080 port
 */
function startRenderer() {
  const config = require('./vite.config')

  config.mode = process.env.NODE_ENV

  config.env = config.env || {}
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('VITE_')) {
      config.env[key] = value
    }
  }

  return createServer(config).listen(8080)
}

async function startMain() {
  const { options, warnings } = await loadConfigFile(join(__dirname, 'rollup.config.js'), {
    input: join(__dirname, '../src/main/index.dev.ts'),
    sourcemap: true
  })

  warnings.flush()

  /**
   * @type {import('rollup').RollupOptions}
   */
  const config = options[0]

  watch({
    ...config,
    watch: {
      buildDelay: 500
    }
  })
    .on('change', (id) => console.log(`${chalk.grey('[change]')} ${id}`))
    .on('event', (event) => {
      switch (event.code) {
        case 'END':
          reloadElectron()
          break
        case 'BUNDLE_END':
          console.log(`${chalk.grey('[bundle]')} ${event.output} ${event.duration + 'ms'}`)
          break
        case 'ERROR':
          if (event.error.plugin !== 'typechecker') {
            console.error(event.error)
          }
          break
      }
    })
}

Promise.all([
  startMain(),
  startRenderer()
]).catch(e => {
  console.error(e)
  process.exit(1)
})
