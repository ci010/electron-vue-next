# electron-vue-next

This repository contains the starter template for using vue-next with the latest electron. 

*I started to learn electron & vue by the great project [electron-vue](https://github.com/SimulatedGREG/electron-vue). This project is also inspired from it.*

## 特性清单

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

## 上手指南

git clone 或者直接下载本仓库

之后在仓库根目录下:

```sh
# 安装依赖
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

### 在 Renderer 进程中使用 Nodejs

本项目默认遵从 [security](https://www.electronjs.org/docs/tutorial/security)。在默认情况下，Renderer (浏览器) 不能访问 NodeJS 的模块，这意味着你不能在浏览器中直接访问 fs 来读写文件。你需要通过使用 [Service](/src/main/services/Service.ts) 来访问 NodeJS 资源。在 vue 中使用 `useService('NameOfService')` 来获得 service 提供的方法。

### 配置你的项目信息和构建脚本

在你安装完项目依赖之后，你应该首先去 [package.json](/package.json) 中更改项目基本信息，如项目名，作者信息，git 仓库地址等。
同时你需要更新构建信息 [build.base.config.js](/scripts/build.base.config.js)，

#### assets, 静态资源 (static), 构建资源... 有啥区别？

assets 文件只在 Renderer 进程中使用，他们会被 vite，也就是 rollup 系统打包到最终的构建文件中，你可以直接在 vue/ts 文件中 import 他们，基本上不用自己关心。assets 默认位置在 [renderer/renderer/assets](src/renderer/assets)

静态资源，指的是一些需要被 main 进程在运行中使用的文件，比如你的系统托盘小图标 (Tray) 就需要放在 static 文件夹中，在运行时通过文件系统 (fs) 获取。或如你需要在 Windows 下运行一段 powershell，这些 powershell 文件通常就需要放在 static 文件夹下，并且在构建配置文件中明确标出 asarUnpack。默认静态文件夹在 [static](static).

The build resources are used by `electron-builder` to build the installer. They can be your program icon of installer, or installer script. Default build icons are under [build/icons](build/icons).

*Notice that your program icon can show up in multiple place! Don't mixup them!*
- *In build icons, of course you want your program has correct icon.*
- *In static directory, sometime you want your program has **tray** which require icon in static directory.*
- *In assets, sometime you want to display your program icon inside a page. You need to place them in the assets!*

### 在 VSCode 中 Debug

本项目内置配置好的 vscode debug 配置。你会在 .vscode/launch.json 中看到以下三个配置 

1. Electron: Main (attach)
2. Electron: Renderer (attach)
3. Electron: Main & Renderer (attach)

如果你看得懂的话就比较清晰了. 第一个是 attach 到 Electron 的 main 进程上。第二个是 attach 到 Renderer 进程上（需要 vscode 安装 Chrome Debugger 插件）。第三个则是这俩的合体，两个都 attach 上。

注意，这些配置都是 attach 模式，你需要先通过 `npm run dev` 启动 Electron 后使用。

### 新增依赖

如果你想添加新的 npm 包作为依赖使用，你需要注意这个依赖是不是一个基于 nodejs 的模块。如果它是一个 nodejs 的包，你需要把这个包名放进 [vite.config.js](/scripts/vite.config.js) 的 `exclude` 列表中。这个列表是用于告诉 vite 不要优化某些依赖，如果你不在这里剔除他们，vite就会抱怨说“我优化不了这些！”之类的话。

当然如果这个依赖是纯 JS 实现，你就不需要把它加到这里面了。

#### 原生 (Native) 依赖 

一些 npm 包中自带编译好的二进制文件，对于这种
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

## NPM Scripts

### `npm run dev`

Start the vite dev server hosting the renderer webpage with hot reloading.
Start the rollup server hosting the main process script.


## Planned Features

- Multi-Windows Support
  - This need to wait vite support [#257](https://github.com/vitejs/vite/issues/257)
  - Currently, all workarounds I can come up with are all ugly and not ideal enough...
- Make tsconfig.json less confusing
  - Due to the Vetur [limitation](https://github.com/vuejs/vetur/issues/424) (only the root tsconfig.json is used for vetur), the current root tsconfig.json might be confusing
- [vue-devtool](https://github.com/vuejs/vue-devtools) support
  - Currently the devtool is still WIP and not support vuex/router...
  - Wait until it has great support for vuex and router to add it