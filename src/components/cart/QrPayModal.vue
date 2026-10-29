<template>
  <Teleport to="body">
    <div ref="el" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-sm modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi" :class="brand.icon" :style="{ color: brand.color }"></i>
              {{ payType }}扫码支付
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <p class="qr-amount">应付金额 <span>¥{{ fixed(amount) }}</span></p>

            <div class="qr-box">
              <svg class="qr-code" viewBox="0 0 25 25" shape-rendering="crispEdges" aria-label="支付二维码">
                <rect x="0" y="0" width="25" height="25" fill="#fff" />
                <rect v-for="(c, i) in finderCells" :key="'f' + i" :x="c[0]" :y="c[1]" width="1" height="1" fill="#111" />
                <rect v-for="(c, i) in dataCells" :key="'d' + i" :x="c[0]" :y="c[1]" width="1" height="1" fill="#111" />
              </svg>
              <div class="qr-brand">
                <i class="bi" :class="brand.icon" :style="{ color: brand.color }"></i>
              </div>
            </div>

            <p class="qr-tip">
              <i class="bi bi-phone"></i>
              请使用{{ payType === '微信支付' ? '微信' : '支付宝' }}扫描上方二维码
            </p>
            <p class="qr-status" :class="{ 'is-done': left <= 0 }">
              <span v-if="left > 0" class="hf-spinner"></span>
              <i v-else class="bi bi-check-circle-fill"></i>
              {{ left > 0 ? '等待用户扫码支付… ' + left + ' 秒' : '已扫码，支付成功' }}
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">取消支付</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useBsModal } from '@/composables/useBsModal'

const emit = defineEmits(['scanned', 'closed'])

const SIZE = 25
const WAIT_SECONDS = 5

const el = ref(null)
const modal = useBsModal(el)

const amount = ref(0)
const payType = ref('微信支付')
const left = ref(WAIT_SECONDS)
const seed = ref(1)
let timer = null

const brand = computed(() => payType.value === '支付宝'
  ? { icon: 'bi-alipay', color: '#1677ff' }
  : { icon: 'bi-wechat', color: '#07c160' })

function fixed (n) {
  return (Number(n) || 0).toFixed(2)
}

/* 用确定性伪随机生成像二维码的点阵，纯前端、无需真实支付 */
function cellsOf (s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let state = (h >>> 0) || 1
  const next = () => {
    state ^= state << 13
    state >>>= 0
    state ^= state >> 17
    state ^= state << 5
    state >>>= 0
    return state / 4294967296
  }
  const cells = []
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const inFinder = (x < 8 && y < 8) || (x > SIZE - 9 && y < 8) || (x < 8 && y > SIZE - 9)
      const inLogo = x > 9 && x < 15 && y > 9 && y < 15
      if (inFinder || inLogo) continue
      if (next() > 0.5) cells.push([x, y])
    }
  }
  return cells
}

const dataCells = computed(() => cellsOf(payType.value + '|' + fixed(amount.value) + '|' + seed.value))

/* 三个定位角：7×7 外框 + 3×3 中心块 */
const finderCells = computed(() => {
  const out = []
  const origins = [[0, 0], [SIZE - 7, 0], [0, SIZE - 7]]
  origins.forEach(([ox, oy]) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const edge = x === 0 || x === 6 || y === 0 || y === 6
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
        if (edge || core) out.push([ox + x, oy + y])
      }
    }
  })
  return out
})

function stopTimer () {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer () {
  stopTimer()
  left.value = WAIT_SECONDS
  timer = setInterval(() => {
    left.value -= 1
    if (left.value <= 0) {
      left.value = 0
      stopTimer()
      emit('scanned', payType.value)
    }
  }, 1000)
}

function open (sum, type) {
  amount.value = sum
  payType.value = type || '微信支付'
  seed.value = Date.now()
  modal.show()
  startTimer()
}

function hide () {
  modal.hide()
}

function onHidden () {
  stopTimer()
  emit('closed')
}

onMounted(() => {
  if (el.value) el.value.addEventListener('hidden.bs.modal', onHidden)
})

onBeforeUnmount(() => {
  stopTimer()
  if (el.value) el.value.removeEventListener('hidden.bs.modal', onHidden)
})

defineExpose({ open, hide })
</script>

<style scoped>
.qr-amount {
  margin: 0 0 12px;
  font-size: 13px;
  color: #8a8177;
}
.qr-amount span {
  font-size: 20px;
  font-weight: 800;
  color: #c0392b;
  margin-left: 4px;
}
.qr-box {
  position: relative;
  width: 190px;
  height: 190px;
  margin: 0 auto;
  padding: 8px;
  background: #fff;
  border: 1px solid #e5ded3;
  border-radius: 6px;
  box-shadow: 0 4px 14px rgba(90, 54, 30, .08);
}
.qr-code {
  display: block;
  width: 100%;
  height: 100%;
}
.qr-brand {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2px solid #fff;
  border-radius: 6px;
  box-shadow: 0 0 0 1px #ece5da;
}
.qr-brand i { font-size: 22px; line-height: 1; }
.qr-tip {
  margin: 14px 0 6px;
  font-size: 12.5px;
  color: #5f574f;
}
.qr-tip i { color: #b8860b; margin-right: 4px; }
.qr-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 0;
  font-size: 12.5px;
  color: #8a8177;
}
.qr-status.is-done {
  color: #1e8e4e;
  font-weight: 700;
}
</style>
