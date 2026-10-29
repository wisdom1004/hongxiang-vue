<template>
  <section class="hf-section--paper hf-section">
    <div class="container">
      <div class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div>
          <div class="hf-eyebrow">产地直发</div>
          <h2 class="hf-title">精选助农农产</h2>
          <p class="hf-sub mb-0">优先展示急售与预售商品，每单都标注了让利金额与带动农户数。</p>
        </div>
        <router-link class="hf-btn hf-btn--ghost" to="/agri#shop">查看全部农产 <i class="bi bi-arrow-right"></i></router-link>
      </div>
      <div class="row g-4">
        <div v-if="loading" class="col-12">
          <div class="hf-empty"><span class="hf-spinner"></span></div>
        </div>
        <div v-else-if="!picked.length" class="col-12">
          <div class="hf-empty"><i class="bi bi-inbox"></i>暂无上架农产</div>
        </div>
        <ProductCard
          v-for="p in picked"
          v-else
          :key="p.id"
          :product="p"
          variant="home"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ProductCard from '@/components/common/ProductCard.vue'
import { getProducts } from '@/api'

const RANK = { urgent: 0, presale: 1, sale: 2, none: 3 }
const list = ref([])
const loading = ref(true)

const picked = computed(() => list.value.slice().sort((a, b) =>
  (RANK[a.help] || 3) - (RANK[b.help] || 3) || b.sales - a.sales
).slice(0, 6))

onMounted(async () => {
  try {
    list.value = (await getProducts({ limit: 60 })) || []
  } catch (e) {
    list.value = []
  } finally {
    loading.value = false
  }
})
</script>
