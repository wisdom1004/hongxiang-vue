<template>
  <header class="agri-hero">
    <div class="container">
      <div class="row align-items-center g-4">
        <div class="col-lg-7">
          <div class="agri-hero__eyebrow"><i class="bi bi-basket2-fill"></i> 助农专区 · 产地直发</div>
          <h1>买一单，就是一户人家的<span class="hl">收成</span></h1>
          <p>跳过中间环节，从 29 个帮扶产区直发到家。每件商品都标注了带动农户数、让利金额与溯源码——你买得明白，农户收得踏实。</p>
          <div class="agri-hero__tags">
            <span><i class="bi bi-patch-check-fill"></i> 一物一码可溯源</span>
            <span><i class="bi bi-truck"></i> 产地直发 · 破损包赔</span>
            <span><i class="bi bi-people-fill"></i> 每单让利直达合作社</span>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="agri-hero__board">
            <div class="agri-hero__board-title">助农实时看板</div>
            <div class="agri-hero__board-grid">
              <div><b>{{ fmt(stats && stats.households) }}</b><span>带动农户（户）</span></div>
              <div><b>{{ fmt(stats && stats.sales_amount) }}</b><span>累计助农订单</span></div>
              <div><b>{{ fmt(stats && stats.adopted_units) }}</b><span>已认养果树（株）</span></div>
              <div><b>{{ fmt(stats && stats.trace_batches) }}</b><span>溯源批次</span></div>
            </div>
            <div class="agri-hero__board-foot">
              <i class="bi bi-info-circle"></i> 数据来自平台合作社回传，每 10 分钟同步
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { num } from '@/utils/format'

defineProps({
  stats: { type: Object, default: null }
})

function fmt (v) {
  return v == null || v === '' ? '--' : num(v)
}
</script>
