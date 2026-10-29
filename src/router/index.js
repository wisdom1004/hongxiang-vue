import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue'),
    meta: { title: '红乡智推 - 红色乡村助农 AI 智能推介平台' }
  },
  {
    path: '/agri',
    name: 'agri',
    component: () => import(/* webpackChunkName: "agri" */ '@/views/AgriView.vue'),
    meta: { title: '助农专区 - 红乡智推' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import(/* webpackChunkName: "cart" */ '@/views/CartView.vue'),
    meta: { title: '红乡智推 - 购物车' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/LoginView.vue'),
    meta: { title: '登录 / 注册 - 红乡智推' }
  },
  {
    path: '/user',
    name: 'user',
    component: () => import(/* webpackChunkName: "user" */ '@/views/UserCenterView.vue'),
    meta: { title: '我的主页 - 红乡智推', requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/AdminView.vue'),
    meta: { title: '运营后台 - 红乡智推' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView.vue'),
    meta: { title: '项目概况 - 红乡智推' }
  },
  { path: '/index.html', redirect: to => ({ path: '/', hash: to.hash, query: to.query }) },
  { path: '/agri.html', redirect: to => ({ path: '/agri', hash: to.hash, query: to.query }) },
  { path: '/cart.html', redirect: to => ({ path: '/cart', hash: to.hash, query: to.query }) },
  { path: '/login.html', redirect: to => ({ path: '/login', hash: to.hash, query: to.query }) },
  { path: '/user-center.html', redirect: to => ({ path: '/user', hash: to.hash, query: to.query }) },
  { path: '/admin.html', redirect: to => ({ path: '/admin', hash: to.hash, query: to.query }) },
  { path: '/about.html', redirect: to => ({ path: '/about', hash: to.hash, query: to.query }) },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // 带锚点时交给 afterEach 统一处理：等待异步数据渲染完成后再定位，避免落在错位置
    if (to.hash) return false
    return { top: 0 }
  }
})

router.beforeEach(to => {
  document.title = to.meta.title || '红乡智推'
  if (to.meta.requiresAuth) {
    const user = useUserStore()
    if (!user.isLoggedIn) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }
  return true
})

router.afterEach(to => {
  if (!to.hash) return
  const MAX_FRAMES = 240          // 最多跟踪约 4 秒
  const STABLE_FRAMES = 24        // 连续 0.4 秒位置不再变化即认为内容已加载完成
  let el = null
  let frames = 0
  let stable = 0
  let aborted = false

  const abort = () => { aborted = true }
  const cleanup = () => {
    window.removeEventListener('wheel', abort)
    window.removeEventListener('touchstart', abort)
  }
  window.addEventListener('wheel', abort, { passive: true, once: true })
  window.addEventListener('touchstart', abort, { passive: true, once: true })

  const tick = () => {
    if (aborted) {
      cleanup()
      return
    }
    if (!el || !el.isConnected) el = document.querySelector(to.hash)
    if (el) {
      const nav = document.querySelector('.navbar')
      const offset = (nav ? nav.offsetHeight : 56) + 10
      const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const top = Math.min(maxTop, Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset))
      if (Math.abs(window.scrollY - top) > 2) {
        window.scrollTo(0, top)
        stable = 0
      } else {
        stable += 1
      }
      if (stable >= STABLE_FRAMES) {
        cleanup()
        return
      }
    }
    if (frames++ < MAX_FRAMES) requestAnimationFrame(tick)
    else cleanup()
  }
  requestAnimationFrame(tick)
})

export default router
