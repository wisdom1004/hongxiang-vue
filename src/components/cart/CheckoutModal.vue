<template>
  <Teleport to="body">
    <div ref="el" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-file-text me-2"></i>确认订单</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">收货地址</label>
              <input v-model="address" type="text" class="form-control" placeholder="请输入省/市/区/详细地址">
            </div>
            <div class="mb-3">
              <label class="form-label">收货人</label>
              <input v-model="receiver" type="text" class="form-control" placeholder="姓名">
            </div>
            <div class="mb-3">
              <label class="form-label">联系电话</label>
              <input v-model="phone" type="tel" class="form-control" placeholder="手机号">
            </div>
            <div class="mb-3">
              <label class="form-label">订单备注</label>
              <textarea v-model="remark" class="form-control" rows="2" placeholder="选填：给商家留言"></textarea>
            </div>
            <div class="border-top pt-3">
              <h6>商品清单</h6>
              <div>
                <div v-for="g in goods" :key="g.productId">
                  {{ g.name }} × {{ g.num }} 件，单价¥{{ fixed(g.price) }}，小计¥{{ fixed(g.price * g.num) }}
                </div>
              </div>
              <div class="text-end mt-3 fs-5">
                订单总额：<span class="text-danger fw-bold">¥{{ fixed(total) }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">返回购物车</button>
            <button class="btn btn-card" @click="submit">提交订单</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useBsModal } from '@/composables/useBsModal'
import { useAddressStore } from '@/stores/address'
import { useUiStore } from '@/stores/ui'

const emit = defineEmits(['submit', 'closed'])

const addressStore = useAddressStore()
const ui = useUiStore()

const el = ref(null)
const modal = useBsModal(el)

const goods = ref([])
const total = ref(0)
const address = ref('')
const receiver = ref('')
const phone = ref('')
const remark = ref('')

function fixed (n) {
  return (Number(n) || 0).toFixed(2)
}

function open (items, sum) {
  goods.value = items.slice()
  total.value = sum
  address.value = ''
  receiver.value = ''
  phone.value = ''
  remark.value = ''
  const addr = addressStore.defaultAddress
  if (addr) {
    address.value = addr.address || ''
    receiver.value = addr.name || ''
    phone.value = addr.phone || ''
  }
  modal.show()
}

function submit () {
  if (!address.value.trim() || !receiver.value.trim() || !phone.value.trim()) {
    ui.show('收货地址、姓名、手机号不能为空', 'bi-exclamation-circle')
    return
  }
  emit('submit', {
    address: address.value.trim(),
    receiver: receiver.value.trim(),
    phone: phone.value.trim(),
    remark: remark.value.trim()
  })
}

function hide () {
  modal.hide()
}

function onHidden () {
  emit('closed')
}

onMounted(() => {
  if (el.value) el.value.addEventListener('hidden.bs.modal', onHidden)
})

onBeforeUnmount(() => {
  if (el.value) el.value.removeEventListener('hidden.bs.modal', onHidden)
})

defineExpose({ open, hide })
</script>
