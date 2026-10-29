<template>
  <div class="map-detail" :class="{ 'is-show': !!region }">
    <div class="map-detail__head">
      <h4>{{ region ? region.name : '—' }}</h4>
      <p>{{ region ? region.province + region.city + ' · ' + region.coop : '—' }}</p>
      <button type="button" class="map-detail__close" @click="$emit('close')">×</button>
    </div>
    <div v-if="region" class="map-detail__body">
      <div class="map-detail__grid">
        <div class="map-detail__cell"><span>助农指数</span><b>{{ helpIndex }}</b></div>
        <div class="map-detail__cell"><span>带动农户</span><b>{{ num(region.households) }}</b></div>
        <div class="map-detail__cell"><span>主打农产</span><b style="font-size:14px;">{{ region.main }}</b></div>
        <div class="map-detail__cell"><span>年产量(吨)</span><b>{{ num(region.output) }}</b></div>
      </div>
      <p class="map-detail__intro">{{ region.intro }}</p>
      <div class="mb-2" style="font-size:11.5px;color:#8a8177;">点击可查看该产区农产溯源档案</div>
      <div class="map-detail__prods">
        <span v-if="loading" class="text-muted small">加载中…</span>
        <span v-else-if="!products.length" class="text-muted small">暂无上架农产</span>
        <span
          v-for="p in products"
          v-else
          :key="p.id"
          class="map-detail__prod"
          @click="trace.openByProduct(p.id)"
        >{{ p.name }}</span>
      </div>
      <div class="map-detail__actions">
        <router-link class="hf-btn hf-btn--primary hf-btn--sm" :to="{ path: '/agri', query: { region: region.id } }">查看农产</router-link>
        <a class="hf-btn hf-btn--ghost hf-btn--sm" target="_blank" rel="noopener" :href="navUrl(region.lat, region.lng, region.name + '助农产区')">地图导航</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getRegion } from '@/api'
import { useTrace } from '@/composables/useTrace'
import { num } from '@/utils/format'
import { navUrl } from '@/utils/nav'

const props = defineProps({
  region: { type: Object, default: null }
})

defineEmits(['close'])

const trace = useTrace()
const products = ref([])
const loading = ref(false)
const cache = {}

const helpIndex = computed(() => (Number(props.region && props.region.help_index) || 0).toFixed(1))

watch(() => props.region && props.region.id, async id => {
  if (!id) return
  if (cache[id]) {
    products.value = cache[id]
    return
  }
  loading.value = true
  products.value = []
  try {
    const d = await getRegion(id)
    cache[id] = d.products || []
    if (props.region && props.region.id === id) products.value = cache[id]
  } catch (e) {
    products.value = []
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>
