const path = require('path')
const pluginPreload = require('./plugins/esbuild.preload.plugin')
const pluginRenedrer = require('./plugins/esbuild.renderer.plugin')
const pluginStatic = require('./plugins/esbuild.static.plugin')
const pluginWorker = require('./plugins/esbuild.worker.plugin')
const pluginVueDevtools = require('./plugins/esbuild.devtool.plugin')

/**
 * @type {import('esbuild').BuildOptions}
 */
const config = {
  bundle: true,
  metafile: true,
  assetNames: 'static/[name]-[hash]',
  entryNames: '[dir]/[name]',
  format: 'cjs',
  outdir: path.join(__dirname, '../dist'),
  platform: 'node',
  loader: {
    '.png': 'file',
    '.jpeg': 'file',
    '.jpg': 'file',
    '.svg': 'file',
    '.webp': 'file'
  },
  plugins: [
    pluginPreload(path.join(__dirname, '../src/preload')),
    pluginRenedrer(),
    pluginStatic(path.join(__dirname, '../static')),
    pluginVueDevtools(path.join(__dirname, '../extensions')),
    pluginWorker()
  ],
  external: ['electron']
}

module.exports = config
