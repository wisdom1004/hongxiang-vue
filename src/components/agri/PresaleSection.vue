<template>
  <section id="presale" class="hf-section hf-section--paper">
    <div class="container">
      <div class="hf-eyebrow">预售助农</div>
      <h2 class="hf-title">先下单，<span class="accent">再采摘</span></h2>
      <p class="hf-sub">
        预售款用于支付采摘、晾晒与包装的人工费用，让农户不必借钱备货。达成目标后按订单顺序发货，未达成全额退款。
      </p>

      <div v-if="loading" class="row g-4 mt-2">
        <div class="col-12"><div class="hf-empty"><span class="hf-spinner"></span></div></div>
      </div>
      <div v-else-if="error" class="row g-4 mt-2">
        <div class="col-12"><div class="hf-empty"><i class="bi bi-cloud-slash"></i>{{ error }}</div></div>
      </div>
      <div v-else-if="!list.length" class="row g-4 mt-2">
        <div class="col-12"><div class="hf-empty"><i class="bi bi-hourglass"></i>暂无预售项目</div></div>
      </div>
      <div v-else class="row g-4 mt-2">
        <div v-for="s in list" :key="s.id" class="col-md-6 col-lg-4">
          <article class="hf-adopt">
            <div class="hf-adopt__media">
              <ProductImage :src="s.img" :alt="s.product_name" cat="果干" :label="s.product_name" />
              <span class="hf-adopt__flag">预售</span>
              <div class="hf-adopt__location"><i class="bi bi-geo-alt-fill"></i>{{ s.region_name }} · 截止 {{ s.deadline }}</div>
            </div>
            <div class="hf-adopt__body">
              <h4>{{ s.title }}</h4>
              <p class="hf-adopt__intro">{{ s.intro }}</p>
              <div class="hf-fact"><i class="bi bi-truck"></i>{{ s.delivery }}</div>
              <div class="hf-progress-meta">
                <span>已预售 {{ num(s.sold) }} / {{ num(s.target) }} 份</span>
                <b style="color:#7a1006;">{{ Number(s.percent).toFixed(1) }}%</b>
              </div>
              <div class="hf-progress hf-progress--green"><span :style="{ width: Math.min(100, s.percent) + '%' }"></span></div>
              <div class="hf-adopt__foot mt-3">
                <div class="hf-adopt__price">¥{{ money(s.price) }}<small>定金 {{ s.deposit }}%</small></div>
                <button class="hf-btn hf-btn--green hf-btn--sm" @click="emit('order', { kind: 'presale', item: s })">预订一份</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import ProductImage from '@/components/common/ProductImage.vue'
import { getPresales } from '@/api'
import { money, num } from '@/utils/format'

const props = defineProps({
  refresh: { type: Number, default: 0 }
})
const emit = defineEmits(['order'])

const list = ref([])
const loading = ref(true)
const error = ref('')

async function load () {
  loading.value = true
  error.value = ''
  try {
    list.value = await getPresales()
  } catch (e) {
    error.value = '未获取到预售项目，请稍后重试'
  } finally {
    loading.value = false
  }
}

watch(() => props.refresh, load)
onMounted(load)
</script>
