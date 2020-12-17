const { join } = require('path')
const { external } = require('../package.json')

/**
 * Vite shared config, assign alias and root dir
 * @type {import('vite').UserConfig}
 */
const config = {
  root: join(__dirname, '../src/renderer'),
  base: '', // has to set to empty string so the html assets path will be relative
  alias: {
    '/@shared/': join(__dirname, '../src/shared'),
    '/@/': join(__dirname, '../src/renderer')
  },
  optimizeDeps: {
    exclude: external
  }
}

module.exports = config
