const chalk = require('chalk')
const { createServer } = require('vitepress')
const { bundledDependencies, dependencies } = require('../package.json')

async function startVitepress() {
  createServer({
    root: 'docs',
    optimizeDeps: {
      exclude: Object.keys(dependencies).filter((dep) => bundledDependencies.indexOf(dep) === -1)
    }
  }).then((server) => {
    server.listen(3000, () => {
      console.log(`listening at http://localhost:${3000}`)
    })
  }).catch((err) => {
    console.error(chalk.red('failed to start server. error:\n'), err)
  })
}

startVitepress()
