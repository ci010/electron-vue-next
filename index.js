#!/usr/bin/env node

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
  threadWorker: true,
  mainService: true,
  vscode: true
}

const provided = {
  nodeIntegration: false,
  name: false,
  service: false,
  vscode: false
}

program
  .storeOptionsAsProperties(false)
  .version(version)
  .option('-ni, --no-interactive', 'disable interactive interface')
  .option('-n, --name <name>', 'name of the project')
  .option('-en, --enable-node-integration', 'enable node integration')
  .option('-ns, --no-service', 'do not generate Service infra')
  .option('-ns, --no-thread-worker', 'do not generate thread worker support')
  .option('-nc, --no-vscode', 'do not generate VSCode debug config')
  .on('option:enable-node-integration', () => { provided.nodeIntegration = true })
  .on('option:name', () => { provided.name = true })
  .on('option:no-service', () => { provided.service = true })
  .on('option:no-vscode', () => { provided.vscode = true })
  .description('Setup vue-electron-next-app to a directory')
  .action(() => {
    const dir = program.args[0]
    const opts = program.opts()
    options.outputDirectory = dir
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
  const { projectName, nodeIntegration, mainService, vscode, threadWorker } = await inquirer.prompt([
    { type: 'input', default: name || 'electron-vue-app', message: 'Name of the project:', name: 'projectName', when: !provided.name },
    { type: 'confirm', default: false, message: 'Enable node integration for renderer:', name: 'nodeIntegration', when: !provided.nodeIntegration },
    {
      type: 'confirm',
      default: true,
      message: 'Use Service infrastructure to handle main/renderer communication:',
      name: 'mainService',
      when: !provided.service
    },
    {
      type: 'confirm',
      default: true,
      message: 'Include thread_worker support',
      name: 'threadWorker'
    },
    { type: 'confirm', default: true, message: 'Generate vscode debug config:', name: 'vscode', when: !provided.vscode }
  ])
  options.threadWorker = threadWorker
  options.projectName = projectName
  options.nodeIntegration = nodeIntegration
  options.mainService = mainService
  options.vscode = vscode
  options.outputDirectory = options.outputDirectory || projectName
}

async function setupProject() {
  const srcDir = join(__dirname, 'electron-vue-next')
  const distDir = resolve(options.outputDirectory || 'electron-vue-next')

  if (srcDir === distDir) {
    throw new Error('The generated directory cannot be the same as the source directory in node_modules!')
  }

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
      if (!options.threadWorker) {
        if (relativePath.startsWith(join('src', 'main', 'workers'))) {
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
      'const logger = new Logger()',
      'logger.initialize(app.getPath(\'userData\'))',
      'initialize(logger)'
    ])
    const result = lines.filter((line) => !filteredLine.has(line.trim())).join('\n')
    await writeFile(indexPath, result)
  }
  if (options.nodeIntegration) {
    const indexPath = join(distDir, 'src/main/index.ts')
    const lines = (await readFile(indexPath)).toString().split('\n')
    const nodeIntegrationLine = lines.indexOf('      nodeIntegration: false')
    lines[nodeIntegrationLine] = '      nodeIntegration: true'
    await writeFile(indexPath, lines.join('\n'))
  }
  if (!options.threadWorker) {
    const indexPath = join(distDir, 'src/main/index.ts')
    const lines = (await readFile(indexPath)).toString().split('\n')
    const filteredLine = new Set([
      'import { Worker } from \'worker_threads\'',
      '// thread_worker example',
      'new Worker(__workers.index, { workerData: \'worker world\' }).on(\'message\', (message) => {',
      // eslint-disable-next-line no-template-curly-in-string
      'logger.log(`Message from worker: ${message}`)',
      '}).postMessage(\'\')'
    ])
    const result = lines
      .filter(l => !filteredLine.has(l.trim()))
      .join('\n')
    await writeFile(indexPath, result)
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
