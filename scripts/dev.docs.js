const chalk = require('chalk')
const { createServer } = require('vitepress')
const { excludeOptimize } = require('../package.json')

async function startVitepress() {
  createServer({
    root: 'docs',
    optimizeDeps: {
      exclude: excludeOptimize
    },
  }).then((server) => {
    server.listen(3000, () => {
      console.log(`listening at http://localhost:${3000}`)
    })
  }).catch((err) => {
    console.error(chalk.red('failed to start server. error:\n'), err)
  })
}

startVitepress()
