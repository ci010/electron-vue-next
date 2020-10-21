import { createRouter, createMemoryHistory } from 'vue-router'
import Home from '/@/components/Home.vue'
import About from '/@/components/About.vue'
import Store from '/@/components/StoreExample.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/about',
      component: About
    },
    {
      path: '/store',
      component: Store
    }
  ]
})

export default router
