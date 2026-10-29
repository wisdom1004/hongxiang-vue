<template>
  <section class="hf-section--tight">
    <div class="container">
      <div class="hf-stats">
        <div
          v-for="s in cards"
          :key="s.label"
          class="hf-stat"
          :class="s.tone ? 'hf-stat--' + s.tone : ''"
        >
          <div class="label">{{ s.label }}</div>
          <div class="value">{{ s.value }}<small>{{ s.unit }}</small></div>
          <div class="note">{{ s.note }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { num } from '@/utils/format'

const props = defineProps({
  regionsCount: { type: Number, default: 0 },
  stats: { type: Object, default: null }
})

const cards = computed(() => {
  const s = props.stats || {}
  return [
    { label: '覆盖帮扶产区', value: props.regionsCount, unit: '个', note: '县域 / 州域为最小帮扶单元' },
    { label: '优质合作社', value: s.coops || 0, unit: '家', note: '已通过平台资质核验' },
    { label: '带动农户', value: num(s.households), unit: '户', note: '含建档立卡脱贫户' },
    { label: '累计助农销售额', value: num(s.sales_amount), unit: '元', note: '产地直发，无中间加价', tone: 'green' },
    { label: '溯源批次', value: num(s.trace_batches), unit: '批', note: '一物一码，可查可验', tone: 'gold' }
  ]
})
</script>
