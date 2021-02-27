import { app, BrowserWindow } from 'electron'
import './dialog'
import { Logger } from './logger'
import { initialize } from './services'
import createBaseWorker from './workers/index?worker'
import indexPreload from '/@preload/index'
import anotherPreload from '/@preload/another'
import indexHtmlUrl from '/@renderer/index.html'
import sideHtmlUrl from '/@renderer/side.html'
import logoUrl from '/@static/logo.png'

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
  createBaseWorker({ workerData: 'worker world' }).on('message', (message) => {
    logger.log(`Message from worker: ${message}`)
  }).postMessage('')
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: indexPreload,
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: logoUrl
  })

  mainWindow.loadURL(indexHtmlUrl)
  return mainWindow
}

function createSecondWindow() {
  const sideWindow = new BrowserWindow({
    height: 600,
    width: 300,
    webPreferences: {
      preload: anotherPreload,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  sideWindow.loadURL(sideHtmlUrl)
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
