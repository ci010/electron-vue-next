# Overview

This repository contains the starter template for using vue-next with the latest electron. 

*I started to learn electron & vue by the great project [electron-vue](https://github.com/SimulatedGREG/electron-vue). This project is also inspired from it.*

You can see the document [here](https://ci010.github.io/electron-vue-next/index.html).

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
  - Due to the Vetur [limitation](https://github.com/vuejs/vetur/issues/424) (only the root tsconfig.json is used for vetur), the current root tsconfig.json might be confusing
- [vue-devtool](https://github.com/vuejs/vue-devtools) support
  - Currently the devtool is still WIP and not support vuex/router...
  - Wait until it has great support for vuex and router to add it

## Getting Started

Run `npm init electron-vue-next`

Once you have your project, and in the project folder:

```shell
# Install dependencies with linter
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
