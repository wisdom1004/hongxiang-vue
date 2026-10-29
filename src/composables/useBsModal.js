import { nextTick, onBeforeUnmount, onMounted } from 'vue'
import { Modal } from 'bootstrap'

export function useBsModal (elRef, options) {
  let instance = null

  onMounted(() => {
    if (elRef.value) instance = Modal.getOrCreateInstance(elRef.value, options || {})
  })

  onBeforeUnmount(() => {
    if (instance) {
      instance.hide()
      instance.dispose()
    }
    document.querySelectorAll('.modal-backdrop').forEach(n => n.remove())
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  })

  const show = () => nextTick(() => { instance && instance.show() })
  const hide = () => instance && instance.hide()

  return { show, hide }
}
