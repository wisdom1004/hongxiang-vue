<template>
  <section id="plan" class="hf-section--paper hf-section">
    <div class="container">
      <div class="row g-4 align-items-start">
        <div class="col-lg-5">
          <div class="hf-eyebrow">AI · 帮销路线</div>
          <h2 class="hf-title">让采购车<span class="accent">跑得值</span></h2>
          <p class="hf-sub">
            输入行程天数与采购预算，模型按"助农指数（40%）+ 滞销预警（35%）+ 带动农户规模（25%）"排序，
            再做地理聚类，输出一条不走回头路的产地直采路线。每一站都标注了可对接的合作社与建议采购品类。
          </p>
          <div class="route-form">
            <div class="route-form__grid">
              <div class="hf-field">
                <label for="planDays">行程天数</label>
                <select id="planDays" v-model="days">
                  <option value="2">2 天</option>
                  <option value="3">3 天</option>
                  <option value="4">4 天</option>
                  <option value="5">5 天</option>
                </select>
              </div>
              <div class="hf-field">
                <label for="planBudget">采购预算（元）</label>
                <input id="planBudget" v-model="budget" type="number" min="1000" step="500">
              </div>
              <div class="hf-field" style="grid-column: span 2;">
                <label for="planStart">出发城市</label>
                <select id="planStart" v-model="start">
                  <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>
            <div class="route-form__foot">
              <button class="hf-btn hf-btn--primary" :disabled="loading" @click="generate">
                <span v-if="loading" class="hf-spinner"></span>
                <i v-else class="bi bi-stars"></i>
                <template v-if="!loading">生成帮销路线</template>
              </button>
              <button class="hf-btn hf-btn--ghost" :disabled="!plan" @click="$emit('show-map', plan)">
                <i class="bi bi-map"></i>在地图上查看
              </button>
            </div>
          </div>
        </div>
        <div class="col-lg-7">
          <div class="route-result">
            <div v-if="!plan" class="route-placeholder">
              <i class="bi bi-signpost-split"></i>
              <p>还没有路线。设置参数后点击「生成帮销路线」，AI 会给出一份可直接执行的采购行程。</p>
            </div>
            <template v-else>
              <div class="route-summary">{{ plan.summary }}</div>
              <div class="mb-3 d-flex flex-wrap gap-2">
                <span v-for="r in plan.rules" :key="r" class="hf-badge hf-badge--gold">
                  <i class="bi bi-check2"></i>{{ r }}
                </span>
                <span class="hf-badge hf-badge--green">出发：{{ plan.start }}</span>
                <span class="hf-badge hf-badge--red">预算：¥{{ money(plan.budget) }}</span>
              </div>
              <div v-for="p in plan.plan" :key="'d' + p.day" class="route-day">
                <div class="route-day__badge">{{ p.day }}</div>
                <div class="route-day__head">
                  <span class="route-day__title">第 {{ p.day }} 天 · {{ p.city }}</span>
                  <span class="route-day__budget">预算 ¥{{ money(p.budget) }}</span>
                  <span class="hf-badge hf-badge--ghost">{{ p.cluster }}</span>
                </div>
                <div class="route-day__advice">{{ p.advice }}</div>
                <div class="route-day__stops">
                  <div
                    v-for="r in p.regions"
                    :key="r.id"
                    class="route-stop"
                    @click="$emit('select-region', r.id)"
                  >
                    <b>
                      {{ r.name }}
                      <span v-if="r.urgent" style="color:#c0392b;font-size:10px;">急售</span>
                    </b>
                    <span>主打 {{ r.main }} · {{ num(r.households) }} 户</span>
                    <span>{{ r.coop }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { aiHelpPlan } from '@/api'
import { useUiStore } from '@/stores/ui'
import { money, num } from '@/utils/format'

const props = defineProps({
  cities: { type: Array, default: () => [] }
})

const emit = defineEmits(['show-map', 'select-region'])

const ui = useUiStore()
const days = ref('3')
const budget = ref(3000)
const start = ref('')
const plan = ref(null)
const loading = ref(false)

watch(() => props.cities, list => {
  if (!start.value && list.length) start.value = list.includes('西安市') ? '西安市' : list[0]
}, { immediate: true })

async function generate () {
  loading.value = true
  try {
    const d = await aiHelpPlan({ days: days.value, budget: budget.value || 3000, start: start.value })
    plan.value = d
    emit('plan-ready', d)
  } catch (e) {
    ui.show((e.body && e.body.error) || '未获取到规划结果，请稍后重试', 'bi-cloud-slash')
  } finally {
    loading.value = false
  }
}

defineExpose({ getPlan: () => plan.value })
</script>
