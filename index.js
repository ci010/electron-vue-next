const inquirer = require('inquirer')
const commander = require('commander')
const chalk = require('chalk')
const { version, name } = require('./package.json')
const { join, relative, resolve } = require('path')
const { copy, readFile, writeFile, readJSON, writeJSON } = require('fs-extra')

const program = new commander.Command(name)

const options = {
  outputDirectory: join(process.cwd(), 'electron-vue-next'),
  projectName: 'electron-vue-next',
  nodeIntegration: false,
  mainService: true,
  vscode: true,
}

const provided = {
  nodeIntegration: false,
  name: false,
  service: false,
  vscode: false,
}

program
  .storeOptionsAsProperties(false)
  .version(version)
  .arguments('<app-directory>')
  .option('-ni, --no-interactive', 'disable interactive interface')
  .option('-n, --name <name>', 'name of the project')
  .option('-en, --enable-node-integration', 'enable node integration')
  .option('-ns, --no-service', 'do not generate Service infra')
  .option('-nc, --no-vscode', 'do not generate VSCode debug config')
  .on('option:enable-node-integration', () => { provided.nodeIntegration = true })
  .on('option:name', () => { provided.name = true })
  .on('option:no-service', () => { provided.service = true })
  .on('option:no-vscode', () => { provided.vscode = true })
  .description('Setup vue-electron-next-app to a directory')
  .action(() => {
    const dir = program.args[0]
    const opts = program.opts()
    options.outputDirectory = dir || 'electron-vue-next'
    options.name = opts.name || dir
    options.nodeIntegration = opts.enableNodeIntegration
    options.mainService = opts.service
    options.vscode = opts.vscode
    if (!options.noInteractive) {
      console.log(`
Answer questions in prompt to config the project generator:

  ${chalk.italic.magenta('If you have question, please refer the document https://ci010.github.io/electron-vue-next/')}
`)
      interactive(dir).then(setupProject)
    } else {
      setupProject()
    }
  })
  .parse(process.argv)

async function interactive(name) {
  const { projectName, nodeIntegration, mainService, vscode } = await inquirer.prompt([
    { type: 'input', default: name, message: 'Name of the project:', name: 'projectName', when: !provided.name },
    { type: 'confirm', default: false, message: 'Enable node integration for renderer:', name: 'nodeIntegration', when: !provided.nodeIntegration },
    {
      type: 'confirm',
      default: true,
      message: 'Use Service infrastructure to handle main/renderer communication:',
      name: 'mainService',
      when: !provided.service
    },
    { type: 'confirm', default: true, message: 'Generate vscode debug config:', name: 'vscode', when: !provided.vscode },
  ])
  options.projectName = projectName
  options.nodeIntegration = nodeIntegration
  options.mainService = mainService
  options.vscode = vscode
}

async function setupProject() {
  const srcDir = join(__dirname, 'electron-vue-next')
  const distDir = options.outputDirectory

  await copy(srcDir, distDir, {
    overwrite: true,
    filter: (src, dest) => {
      const relativePath = relative(srcDir, src)
      if (!options.mainService) {
        if (relativePath.startsWith(join('src', 'main', 'services'))) {
          return false
        }
        if (relativePath.startsWith(join('src', 'main', 'logger.ts'))) {
          return false
        }
      }
      if (!options.vscode) {
        if (relativePath.startsWith('.vscode')) {
          return false
        }
      }
      return true
    }
  })
  const packageJSON = await readJSON(join(distDir, 'package.json'))
  packageJSON.name = options.projectName
  if (!options.mainService) {
    const indexPath = join(distDir, 'src/main/index.ts')
    const lines = (await readFile(indexPath)).toString().split('\n')
    const filteredLine = new Set([
      'import { Logger } from \'./logger\'',
      'import { initialize } from \'./services\'',
      '  const logger = new Logger()',
      '  logger.initialize(app.getPath(\'userData\'))',
      '  initialize(logger)'
    ])
    const result = lines.filter((line) => !filteredLine.has(line)).join('\n')
    await writeFile(indexPath, result)
  }
  if (options.nodeIntegration) {
    const indexPath = join(distDir, 'src/main/index.ts')
    const lines = (await readFile(indexPath)).toString().split('\n')
    const nodeIntegrationLine = lines.indexOf('      nodeIntegration: false')
    lines[nodeIntegrationLine] = '      nodeIntegration: true'
    await writeFile(indexPath, lines.join('\n'))
  }
  await writeJSON(join(distDir, 'package.json'), packageJSON, { spaces: 4 })

  console.log()
  console.log(`Project Generated at: ${resolve(options.outputDirectory)}\n`)
  console.log(`Next, you should process following commands:

  ${chalk.cyan('cd')} ${options.outputDirectory}
  ${chalk.cyan('npm')} install
    Install dependencies of the project

  ${chalk.cyan('npm')} run dev
    Start the development environment`)
}
