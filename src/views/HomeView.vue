<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <HomeHero
    :regions-count="map.regions.length"
    :provinces-count="map.provinces.length"
    :households="num(householdSum)"
    :urgent-tons="stats ? stats.urgent_tons : ''"
  />
  <StatBoard :regions-count="map.regions.length" :stats="stats" />
  <MapSection />
  <PlanSection
    :cities="map.cities"
    @plan-ready="onPlanReady"
    @show-map="showPlanOnMap"
    @select-region="onSelectRegion"
  />
  <DemandSection :regions="map.regions" />
  <FeaturedProducts />
  <BusinessModes />

  <section class="hf-section--tight">
    <div class="container">
      <div class="cta-map">
        <div class="cta-map__text">
          <h3>你的一次下单，是一次真实的帮扶</h3>
          <p>平台每笔助农订单都会标注让利去向：合作社账户、农户直付或村集体公益金。</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <router-link class="hf-btn hf-btn--gold" to="/agri"><i class="bi bi-bag-heart"></i>去助农商城</router-link>
          <router-link
            class="hf-btn hf-btn--ghost"
            style="background:transparent;color:#ffe9c8;border-color:rgba(255,216,155,.4);"
            to="/about"
          >了解项目</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import '@/styles/pages/map.css'
import '@/styles/pages/home.css'
import { computed, onMounted, ref } from 'vue'
import HomeHero from '@/components/home/HomeHero.vue'
import StatBoard from '@/components/home/StatBoard.vue'
import MapSection from '@/components/map/MapSection.vue'
import PlanSection from '@/components/plan/PlanSection.vue'
import DemandSection from '@/components/demand/DemandSection.vue'
import FeaturedProducts from '@/components/home/FeaturedProducts.vue'
import BusinessModes from '@/components/home/BusinessModes.vue'
import { useMapStore } from '@/stores/map'
import { useUiStore } from '@/stores/ui'
import { getStats } from '@/api'
import { num } from '@/utils/format'

const map = useMapStore()
const ui = useUiStore()
const stats = ref(null)

const householdSum = computed(() =>
  map.regions.reduce((a, r) => a + (Number(r.households) || 0), 0)
)

onMounted(async () => {
  try {
    stats.value = await getStats()
  } catch (e) {
    stats.value = null
  }
})

function scrollToMap () {
  const el = document.getElementById('map')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onPlanReady (plan) {
  map.plan = plan
}

function showPlanOnMap (plan) {
  if (!plan) return
  map.plan = plan
  const provinces = {}
  plan.plan.forEach(d => d.regions.forEach(r => {
    const hit = map.find(r.id)
    if (hit) provinces[hit.province] = 1
  }))
  const useSx = Object.keys(provinces).length === 1 && provinces['陕西省']
  map.setView(useSx ? 'sx' : 'cn')
  ui.show('路线已叠加到地图，共 ' + plan.plan.length + ' 天行程', 'bi-map')
  scrollToMap()
}

function onSelectRegion (id) {
  map.select(id, true)
  scrollToMap()
}
</script>
