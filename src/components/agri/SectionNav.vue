<template>
  <div class="agri-anchor">
    <div class="container">
      <a v-for="item in items" :key="item.id" :href="'#' + item.id" @click.prevent="go(item.id)">
        <i class="bi" :class="item.icon"></i> {{ item.label }}
      </a>
    </div>
  </div>
</template>

<script setup>
const items = [
  { id: 'ai', label: 'AI 选品', icon: 'bi-stars' },
  { id: 'shop', label: '助农商城', icon: 'bi-bag' },
  { id: 'adopt', label: '果树认养', icon: 'bi-tree' },
  { id: 'presale', label: '霜降预售', icon: 'bi-hourglass-split' },
  { id: 'trace', label: '溯源查询', icon: 'bi-upc-scan' }
]

function go (id) {
  const el = document.getElementById(id)
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' })
}
</script>
