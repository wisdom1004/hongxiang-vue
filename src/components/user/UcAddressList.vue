<template>
  <section class="uc-card h-100">
    <div class="uc-card__head"><h2><i class="bi bi-geo-alt"></i> 收货信息</h2></div>
    <template v-if="info.phone || addresses.length">
      <div v-if="info.phone" class="uc-addr">
        <b>默认联系方式</b>
        <p>{{ info.phone }}</p>
      </div>
      <div v-for="(a, i) in addresses" :key="i" class="uc-addr" :class="{ 'is-default': a.isDefault }">
        <span v-if="a.isDefault" class="uc-addr__tag">默认</span>
        <b>{{ a.name || '收货人' }} {{ a.phone || '' }}</b>
        <p>{{ a.address || '' }}</p>
      </div>
    </template>
    <div v-else class="hf-empty">
      <i class="bi bi-geo"></i>还没有收货信息，下单结算时会自动记住常用地址
    </div>
  </section>
</template>

<script setup>
defineProps({
  info: { type: Object, default: () => ({}) },
  addresses: { type: Array, default: () => [] }
})
</script>
