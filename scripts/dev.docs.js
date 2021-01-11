const chalk = require('chalk')
const { createServer } = require('vitepress')
const { external } = require('../electron-vue-next/package.json')
const { dependencies } = require('../package.json')
const builtins = require('builtin-modules')

const port = 3000

async function startVitepress() {
  try {
    const server = await createServer('docs', {
      optimizeDeps: {
        exclude: [...external, ...Object.keys(dependencies), ...builtins]
      }
    })
    server.listen(port, () => {
      console.log(`${chalk.green('[vitepress]')} listening at http://localhost:${port}`)
    })
  } catch (err) {
    console.error(chalk.red('failed to start server. error:\n'), err)
  }
}

startVitepress()
