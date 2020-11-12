import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import './dialog'
import { Logger } from './logger'
import { initialize } from './services'

async function main() {
  const logger = new Logger()
  logger.initialize(app.getPath('userData'))
  initialize(logger)
  app.whenReady().then(() => {
    createWindow()
  })
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: join(__static, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadURL(__windowUrls.index)
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
