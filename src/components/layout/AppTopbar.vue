<template>
  <div class="gov-topbar">
    <div class="container d-flex justify-content-between flex-wrap">
      <span>欢迎访问红乡智推——红色乡村助农 AI 智能推介平台</span>
      <span>
        <span id="govDate">{{ dateText }}</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoginPage = computed(() => route.name === 'login')

const WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const dateText = computed(() => {
  const d = new Date()
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + WEEK[d.getDay()]
})
</script>
