function getRouterConfig(langPrefix = '/') {
  return [
    {
      text: langPrefix === '/' ? 'Getting started' : '快速上手',
      link: `${langPrefix}`,
    },
  ];
}

/**
 * @type {import('vitepress').DefaultTheme.Config}
 */
const themeConfig = {
  search: {
    searchMaxSuggestions: 10,
  },
  // nav: [{
  //   text: 'Language',
  //   items: [{
  //     text: '中文',
  //     link: '/zh/index',
  //     target: '/zh/index'
  //   }, {
  //     text: 'English',
  //     link: '/'
  //   }]
  // }],
  // sidebar: { '/': 'auto', '/zh/': 'auto' },
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
