import { spawn } from 'child_process'
import { app, net } from 'electron'
import { autoUpdater, Provider, UpdateInfo } from 'electron-updater'
import { createWriteStream, existsSync, rename, unlink, writeFile } from 'original-fs'
import { platform } from 'os'
import { dirname, join } from 'path'
import { promisify } from 'util'

function getUpdateAsarPath() {
  return join(app.getPath('userData'), 'update.asar')
}

function getUpdateScriptPath() {
  return join(app.getPath('userData'), 'AutoUpdate.ps1')
}

/**
 * Download the app.asar host on github to %APPDATA%/update.asar
 */
export async function downloadAsarUpdate() {
  const provider: Provider<UpdateInfo> = (await (autoUpdater as any).clientPromise)
  const updateInfo: UpdateInfo = (await (autoUpdater as any).checkForUpdatesPromise)
  const files = provider.resolveFiles(updateInfo)
  const urlObject = files[0].url
  urlObject.pathname = `${urlObject.pathname.substring(0, urlObject.pathname.lastIndexOf('/'))}app.asar`

  const asarPath = getUpdateAsarPath()

  await new Promise((resolve, reject) => {
    const output = createWriteStream(asarPath)
    const request = net.request({
      url: urlObject.toString(),
      redirect: 'follow'
    }).on('response', (message) => {
      message.on('data', (chunk) => {
        output.write(chunk, (error) => {
          if (error) {
            reject(error)
            output.close()
            request.abort()
          }
        })
      }).on('aborted', () => {
        reject(new Error('Abort'))
      }).on('end', () => {
        output.end(() => {
          resolve()
        })
      }).on('error', reject)
    })
    request.end()
  })
}

/**
 * Quit and install %APPDATA%/update.asar.
 *
 * - On windows, it will generate a powershell script to install the update.
 * - On Mac and Linux, it will directly replace the old app.asar to new update.asar
 */
export async function quitAndInstallAsar() {
  const exePath = process.argv[0]
  const appPath = dirname(exePath)

  const currentPlatform = platform()
  const appAsarPath = join(appPath, 'resources', 'app.asar')
  const updateAsarPath = getUpdateAsarPath()

  if (currentPlatform === 'win32') {
    const elevatePath = join(appPath, 'resources', 'elevate.exe')

    if (!existsSync(updateAsarPath)) {
      throw new Error(`No update found: ${updateAsarPath}`)
    }
    if (!existsSync(elevatePath)) {
      throw new Error(`No elevate.exe found: ${elevatePath}`)
    }
    const psPath = getUpdateScriptPath()
    let startProcessCmd = `Start-Process -FilePath "${process.argv[0]}"`
    if (process.argv.slice(1).length > 0) {
      startProcessCmd += ` -ArgumentList ${process.argv.slice(1).map((s) => `"${s}"`).join(', ')}`
    }
    startProcessCmd += ` -WorkingDirectory ${process.cwd()}`
    await promisify(writeFile)(psPath, [
      'Start-Sleep -s 3',
      `Copy-Item -Path "${updateAsarPath}" -Destination "${appAsarPath}"`,
      `Remove-Item -Path "${updateAsarPath}"`,
      startProcessCmd
    ].join('\r\n'))

    const args = [
      'powershell.exe',
      '-ExecutionPolicy',
      'RemoteSigned',
      '-File',
      `"${psPath}"`
    ]

    args.unshift(elevatePath)

    spawn(args[0], args.slice(1), {
      detached: true
    }).unref()
  } else {
    await promisify(unlink)(appAsarPath)
    await promisify(rename)(updateAsarPath, appAsarPath)
    app.relaunch()
  }

  app.quit()
}
