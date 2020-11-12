/**
 * @type {import('vitepress').DefaultTheme.Config}
 */
const themeConfig = {
  search: {
    searchMaxSuggestions: 10,
  },
  sidebar: 'auto',
  repo: 'ci010/vue-electron-next',
  docsDir: 'docs',
  repoLabel: 'Github',
  lastUpdated: true,
  prevLink: true,
  nextLink: true,
  locales: {
    '/': {
      lang: 'en-US',
      title: 'vue-electron-next',
      description: 'vue hooks',
      label: 'English',
      selectText: 'Languages',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'vue-electron-next',
      description: 'vue hooks',
      label: '中文',
      selectText: '语言',
    },
  },
}

/**
 * @type {import('vitepress').UserConfig<import('vitepress').DefaultTheme.Config>}
 */
const config = {
  lang: 'en-US',
  themeConfig,
  base: '/electron-vue-next',
  title: 'Electron Vue Next',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'vue-electron-next',
      description: 'vue hooks',
      label: 'English',
      selectText: 'Languages',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'vue-electron-next',
      description: 'vue hooks',
      label: '中文',
      selectText: '语言',
    },
  },
}

module.exports = config;
