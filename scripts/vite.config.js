const { join } = require('path')

/**
 * Vite shared config, assign alias and root dir
 * @type {import('vite').BuildConfig}
 */
const config = {
  root: join(__dirname, '../src/renderer'),
  base: '', // has to set to empty string so the html assets path will be relative
  alias: {
    '/@shared/': join(__dirname, '../src/shared'),
    '/@/': join(__dirname, '../src/renderer')
  },
  optimizeDeps: {
    exclude: [
      'electron-updater'
      // exclude the module with nodejs dependencies
    ]
  }
}

module.exports = config
