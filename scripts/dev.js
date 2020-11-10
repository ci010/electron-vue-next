const electron = require('electron')
const { spawn } = require('child_process')
const { join } = require('path')
const { createServer } = require('vite')
const chalk = require('chalk')
const loadConfigFile = require('rollup/dist/loadConfigFile')
const { watch } = require('rollup')
const { EOL } = require('os')

const manualRestart = false

const child = {
  /**
   * @type {import('child_process').ChildProcessWithoutNullStreams  | null}
   */
  electron: null,

  /**
   * @type {import('http').Server  | null}
   */
  viteServer: null,

  /**
   * @type {import('rollup').RollupWatcher  | null}
   */
  rollupWatcher: null
}

/**
 * Start electron process and inspect port 5858 with 9222 as debug port.
 */
function startElectron() {
  /**
   * @type {any}
   */
  const electronCommand = electron
  child.electron = spawn(electronCommand,
    ['--inspect=5858', '--remote-debugging-port=9222', join(__dirname, '../dist/electron/index.dev.js')])

  /**
   * @param {string | Buffer} data
   */
  function electronLog(data) {
    const colorize = (line) => {
      if (line.startsWith('[INFO]')) {
        return chalk.green('[INFO]') + line.substring(6)
      } else if (line.startsWith('[WARN]')) {
        return chalk.yellow('[WARN]') + line.substring(6)
      } if (line.startsWith('[ERROR]')) {
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
  child.electron.stdout.on('data', electronLog)
  child.electron.stderr.on('data', electronLog)

  child.electron.on('close', (code, sig) => {
    if (!manualRestart) {
      // if (!devtoolProcess.killed) {
      //     devtoolProcess.kill(0);
      // }
      if (!sig) { // Manual close
        stop()
      }
    }
  })
}

/**
 * Kill and restart electron process
 */
function reloadElectron() {
  if (child.electron) {
    child.electron.kill('SIGTERM')
    console.log(chalk.bold.underline.green('Electron App Restarted'))
  } else {
    console.log(chalk.bold.underline.green('Electron App Started'))
  }
  startElectron()
}

/**
 * Start vite dev server for renderer process and listen 8080 port
 */
async function startRenderer() {
  const config = require('./vite.config')
  child.viteServer = await createServer(config).listen(8080)
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
  child.rollupWatcher = watch({
    ...config,
    watch: {
      buildDelay: 500
    }
  })

  child.rollupWatcher.on('event', (event) => {
    switch (event.code) {
      case 'END':
        reloadElectron()
        break
      case 'BUNDLE_END':
        console.log(`${chalk.grey('[bundle]')} ${event.output} ${event.duration + 'ms'}`)
        break
      case 'ERROR':
        console.error(event.error)
        break
    }
  }).on('change', (id) => {
    console.log(`${chalk.grey('[change]')} ${id}`)
  })
}

function stop(code = 0) {
  if (child.electron) {
    child.electron.kill()
  }

  if (child.viteServer) {
    child.viteServer.removeAllListeners()
    child.viteServer.close()
  }

  if (child.rollupWatcher) {
    child.rollupWatcher.removeAllListeners()
    child.rollupWatcher.close()
  }

  process.exit(code)
}

Promise.all([
  startMain(),
  startRenderer()
]).catch(console.error)
