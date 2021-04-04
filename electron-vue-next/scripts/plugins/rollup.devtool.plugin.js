import { join } from 'path'

/**
 * @returns {import('rollup').Plugin}
 */
export default function createVueDevtoolsPlugin() {
  return {
    name: 'electron:devtools',
    async resolveId(id) {
      if (id === 'vue-devtools') {
        return id
      }
    },
    async load(id) {
      if (id === 'vue-devtools') {
        const path = join(__dirname, '../extensions')
        console.log(path)
        return `export default "${path}"`
      }
    }
  }
}
