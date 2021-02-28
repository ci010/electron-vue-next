import { app, BrowserWindow } from 'electron'
import { Socket } from 'net'
// eslint-disable-next-line import/first
import './index'

app.on('browser-window-created', (event, window) => {
  if (!window.webContents.isDevToolsOpened()) {
    window.webContents.openDevTools()
  }
})

const devServer = new Socket({}).connect(3031, '127.0.0.1')
devServer.on('data', () => {
  BrowserWindow.getAllWindows().forEach(w => w.reload())
})
