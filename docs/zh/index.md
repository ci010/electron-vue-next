# electron-vue-next

此仓库包含了一个用于快速上手 vue-next 和 electron 的模板~

*我通过使用 [electron-vue](https://github.com/SimulatedGREG/electron-vue)，学习了如何使用 electron 和 vue。所以这个项目很大程度上受到了它的启发。*

## 特性清单

- Electron 10
  - 遵从 [ 安全性，原生能力和你的责任 ](https://www.electronjs.org/docs/tutorial/security) 这篇文章的指导，将 renderer 进程配置为纯“浏览器环境”（没有 node 环境）
  - 使用 [electron-builder](https://github.com/electron-userland/electron-builder) 来构建项目
- 跟随 [vue-next](https://github.com/vuejs/vue-next) 的新生态
  - 使用 [vite](https://github.com/vitejs/vite) 来构建 renderer 进程，热重载速度非常之快
  - 使用 [vuex 4.0](https://github.com/vuejs/vuex/tree/4.0)，并自带类型推断代码，尽可能利用 typescript 的类型系统
  - 使用了新的 [vue-router-next](https://github.com/vuejs/vue-router-next)
- 内置 [eslint](https://www.npmjs.com/package/eslint)，默认使用 Javascript Standard
- 内置 TypeScript
  - 使用 [esbuild](https://github.com/evanw/esbuild) 和 [rollup](https://github.com/rollup/rollup) 来构建 main 进程的 typescript（和 vite 使用的 esbuild 版本相同）
- 开箱即用的 Github Action 发布流程
  - 自动升级版本号并且生成更变日志，只要你的 git commits 遵从 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0)
  - 具体细节你可以在 [发布](#发布) 这个章节查找
- 和 VSCode 集成
  - 自带 VSCode 的 Debug 配置。可以在 VSCode 中 debug typescript 和 vue 文件，main 和 renderer 的都可以。
  - 具体实现细节可以看 [Debug](#在-vscode-中-debug) 这个章节
- 支持多窗口
  - 可以简单地让 App 增加一个新的窗口，详情参见 [如何添加一个新的窗口](#添加一个新的窗口)

## 上手指南

通过 npm init 来创建模板:

`npm init electron-vue-next`

之后在仓库根目录下:

```shell
# 安装依赖
npm install

# 创建 dev 服务器，将启动 electron 和 vite 的热重载服务器
npm run dev

# 可选. 将 main 和 renderer 进程编译成 JavaScript，并显示输出大小
npm run build

# 可选. 将所有编译输出打包到一个 electron 应用程序中，以文件夹形式存在
npm run build:dir

# 将所有输出打包到实际的 electron 安装包中
npm run build:production

```

### 配置你的项目信息和构建脚本

在你安装完项目依赖之后，你应该首先去 [package.json](/package.json) 中更改项目基本信息，如项目名，作者信息，git 仓库地址等。
同时你需要更新构建信息 [build.base.config.js](/scripts/build.base.config.js)，

## 项目结构

### 文件目录结构

整个项目的文件结构大概如此：

```
your-project
├─ scripts                 所有的脚本文件夹，比如 build 的脚本就在这放着
├─ build                   build 使用的资源文件，同时也是 build 的输出文件夹
│  └─ icons/               build 使用的图标文件
├─ dist
│  └─ electron/            编译后的js会在这
├─ src
│  ├─ main
│  │  ├─ dialog.ts         对 electron dialog API 的简单封装，让 renderer 可以使用 dialog
│  │  ├─ global.ts         typescript 的一些全局定义
│  │  ├─ index.dev.ts      rollup 开发环境的入口文件
│  │  ├─ index.prod.ts     rollup 生产环境的入口文件
│  │  ├─ index.ts          共享的入口文件，基本逻辑都从这开始
│  │  ├─ logger.ts         一个简单的 Logger
│  │  └─ staticStore.ts
│  ├─ renderer
│  │  ├─ assets/           assets 文件夹
│  │  ├─ components/       所有 vue components
│  │  ├─ router.ts         vue-router 初始代码
│  │  ├─ store.ts          vuex 初始代码
│  │  ├─ App.vue           Vue 文件的入口文件，被 index.ts 导入
│  │  ├─ index.css         vite 会编译的 css 的入口文件
│  │  ├─ index.html        vite 会编译的 html 的入口文件
│  │  └─ index.ts          vite 会编译的 typescript 的入口文件
│  └─ shared               在 main 和 renderer 之间共享的代码文件夹，其中代码两边都可以 import 到
│     ├─ store/            vuex store 的定义
│     └─ sharedLib.ts      一个简单的 main/renderer 共享模块的例子
├─ static/                 静态资源文件夹
├─ .eslintrc.js
├─ .gitignore
├─ package.json
└─ README.md
```

#### assets, 静态资源 (static), 构建资源... 有啥区别？

assets 文件只在 Renderer 进程中使用，他们会被 vite，也就是 rollup 系统打包到最终的构建文件中，你可以直接在 vue/ts 文件中 import 他们，基本上不用自己关心。assets 默认位置在 [renderer/renderer/assets](src/renderer/assets)

静态资源，指的是一些需要被 main 进程在运行中使用的文件，比如你的系统托盘小图标 (Tray) 就需要放在 static 文件夹中，在运行时通过文件系统 (fs) 获取。或如你需要在 Windows 下运行一段 powershell，这些 powershell 文件通常就需要放在 static 文件夹下，并且在构建配置文件中明确标出 asarUnpack。默认静态文件夹在 [static](static)。

而构建资源是指那些被 `electron-builder` 使用的资源，他们会用来构建安装包等。例如程序的图标，安装程序的自定义脚本等。默认的程序图标放在 [build/icons](build/icons) 里。

*请注意你的程序图标可能需要在各种地方使用！不要混淆他们！*
- *对于安装包图标, 他们应该在 `build/icons`，这会影响例如安装包图标，或者在 File Explorer 中显示的图标*
- *对于静态资源中的图标，一般是用作于设置 **(系统托盘) tray** 或者当前窗口在任务栏的图标*
- *对于在 assets 中的图标，这些一般使用在页面内显示 logo*


### 主进程和渲染进程的概念

从 Electron 官方文档 [main and renderer processes](https://www.electronjs.org/docs/tutorial/quick-start#main-and-renderer-processes) 引用的解释。主进程 (main process) 是

> - 主进程通过创建 BrowserWindow 实例来创建 网页。 每一个 BrowserWindow 实例在其渲染过程中运行网页， 当一个 BrowserWindow 实例被销毁时，对应的渲染过程也会被终止。
> - 主进程 管理 所有网页及其对应的渲染进程。

而渲染进程 (renderer process) 则是

> - 渲染进程只能管理相应的网页， 一个渲染进程的崩溃不会影响其他渲染进程。
> - 渲染进程通过 IPC 与主进程通信在网在页上执行 GUI 操作。 出于安全和可能的资源泄漏考虑，直接从渲染器进程中调用与本地 GUI 有关的 API 受到限制。

一般来讲，主进程包含了你的核心业务逻辑，而渲染进程则负责显示。当然这不绝对，有些人认为主进程就应该只负责一些和系统交互的操作，不应该有重 CPU 的操作，因为如果主进程 CPU 负荷过高会将整个 App 卡住（幸好 Nodejs 大部分 IO API 都是 async，并不会卡住整个 app）。因此如果你有一些非常吃 CPU 的工作，应该考虑用 nodejs 的 [worker_thread](https://nodejs.org/api/worker_threads.html) 把他们放到别的线程中。

所以这方面的设计和你的 app 的业务高度相关，如果你的业务只是有频繁的 IO 操作，把这些逻辑放在 main 也没什么问题。如果你的业务需要占用 CPU 很长时间，你则需要考虑把他们放在 main 进程之外的地方了。

根据 electron 的 [security](https://www.electronjs.org/docs/tutorial/security) 教程。在这个模板中，renderer 进程 [默认情况下 **并没有** 权限去访问 nodejs 的模块](https://www.electronjs.org/docs/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content). Electron 在 `webPreferences` 里提供了 `preload` 选项来处理这种问题。在这个模板中，我们则提供了 `Service` 来处理这个问题。

`Service` 是一系列定义在 `src/main/services` 文件夹下的 class。`Service` 所有的 public 方法，经过我们的封装，都可以简单地在 renderer 进程访问。
它也可以看作一个 main 和 renderer 进程之间的桥梁。你可以参考 [Service](#服务-service) 章节来一探究竟。


### NPM 脚本

#### `npm run dev`

开启 vite 开发环境，vite 将提供 renderer （浏览器端）的热重载。
同时开启一个 rollup 开发环境，检测 main 端的代码变化，如果 main 的代码有变动，它会自动重启你的整个 electron 程序。

#### `npm run build`

将 `main` 和 `renderer` 的代码编译到 production 环境, 输出的代码在 `dist/electron`

#### `npm run build:production`

编译所有代码，并且使用 `electron-builder` 来你的 app build 成可执行的 exe 文件或者 zip 等。这个的配置文件在 [scripts/build.base.config.js](scripts/build.base.config.js)。

#### `npm run build:dir`

编译所有代码, 并且使用 `electron-builder` 编译你的 app 到 production 环境，但它只输出文件夹形式的 build （不打包成安装程序），比如对于 windows x64，他会把你的程序编译到 `build/win-unpacked`，并不输出 installer。

自然，这个会比 `npm run build:production` 快。你可以使用它来快速测试 production 的软件运行状况。

#### `npm run lint`

使用 eslint 来检查代码风格。

#### `npm run lint:fix`

使用 eslint 来检查代码风格并尽可能的修复。

## 开发

本项目默认遵从 [security](https://www.electronjs.org/docs/tutorial/security)。在默认情况下，Renderer (浏览器) 不能访问 NodeJS 的模块，这意味着你不能在浏览器中直接访问 fs 来读写文件。你需要通过使用 [Service](/src/main/services/Service.ts) 来访问 NodeJS 资源。在 vue 中使用 `useService('NameOfService')` 来获得 service 提供的方法。

### 服务 (Service)

所有 Service 的实现都放在 `src/main/services`。Service 应该包含一些 App 与网络、磁盘文件交互的的核心业务逻辑，这些逻辑将运行在主进程。Service 会自动暴露接口到渲染进程，在渲染进程中，你可以通过一个 `useService('NameOfService')` 来直接使用 Service。

Serivce 本身是完全可选的。之所以有这种设计是因为 Electron 提倡的安全性 ***如果你认为这个设计是多余的，或者是过度设计，你完全可以移除它。***

#### 创建一个新 Service

在 `/src/main/services` 里添加一个文件叫 `BarService.ts`

```ts
export default class BarService extends Service {
  async doSomeCoreLogic() {
    // 在这里做一些异步的核心业务逻辑
  }
}
```

之后你需要把这个 `BarService` 加到 `Services` 的接口中，在 `src/main/services/index.ts` 里：

```ts
import { BarService } from './BarService'

export interface Services {
  // ... 一些其他的 Services
  BarService: BarService
}
```

之后，你需要把它添加到 `src/main/index.ts` 的 `initializeServices` 里：

```ts
async function initializeServices(logger: Logger) {
  initialize({
    // ... 其他 services 的初始化
    BarService: new BarService(logger)
  })
}
```

现在这个 `BarService` 已经可以被渲染进程调用了，只需要通过 `useService('BarService')` 就可以，详情请见 [Using Service in Renderer](#在渲染进程浏览器中使用某个-service).

##### Services 之间的交互

如果你在一个 `Service` 中想使用其他 `Service`，比如 `FooService`。你需要使用 `@Inject` 装饰器。

```ts
export default class BarService extends Service {
  @Inject('FooService')
  private fooService: FooService

  async doSomeCoreLogic() {
    const result = await this.fooService.foo()
  }
}
```

#### 在渲染进程(浏览器)中使用某个 Service

在 renderer 进程中，你可以通过 `useService('nameOfService')` 直接访问所有 service 的所有异步（async）方法。

这是 [About.vue]() 里的一个例子，它在使用 `BaseService`.

```vue
<template>
  <div>
    <img alt="Vue logo" src="../assets/logo.png" />
    <div>Electron Version: {{ version }} </div>
    <div>Appdata Path: {{ path }} </div>
    <div>Running Platform: {{ platform }} </div>
  </div>
</template>

<script lang=ts>
import { defineComponent, reactive, toRefs } from 'vue'
import { useService } from '../hooks'

export default defineComponent({
  setup() {
    const { getBasicInformation } = useService('BaseService')
    const data = reactive({
      version: '',
      path: '',
      platform: ''
    })
    getBasicInformation().then(({ version, platform, root }) => {
      data.version = version
      data.path = root
      data.platform = platform
    })
    return {
      ...toRefs(data)
    }
  }
})
</script>
```

#### 移除 Service 架构

如果你不喜欢 Service 的设计，你可以简单地把他们移除掉：
1. 删掉整个 `src/main/services` 文件夹
2. 删掉 `src/main/index.ts` 里面的 `import { initialize } from './services'` 和 `initialize(logger)`

当然你可以在 `npm init` 之初就选择不要 service。

### 在渲染进程中使用 Hooks (Composable)

Vue 3 的一大特性就是 [composition-api](https://composition-api.vuejs.org/)。你可以通过组合模式，将各种简单逻辑在 `setup` 函数中拼装出复杂的业务逻辑。这些组合函数都默认放在 `/src/renderer/hooks` 中。

下面就是官方文档中的例子，你在 `/src/renderer/hooks/mouse.ts` 里有以下代码：

```ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMousePosition() {
  const x = ref(0)
  const y = ref(0)

  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}
```

你可以把 `mouse.ts` 在 `/src/renderer/hooks/index.ts` 中导出：

```ts
// 其他导出...

export * from './mouse.ts'
```

然后你在 `vue` 文件中，就可以这样来导入：

```vue
<template>
  ...template content
</template>
<script lang=ts>
import { defineComponent } from 'vue'
import { useMousePosition } from '/@/hooks'

export default defineComponent({
  setup() {
    const { x, y } = useMousePosition()
    // other logic
    return { x, y }
  }
})
</script>
```

### 在渲染进程中使用 Electron API

此项目在默认情况下已经封装了一些 electron API 供 renderer 进程使用，例如 `useShell`, `useClipboard`, `useIpc` 和 `useDialog`。

*这些 API 是通过加载 `static/preload.js` 来实现的。如果你把 preload 在创建 BrowserWindow 的时候给移除了，在 renderer 进程这些就用不了了。*

```ts
import { defineComponent } from 'vue'
import { useShell } from '/@/hooks'

export default defineComponent({
  setup() {
    const shell = useShell() // 这个等价于 import { shell } from 'electron'
  }
})
```

一般的 use 风格的 electron API 都等价于直接从 electron import，但是 `useDialog` 是唯一例外，你只能在其中使用 `async` 的 API。

### 管理依赖

如果你想添加新的 npm 包作为依赖使用，你需要注意这个依赖是不是一个基于 nodejs 的模块。如果它是一个 nodejs 的包，你需要把这个包名放进 `package.json` 的 `external` 列表中。这个列表是用于告诉 vite 不要优化某些依赖，如果你不在这里剔除他们，vite就会抱怨说“我优化不了这些！”之类的话。


```json
{
  // ...other package.json content
  "dependencies": {
    // ...other dependencies
    "a-nodejs-package": "<version>"
  },
  "external": [
    // ...other existed excluded packages
    "a-nodejs-package" // your new package
  ],
  // ...rest of package.json
}
```

当然如果这个依赖是纯 JS 实现，你就不需要把它加到这里面了。

#### 原生 (Native) 依赖 

如果你需要使用一些原生依赖（需要在安装时从源码重新构建成二进制的依赖），通常你需要 [node-gyp](https://github.com/nodejs/node-gyp)，但是 `electron-builder` 会自动帮你重新构建 electron 版本的二进制文件。所以你一般不需要太在意这个。请注意，如果你在用 Windows，你可能需要安装 [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) 来帮助你安装构建依赖的环境。

#### 自带二进制的依赖

有一些 package 中含有已经编译好的二进制文件，对于这种 package 我们不但需要把它放进 `external` 中，还需要对 electron-builder 的配置稍加改动。具体细节请参见 [在构建中剔除某些具体文件](#在构建中剔除某些具体文件) 章节。当然这对于正常开发流程并没有什么影响。

### 添加一个新的窗口

1. 在 `src/renderer` 下添加一个新的 html 文件
2. 在新添加的 html 文件中引用你新写的 ts/js 文件
3. 在主进程 `main/index.ts` 中加入一段创建此窗口的代码

例如你在 `src/renderer` 下面新增加了 `side.html` ，你需要在 `index.ts` 中加入类似以下代码：

```ts

// 这个方法应该在启动的时候被调用
function createANewWindow() {
  // 这部分和之前都一样，根据自己需求改
  const win = new BrowserWindow({
    height: 600,
    width: 300,
    webPreferences: {
      preload: join(__static, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // __windowUrls.side 就是指向你新添加的 html 的 url
  win.loadURL(__windowUrls.side)
}

```

在 `scripts/vite.config.js` 中会自动扫描 `src/renderer` 下的所有 html 文件，所以一般来说你不需要改 vite 的配置文件。
当然你可以参照 [vite 的官方文档](https://vitejs.dev/guide/build.html#multi-page-app)来更加自定义多页面的功能。

### 在 VSCode 中 Debug

本项目内置配置好的 vscode debug 配置。你会在 .vscode/launch.json 中看到以下三个配置 

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

如果你看得懂的话就比较清晰了. 第一个是 attach 到 Electron 的 main 进程上。第二个是 attach 到 Renderer 进程上（需要 vscode 安装 Chrome Debugger 插件）。第三个则是这俩的合体，两个都 attach 上。

注意，这些配置都是 attach 模式，你需要先通过 `npm run dev` 启动 Electron 后使用。

### 可选项: 在渲染进程中使用 Node 模块

默认情况下，渲染进程就是个普通的前端浏览器环境。你不能在里面访问 nodejs 模块。

如果你是在想在里面用 node 模块，或者你对 service 的设计感到厌倦，你可以直接在你创建 BrowserWindow 之初开启 `nodeIntegration`。这个属性开启会让你的 renderer 进程也能访问 node。

比如你可以有如下代码让我们的主窗口能访问 node：

```ts
const mainWindow = new BrowserWindow({
  height: 600,
  width: 800,
  webPreferences: {
    preload: join(__static, 'preload.js'),
    nodeIntegration: true // 这让这个浏览器可以访问 node
  }
})
```

## 构建

此项目的构建是直接使用 [electron-builder](https://github.com/electron-userland/electron-builder) 来达成的。它的配置主要放在 [scripts/build.base.config.js](https://github.com/ci010/electron-vue-next/tree/master/scripts/build.base.config.js) 文件中。当然你可以参考 electron-builder 的[官方文档](https://www.electron.build/)来使用。

### 编译流程

首先，我们会将 typescript/vue 的源码通过 rollup 以 production 模式编译成 JavaScript。rollup 对主进程的编译配置在 [rollup.config.js](https://github.com/ci010/electron-vue-next/tree/master/scripts/rollup.config.js) 中，它会把编译出来的结果输出到 `dist/electron/index.prod.js`。

注意，因为 rollup 是基于 esm 的，对循环依赖的处理没法像 webpack 那样理想，所以在尝试打包不少 nodejs 的 package 时会遇到循环依赖的问题。而你自己对这些 package 没有掌控 （webpack 一般能处理这种循环依赖的问题，并不会直接失败掉），所以此项目默认带的 rollup 构建脚本是不会打包 main 中使用的 nodejs 依赖的，你只要在 `package.json` 中把他们标注成 `external`，这些依赖就会以 `node_modules` 的形式存在于我们的构建输出的 asar 中。所以当你发现 `index.prod.js` 中没有打包 nodejs 的依赖代码也别感到奇怪就是了。

而渲染进程的编译配置放在 [vite.config.js](https://github.com/ci010/electron-vue-next/tree/master/scripts/vite.config.js) 里，它会将结果输出到 `dist/electron/renderer/*` 里。

### 在构建中剔除某些具体文件

通常来讲，如果你的 `dependencies` 和 `external` 配置正确，你不需要太担心构建的问题。但是有一些依赖包含了已经编译好的二进制。你可能希望正确打包这些预编译的二进制文件。

例如, [7zip-min](https://github.com/onikienko/7zip-min):

因为它引用了 `7zip-bin`，而 `7zip-bin` 自带了针对多平台的二进制文件，我们需要妥善处理这些已经 build 好的二进制文件。我们自然不希望在某一个平台的构件中看到另一个平台的二进制文件。
更改 electron-builder 的构建配置: `build.base.config.js`

```js
  asarUnpack: [
    "node_modules/7zip-bin/**/*"
  ],
```

将他们添加到 `asarUnpack` 中来保证 electron-builder 在安装后会正确解压这些二进制文件。

你还需要在 `build.config.js` 中为每个平台配置 `files`，这样就不会让某个平台的出现在它不该出现的地方了：

```js
  mac: {
    // ... 其他 mac 配置
    files: [
      "node_modules/7zip-bin/**/*",
      "!node_modules/7zip-bin/linux/**",
      "!node_modules/7zip-bin/win/**"
    ]
  },
  win: {
    // ... 其他 win 配置
    files: [
      "node_modules/7zip-bin/**/*",
      "!node_modules/7zip-bin/linux/**",
      "!node_modules/7zip-bin/mac/**"
    ]
  },
  linux: {
    // ... 其他 linux 配置
    files: [
      "node_modules/7zip-bin/**/*",
      "!node_modules/7zip-bin/win/**",
      "!node_modules/7zip-bin/mac/**"
    ]
  },
```

## 发布

自带的 github action 会在你每个 PR 提交的时跑 eslint 和 `npm run build`。并不会做完整的 build （因为 build production 比较花时间，当然你可以自己打开）

当有新的 push 进了 master branch，github action 会自动在 windows/mac/linux 上 build 生产环境的代码。如果构建都成功了，除了会把构建的输出上传到 github assets 之外，它还会创建一个 PR，其中给你提升了 package.json 的版本号，并且会写新的 changelog 到 changelog.md 中。

如果你想要它自动生成 changelog，你得遵循 [conventional commit guideline](https://www.conventionalcommits.org/en/v1.0.0)。

实际应用中你只需要检查这个 PR，如果没啥问题点击通过，它就会再 build 一遍，并且将结果发布到 github release 上。

**如果你不需要这种自动流程，你可以将以下文件移除 [.github/workflows/build.yml](/.github/workflows/build.yml)**

### 自动更新的支持

这个模板默认自带了 [electron-updater](https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater)。你可以参照 [electron-builder](https://github.com/electron-userland/electron-builder) 的流程来实现自动更新。
