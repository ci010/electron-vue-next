import { app, BrowserWindow } from 'electron'
import { Socket } from 'net'
// eslint-disable-next-line import/first
import './index'

global.__static = require('path').join(__dirname, '../../static').replace(/\\\\/g, '\\\\\\\\')
global.__windowUrls = new Proxy({}, {
  get(_, page) {
    return `http://localhost:8080/${page.toString()}.html`
  }
})
global.__preloads = new Proxy({}, {
  get(_, name) {
    return require('path').join(__dirname, `../../dist/electron/${name.toString()}.preload.js`).replace(/\\\\/g, '\\\\\\\\')
  }
})
global.__workers = new Proxy({}, {
  get(_, name) {
    return require('path').join(__dirname, `../../dist/electron/${name.toString()}.worker.js`).replace(/\\\\/g, '\\\\\\\\')
  }
})

app.on('browser-window-created', (event, window) => {
  if (!window.webContents.isDevToolsOpened()) {
    window.webContents.openDevTools()
  }
})

const devServer = new Socket({}).connect(25555, '127.0.0.1')
devServer.on('data', () => {
  BrowserWindow.getAllWindows().forEach(w => w.reload())
})
