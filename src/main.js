import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { startMock } from './mock'

import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'
import './styles/agri-pro.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// 先启动 Mock Service Worker 再挂载应用，确保首屏请求也被拦截
startMock().finally(() => {
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
})
