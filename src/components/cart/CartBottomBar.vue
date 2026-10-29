<template>
  <div class="cart-bottom-bar mt-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
    <div class="form-check">
      <input
        id="checkAll"
        class="form-check-input"
        type="checkbox"
        :checked="allChecked"
        @change="emit('toggleAll', $event.target.checked)"
      >
      <label class="form-check-label" for="checkAll">全选</label>
    </div>
    <div>
      <span class="me-4">合计：<span class="text-danger fw-bold fs-5">¥{{ fixed(total) }}</span></span>
      <button type="button" class="btn btn-card" @click="emit('checkout')">结算</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  allChecked: { type: Boolean, default: false },
  total: { type: Number, default: 0 }
})
const emit = defineEmits(['toggleAll', 'checkout'])

function fixed (n) {
  return (Number(n) || 0).toFixed(2)
}
</script>
