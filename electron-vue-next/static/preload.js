const { shell, clipboard, ipcRenderer, contextBridge } = require('electron')

const api = {
  shell,
  clipboard,
  ipcRenderer,
  dialog: {
    showCertificateTrustDialog(...options) {
      return ipcRenderer.invoke('dialog:showCertificateTrustDialog', ...options)
    },
    showErrorBox(...options) {
      return ipcRenderer.invoke('dialog:showErrorBox', ...options)
    },
    showMessageBox(...options) {
      return ipcRenderer.invoke('dialog:showMessageBox', ...options)
    },
    showOpenDialog(...options) {
      return ipcRenderer.invoke('dialog:showOpenDialog', ...options)
    },
    showSaveDialog(...options) {
      return ipcRenderer.invoke('dialog:showSaveDialog', ...options)
    }
  }
}

try {
  contextBridge.exposeInMainWorld('electron', api)
} catch {
  window.electron = api
}
