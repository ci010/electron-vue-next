import { cleanUrl, parseRequest } from './rollup.base.plugin'

/**
 * @returns {import('rollup').Plugin}
 */
export default function createWorkerPlugin() {
  return {
    name: 'worker',

    load(id) {
      const { worker } = parseRequest(id)
      if (typeof worker === 'string') {
        return ''
      }
    },

    async transform(_, id) {
      const query = parseRequest(id)
      if (query == null || (query && query.worker == null)) {
        return
      }

      // emit as separate chunk
      const hash = this.emitFile({
        type: 'chunk',
        id: cleanUrl(id)
      })
      const path = `__WORKER__${hash}__`
      if (this.meta.watchMode) {
        return `
        import { Worker } from 'worker_threads';
        export default function (options) { return new Worker(${path}, options); }`
      } else {
        return `
        import { join } from 'path'; 
        import { Worker } from 'worker_threads';
        export default function (options) { return new Worker(join(__dirname, ${path}), options); }`
      }
    }
  }
}
