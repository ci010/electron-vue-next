/**
 * Provide vue-devtool extension virtual import.
 * @param {string} extensionLocation
 * @returns {import('esbuild').Plugin}
 */
module.exports = function createVueDevtoolsPlugin(extensionLocation) {
  return {
    name: 'resolve-devtools',
    setup(build) {
      build.onResolve({ filter: /vue-devtools/g }, async ({ path }) => ({
        path,
        namespace: 'devtools'
      }))
      build.onLoad({ filter: /vue-devtools/g, namespace: 'devtools' }, async () => {
        return {
          contents: `export default ${JSON.stringify(extensionLocation)}`,
          resolveDir: build.initialOptions.outdir
        }
      })
    }
  }
}
