import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
// import { format } from 'url'
// import './dialog'
// import { Logger } from './logger'
// import { initialize } from './services'

let mainWindow: BrowserWindow | null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  console.log(join(__dirname, './renderer/index.html'));

  // and load the index.html of the app.
  mainWindow.loadURL(import.meta.env.PROD
    ? join(__dirname, './renderer/index.html')
    : 'http://localhost:3000/index.html'
  )

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

app.on('ready', createWindow)

// ensure app start as single instance
if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

console.log(import.meta.env)

if (import.meta.env.DEV) {
  console.log('DEEEV 2 3')
}

if (import.meta.env.PROD) {
  console.log('PROOOOD')
}

autoUpdater.checkForUpdatesAndNotify()
