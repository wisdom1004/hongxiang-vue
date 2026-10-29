<template>
  <div class="breadcrumb-wrap">
    <div class="container">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><router-link to="/">首页</router-link></li>
          <li class="breadcrumb-item active" aria-current="page">{{ current }}</li>
        </ol>
      </nav>
    </div>
  </div>
</template>

<script setup>
defineProps({
  current: { type: String, default: '' }
})
</script>
