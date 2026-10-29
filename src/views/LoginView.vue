<template>
  <main class="login-wrap">
    <div class="container">
      <div class="row g-0 login-shell">
        <div class="col-lg-6 login-intro">
          <div class="hf-eyebrow">产地直发 · 一物一码</div>
          <h1>让每一份山货<br><span>都卖得出去</span></h1>
          <p>登录后可查看认养与预售订单、收藏的农产、常用收货信息；合作社与运营人员可进入后台查看滞销预警与订单。</p>
          <ul class="login-points">
            <li><i class="bi bi-check2-circle"></i>认养果树，锁定果农一年的管护收益</li>
            <li><i class="bi bi-check2-circle"></i>预售尾款随行就市，先卖后采不压货</li>
            <li><i class="bi bi-check2-circle"></i>扫码溯源，看到采摘、质检、发货全过程</li>
          </ul>
        </div>

        <div class="col-lg-6 login-form-side">
          <div class="login-card">
            <h2>登录红乡智推</h2>
            <p class="login-card__sub">
              <template>首次使用短信验证码登录后将自动创建账号</template>
            </p>

            <div class="login-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                :aria-selected="mode === 'password'"
                :class="{ 'is-active': mode === 'password' }"
                @click="switchMode('password')"
              >密码登录</button>
              <button
                type="button"
                role="tab"
                :aria-selected="mode === 'code'"
                :class="{ 'is-active': mode === 'code' }"
                @click="switchMode('code')"
              >验证码登录</button>
            </div>

            <form @submit.prevent="submit">
              <div class="mb-3">
                <label class="form-label" for="username">账号</label>
                <input id="username" v-model="account" type="text" class="form-control" placeholder="请输入手机号" autocomplete="username" required>
              </div>

              <div v-if="mode === 'password'" class="mb-3">
                <label class="form-label" for="password">密码</label>
                <input id="password" v-model="password" type="password" class="form-control" placeholder="请输入密码" autocomplete="current-password" required>
              </div>
              <div v-else class="mb-3">
                <label class="form-label" for="code">短信验证码</label>
                <div class="d-flex gap-2">
                  <input id="code" v-model="code" type="text" inputmode="numeric" maxlength="6" class="form-control" placeholder="请输入 6 位验证码" autocomplete="one-time-code" required>
                  <button class="btn login-code-btn" type="button" :disabled="countdown > 0" @click="sendCode">
                    {{ countdown > 0 ? countdown + 's 后重发' : '获取验证码' }}
                  </button>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="form-check">
                  <input id="remember" class="form-check-input" type="checkbox" checked>
                  <label class="form-check-label" for="remember">记住我</label>
                </div>
              </div>

              <button type="submit" class="btn theme-red w-100" :disabled="loading">
                <span v-if="loading" class="hf-spinner"></span>
                {{ loading ? '登录中…' : '登录 / 免费注册' }}
              </button>
            </form>

            <p class="login-demo">
              <i class="bi bi-info-circle"></i>
              演示凭据：手机号 <b>18866669999</b>，密码 <b>123456</b>，验证码 <b>178562</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import '@/styles/pages/login.css'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const ui = useUiStore()

const account = ref('')
const password = ref('')
const code = ref('')
const mode = ref('password')
const loading = ref(false)
const countdown = ref(0)
let timer = null

const target = computed(() => {
  const raw = route.query.redirect || route.query.next
  const url = String(raw || '')
  if (!url || /^(https?:)?\/\//i.test(url) || url.includes('..') || !url.startsWith('/')) return '/user'
  return url
})

function switchMode (next) {
  mode.value = next
  if (next === 'password') code.value = ''
  else password.value = ''
}

// 模拟发送短信验证码：仅前端倒计时，不请求后端
function sendCode () {
  if (countdown.value > 0) return
  if (!String(account.value || '').trim()) {
    ui.show('请先输入账号', 'bi-exclamation-circle')
    return
  }
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
  ui.show('验证码已发送', 'bi-chat-dots-fill')
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

async function submit () {
  if (loading.value) return
  loading.value = true
  const res = await user.login({
    account: account.value,
    password: password.value,
    code: code.value,
    mode: mode.value
  })
  loading.value = false
  if (!res.ok) {
    ui.show(res.message, 'bi-exclamation-circle')
    return
  }
  ui.show('登录成功，正在进入…', 'bi-check-circle-fill')
  setTimeout(() => router.replace(target.value), 420)
}
</script>

<style scoped>
.login-tabs {
  display: flex;
  gap: 6px;
  margin: 18px 0 18px;
  border-bottom: 1px solid var(--hf-line, #e5ded3);
}
.login-tabs button {
  flex: 1;
  border: 0;
  background: none;
  padding: 9px 4px 10px;
  font-size: 14px;
  font-weight: 700;
  color: #8a8177;
  border-bottom: 2px solid transparent;
  transition: color .18s, border-color .18s;
}
.login-tabs button:hover { color: #7a1006; }
.login-tabs button.is-active {
  color: #7a1006;
  border-bottom-color: #c0392b;
}
.login-demo {
  margin: 14px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: #8a8177;
}
.login-demo i { color: #b8860b; margin-right: 4px; }
.login-demo b { color: #7a1006; }

/* 获取验证码按钮，与输入框同高 */
.login-code-btn {
  flex: 0 0 108px;
  padding: 0 8px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  color: #7a1006;
  background: #fdfaf5;
  border: 1px solid #d8cfc2;
  white-space: nowrap;
}
.login-code-btn:hover:not(:disabled) {
  color: #fff;
  background: #c0392b;
  border-color: #c0392b;
}
.login-code-btn:disabled {
  color: #a09a91;
  background: #f3f0ea;
  border-color: #e2dbd0;
}
</style>
