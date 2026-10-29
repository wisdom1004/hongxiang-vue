<template>
  <div ref="canvasEl" class="map-canvas">
    <svg
      ref="svgEl"
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="帮扶产区分布地图"
      :class="{ 'is-dragging': dragging }"
      @mousemove="onMove"
      @mouseleave="hideTip"
      @click="onClick"
      @wheel.prevent="onWheel"
      @pointerdown="onDown"
      @pointermove="onDrag"
      @pointerup="onUp"
      @pointercancel="onUp"
    >
      <defs>
        <filter id="markerShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#5c0a04" flood-opacity="0.28" />
        </filter>
      </defs>
      <g :transform="zoomTransform">
        <g>
          <g v-for="s in shapes" :key="s.name">
            <title>{{ s.title }}</title>
            <path
              v-for="(d, i) in s.paths"
              :key="i"
              :d="d"
              :fill="s.fill"
              fill-rule="evenodd"
              class="map-region"
              :class="{ 'is-dim': !s.focus }"
              :data-name="s.name"
            />
          </g>
        </g>
        <g>
          <text
            v-for="s in labels"
            :key="s.name"
            :x="s.x"
            :y="s.y"
            text-anchor="middle"
            class="map-region-label"
            :font-size="view === 'sx' ? '13' : '10.5'"
            :opacity="s.opacity"
          >{{ s.label }}</text>
        </g>
        <g>
          <template v-if="route">
            <path :d="route.d" class="map-route" vector-effect="non-scaling-stroke" />
            <g v-for="(n, i) in route.nodes" :key="'rn' + i" class="map-route-node">
              <circle :cx="n.x" :cy="n.y" r="9" />
              <text :x="n.x" :y="n.y">{{ i + 1 }}</text>
            </g>
          </template>
        </g>
      </g>
      <g v-if="view === 'cn'">
        <rect
          :x="INSET_BOX.x"
          :y="INSET_BOX.y"
          :width="INSET_BOX.w"
          :height="INSET_BOX.h"
          class="map-inset-frame"
          rx="3"
        />
        <path
          v-for="(d, i) in insetPaths"
          :key="'inset' + i"
          :d="d"
          fill="none"
          stroke="#b39a76"
          stroke-width="1"
          fill-rule="evenodd"
        />
        <text
          :x="INSET_BOX.x + 8"
          :y="INSET_BOX.y + INSET_BOX.h - 8"
          class="map-inset-label"
        >南海诸岛（示意）</text>
      </g>
      <g>
        <g
          v-for="m in markers"
          :key="m.id"
          class="map-marker"
          :class="{ 'is-active': m.active }"
          :data-id="m.id"
          filter="url(#markerShadow)"
          :transform="'translate(' + m.x + ',' + m.y + ')'"
        >
          <circle v-if="m.urgent" class="pulse" r="7" cx="0" cy="0" fill="#c0392b" opacity=".5" />
          <circle class="halo" :r="m.halo" :fill="m.urgent ? '#c0392b' : '#7a1006'" />
          <circle class="pin" :r="m.r" :fill="m.urgent ? '#c0392b' : '#7a1006'" fill-opacity=".92" />
          <circle
            v-if="m.active"
            :r="m.r + 8"
            fill="none"
            stroke="#c9a064"
            stroke-width="2"
          />
        </g>
      </g>
    </svg>

    <div class="map-hints">
      <b><i class="bi bi-info-circle"></i> 地图操作提示</b>
      <span><i class="bi bi-mouse2"></i>滚轮缩放 · 拖拽平移</span>
      <span><i class="bi bi-circle-fill"></i>圆点越大，带动农户越多</span>
      <span><i class="bi bi-broadcast"></i>红色脉冲点 = 正在急售的产区</span>
      <span><i class="bi bi-hand-index-thumb"></i>点击任意县域查看产区档案</span>
    </div>

    <div class="map-toolbar">
      <button type="button" title="放大" @click="zoomAt(1.35)"><i class="bi bi-plus-lg"></i></button>
      <button type="button" title="缩小" @click="zoomAt(1 / 1.35)"><i class="bi bi-dash-lg"></i></button>
      <button type="button" title="复位" @click="resetTf"><i class="bi bi-arrows-fullscreen"></i></button>
      <button type="button" title="定位到当前选中产区" @click="locate"><i class="bi bi-bullseye"></i></button>
    </div>

    <div class="map-legend">
      <b>助农指数</b>
      <div class="map-legend__scale">
        <span>低</span><div class="map-legend__grad"></div><span>高</span>
      </div>
      <div class="map-legend__dots">
        <i style="width:6px;height:6px;"></i>
        <i style="width:9px;height:9px;"></i>
        <i style="width:12px;height:12px;"></i>
        <i style="width:16px;height:16px;"></i>
        <span style="margin-left:4px;color:#8a8177;">圆点=带动农户规模</span>
      </div>
      <div class="map-legend__note">行政区划边界仅作产区分布示意</div>
    </div>

    <div v-show="tip.show" class="map-tip is-show" :style="{ left: tip.left + 'px', top: tip.top + 'px' }">
      <b>{{ tip.name }}</b>
      <div class="t-row"><span>主打农产</span><span>{{ tip.main }}</span></div>
      <div class="t-row"><span>助农指数</span><span>{{ tip.helpIndex }}</span></div>
      <div class="t-row"><span>带动农户</span><span>{{ tip.households }} 户</span></div>
      <div v-if="tip.urgent" class="t-row">
        <span>滞销预警</span><span style="color:#ff9c8a;">{{ tip.urgent }} 款急售</span>
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { makeProj, pathOf } from '@/composables/map/geometry'
import { lerpColor } from '@/composables/map/color'
import { loadGeo } from '@/composables/map/useGeo'
import { num } from '@/utils/format'

const VB = { w: 1000, h: 700 }
const BOX = { x: 30, y: 26, w: 940, h: 648 }
const INSET_BOX = { x: 748, y: 486, w: 226, h: 186 }

const props = defineProps({
  regions: { type: Array, default: () => [] },
  urgentMap: { type: Object, default: () => ({}) },
  view: { type: String, default: 'cn' },
  metric: { type: String, default: 'help_index' },
  province: { type: String, default: '' },
  city: { type: String, default: '' },
  selectedId: { type: [String, Number], default: '' },
  plan: { type: Object, default: null },
  focusNonce: { type: Number, default: 0 }
})

const emit = defineEmits(['select', 'toggle-feature', 'close-detail'])

const svgEl = ref(null)
const canvasEl = ref(null)
const geo = ref(null)

onMounted(async () => {
  geo.value = await loadGeo()
})

const tf = reactive({ k: 1, tx: 0, ty: 0 })
const zoomTransform = computed(() =>
  'translate(' + tf.tx.toFixed(2) + ',' + tf.ty.toFixed(2) + ') scale(' + tf.k.toFixed(3) + ')'
)

const features = computed(() => {
  if (!geo.value) return []
  if (props.view === 'sx') return geo.value.sx.features
  return geo.value.cn.features.filter(f => f.name !== '南海诸岛')
})

const proj = computed(() => (features.value.length ? makeProj(features.value, BOX) : null))
const key = computed(() => (props.view === 'sx' ? 'city' : 'province'))

function valueOf (r, m) {
  if (m === 'help_index') return Number(r.help_index) || 0
  if (m === 'households') return Number(r.households) || 0
  if (m === 'sales') return Number(r.sales) || 0
  if (m === 'urgent') return props.urgentMap[r.id] || 0
  return 0
}

function agg (name, m) {
  const list = props.regions.filter(r => r[key.value] === name)
  if (!list.length) return null
  if (m === 'help_index') {
    const s = list.reduce((a, r) => a + (Number(r.help_index) || 0), 0)
    return { v: s / list.length, n: list.length }
  }
  const sum = list.reduce((a, r) => a + valueOf(r, m), 0)
  return { v: sum, n: list.length }
}

const ranges = computed(() => {
  const vals = []
  features.value.forEach(f => {
    const a = agg(f.name, props.metric)
    if (a) vals.push(a.v)
  })
  return {
    min: Math.min.apply(null, vals.concat([0])),
    max: Math.max.apply(null, vals.concat([1]))
  }
})

const shapes = computed(() => {
  if (!proj.value) return []
  const { min, max } = ranges.value
  return features.value.map(f => {
    const a = agg(f.name, props.metric)
    const t = a ? (max === min ? 1 : (a.v - min) / (max - min)) : 0
    let fill = a ? lerpColor(0.12 + t * 0.88) : '#f3ece1'
    if (props.metric === 'urgent' && a && a.v > 0) fill = lerpColor(0.45 + t * 0.55)
    const focus = props.view === 'sx'
      ? (!props.city || props.city === f.name)
      : (!props.province || props.province === f.name)
    return {
      name: f.name,
      title: f.name + (a ? '（' + a.n + ' 个帮扶产区）' : '（暂无帮扶产区）'),
      fill,
      focus,
      paths: (f.polys || []).map(poly => pathOf(poly, proj.value))
    }
  })
})

const labels = computed(() => {
  if (!proj.value) return []
  return features.value.filter(f => f.center && f.center.length === 2).map(f => {
    const a = agg(f.name, props.metric)
    return {
      name: f.name,
      x: proj.value.x(f.center[0]).toFixed(1),
      y: proj.value.y(f.center[1]).toFixed(1),
      label: f.name.replace(/(特别行政区|维吾尔自治区|回族自治区|壮族自治区|自治区|省|市)$/, ''),
      opacity: a ? (props.view === 'sx' ? '1' : '0.85') : '0.42'
    }
  })
})

const insetPaths = computed(() => {
  if (!geo.value) return []
  const jd = geo.value.cn.features.find(f => f.name === '南海诸岛')
  if (!jd) return []
  const p = makeProj([jd], INSET_BOX)
  return (jd.polys || []).map(poly => pathOf(poly, p))
})

const maxHouseholds = computed(() =>
  Math.max.apply(null, props.regions.map(r => Number(r.households) || 0).concat([1]))
)

const markers = computed(() => {
  if (!proj.value) return []
  const mh = maxHouseholds.value
  return props.regions.map(r => {
    const urgent = !!props.urgentMap[r.id]
    const rBase = 4 + 8 * Math.sqrt((Number(r.households) || 0) / mh)
    return {
      id: r.id,
      urgent,
      active: String(props.selectedId) === String(r.id),
      r: rBase.toFixed(1),
      halo: String(rBase + 5),
      x: (proj.value.x(r.lng) * tf.k + tf.tx).toFixed(1),
      y: (proj.value.y(r.lat) * tf.k + tf.ty).toFixed(1)
    }
  })
})

const route = computed(() => {
  if (!proj.value || !props.plan || !props.plan.plan) return null
  const pts = []
  props.plan.plan.forEach(d => { d.regions.forEach(r => pts.push(r)) })
  if (!pts.length) return null
  let d = ''
  const nodes = []
  pts.forEach((r, i) => {
    const x = proj.value.x(r.lng)
    const y = proj.value.y(r.lat)
    d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)
    nodes.push({ x: x.toFixed(1), y: y.toFixed(1) })
  })
  return { d, nodes }
})

const tip = reactive({ show: false, left: 0, top: 0, name: '', main: '', helpIndex: '', households: '', urgent: 0 })

function showTipFor (region, evt) {
  const rect = canvasEl.value.getBoundingClientRect()
  tip.name = region.name
  tip.main = region.main
  tip.helpIndex = (Number(region.help_index) || 0).toFixed(1)
  tip.households = num(region.households)
  tip.urgent = props.urgentMap[region.id] || 0
  tip.left = evt.clientX - rect.left
  tip.top = evt.clientY - rect.top
  tip.show = true
}

function hideTip () {
  tip.show = false
}

function onMove (e) {
  const marker = e.target.closest && e.target.closest('.map-marker')
  if (!marker) return hideTip()
  const region = props.regions.find(x => String(x.id) === marker.getAttribute('data-id'))
  if (!region) return hideTip()
  showTipFor(region, e)
}

/* ---------------- 变换 ---------------- */
function applyClamp () {
  const max = VB.w * (tf.k - 1)
  const maxY = VB.h * (tf.k - 1)
  tf.tx = Math.max(-max, Math.min(0, tf.tx))
  tf.ty = Math.max(-maxY, Math.min(0, tf.ty))
}

function viewBoxPoint (evt) {
  const rect = svgEl.value.getBoundingClientRect()
  const scale = Math.min(rect.width / VB.w, rect.height / VB.h)
  const offX = (rect.width - VB.w * scale) / 2
  const offY = (rect.height - VB.h * scale) / 2
  return {
    x: (evt.clientX - rect.left - offX) / scale,
    y: (evt.clientY - rect.top - offY) / scale
  }
}

function zoomAt (factor, pt) {
  const k2 = Math.max(1, Math.min(5, tf.k * factor))
  if (k2 === tf.k) return
  const q = pt || { x: VB.w / 2, y: VB.h / 2 }
  tf.tx = q.x - (k2 / tf.k) * (q.x - tf.tx)
  tf.ty = q.y - (k2 / tf.k) * (q.y - tf.ty)
  tf.k = k2
  applyClamp()
}

function onWheel (e) {
  zoomAt(e.deltaY < 0 ? 1.14 : 1 / 1.14, viewBoxPoint(e))
}

function resetTf () {
  tf.k = 1
  tf.tx = 0
  tf.ty = 0
}

function focusOn (region) {
  if (!proj.value || !region) return
  const x = proj.value.x(region.lng)
  const y = proj.value.y(region.lat)
  tf.k = Math.max(tf.k, 2.2)
  tf.tx = VB.w / 2 - x * tf.k
  tf.ty = VB.h / 2 - y * tf.k
  applyClamp()
}

function locate () {
  const region = props.regions.find(r => String(r.id) === String(props.selectedId))
  if (region) focusOn(region)
  else emit('locate-empty')
}

watch(() => props.focusNonce, () => {
  const region = props.regions.find(r => String(r.id) === String(props.selectedId))
  if (region) focusOn(region)
})

watch(() => props.view, resetTf)

const dragging = ref(false)
let drag = null

function onDown (e) {
  if (e.target.closest && e.target.closest('.map-marker')) return
  drag = { x: e.clientX, y: e.clientY, tx: tf.tx, ty: tf.ty }
  dragging.value = true
  if (svgEl.value.setPointerCapture) svgEl.value.setPointerCapture(e.pointerId)
}

function onDrag (e) {
  if (!drag) return
  const rect = svgEl.value.getBoundingClientRect()
  const scale = Math.min(rect.width / VB.w, rect.height / VB.h)
  tf.tx = drag.tx + (e.clientX - drag.x) / scale
  tf.ty = drag.ty + (e.clientY - drag.y) / scale
  applyClamp()
}

function onUp () {
  drag = null
  dragging.value = false
}

function onClick (e) {
  const marker = e.target.closest && e.target.closest('.map-marker')
  if (marker) {
    emit('select', marker.getAttribute('data-id'))
    return
  }
  const region = e.target.closest && e.target.closest('.map-region')
  if (region) {
    emit('toggle-feature', region.getAttribute('data-name'))
    return
  }
  if (!(e.target.closest && (e.target.closest('.map-detail') || e.target.closest('.map-toolbar')))) {
    emit('close-detail')
  }
}
</script>
