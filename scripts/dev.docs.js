const chalk = require('chalk')
const { createServer } = require('vitepress')
const { excludeOptimize } = require('../package.json')

const port = 3000

async function startVitepress() {
  try {
    const server = await createServer({
      root: 'docs',
      optimizeDeps: {
        exclude: excludeOptimize
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
