import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { clearPersisted } from './persist'

let worker = null

/**
 * 启动 Mock Service Worker。
 * 请求经 Service Worker 拦截，在浏览器 Network 面板可见（标记为 from service worker）。
 */
export async function startMock () {
  if (process.env.VUE_APP_USE_MOCK === 'false') return

  worker = setupWorker(...handlers)

  worker.events.on('request:start', ({ request }) => {
    console.info('[Mock 接口]', request.method, new URL(request.url).pathname +
      (new URL(request.url).search || ''))
  })

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: (process.env.BASE_URL || '/') + 'mockServiceWorker.js' }
  })

  // 控制台执行 __resetMock() 可清空本地数据并回到初始种子态
  window.__resetMock = () => {
    clearPersisted()
    window.location.reload()
  }
}
