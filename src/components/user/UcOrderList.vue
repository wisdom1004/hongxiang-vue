<template>
  <section class="uc-card">
    <div class="uc-card__head">
      <h2><i class="bi bi-receipt"></i> 我的订单</h2>
      <div class="uc-tabs">
        <button
          v-for="t in tabs"
          :key="t.value"
          type="button"
          :class="{ 'is-active': type === t.value }"
          @click="type = t.value"
        >{{ t.label }}</button>
      </div>
    </div>

    <div v-if="!list.length" class="hf-empty">
      <i class="bi bi-inbox"></i>还没有{{ type === 'all' ? '订单' : label(type) + '订单' }}，<router-link to="/agri">去助农专区看看</router-link>
    </div>
    <div v-else class="uc-orders">
      <article v-for="o in list" :key="o.order_no || o.id" class="uc-order">
        <div class="uc-order__top">
          <span class="uc-order__type"><i class="bi" :class="icon(o.type)"></i>{{ label(o.type) }}</span>
          <span class="uc-order__no">{{ o.order_no || ('#' + o.id) }}</span>
          <span class="uc-order__status">{{ o.status || '待发货' }}</span>
        </div>
        <div class="uc-order__body">
          <h3>{{ o.title || itemText(o) }}</h3>
          <p>{{ itemText(o) }}</p>
        </div>
        <div class="uc-order__foot">
          <span class="uc-order__time"><i class="bi bi-clock"></i>{{ o.created_at || '' }}</span>
          <span class="uc-order__amount">¥{{ money(o.amount) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { money } from '@/utils/format'

const props = defineProps({
  orders: { type: Array, default: () => [] }
})

const type = ref('all')

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'product', label: '农产品' },
  { value: 'adopt', label: '认养' },
  { value: 'presale', label: '预售' }
]

const labels = { product: '农产品', adopt: '认养', presale: '预售' }
const icons = { product: 'bi-basket', adopt: 'bi-tree', presale: 'bi-calendar-check' }

const list = computed(() => props.orders.filter(o => type.value === 'all' || o.type === type.value))

function label (t) {
  return labels[t] || '农产品'
}

function icon (t) {
  return icons[t] || 'bi-basket'
}

function itemText (o) {
  const items = (o.items || []).map(it => (it.title || '') + ' × ' + (it.qty || 1)).join('、')
  return items || o.title || ''
}
</script>
