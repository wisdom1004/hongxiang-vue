import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const toast = reactive({ msg: '', icon: 'bi-check-circle-fill', show: false })
  let timer = null

  function show (msg, icon) {
    toast.msg = String(msg || '')
    toast.icon = icon || 'bi-check-circle-fill'
    toast.show = true
    clearTimeout(timer)
    timer = setTimeout(() => { toast.show = false }, 2400)
  }

  function hide () {
    toast.show = false
    clearTimeout(timer)
  }

  return { toast, show, hide }
})
