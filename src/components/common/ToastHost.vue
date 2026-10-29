<template>
  <div class="cart-toast" :class="{ show: ui.toast.show }">
    <i class="bi" :class="ui.toast.icon"></i> {{ ui.toast.msg }}
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>
