import axios from 'axios'
import { useUiStore } from '@/stores/ui'

export const http = axios.create({
  baseURL: process.env.VUE_APP_API_BASE || '',
  timeout: 15000
})

http.interceptors.response.use(
  res => res.data,
  err => {
    const status = err.response && err.response.status
    const body = err.response && err.response.data
    const message = (body && body.error) ||
      (status === 404 ? '接口不存在' : status ? '请求失败（' + status + '）' : '网络异常')
    if (!(err.config && err.config.silent)) {
      try {
        useUiStore().show(message, 'bi-exclamation-circle')
      } catch (e) { /* pinia 未就绪时静默 */ }
    }
    return Promise.reject(Object.assign(new Error(message), { status, body }))
  }
)

export function postSafe (url, data, config) {
  return http.post(url, data, config).then(d => ({ ok: true, data: d }))
    .catch(e => ({ ok: false, data: e.body || { error: e.message } }))
}
