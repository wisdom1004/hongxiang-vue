import { getProduct, getTrace } from '@/api'
import { useUiStore } from '@/stores/ui'
import { reactive } from 'vue'

const state = reactive({
  open: false,
  loading: false,
  error: '',
  data: null
})

let pending = null

function render (data) {
  state.data = data
  state.error = ''
  state.loading = false
}

export function useTrace () {
  async function openByCode (code) {
    state.open = true
    state.loading = true
    state.data = null
    state.error = ''
    try {
      render(await getTrace(code, { silent: true }))
    } catch (e) {
      state.loading = false
      state.data = null
      state.error = (e.body && e.body.error) || '未查询到该溯源码'
    }
  }

  async function openByProduct (pid) {
    if (pending === pid) return
    pending = pid
    try {
      const p = await getProduct(pid)
      if (!p || !p.trace_code) {
        useUiStore().show('该商品暂未生成溯源码', 'bi-info-circle')
        return
      }
      await openByCode(p.trace_code)
    } catch (e) {
      useUiStore().show((e.body && e.body.error) || '溯源信息获取失败', 'bi-exclamation-circle')
    } finally {
      pending = null
    }
  }

  function close () {
    state.open = false
  }

  return { state, openByCode, openByProduct, close }
}
