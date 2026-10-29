<template>
  <div class="col-sm-6 col-lg-4">
    <article class="hf-prod" :class="{ 'home-prod': variant === 'home' }">
      <div class="hf-prod__media">
        <ProductImage :src="product.img" :alt="product.name" :cat="product.cat" />
        <div class="hf-prod__tags">
          <span v-for="t in tags" :key="t" class="hf-badge hf-badge--ghost">{{ t }}</span>
        </div>
        <span v-if="product.help === 'urgent'" class="hf-prod__urgent">急售</span>
        <button
          v-if="showFav"
          type="button"
          class="hf-prod__fav"
          :class="{ 'is-on': fav.has(product.id) }"
          aria-label="收藏"
          @click="fav.toggle(product.id)"
        >
          <i class="bi" :class="fav.has(product.id) ? 'bi-heart-fill' : 'bi-heart'"></i>
        </button>
      </div>
      <div class="hf-prod__body">
        <div class="hf-prod__meta">
          <span><i class="bi bi-geo-alt"></i> {{ product.region_name }}</span>
          <span class="dot"></span>
          <span class="hf-prod__rating"><i class="bi bi-star-fill"></i>{{ product.rating }}</span>
          <span class="dot"></span>
          <span>{{ num(product.farmers) }} 户</span>
        </div>
        <h3 class="hf-prod__title">{{ product.name }}</h3>
        <div class="hf-prod__desc">{{ product.desc }}</div>
        <div class="hf-prod__help" :class="{ 'hf-prod__help--urgent': product.help === 'urgent' }">
          <b>{{ helpText }}</b>{{ product.note }}
        </div>
        <div class="hf-price">
          <span class="now">¥{{ money(product.price) }}<small>/{{ product.unit }}</small></span>
          <span v-if="product.origin_price > product.price" class="was">¥{{ money(product.origin_price) }}</span>
          <span v-if="showSave && product.save > 0" class="save">省 {{ money(product.save) }} 元</span>
        </div>
        <div class="hf-prod__foot">
          <button class="hf-btn hf-btn--primary" @click="cart.add(product, 1)">
            <i class="bi bi-cart-plus"></i>加入购物车
          </button>
          <button class="hf-btn hf-btn--ghost" @click="trace.openByProduct(product.id)">
            <i class="bi bi-upc-scan"></i>溯源
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProductImage from './ProductImage.vue'
import { useCartStore } from '@/stores/cart'
import { useFavoritesStore } from '@/stores/favorites'
import { useTrace } from '@/composables/useTrace'
import { money, num } from '@/utils/format'

const props = defineProps({
  product: { type: Object, required: true },
  showFav: { type: Boolean, default: false },
  showSave: { type: Boolean, default: false },
  variant: { type: String, default: '' }
})

const cart = useCartStore()
const fav = useFavoritesStore()
const trace = useTrace()

const tags = computed(() => String(props.product.tags || '').split(',').filter(Boolean).slice(0, 2))
const helpText = computed(() => {
  if (props.product.help === 'urgent') return '急售助农：'
  if (props.product.help === 'presale') return '预售助农：'
  return '助农让利：'
})
</script>
