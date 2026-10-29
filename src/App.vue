<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <AppTopbar />
  <AppHeader />
  <router-view />
  <AppFooter />
  <TraceModal />
  <ToastHost />
  <GovBackTop />
</template>

<script setup>
import AppTopbar from '@/components/layout/AppTopbar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import GovBackTop from '@/components/layout/GovBackTop.vue'
import TraceModal from '@/components/common/TraceModal.vue'
import ToastHost from '@/components/common/ToastHost.vue'
</script>
