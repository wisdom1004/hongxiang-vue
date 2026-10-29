<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <AgriHero :stats="catalog.stats" />
  <SectionNav />
  <AiAdvisor />
  <ShopSection />
  <AdoptSection :refresh="refresh" @order="openOrder" />
  <PresaleSection :refresh="refresh" @order="openOrder" />
  <TraceSection />
  <CtaBanner />
  <OrderModal :payload="order" @close="order = null" @ordered="onOrdered" />
</template>

<script setup>
import '@/styles/pages/agri.css'
import { onMounted, ref } from 'vue'
import AgriHero from '@/components/agri/AgriHero.vue'
import SectionNav from '@/components/agri/SectionNav.vue'
import AiAdvisor from '@/components/agri/AiAdvisor.vue'
import ShopSection from '@/components/agri/ShopSection.vue'
import AdoptSection from '@/components/agri/AdoptSection.vue'
import PresaleSection from '@/components/agri/PresaleSection.vue'
import TraceSection from '@/components/agri/TraceSection.vue'
import CtaBanner from '@/components/agri/CtaBanner.vue'
import OrderModal from '@/components/agri/OrderModal.vue'
import { useCatalogStore } from '@/stores/catalog'

const catalog = useCatalogStore()
const order = ref(null)
const refresh = ref(0)

function openOrder (payload) {
  order.value = payload
}

function onOrdered () {
  refresh.value += 1
}

onMounted(() => {
  catalog.ensureStats().catch(() => {})
})
</script>
