<template>
  <section id="trace" class="hf-section">
    <div class="container">
      <div class="trace-box">
        <div class="row g-4 align-items-center">
          <div class="col-lg-6">
            <div class="hf-eyebrow">一物一码</div>
            <h2 class="hf-title">这箱苹果，<span class="accent">从哪块地来</span></h2>
            <p class="hf-sub">
              输入包装上的溯源码，可查看种植、管护、采摘、分选、质检、发货六个节点的责任人与时间。没有溯源码的农产，平台不予上架。
            </p>
            <div class="trace-form">
              <input
                v-model="code"
                placeholder="请输入溯源码，如 HX-LC-2026-0001"
                @keydown.enter.prevent="query"
              />
              <button class="hf-btn hf-btn--primary" @click="query"><i class="bi bi-upc-scan"></i>查询</button>
              <button class="hf-btn hf-btn--ghost" :disabled="demoLoading" @click="demo">用示例码试试</button>
            </div>
            <div class="trace-form__tip">提示：在商品卡上点击「溯源」按钮，可直接查看该商品的完整档案。</div>
          </div>
          <div class="col-lg-6">
            <div class="trace-steps">
              <div class="trace-step"><b>01</b><span>种植建档</span><i>地块、品种、树龄入库</i></div>
              <div class="trace-step"><b>02</b><span>管护记录</span><i>施肥用药留痕可查</i></div>
              <div class="trace-step"><b>03</b><span>采摘分选</span><i>批次与等级对应</i></div>
              <div class="trace-step"><b>04</b><span>质检发货</span><i>县级质检 + 冷链单号</i></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { getTraceCode } from '@/api'
import { useTrace } from '@/composables/useTrace'
import { useUiStore } from '@/stores/ui'

const trace = useTrace()
const ui = useUiStore()

const code = ref('')
const demoLoading = ref(false)

function query () {
  const v = code.value.trim()
  if (!v) return demo()
  trace.openByCode(v)
}

async function demo () {
  demoLoading.value = true
  try {
    const d = await getTraceCode()
    if (d && d.code) {
      code.value = d.code
      trace.openByCode(d.code)
    } else {
      ui.show('暂无语义溯源码', 'bi-info-circle')
    }
  } catch (e) {
    ui.show('溯源码获取失败', 'bi-cloud-slash')
  } finally {
    demoLoading.value = false
  }
}
</script>
