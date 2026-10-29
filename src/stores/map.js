import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getProducts, getRegions } from '@/api'

export const useMapStore = defineStore('map', () => {
  const view = ref('cn')
  const metric = ref('help_index')
  const keyword = ref('')
  const province = ref('')
  const city = ref('')
  const regions = ref([])
  const urgentMap = ref({})
  const selectedId = ref('')
  const plan = ref(null)
  const focusNonce = ref(0)
  const loaded = ref(false)

  const selected = computed(() => regions.value.find(r => r.id === selectedId.value) || null)

  function valueOf (r, m) {
    const metricKey = m || metric.value
    if (metricKey === 'help_index') return Number(r.help_index) || 0
    if (metricKey === 'households') return Number(r.households) || 0
    if (metricKey === 'sales') return Number(r.sales) || 0
    if (metricKey === 'urgent') return urgentMap.value[r.id] || 0
    return 0
  }

  const list = computed(() => {
    const kw = keyword.value.trim()
    let items = regions.value.slice()
    if (view.value === 'sx' && city.value) items = items.filter(r => r.city === city.value)
    if (view.value === 'cn' && province.value) items = items.filter(r => r.province === province.value)
    if (kw) items = items.filter(r => (r.name + r.main + r.tags + r.city).indexOf(kw) >= 0)
    if (metric.value === 'urgent') items = items.filter(r => urgentMap.value[r.id])
    return items.sort((a, b) => valueOf(b) - valueOf(a))
  })

  const provinces = computed(() => {
    const out = []
    regions.value.forEach(r => { if (!out.includes(r.province)) out.push(r.province) })
    return out
  })

  const cities = computed(() => {
    const out = []
    regions.value.forEach(r => { if (!out.includes(r.city)) out.push(r.city) })
    return out
  })

  async function load () {
    const [list_, urgent] = await Promise.all([
      getRegions(),
      getProducts({ help: 'urgent', limit: 50 })
    ])
    regions.value = list_ || []
    const map = {}
    ;(urgent || []).forEach(p => { map[p.region_id] = (map[p.region_id] || 0) + 1 })
    urgentMap.value = map
    loaded.value = true
  }

  function select (id, focus) {
    selectedId.value = id
    if (focus) focusNonce.value++
  }

  function closeDetail () {
    selectedId.value = ''
  }

  function setView (v) {
    view.value = v
    city.value = ''
    province.value = ''
    selectedId.value = ''
  }

  function toggleFeature (name) {
    if (view.value === 'sx') city.value = city.value === name ? '' : name
    else province.value = province.value === name ? '' : name
  }

  function find (id) {
    return regions.value.find(r => r.id === id)
  }

  return {
    view, metric, keyword, province, city, regions, urgentMap, selectedId, plan,
    focusNonce, loaded, selected, list, provinces, cities,
    valueOf, load, select, closeDetail, setView, toggleFeature, find
  }
})
