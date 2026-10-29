<template>
  <section id="adopt" class="hf-section">
    <div class="container">
      <div class="row g-4 align-items-end mb-4">
        <div class="col-lg-7">
          <div class="hf-eyebrow">订单农业 · 认养</div>
          <h2 class="hf-title">先付钱，<span class="accent">再长果</span></h2>
          <p class="hf-sub mb-0">
            认养一株果树，等于提前把农户一年的管护成本结清。果农不必再为"熟了卖不掉"发愁，你也能拿到保底产量与 4 次生长反馈。
          </p>
        </div>
        <div class="col-lg-5 text-lg-end">
          <span class="hf-badge hf-badge--green" style="height:30px;font-size:13px;">
            <i class="bi bi-shield-check"></i> 认养款由平台托管，按管护节点分期结算
          </span>
        </div>
      </div>

      <div v-if="loading" class="row g-4">
        <div class="col-12"><div class="hf-empty"><span class="hf-spinner"></span></div></div>
      </div>
      <div v-else-if="error" class="row g-4">
        <div class="col-12"><div class="hf-empty"><i class="bi bi-cloud-slash"></i>{{ error }}</div></div>
      </div>
      <div v-else-if="!list.length" class="row g-4">
        <div class="col-12"><div class="hf-empty"><i class="bi bi-tree"></i>暂无认养项目</div></div>
      </div>
      <div v-else class="row g-4">
        <div v-for="a in list" :key="a.id" class="col-md-6 col-lg-4">
          <article class="hf-adopt">
            <div class="hf-adopt__media">
              <ProductImage :src="a.img" :alt="a.product_name" cat="苹果" :label="a.product_name" />
              <span class="hf-adopt__flag">{{ a.duration }}</span>
              <div class="hf-adopt__location"><i class="bi bi-geo-alt-fill"></i>{{ a.region_name }} · {{ a.city }}</div>
            </div>
            <div class="hf-adopt__body">
              <h4>{{ a.title }}</h4>
              <p class="hf-adopt__intro">{{ a.intro }}</p>
              <ul class="hf-adopt__rights">
                <li v-for="(r, i) in a.rights || []" :key="i">{{ r }}</li>
              </ul>
              <div class="hf-progress-meta">
                <span>已认养 {{ num(a.taken) }} / {{ num(a.total) }} {{ a.unit }}</span>
                <b style="color:#7a1006;">{{ Number(a.percent).toFixed(1) }}%</b>
              </div>
              <div class="hf-progress"><span :style="{ width: Math.min(100, a.percent) + '%' }"></span></div>
              <div class="hf-adopt__foot mt-3">
                <div class="hf-adopt__price">¥{{ money(a.price) }}<small>/{{ a.unit }}·{{ a.duration }}</small></div>
                <button class="hf-btn hf-btn--primary hf-btn--sm" @click="emit('order', { kind: 'adopt', item: a })">立即认养</button>
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
import { getAdoptions } from '@/api'
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
    list.value = await getAdoptions()
  } catch (e) {
    error.value = '未获取到认养项目，请稍后重试'
  } finally {
    loading.value = false
  }
}

watch(() => props.refresh, load)
onMounted(load)
</script>
