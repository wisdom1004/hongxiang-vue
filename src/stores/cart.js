import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useUiStore } from './ui'

function load () {
  try {
    return normalize(JSON.parse(localStorage.getItem('cart') || '[]'))
  } catch (e) {
    return []
  }
}

function normalize (raw) {
  if (!Array.isArray(raw)) return []
  return raw.map(i => ({
    productId: Number(i.productId != null ? i.productId : i.id) || 0,
    name: String(i.name || ''),
    price: Number(i.price) || 0,
    num: Math.max(1, Math.min(99, Number(i.num) || 1)),
    unit: i.unit || '件'
  })).filter(i => i.productId)
}

export const useCartStore = defineStore('cart', () => {
  const items = ref(load())
  const checkedIds = ref([])

  const count = computed(() => items.value.reduce((s, i) => s + (Number(i.num) || 1), 0))
  const total = computed(() => items.value.reduce((s, i) => s + i.price * i.num, 0))
  const checkedItems = computed(() => items.value.filter(i => checkedIds.value.includes(i.productId)))
  const checkedTotal = computed(() => checkedItems.value.reduce((s, i) => s + i.price * i.num, 0))
  const allChecked = computed(() => items.value.length > 0 && items.value.every(i => checkedIds.value.includes(i.productId)))

  function persist () {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  function add (product, qty) {
    const n = Math.max(1, Math.min(99, Number(qty) || 1))
    const pid = Number(product.id != null ? product.id : product.productId)
    const hit = items.value.find(i => i.productId === pid)
    if (hit) hit.num = Math.min(99, hit.num + n)
    else items.value.push({
      productId: pid,
      name: product.name,
      price: Number(product.price) || 0,
      num: n,
      unit: product.unit || '件'
    })
    useUiStore().show('已加入购物车：' + product.name + ' × ' + n)
  }

  function setNum (pid, num) {
    const hit = items.value.find(i => i.productId === Number(pid))
    if (!hit) return
    const n = Number(num)
    if (!n || n <= 0) return remove(pid)
    hit.num = Math.max(1, Math.min(99, n))
  }

  function remove (pid) {
    items.value = items.value.filter(i => i.productId !== Number(pid))
    checkedIds.value = checkedIds.value.filter(id => id !== Number(pid))
  }

  function toggle (pid) {
    const id = Number(pid)
    if (checkedIds.value.includes(id)) checkedIds.value = checkedIds.value.filter(x => x !== id)
    else checkedIds.value = checkedIds.value.concat(id)
  }

  function toggleAll (checked) {
    checkedIds.value = checked ? items.value.map(i => i.productId) : []
  }

  function clearChecked () {
    items.value = items.value.filter(i => !checkedIds.value.includes(i.productId))
    checkedIds.value = []
  }

  watch(items, persist, { deep: true })

  return {
    items, checkedIds, count, total, checkedItems, checkedTotal, allChecked,
    add, setNum, remove, toggle, toggleAll, clearChecked
  }
})
