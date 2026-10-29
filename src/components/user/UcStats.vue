<template>
  <section class="uc-stats">
    <div v-for="s in items" :key="s.label" class="uc-stat">
      <i class="bi" :class="s.icon"></i>
      <b>{{ s.value }}</b>
      <span>{{ s.label }}</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { money } from '@/utils/format'

const props = defineProps({
  orders: { type: Array, default: () => [] },
  favCount: { type: Number, default: 0 }
})

const items = computed(() => {
  const sum = props.orders.reduce((a, o) => a + (Number(o.amount) || 0), 0)
  const adopt = props.orders.filter(o => o.type === 'adopt' || o.type === 'presale').length
  return [
    { value: props.orders.length, label: '订单笔数', icon: 'bi-receipt' },
    { value: adopt, label: '认养 / 预售', icon: 'bi-tree' },
    { value: '¥' + money(sum), label: '助农金额', icon: 'bi-coin' },
    { value: props.favCount, label: '收藏商品', icon: 'bi-heart' }
  ]
})
</script>
