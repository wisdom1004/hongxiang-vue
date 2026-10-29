<template>
  <section class="uc-hero">
    <div class="uc-hero__avatar"><i class="bi bi-person"></i></div>
    <div class="uc-hero__info">
      <h1>{{ name }}</h1>
      <p>{{ meta }}</p>
    </div>
    <div class="uc-hero__ops">
      <router-link class="hf-btn hf-btn--ghost hf-btn--sm" to="/agri"><i class="bi bi-basket"></i> 去助农专区</router-link>
      <button class="hf-btn hf-btn--ghost hf-btn--sm" type="button" @click="emit('logout')">
        <i class="bi bi-box-arrow-right"></i> 退出
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  name: { type: String, default: '助农伙伴' },
  meta: { type: String, default: '尚无订单记录' }
})
const emit = defineEmits(['logout'])
</script>
