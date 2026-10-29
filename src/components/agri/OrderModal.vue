<template>
  <Teleport to="body">
    <div ref="el" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isAdopt ? '确认认养信息' : '确认预售订单' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
          </div>
          <div class="modal-body">
            <div class="order-modal__item">
              <b>{{ item.title }}</b><br>
              {{ sub }}<br>
              单价 ¥{{ money(item.price) }} / {{ unit }}
            </div>
            <div class="mb-3">
              <label class="form-label">联系方式 <span class="text-danger">*</span></label>
              <input v-model="contact" class="form-control" placeholder="手机号 / 微信号，用于接收进度通知" />
            </div>
            <div v-if="!isAdopt" class="mb-2">
              <label class="form-label">数量</label>
              <input v-model="qty" class="form-control" type="number" min="1" />
            </div>
            <div v-if="!isAdopt" class="mb-1">
              <label class="form-label">收货地址</label>
              <input v-model="address" class="form-control" placeholder="省 / 市 / 区 街道门牌" />
            </div>
            <div class="order-modal__note">{{ note }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-light" data-bs-dismiss="modal">再想想</button>
            <button class="btn btn-danger" :disabled="submitting" @click="confirm">确认提交</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useBsModal } from '@/composables/useBsModal'
import { adoptSafe, orderPresaleSafe } from '@/api'
import { useUiStore } from '@/stores/ui'
import { useAddressStore } from '@/stores/address'
import { useUserStore } from '@/stores/user'
import { money } from '@/utils/format'

const props = defineProps({
  payload: { type: Object, default: null }
})
const emit = defineEmits(['close', 'ordered'])

const ui = useUiStore()
const addressStore = useAddressStore()
const user = useUserStore()

const el = ref(null)
const modal = useBsModal(el)

const contact = ref('')
const qty = ref(1)
const address = ref('')
const submitting = ref(false)

const isAdopt = computed(() => props.payload && props.payload.kind === 'adopt')
const item = computed(() => (props.payload && props.payload.item) || {})

const unit = computed(() => {
  if (!props.payload) return '件'
  return isAdopt.value ? item.value.unit : '份'
})

const sub = computed(() => {
  const it = item.value
  if (!props.payload) return ''
  return isAdopt.value
    ? it.region_name + ' · ' + it.duration
    : it.region_name + ' · 截止 ' + it.deadline
})

const note = computed(() => isAdopt.value
  ? '认养成功后合作社将在 24 小时内与你联系，确认挂牌与生长反馈方式。'
  : '预售款用于支付采摘与包装人工，达成目标后按订单顺序发货；未达成全额退款。')

function onHidden () {
  emit('close')
}

onMounted(() => {
  if (el.value) el.value.addEventListener('hidden.bs.modal', onHidden)
})

onBeforeUnmount(() => {
  if (el.value) el.value.removeEventListener('hidden.bs.modal', onHidden)
})

watch(() => props.payload, p => {
  if (p) {
    contact.value = ''
    qty.value = 1
    address.value = ''
    submitting.value = false
    modal.show()
  } else {
    modal.hide()
  }
})

async function confirm () {
  const p = props.payload
  if (!p) return
  const c = contact.value.trim()
  if (!c) {
    ui.show('请填写联系方式', 'bi-exclamation-circle')
    return
  }
  submitting.value = true
  try {
    const res = p.kind === 'adopt'
      ? await adoptSafe(p.item.id, { contact: c, title: p.item.title })
      : await orderPresaleSafe(p.item.id, {
        contact: c,
        qty: qty.value || 1,
        address: address.value.trim()
      })
    if (!res.ok) {
      ui.show((res.data && res.data.error) || '提交失败', 'bi-exclamation-circle')
      return
    }
    ui.show((res.data && res.data.message) || '提交成功，可在个人中心查看', 'bi-check-circle-fill')
    if (p.kind === 'presale' && address.value.trim()) {
      addressStore.save({ phone: c, address: address.value.trim(), name: user.displayName })
    }
    modal.hide()
    emit('ordered')
  } finally {
    submitting.value = false
  }
}
</script>
