import { app, BrowserWindow } from 'electron'
import { Worker } from 'worker_threads'
import './dialog'
import { Logger } from './logger'
import { initialize } from './services'

async function main() {
  const logger = new Logger()
  logger.initialize(app.getPath('userData'))
  initialize(logger)
  app.whenReady().then(() => {
    const main = createWindow()
    const [x, y] = main.getPosition()
    const side = createSecondWindow()
    side.setPosition(x + 800 + 5, y)
  })
  // thread_worker example
  new Worker(__workers.index, { workerData: 'worker world' }).on('message', (message) => {
    logger.log(`Message from worker: ${message}`)
  }).postMessage('')
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: __preloads.index,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadURL(__windowUrls.index)
  return mainWindow
}

function createSecondWindow() {
  const sideWindow = new BrowserWindow({
    height: 600,
    width: 300,
    webPreferences: {
      preload: __preloads.another,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  sideWindow.loadURL(__windowUrls.side)
  return sideWindow
}

// ensure app start as single instance
if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

process.nextTick(main)
