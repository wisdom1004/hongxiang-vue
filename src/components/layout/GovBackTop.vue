<template>
  <a class="gov-backtop" :class="{ 'is-show': visible }" href="#" aria-label="返回顶部" @click.prevent="toTop">
    <i class="bi bi-arrow-up"></i>
  </a>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const visible = ref(false)

function onScroll () {
  visible.value = window.scrollY > 400
}

function toTop () {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>
