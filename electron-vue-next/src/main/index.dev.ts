import { app, BrowserWindow } from 'electron'
import { Socket } from 'net'
// eslint-disable-next-line import/first
import './index'

global.__preloads = new Proxy({}, {
  get(_, name) {
    return require('path').join(__dirname, `../../dist/electron/${name.toString()}.preload.js`).replace(/\\\\/g, '\\\\\\\\')
  }
})

app.on('browser-window-created', (event, window) => {
  if (!window.webContents.isDevToolsOpened()) {
    window.webContents.openDevTools()
  }
})

const devServer = new Socket({}).connect(3031, '127.0.0.1')
devServer.on('data', () => {
  BrowserWindow.getAllWindows().forEach(w => w.reload())
})
