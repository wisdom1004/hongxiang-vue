import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

function load () {
  try {
    return JSON.parse(localStorage.getItem('hfFavs') || '[]').map(Number)
  } catch (e) {
    return []
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref(load())
  const count = computed(() => ids.value.length)

  function has (pid) {
    return ids.value.includes(Number(pid))
  }

  function toggle (pid) {
    const id = Number(pid)
    if (ids.value.includes(id)) ids.value = ids.value.filter(x => x !== id)
    else ids.value = ids.value.concat(id)
  }

  watch(ids, v => localStorage.setItem('hfFavs', JSON.stringify(v)), { deep: true })

  return { ids, count, has, toggle }
})
