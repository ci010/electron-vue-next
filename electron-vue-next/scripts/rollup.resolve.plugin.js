import { existsSync } from 'fs'
import { readFile } from 'fs-extra'
import { basename, isAbsolute, join } from 'path'
import { cleanUrl, parseRequest } from './rollup.base.plugin'

export const workerUrlRE = /__WORKER__([a-z\d]{8})__(?:\$_(.*?)__)?/g
export const assetsUrlRE = /__ASSETS__([a-z\d]{8})__(?:\$_(.*?)__)?/g

function isRendererHtml(path) {
  if (!path.endsWith('.html')) return
  if (isAbsolute(path)) {
    if (path.startsWith(join(__dirname, '../src/renderer')) && existsSync(path)) {
      return path
    }
  }
  const file = join(__dirname, '../src/renderer', cleanUrl(path))
  if (existsSync(file)) {
    return file
  }
  return undefined
}

function isStaticFile(path) {
  if (isAbsolute(path)) {
    if (path.startsWith(join(__dirname, '../static')) && existsSync(path)) {
      return path
    }
  }
  const file = join(__dirname, '../static', cleanUrl(path))
  if (existsSync(file)) {
    return file
  }
  return undefined
}

/**
 * @type {() => import('rollup').Plugin}
 */
const createPlugin = () => ({
  name: 'resolver',
  async resolveId(id, importer) {
    if (id.endsWith('.ts')) {
      return
    }
    const query = parseRequest(id)
    const staticFile = isStaticFile(id)
    if (staticFile) {
      return staticFile
    }
    const htmlFile = isRendererHtml(id)
    if (htmlFile) {
      return htmlFile
    }
    if (typeof query.worker === 'string') {
      return id
    }
    if (!isAbsolute(id) && !importer) {
      id = join(__dirname, '../src/main', id)
    }
    const tsResult = await this.resolve(`${id}.ts`, importer, { skipSelf: true })
    if (tsResult) {
      return tsResult
    }
    const indexTsResult = await this.resolve(`${id}/index.ts`, importer, { skipSelf: true })
    if (indexTsResult) {
      return indexTsResult
    }
  },
  async load(id) {
    const staticFile = isStaticFile(id)
    if (staticFile) {
      if (this.meta.watchMode) {
        return `export default ${JSON.stringify(id)}`
      } else {
        const hash = this.emitFile({
          fileName: basename(staticFile),
          type: 'asset',
          source: await readFile(staticFile)
        })
        return `import { join } from 'path'; export default join(__dirname, __ASSETS__${hash}__);`
      }
    }
    const htmlFile = isRendererHtml(id)
    if (htmlFile) {
      if (this.meta.watchMode) {
        const url = JSON.stringify(`http://localhost:8080/${basename(htmlFile)}`)
        return `export default ${url};`
      } else {
        return `import { join } from 'path'; export default join(__dirname, ${basename(htmlFile)});`
      }
    }
  },
  generateBundle(_, output) {
    for (const o of Object.values(output)) {
      if (o.type === 'chunk') {
        const result = workerUrlRE.exec(o.code)
        if (result) {
          const hash = result[1]
          const fileName = this.getFileName(hash)
          if (this.meta.watchMode) {
            o.code = o.code.replace(new RegExp(`__WORKER__${hash}__`, 'g'), JSON.stringify(join(__dirname, '../dist/electron', fileName)))
          } else {
            o.code = o.code.replace(new RegExp(`__WORKER__${hash}__`, 'g'), `${JSON.stringify(fileName)}`)
          }
        }
        const assetsResult = assetsUrlRE.exec(o.code)
        if (assetsResult) {
          const hash = assetsResult[1]
          const fileName = this.getFileName(hash)
          if (!this.meta.watchMode) {
            o.code = o.code.replace(new RegExp(`__ASSETS__${hash}__`, 'g'), `${JSON.stringify(fileName)}`)
          }
        }
      }
    }
  }
})

export default createPlugin
