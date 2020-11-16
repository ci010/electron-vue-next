import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import { format } from 'url'
// import isDev from './isDev'
// import reloader from 'electron-reloader'

// isDev && reloader(module)

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  console.log(join(__dirname, 'index.html'))

  // and load the index.html of the app.
  mainWindow.loadURL(
    format({
      pathname: join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
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
  console.log("DEEEV");
}

if (import.meta.env.PROD) {
  console.log('PROOOOD');
}

autoUpdater.checkForUpdatesAndNotify()
