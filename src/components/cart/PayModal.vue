<template>
  <Teleport to="body">
    <div ref="el" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-credit-card me-2"></i>选择支付方式</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="text-center fs-4">
              应付金额：<span class="text-danger fw-bold">¥{{ fixed(amount) }}</span>
            </p>
            <div v-for="p in pays" :key="p" class="form-check my-2">
              <input :id="'pay-' + p" v-model="payType" class="form-check-input" type="radio" name="payType" :value="p">
              <label class="form-check-label" :for="'pay-' + p">{{ p }}</label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button class="btn btn-card" :disabled="submitting" @click="confirm">确认付款</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useBsModal } from '@/composables/useBsModal'

const emit = defineEmits(['paid', 'closed'])

const el = ref(null)
const modal = useBsModal(el)

const pays = ['微信支付', '支付宝', '账户余额']
const amount = ref(0)
const payType = ref('微信支付')
const submitting = ref(false)

function fixed (n) {
  return (Number(n) || 0).toFixed(2)
}

function open (sum) {
  amount.value = sum
  payType.value = '微信支付'
  submitting.value = false
  modal.show()
}

function confirm () {
  emit('paid', payType.value)
}

function hide () {
  modal.hide()
}

function setSubmitting (v) {
  submitting.value = !!v
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

defineExpose({ open, hide, setSubmitting })
</script>
