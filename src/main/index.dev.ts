import { app } from 'electron'

global.__static = require('path').join(__dirname, '../../static').replace(/\\\\/g, '\\\\\\\\')
global.__windowUrls = new Proxy({}, {
  get(_, page) {
    return `http://localhost:8080/${page.toString()}.html`
  }
})

app.on('browser-window-created', (event, window) => {
  if (!window.webContents.isDevToolsOpened()) {
    window.webContents.openDevTools()
  }
})

// eslint-disable-next-line import/first
import './index'
