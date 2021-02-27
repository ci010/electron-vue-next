import { rollup } from 'rollup'
import { cleanUrl, parseRequest } from './rollup.base.plugin'
/**
 * @returns {import('rollup').Plugin}
 */
export default function createPreloadPlugin(plugins) {
  return {
    name: 'preload',

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

      const bundle = await rollup({
        input: id,
        plugins
      })
      try {
        const { output } = await bundle.generate({
          format: 'es',
          sourcemap: true
        })
        for (const o of output) {
          this.emitFile({
            type: 'asset',
            fileName: o.fileName,
            source: o.type === 'asset' ? o.source : o.code
          })
        }
      } finally {
        bundle.close()
      }

      // emit as separate chunk
      const hash = this.emitFile({
        type: 'chunk',
        id: cleanUrl(id)
      })
      const path = `__PRELOAD__${hash}__`
      return `export default ${path};`
    }
  }
}
