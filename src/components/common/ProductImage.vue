<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <img
    v-if="!failed"
    :src="assetUrl(src)"
    :alt="alt"
    loading="lazy"
    @error="failed = true"
  >
  <div v-else class="prod-ph">
    <i class="bi" :class="icon"></i>
    <span>{{ label || alt }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { assetUrl } from '@/utils/img'
import { catIcon } from '@/utils/icons'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  cat: { type: String, default: '' },
  label: { type: String, default: '' }
})

const failed = ref(false)
const icon = computed(() => catIcon(props.cat))
</script>
