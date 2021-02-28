import { existsSync } from 'fs'
import { isAbsolute, join } from 'path'
import { rollup } from 'rollup'
import { cleanUrl, parseRequest } from './rollup.base.plugin'

export function isPreloadFile(path) {
  if (isAbsolute(path)) {
    if (path.startsWith(join(__dirname, '../src/preload')) && existsSync(path)) {
      return path
    }
  }
  const file = join(__dirname, '../src/preload', cleanUrl(path))
  if (existsSync(file)) {
    return file
  }
  return undefined
}

/**
 * @returns {import('rollup').Plugin}
 */
export default function createPreloadPlugin(plugins) {
  return {
    name: 'preload',

    async load(id) {
      const preloadFile = isPreloadFile(id)
      if (preloadFile) {
        const bundle = await rollup({
          input: id,
          plugins
        })
        try {
          const { output } = await bundle.generate({
            format: 'cjs',
            sourcemap: true
          })
          const chunk = output.find(o => o.type === 'chunk')
          if (!chunk) {
            throw new Error(`Cannot generate preload chunk! ${id}`)
          }
          const hash = this.emitFile({
            type: 'asset',
            name: `preload.${chunk.name}`,
            fileName: `preload.${chunk.fileName}`,
            source: chunk.type === 'asset' ? chunk.source : chunk.code
          })

          const path = `__ASSETS__${hash}__`
          return `export default ${path};`
        } finally {
          bundle.close()
        }
      }
    }
  }
}
