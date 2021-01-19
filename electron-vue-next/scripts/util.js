const { readdir, existsSync } = require('fs-extra')
const { join, extname } = require('path')
const loadConfigFile = require('rollup/dist/loadConfigFile')

/**
 * @param  {Record<string, string>} input
 */
async function loadWorkerInput(input) {
  const workerDir = join(__dirname, '../src/main/workers')
  if (existsSync(workerDir)) {
    const workers = await readdir(workerDir)
    for (const worker of workers.filter(f => f.endsWith('.js') || f.endsWith('.ts'))) {
      const ext = extname(worker)
      input[`${worker.substring(0, worker.length - ext.length)}.worker`] = join(workerDir, worker)
    }
  }
}

/**
 * @param  {Record<string, string>} input
 */
async function loadPreloadInput(input) {
  const preloadDir = join(__dirname, '../src/preload')
  const preloads = await readdir(preloadDir)
  for (const preload of preloads.filter(f => f.endsWith('.js') || (f.endsWith('.ts') && !f.endsWith('.d.ts')))) {
    const ext = extname(preload)
    input[`${preload.substring(0, preload.length - ext.length)}.preload`] = join(preloadDir, preload)
  }
}

/**
 * Load rollup config
 * @returns {Promise<import('rollup').RollupOptions[]>}
 */
async function loadRollupConfig() {
  const { options, warnings } = await loadConfigFile(join(__dirname, 'rollup.config.js'), {
  })

  warnings.flush()

  return options
}

module.exports = {
  loadRollupConfig,
  loadWorkerInput,
  loadPreloadInput
}
