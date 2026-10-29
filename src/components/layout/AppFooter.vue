<template>
  <footer class="footer">
    <div class="container">
      <div class="row footer-links">
        <div class="col-md-4">
          <h6>快速导航</h6>
          <router-link to="/">网站首页</router-link><br>
          <router-link to="/#map">助农地图</router-link><br>
          <router-link to="/agri">助农专区</router-link><br>
          <router-link to="/about">平台概况</router-link>
        </div>
        <div class="col-md-4">
          <h6>资源服务</h6>
          <router-link to="/agri#shop">助农商城</router-link><br>
          <router-link to="/agri#adopt">果树认养</router-link><br>
          <router-link to="/agri#presale">霜降预售</router-link><br>
          <router-link to="/agri#trace">溯源查询</router-link>
        </div>
        <div class="col-md-4">
          <h6>平台信息</h6>
          <p class="mb-1">{{ team }}</p>
          <p class="mb-1">队名：破界者</p>
          <p class="mb-0">以智赋能乡村产业，青春助力乡村振兴</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>红乡智推——红色乡村助农 AI 智能推介平台 V2.0</p>
        <p>© 2026 破界者 · 西安汽车职业大学 人工智能学院 版权所有</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const team = computed(() => {
  if (route.name === 'admin') return '红乡智推项目组 · 西安汽车职业大学'
  if (route.name === 'about') return '破界者项目组 · 西安汽车职业大学'
  return '破界者 · 西安汽车职业大学'
})
</script>
