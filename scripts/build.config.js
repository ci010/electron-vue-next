const baseConfig = require('./build.base.config')

/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  ...baseConfig,
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    perMachine: true,
    differentialPackage: true
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ]
  },
  mac: {
    icon: 'build/icons/icon.icns',
    target: [
      {
        target: 'zip'
      },
      {
        target: 'dmg'
      }
    ]
  },
  win: {
    icon: 'build/icons/icon.ico',
    target: [
      // disable build for x32 by default
      // 'nsis:ia32',
      'nsis:x64',
      // uncomment to generate web installer
      // electron-builder can use either web or offline installer to auto update
      // {
      //   target: 'nsis-web',
      //   arch: [
      //     'x64',
      //     'ia32'
      //   ]
      // },
      {
        target: 'zip',
        arch: [
          // 'ia32',
          'x64'
        ]
      }
    ]
  },
  linux: {
    icon: 'build/icons',
    target: [
      {
        target: 'deb'
      },
      {
        target: 'rpm'
      },
      {
        target: 'AppImage'
      },
      {
        target: 'snap'
      }
    ]
  },
  snap: {
    publish: [
      'github'
    ]
  }
}

module.exports = config
