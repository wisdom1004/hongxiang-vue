import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCategories, getProducts, getRegions, getStats } from '@/api'

export const useCatalogStore = defineStore('catalog', () => {
  const stats = ref(null)
  const regions = ref([])
  const categories = ref([])
  const products = ref([])
  let statsLoaded = false
  let regionsLoaded = false
  let categoriesLoaded = false
  let productsLoaded = false

  async function ensureStats (force) {
    if (statsLoaded && !force) return stats.value
    stats.value = await getStats()
    statsLoaded = true
    return stats.value
  }

  async function ensureRegions (force) {
    if (regionsLoaded && !force) return regions.value
    regions.value = await getRegions()
    regionsLoaded = true
    return regions.value
  }

  async function ensureCategories (force) {
    if (categoriesLoaded && !force) return categories.value
    categories.value = await getCategories()
    categoriesLoaded = true
    return categories.value
  }

  async function ensureProducts (force) {
    if (productsLoaded && !force) return products.value
    products.value = await getProducts({ limit: 200 })
    productsLoaded = true
    return products.value
  }

  function invalidate () {
    statsLoaded = false
    productsLoaded = false
    regionsLoaded = false
  }

  return { stats, regions, categories, products, ensureStats, ensureRegions, ensureCategories, ensureProducts, invalidate }
})
