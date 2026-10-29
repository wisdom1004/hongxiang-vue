<template>
  <section id="map" class="map-section">
    <div class="container">
      <div class="row g-3 align-items-end mb-3">
        <div class="col-lg-7">
          <div class="hf-eyebrow">核心功能 · 助农一张图</div>
          <h2 class="hf-title">先看地图，<span class="accent">再决定去哪收</span></h2>
          <p class="hf-sub mb-0">
            {{ store.regions.length }} 个帮扶产区、{{ store.provinces.length }} 个省（区），每个县域都有独立的助农指数、带动农户规模与主打农产。
          </p>
        </div>
      </div>

      <div class="map-layout">
        <MapSidebar
          :list="store.list"
          :view="store.view"
          :metric="store.metric"
          :keyword="kw"
          :selected-id="store.selectedId"
          :urgent-map="store.urgentMap"
          @update:view="store.setView"
          @update:metric="m => (store.metric = m)"
          @update:keyword="onKeyword"
          @select="id => store.select(id, true)"
        />
        <div class="map-stage">
          <MapCanvas
            :regions="store.regions"
            :urgent-map="store.urgentMap"
            :view="store.view"
            :metric="store.metric"
            :province="store.province"
            :city="store.city"
            :selected-id="store.selectedId"
            :plan="store.plan"
            :focus-nonce="store.focusNonce"
            @select="id => store.select(id)"
            @toggle-feature="store.toggleFeature"
            @close-detail="store.closeDetail"
            @locate-empty="toastNoSelection"
          >
            <MapDetail :region="store.selected" @close="store.closeDetail" />
          </MapCanvas>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import MapSidebar from './MapSidebar.vue'
import MapCanvas from './MapCanvas.vue'
import MapDetail from './MapDetail.vue'
import { useMapStore } from '@/stores/map'
import { useUiStore } from '@/stores/ui'

const store = useMapStore()
const ui = useUiStore()
const kw = ref('')
let timer = null

function onKeyword (v) {
  kw.value = v
  clearTimeout(timer)
  timer = setTimeout(() => { store.keyword = v }, 160)
}

function toastNoSelection () {
  ui.show('请先在列表或地图上选择一个产区', 'bi-info-circle')
}

watch(() => store.selectedId, id => {
  if (!id) return
  const r = store.find(id)
  if (r) store.selectedId = r.id
})

onMounted(async () => {
  if (!store.loaded) await store.load()
  const top = store.regions.slice().sort((a, b) => b.help_index - a.help_index)[0]
  if (top && !store.selectedId) store.select(top.id)
})
</script>
