const { loadEnv } = require('./env.js')
const { writeFileSync } = require('fs')
const { resolve } = require('path')
/**
 *
 * @param {string[]} modes
 */
function buildMode(modes, filePath) {
  const interfaces = modes.map(mode => {
    const name = `${mode}Env`
    const envs = {
      MODE: mode,
      PROD: mode === 'production',
      DEV: mode !== 'production',
      ...loadEnv(mode)
    }
    const interface = `declare interface ${name} ${JSON.stringify(envs)}`

    return { name, interface }
  })

  const str = interfaces.map(({ interface }) => interface).join('\n')
  const name = interfaces.map(({ name }) => name).join(' | ')

  writeFileSync(filePath, `${str}\ndeclare type ImportMetaEnv = ${name}\n`, { encoding: 'utf-8' })
}

buildMode(['production', 'development'], resolve(process.cwd(), './src/shared/env.d.ts'))
