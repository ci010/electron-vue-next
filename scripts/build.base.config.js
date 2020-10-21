
/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  productName: '',
  appId: '',
  directories: {
    output: 'build'
  },
  // assign publish for auto-updater
  // set this to your own repo!
  // publish: [{
  //   provider: 'github',
  //   owner: '',
  //   repo: ''
  // }],
  files: [
    '!**/node_modules/**/*',
    'dist/electron/**/*'
  ]
}

module.exports = config
