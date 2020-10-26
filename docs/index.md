# electron-vue-next

This repository contains the starter template for using vue-next with the latest electron. 

*I started to learn electron & vue by the great project [electron-vue](https://github.com/SimulatedGREG/electron-vue). This project is also inspired from it.*

## Features

- Electron 10
  - Follow the [security](https://www.electronjs.org/docs/tutorial/security) guide of electron, make renderer process a browser only environment
  - Using [electron-builder](https://github.com/electron-userland/electron-builder) to build
- Empower [vue-next](https://github.com/vuejs/vue-next) and its eco-system
  - Using [vite](https://github.com/vitejs/vite) which means develop renderer process can be blazingly fast!
  - Using [vuex 4.0](https://github.com/vuejs/vuex/tree/4.0) with strong type state, getters, and commit
  - Using [vue-router-next](https://github.com/vuejs/vue-router-next)
- Using [eslint](https://www.npmjs.com/package/eslint) with Javascript Standard by default
- Built-in TypeScript Support
  - Using [esbuild](https://github.com/evanw/esbuild) in [rollup](https://github.com/rollup/rollup) (align with vite) to build main process typescript code 
- Github Action with Github Release is out-of-box
  - Auto bump version in package.json and generate CHANGELOG.md if you follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0)
  - Detail how this work described in [Release Process](#release-process) section
- Integrate VSCode well
  - Support debug .ts/.vue files in main/renderer process by vscode debugger
  - Detail see [Debug](#debug-in-vscode) section

## Quick Start

Clone or fork this project to start.
Once you have your project, and in the project folder:

```shell
# Install dependencies
npm install

# Will start vite server, rollup devserver, and electron to dev!
npm run dev

# OPTIONAL. Will compile the main and renderer process to javascript and display output size
npm run build

# OPTIONAL. Will compile all and output an unpacked electron app. You can directly 
npm run build:dir

# Will compile all and build all products and ready to release
npm run build:production

```

### Config Your Project and Build

Once you install your project, you should change the package base info in [package.json](/package.json),
and also the build information in [build.base.config.js](/scripts/build.base.config.js).

## Project Structure

### File Tree

Your workspace should looks like

```tree
your-project
├─ .electron-vue
│  └─ <build/development>.js files
├─ build
│  └─ icons/
|  └─ ... your built installer zip goes here!
├─ dist
│  ├─ electron/    The directory contain the compiled output
│  └─ web/
├─ src
│  ├─ main
│  │  ├─ index.dev.js
│  │  └─ index.js
│  ├─ renderer
│  │  ├─ components/
│  │  ├─ router/
│  │  ├─ store/
│  │  ├─ App.vue
│  │  └─ main.js
│  └─ index.ejs
├─ static/
├─ test
│  ├─ e2e
│  │  ├─ specs/
│  │  ├─ index.js
│  │  └─ utils.js
│  ├─ unit
│  │  ├─ specs/
│  │  ├─ index.js
│  │  └─ karma.config.js
│  └─ .eslintrc
├─ .babelrc
├─ .eslintignore
├─ .eslintrc.js
├─ .gitignore
├─ package.json
└─ README.md
```

#### assets, static resources, build resources... what's the difference?

The assets is only used by the renderer process (in-browser display), like picture or font. They are **bundled by vite/rollup**. You can directly `import` them in `.vue/.ts` files under renderer directory. The default assets are in [renderer/renderer/assets](src/renderer/assets)

The static resources are the static files which main process wants to access (like read file content) in **runtime vie file system**. They might be the tray icon file, browser window icon file. The static folder is at [static](static).

The build resources are used by `electron-builder` to build the installer. They can be your program icon of installer, or installer script. Default build icons are under [build/icons](build/icons).

*Notice that your program icon can show up in multiple place! Don't mixup them!*
- *In build icons, of course you want your program has correct icon.*
- *In static directory, sometime you want your program has **tray** which require icon in static directory.*
- *In assets, sometime you want to display your program icon inside a page. You need to place them in the assets!*

### Main and Renderer Processes

Quote from electron official document about [main and renderer processes](https://www.electronjs.org/docs/tutorial/quick-start#main-and-renderer-processes). The main process is about

> - The Main process creates web pages by creating BrowserWindow instances. Each BrowserWindow instance runs the web page in its Renderer process. When a BrowserWindow instance is destroyed, the corresponding Renderer process gets terminated as well.
> - The Main process manages all web pages and their corresponding Renderer processes.

And the renderer process is about

> - The Renderer process manages only the corresponding web page. A crash in one Renderer process does not affect other Renderer processes.
> - The Renderer process communicates with the Main process via IPC to perform GUI operations in a web page. Calling native GUI-related APIs from the Renderer process directly is restricted due to security concerns and potential resource leakage.

### NPM Scripts

#### `npm run dev`

Start the vite dev server hosting the renderer webpage with hot reloading.
Start the rollup server hosting the main process script. It will auto reload the electron app if you modify the source files.

#### `npm run build`

Compile both `main` and `renderer` process code to production, located at `dist/electron`

#### `npm run build:production`

It will compile both processes, and then run `electron-builder` to build your app into executable installer or zip. The build config is defined in [scripts/build.base.config.js](scripts/build.base.config.js).

#### `npm run build:dir`

It will compile both processes, and it will run `electron-builder` to build only the directoy version of the production electron app, which for example, for windows x64, it's located at `build/win-unpacked`.

This will much faster than `npm run build:production`. So you can use it to quick testing the production app.

#### `npm run lint`

Run eslint to report eslint error.

#### `npm run lint:fix`

Run eslint to fix and report eslint error.

## Development

### Using NodeJS in Renderer

Due to the project is following the [security](https://www.electronjs.org/docs/tutorial/security) guideline. It does not allow the renderer to access node by default. You should use [Service](/src/main/services/Service.ts) to encapsulate your nodejs operation and use the hook `useService('NameOfService')` to use in renderer side.

### Adding New Dependencies

If you adding a new dependency, make sure if it's using any **nodejs** module, add it as `exclude` in the [vite.config.js](/scripts/vite.config.js). Otherwise, the vite will complain about "I cannot optimize it!".

```js 
const config = {
  // other configs above
  optimizeDeps: {
    exclude: [
      'package-name-to-exclude',
      'fs-extra' // module like fs-extra needs to be exclude to vite
    ]
  }
}
```

The raw javascript dependencies are okay for vite.

#### Native Dependencies

If you want to use the native dependencies, which need to compile when install. Usually, you need [node-gyp](https://github.com/nodejs/node-gyp) to build, the electron will rebuild it upon your electron for you. Normally you don't need to worry much. Notice that if you are in Windows, you might want to install [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) to install the compile toolchain.

#### Dependencies Contains Compiled Binary

If you want to use the dependencies containing the compiled binary, not only you should adding it to vite `exclude`, you should also take care about the electron-builder config. See the [Build Configuration](#build-configuration) section for detail.

## Debugging

This is really simple. In vscode debug section, you will see three profiles: 

1. Electron: Main (attach)
2. Electron: Renderer (attach)
3. Electron: Main & Renderer (attach)


```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Electron: Main (attach)",
            "type": "node",
            "request": "attach",
            "cwd": "${workspaceFolder}",
            "outFiles": [
                "${workspaceFolder}/dist/**/*.js"
            ],
            "smartStep": true,
            "sourceMaps": true,
            "protocol": "inspector",
            "port": 5858,
            "timeout": 20000
        },
        {
            "name": "Electron: Renderer (attach)",
            "type": "chrome",
            "request": "attach",
            "port": 9222,
            "webRoot": "${workspaceFolder}",
            "timeout": 15000
        },
    ],
    "compounds": [
        {
            "name": "Electron: Main & Renderer (attach)",
            "configurations": ["Electron: Main (attach)", "Electron: Renderer (attach)"]
        }
    ]
}
```

The name should be clear. The first one attach to main and the second one attach to renderer (required vscode chrome debug extension).
The third one is run the 1 and 2 at the same time.

You should first run `npm run dev` and start debugging by the vscode debug.

## Build

### Exclude Files

For example, [7zip-min](https://github.com/onikienko/7zip-min):

Since it using the `7zip-bin` which carry binary for multiple platform, we need to correctly include them in config.
Modify the electron-builder build script [build.base.config.js](/scripts/build.base.config.js)

```js
  files: [
    "dist/electron/**/*",
    "!**/node_modules/**/*",
    "node_modules/7zip-bin/**/*"
  ],
  asarUnpack: [
    "node_modules/7zip-bin/**/*"
  ],
```

Add them to `files` and `asarUnpack` to ensure the electron builder correctly pack & unpack them.

To optimize for multi-platform, you should also exclude them from `files` of each platform config [build.config.js](/scripts/build.config.js)

```js
  mac: {
    // ... other mac configs
    files: [
      "node_modules/7zip-bin/**/*",
      "!node_modules/7zip-bin/linux/**",
      "!node_modules/7zip-bin/win/**"
    ]
  },
  win: {
    // ... other win configs
    files: [
      "node_modules/7zip-bin/**/*",
      "!node_modules/7zip-bin/linux/**",
      "!node_modules/7zip-bin/mac/**"
    ]
  },
  linux: {
    // ... other linux configs
    files: [
      "node_modules/7zip-bin/**/*",
      "!node_modules/7zip-bin/win/**",
      "!node_modules/7zip-bin/mac/**"
    ]
  },
```
## Release

The out-of-box github action will validate each your PR by eslint and run `npm run build`. It will not trigger electron-builder to build production assets.

For each push in master branch, it will build production assets for win/mac/linux platform and upload it as github action assets. It will also create a **pull request** to asking you to bump version and update the changelog. 

It using the conventional-commit. If you want to auto-generate the changelog, you should follow the [conventional commit guideline](https://www.conventionalcommits.org/en/v1.0.0).

If the **bump version PR** is approved and merged to master, it will auto build and release to github release.

**If you want to disable this github action release process, just remove the [.github/workflows/build.yml](/.github/workflows/build.yml) file.**
