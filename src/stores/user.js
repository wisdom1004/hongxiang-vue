import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginRequest } from '@/api'

const TOKEN_KEY = 'token'

function read (key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const currentUser = ref(read('currentUser', null))
  const userInfo = ref(read('userInfo', {}))

  const isLoggedIn = computed(() => !!token.value && !!(currentUser.value && currentUser.value.account))
  const displayName = computed(() => (userInfo.value && userInfo.value.nick) || (currentUser.value && currentUser.value.account) || '游客')

  /**
   * 登录：密码与短信验证码共用 /api/auth/login
   * @param {{account:string, password?:string, code?:string, mode:'password'|'code'}} payload
   */
  async function login (payload) {
    const account = String((payload && payload.account) || '').trim()
    const mode = payload && payload.mode === 'code' ? 'code' : 'password'
    if (!account) return { ok: false, message: '请输入账号' }
    if (mode === 'password' && !String(payload.password || '')) return { ok: false, message: '请输入密码' }
    if (mode === 'code' && !String(payload.code || '')) return { ok: false, message: '请输入短信验证码' }

    const res = await loginRequest({
      account,
      mode,
      password: mode === 'password' ? String(payload.password) : '',
      code: mode === 'code' ? String(payload.code) : ''
    })
    if (!res.ok) {
      return { ok: false, message: (res.data && res.data.error) || '登录失败，请重试' }
    }

    const data = res.data || {}
    token.value = data.token || ''
    localStorage.setItem(TOKEN_KEY, token.value)

    const info = Object.assign({}, userInfo.value || {})
    if (!info.nick) info.nick = (data.user && data.user.nick) || account
    if (/^\d{11}$/.test(account) && !info.phone) info.phone = account
    userInfo.value = info
    currentUser.value = {
      account,
      role: (data.user && data.user.role) || 'user',
      loginMode: mode,
      loginTime: new Date().toISOString()
    }
    localStorage.setItem('userInfo', JSON.stringify(info))
    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    return { ok: true }
  }

  function logout () {
    token.value = ''
    currentUser.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('currentUser')
  }

  return { token, currentUser, userInfo, isLoggedIn, displayName, login, logout }
})
