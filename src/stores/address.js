import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

function load () {
  try {
    return JSON.parse(localStorage.getItem('addresses') || '[]')
  } catch (e) {
    return []
  }
}

export const useAddressStore = defineStore('address', () => {
  const list = ref(load())
  const defaultAddress = computed(() => list.value.find(a => a.isDefault) || list.value[0] || null)

  function save (addr) {
    if (!addr || !addr.address) return
    const exists = list.value.find(a => a.phone === addr.phone && a.address === addr.address)
    if (exists) return
    list.value.unshift(Object.assign({ isDefault: !list.value.length }, addr))
  }

  watch(list, v => localStorage.setItem('addresses', JSON.stringify(v)), { deep: true })

  return { list, defaultAddress, save }
})
