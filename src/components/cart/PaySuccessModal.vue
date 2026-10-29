<template>
  <Teleport to="body">
    <div ref="el" class="modal fade" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-success"><i class="bi bi-check-circle-fill"></i>支付成功！</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>您的订单已支付成功，订单信息已保存！</p>
            <div v-if="order">
              <p>订单编号：{{ order.order_no }}</p>
              <p>收货人：{{ order.receiver }} {{ order.phone }}</p>
              <p>收货地址：{{ order.address }}</p>
              <p>支付方式：{{ order.payType }}</p>
              <p>订单金额：¥{{ fixed(order.total) }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-card" data-bs-dismiss="modal">完成</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useBsModal } from '@/composables/useBsModal'

const el = ref(null)
const modal = useBsModal(el)
const order = ref(null)

function fixed (n) {
  return (Number(n) || 0).toFixed(2)
}

function open (data) {
  order.value = data
  modal.show()
}

defineExpose({ open })
</script>
