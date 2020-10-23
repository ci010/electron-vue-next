# Overview

This repository contains the starter template for using vue-next with the latest electron. 

*I started to learn electron & vue by the great project [electron-vue](https://github.com/SimulatedGREG/electron-vue). This project is also inspired from it.*

This repo is still **WIP**. 
I'm still working on validating the release process of this repo, and the documentation might not be completed.

If you familiar with electron and vue and don't need example to demostrate how to use it.
You can just start to use this!

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

## Planned Features

- Multi-Windows Support
  - This need to wait vite support [#257](https://github.com/vitejs/vite/issues/257)
  - Currently, all workarounds I can come up with are all ugly and not ideal enough...
- Make tsconfig.json less confusing
  - Due to the Vetur limitation (only the root tsconfig.json is used for vetur), the current root tsconfig.json might be confusing
- [vue-devtool](https://github.com/vuejs/vue-devtools) support
  - Currently the devtool is still WIP and not support vuex/router...
  - Wait until it has great support for vuex and router to add it

## Getting Started

Clone or fork this project to start.
Once you have your project, and in the project folder:

```sh
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

### Using NodeJS in Renderer

Due to the project is following the [security](https://www.electronjs.org/docs/tutorial/security) guideline. It does not allow the renderer to access node by default. You should use [Service](/src/main/services/Service.ts) to encapsulate your nodejs operation and use the hook `useService('NameOfService')` to use in renderer side.

### Config Your Project and Build

Once you install your project, you should change the package base info in [package.json](/package.json),
and also the build information in [build.base.config.js](/scripts/build.base.config.js)

### Debug In VSCode

This is really simple. In vscode debug section, you will see three profiles: 

1. Electron: Main (attach)
2. Electron: Renderer (attach)
3. Electron: Main & Renderer (attach)

The name should be clear. The first one attach to main and the second one attach to renderer (required vscode chrome debug extension).
The third one is run the 1 and 2 at the same time.

You should first run `npm run dev` and start debugging by the vscode debug.

### Adding New Dependencies

If you adding new dependenceis, make sure if it using nodejs module, add it as `exclude` in the [vite.config.js](/scripts/vite.config.js). Otherwise, the vite will complain about "I cannot optimize it!".

The raw javascript dependencies are okay for vite.

#### Native Dependencies

If you want to use the native dependencies, not only you should adding it to vite `exclude`, you should also take care about the electron-builder config.

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

### Release Process

The out-of-box github action will validate each your PR by eslint and run `npm run build`. It will not trigger electron-builder to build production assets.

For each push in master branch, it will build production assets for win/mac/linux platform and upload it as github action assets. It will also create a **pull request** to asking you to bump version and update the changelog. 

It using the conventional-commit. If you want to auto-generate the changelog, you should follow the [conventional commit guideline](https://www.conventionalcommits.org/en/v1.0.0).

If the **bump version PR** is approved and merged to master, it will auto build and release to github release.

**If you want to disable this github action release process, just remove the [.github/workflows/build.yml](/.github/workflows/build.yml) file.**
