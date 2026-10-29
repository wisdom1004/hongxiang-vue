<template>
  <section id="shop" class="hf-section hf-section--paper">
    <div class="container">
      <div class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div>
          <div class="hf-eyebrow">产地直发</div>
          <h2 class="hf-title">助农商城</h2>
          <p class="hf-sub mb-0">按品类、产区、帮扶紧迫度筛选，共 <b>{{ catalog.products.length }}</b> 款在售农产。</p>
        </div>
        <router-link class="hf-btn hf-btn--ghost" to="/#map"><i class="bi bi-geo-alt"></i>在地图上找产区</router-link>
      </div>

      <div class="hf-filter">
        <div class="hf-filter__row">
          <span class="hf-filter__label">品类</span>
          <div class="hf-chips">
            <button class="hf-chip" :class="{ 'is-active': !cat }" @click="pickCat('')">全部</button>
            <button
              v-for="c in catalog.categories"
              :key="c"
              class="hf-chip"
              :class="{ 'is-active': cat === c }"
              @click="pickCat(c)"
            >{{ c }}</button>
          </div>
        </div>
        <div class="hf-filter__row">
          <span class="hf-filter__label">排序</span>
          <div class="hf-chips">
            <button
              v-for="s in sorts"
              :key="s.value"
              class="hf-chip"
              :class="{ 'is-active': sort === s.value }"
              @click="pickSort(s.value)"
            >{{ s.label }}</button>
          </div>
          <label class="hf-switch">
            <input v-model="urgentOnly" type="checkbox" @change="page = 1" />
            <span>只看急售</span>
          </label>
        </div>
        <div class="hf-filter__row">
          <span class="hf-filter__label">产区</span>
          <select v-model="region" class="hf-select" @change="page = 1">
            <option value="">全部产区</option>
            <option v-for="r in catalog.regions" :key="r.id" :value="r.id">{{ r.province }} · {{ r.name }}</option>
          </select>
          <div class="hf-search">
            <input v-model="keyword" type="search" placeholder="搜索农产名称 / 产地，如 苹果、富平" />
            <i class="bi bi-search"></i>
          </div>
        </div>
      </div>

      <div v-if="!list.length" class="row g-4">
        <div class="col-12">
          <div class="hf-empty"><i class="bi bi-search"></i>没有符合条件的农产，试试清空筛选条件</div>
        </div>
      </div>
      <div v-else class="row g-4">
        <ProductCard v-for="p in shown" :key="p.id" :product="p" show-fav show-save />
      </div>

      <div v-if="list.length" class="text-center mt-4">
        <button v-show="shown.length < list.length" class="hf-btn hf-btn--ghost" @click="page += 1">
          加载更多（还有 {{ list.length - shown.length }} 款）
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/common/ProductCard.vue'
import { useCatalogStore } from '@/stores/catalog'

const route = useRoute()
const catalog = useCatalogStore()

const sorts = [
  { value: 'default', label: '综合推荐' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'sales', label: '销量优先' },
  { value: 'help', label: '帮扶紧迫度' }
]

const cat = ref('')
const sort = ref('default')
const urgentOnly = ref(false)
const region = ref('')
const keyword = ref('')
const page = ref(1)
const pageSize = 9

const list = computed(() => {
  const kw = keyword.value.trim()
  const out = catalog.products.filter(p => {
    if (cat.value && p.cat !== cat.value) return false
    if (urgentOnly.value && p.help !== 'urgent') return false
    if (region.value && String(p.region_id) !== String(region.value)) return false
    if (kw && (p.name + p.region_name + p.tags + p.cat).indexOf(kw) < 0) return false
    return true
  })
  const by = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    sales: (a, b) => b.sales - a.sales,
    help: (a, b) => {
      const rank = { urgent: 0, presale: 1, sale: 2, none: 3 }
      return (rank[a.help] ?? 3) - (rank[b.help] ?? 3) || b.help_index - a.help_index
    }
  }
  if (by[sort.value]) out.sort(by[sort.value])
  return out
})

const shown = computed(() => list.value.slice(0, page.value * pageSize))

watch([cat, sort, urgentOnly, region], () => { page.value = 1 })
watch(keyword, () => { page.value = 1 })

function pickCat (c) {
  cat.value = c
}

function pickSort (s) {
  sort.value = s
}

watch(() => route.query.region, v => {
  if (v != null) {
    region.value = String(v)
    page.value = 1
  }
})

onMounted(async () => {
  if (route.query.region) region.value = String(route.query.region)
  try {
    await Promise.all([
      catalog.ensureProducts(),
      catalog.ensureCategories(),
      catalog.ensureRegions()
    ])
  } catch (e) {
    /* 接口异常由拦截器提示 */
  }
})
</script>
