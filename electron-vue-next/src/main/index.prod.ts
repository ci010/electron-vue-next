global.__preloads = new Proxy({}, {
  get(_, name) {
    return require('path').join(__dirname, `./${name.toString()}.preload.js`).replace(/\\\\/g, '\\\\\\\\')
  }
})

// eslint-disable-next-line import/first
import './index'
