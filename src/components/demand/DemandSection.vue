<template>
  <section id="demand" class="hf-section">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-5">
          <div class="hf-eyebrow">产销对接</div>
          <h2 class="hf-title">农产品<span class="accent">滞销上报</span></h2>
          <p class="hf-sub">
            合作社、驻村工作队或农户可直接上报滞销信息。上报后 48 小时内由平台对接采购商与商超渠道，
            并同步进入地图的"滞销预警"图层，被更多采购方看到。
          </p>
          <form class="demand-form" autocomplete="off" @submit.prevent="submit">
            <div class="route-form__grid">
              <div class="hf-field">
                <label for="dmRegion">所在产区 <span class="req">*</span></label>
                <select id="dmRegion" v-model="form.region">
                  <option value="">请选择产区</option>
                  <option v-for="r in regions" :key="r.id" :value="r.name">{{ r.province }} · {{ r.name }}</option>
                </select>
              </div>
              <div class="hf-field">
                <label for="dmProduct">产品名称 <span class="req">*</span></label>
                <input id="dmProduct" v-model="form.product" placeholder="如：红富士苹果">
              </div>
              <div class="hf-field">
                <label for="dmQty">滞销量</label>
                <input id="dmQty" v-model="form.qty" placeholder="如：12 吨">
              </div>
              <div class="hf-field">
                <label for="dmContact">联系方式 <span class="req">*</span></label>
                <input id="dmContact" v-model="form.contact" placeholder="手机号 / 微信">
              </div>
            </div>
            <div class="hf-field mt-3">
              <label for="dmNote">补充说明</label>
              <textarea id="dmNote" v-model="form.note" rows="3" placeholder="成熟期、包装规格、可接受价格区间、是否支持冷链等"></textarea>
            </div>
            <button class="hf-btn hf-btn--green mt-3" type="submit"><i class="bi bi-megaphone"></i>提交上报</button>
            <span class="demand-form__tip">提交即视为同意平台在助农地图公开展示该条求助信息</span>
          </form>
        </div>
        <div class="col-lg-7">
          <div class="demand-board">
            <div class="demand-board__head">
              <h4><i class="bi bi-broadcast"></i> 最近上报</h4>
              <span>{{ demands.length }} 条求助信息</span>
            </div>
            <div class="demand-board__list">
              <div v-if="loading" class="hf-empty"><span class="hf-spinner"></span></div>
              <div v-else-if="!demands.length" class="hf-empty">
                <i class="bi bi-inbox"></i>暂无人上报，你提交的第一条会显示在这里
              </div>
              <div v-for="d in demands" v-else :key="d.id" class="demand-item">
                <div class="demand-item__tag">{{ (d.region || '').slice(0, 4) }}</div>
                <div class="demand-item__main">
                  <div class="demand-item__title">
                    {{ d.product }}
                    <span v-if="d.qty" class="hf-badge hf-badge--gold">{{ d.qty }}</span>
                    <span class="demand-item__state">已受理</span>
                  </div>
                  <div class="demand-item__meta">
                    {{ d.region }} · {{ d.created_at || '' }} · 联系人 {{ mask(d.contact) }}
                  </div>
                  <div v-if="d.note" class="demand-item__note">{{ d.note }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { createDemandSafe, getDemands } from '@/api'
import { useUiStore } from '@/stores/ui'

defineProps({
  regions: { type: Array, default: () => [] }
})

const ui = useUiStore()
const demands = ref([])
const loading = ref(true)
const form = reactive({ region: '', product: '', qty: '', contact: '', note: '' })

function mask (s) {
  s = String(s || '')
  if (s.length <= 3) return s
  return s.slice(0, 3) + '****' + s.slice(-2)
}

async function load () {
  try {
    demands.value = (await getDemands()) || []
  } catch (e) {
    demands.value = []
  } finally {
    loading.value = false
  }
}

async function submit () {
  if (!form.region || !form.product) {
    ui.show('请填写所在产区与产品名称', 'bi-exclamation-circle')
    return
  }
  const res = await createDemandSafe({ ...form })
  if (!res.ok) {
    ui.show((res.data && res.data.error) || '提交失败，请稍后重试', 'bi-exclamation-circle')
    return
  }
  ui.show(res.data.message || '已受理', 'bi-check-circle-fill')
  form.region = ''
  form.product = ''
  form.qty = ''
  form.contact = ''
  form.note = ''
  load()
}

onMounted(load)
</script>
