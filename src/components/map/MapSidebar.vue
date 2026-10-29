<template>
  <aside class="map-side">
    <div class="map-side__head">
      <div class="map-side__title">
        <span><i class="bi bi-list-stars me-1"></i> 产区榜单</span>
        <small>{{ list.length }} 个产区</small>
      </div>
      <div class="map-switch">
        <button type="button" :class="{ 'is-active': view === 'cn' }" @click="$emit('update:view', 'cn')">全国帮扶带</button>
        <button type="button" :class="{ 'is-active': view === 'sx' }" @click="$emit('update:view', 'sx')">陕西省域</button>
      </div>
      <div class="map-metrics">
        <button
          v-for="m in METRICS"
          :key="m.key"
          type="button"
          :class="{ 'is-active': metric === m.key }"
          @click="$emit('update:metric', m.key)"
        >{{ m.label }}</button>
      </div>
      <div class="map-side__search">
        <input
          :value="keyword"
          type="search"
          placeholder="搜索县域 / 主打农产，如 洛川、苹果"
          @input="$emit('update:keyword', $event.target.value)"
        >
        <i class="bi bi-search"></i>
      </div>
    </div>
    <div class="map-side__list">
      <div v-if="!list.length" class="map-list-empty">没有符合条件的产区，换个关键词试试</div>
      <div
        v-for="(r, i) in list"
        v-else
        :key="r.id"
        class="map-row"
        :class="{ 'is-active': String(selectedId) === String(r.id) }"
        @click="$emit('select', r.id)"
      >
        <div class="map-row__rank">{{ i + 1 }}</div>
        <div class="map-row__main">
          <div class="map-row__name">
            {{ r.name }}
            <span v-if="urgentMap[r.id]" class="map-row__flag">急售</span>
          </div>
          <div class="map-row__meta">{{ r.city }} · {{ r.main }} · {{ num(r.households) }} 户</div>
          <div class="map-row__bar"><span :style="{ width: barWidth(r) }"></span></div>
        </div>
        <div class="map-row__val">{{ shownValue(r) }}</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { num } from '@/utils/format'

const METRICS = [
  { key: 'help_index', label: '助农指数' },
  { key: 'households', label: '带动农户' },
  { key: 'sales', label: '销售额' },
  { key: 'urgent', label: '滞销预警' }
]

const props = defineProps({
  list: { type: Array, default: () => [] },
  view: { type: String, default: 'cn' },
  metric: { type: String, default: 'help_index' },
  keyword: { type: String, default: '' },
  selectedId: { type: [String, Number], default: '' },
  urgentMap: { type: Object, default: () => ({}) }
})

defineEmits(['select', 'update:view', 'update:metric', 'update:keyword'])

function valueOf (r) {
  if (props.metric === 'help_index') return Number(r.help_index) || 0
  if (props.metric === 'households') return Number(r.households) || 0
  if (props.metric === 'sales') return Number(r.sales) || 0
  if (props.metric === 'urgent') return props.urgentMap[r.id] || 0
  return 0
}

const max = computed(() => Math.max.apply(null, props.list.map(valueOf).concat([1])))

function barWidth (r) {
  return Math.round(valueOf(r) / max.value * 100) + '%'
}

function shownValue (r) {
  const v = valueOf(r)
  if (props.metric === 'help_index') return v.toFixed(1)
  if (props.metric === 'sales') return num(v) + ' 单'
  if (props.metric === 'households') return num(v) + ' 户'
  return v + ' 款'
}
</script>
