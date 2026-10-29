<template>
  <section class="uc-card h-100">
    <div class="uc-card__head"><h2><i class="bi bi-heart"></i> 我的收藏</h2></div>
    <div v-if="!list.length" class="hf-empty">
      <i class="bi bi-heart"></i>还没有收藏，<router-link to="/agri">去助农专区</router-link>点商品卡右上角的爱心即可收藏
    </div>
    <div v-else class="uc-favs">
      <router-link v-for="p in list" :key="p.id" class="uc-fav" to="/agri">
        <ProductImage :src="p.img" :alt="p.name" :cat="p.cat" />
        <div>
          <b>{{ p.name }}</b>
          <span>{{ p.region_name }} · ¥{{ money(p.price) }}/{{ p.unit }}</span>
        </div>
        <i class="bi bi-heart-fill"></i>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import ProductImage from '@/components/common/ProductImage.vue'
import { money } from '@/utils/format'

const props = defineProps({
  products: { type: Array, default: () => [] },
  ids: { type: Array, default: () => [] }
})

const list = computed(() => props.products.filter(p => props.ids.includes(Number(p.id))))
</script>
