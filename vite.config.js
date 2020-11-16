// const { join } = require('path')
const { external } = require('./package.json')


/**
 * Vite shared config, assign alias and root dir
 * @type {import('vite').UserConfig}
 */
const config = {
  root: './src/renderer',
  outDir: './dist/source/renderer',
  base: '', // has to set to empty string so the html assets path will be relative
  alias: {
    '/@shared/': './src/shared',
    '/@/': './src/renderer'
  },
  assetsInlineLimit: 0,
  optimizeDeps: {
    exclude: external
  }
}

module.exports = config
