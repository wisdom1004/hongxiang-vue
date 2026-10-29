<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <AppBreadcrumb current="运营后台" />
  <main class="container">
    <h2 class="section-title">
      助农运营后台
      <div class="section-sub">滞销预警调度 · 认养与预售订单 · 农产品订单 · 产区数据看板</div>
    </h2>

    <div class="admin-stats">
      <div class="admin-card text-center"><i class="bi bi-receipt fs-1"></i><h4>订单总数</h4><p>{{ orders.length }}</p></div>
      <div class="admin-card text-center"><i class="bi bi-tree fs-1"></i><h4>认养 / 预售</h4><p>{{ helpOrders.length }}</p></div>
      <div class="admin-card text-center"><i class="bi bi-coin fs-1"></i><h4>订单金额</h4><p>¥{{ money(amountSum) }}</p></div>
      <div class="admin-card text-center"><i class="bi bi-exclamation-triangle fs-1"></i><h4>滞销预警</h4><p>{{ (stats && stats.urgent_tons) || 0 }} 吨</p></div>
      <div class="admin-card text-center"><i class="bi bi-people fs-1"></i><h4>带动农户</h4><p>{{ num((stats && stats.households) || 0) }}</p></div>
    </div>

    <section class="admin-card">
      <div class="admin-card__head">
        <h4><i class="bi bi-exclamation-triangle me-2"></i>滞销预警调度</h4>
        <span class="admin-hint">按库存与采摘期自动标记，需优先安排销路</span>
      </div>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr><th>商品</th><th>产区</th><th>合作社</th><th>带动农户</th><th>待销库存</th><th>助农价</th><th>助农指数</th></tr>
          </thead>
          <tbody>
            <tr v-if="!urgentList.length">
              <td colspan="7"><div class="hf-empty"><i class="bi bi-cloud-slash"></i>当前没有滞销预警，产区销售顺畅</div></td>
            </tr>
            <template v-else>
              <tr v-for="p in urgentList" :key="p.id">
                <td>
                  <b>{{ p.name }}</b>
                  <span class="admin-flag" :class="p.help === 'urgent' ? 'admin-flag--urgent' : 'admin-flag--presale'">
                    {{ p.help === 'urgent' ? '急售' : '预售' }}
                  </span>
                </td>
                <td>{{ p.province }}{{ p.city }} · {{ p.county || p.region_name }}</td>
                <td>{{ p.coop_name || '—' }}</td>
                <td>{{ num(p.farmers) }} 户</td>
                <td class="text-danger fw-bold">{{ p.note || '—' }}</td>
                <td>¥{{ money(p.price) }}<small class="text-muted">/{{ p.unit }}</small></td>
                <td><span class="admin-index">{{ (Number(p.help_index) || 0).toFixed(1) }}</span></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <section class="admin-card">
      <div class="admin-card__head">
        <h4><i class="bi bi-tree me-2"></i>认养 / 预售订单</h4>
        <span class="admin-hint">收益前置到种植端，需在采摘季前完成排产</span>
      </div>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr><th>订单号</th><th>类型</th><th>标的</th><th>金额</th><th>下单时间</th><th>联系人</th><th>状态</th></tr>
          </thead>
          <tbody>
            <tr v-if="!helpOrders.length">
              <td colspan="7"><div class="hf-empty"><i class="bi bi-tree"></i>还没有认养 / 预售订单</div></td>
            </tr>
            <template v-else>
              <tr v-for="o in helpOrders" :key="o.order_no || o.id">
                <td class="admin-no">{{ o.order_no || ('#' + o.id) }}</td>
                <td>
                  <span class="admin-flag" :class="o.type === 'adopt' ? 'admin-flag--adopt' : 'admin-flag--presale'">
                    {{ label(o.type) }}
                  </span>
                </td>
                <td>{{ o.title || '' }}</td>
                <td class="fw-bold text-danger">¥{{ money(o.amount) }}</td>
                <td>{{ o.created_at || '' }}</td>
                <td>{{ o.contact || '—' }}</td>
                <td><span class="admin-status">{{ o.status || '待处理' }}</span></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>

    <section class="admin-card">
      <div class="admin-card__head">
        <h4><i class="bi bi-bag-check me-2"></i>农产品订单</h4>
        <span class="admin-hint">产地直发订单，按合作社分单发货</span>
      </div>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr><th>订单号</th><th>商品清单</th><th>金额</th><th>下单时间</th><th>收货电话</th><th>状态</th></tr>
          </thead>
          <tbody>
            <tr v-if="!productOrders.length">
              <td colspan="6"><div class="hf-empty"><i class="bi bi-bag"></i>还没有农产品订单</div></td>
            </tr>
            <template v-else>
              <tr v-for="o in productOrders" :key="o.order_no || o.id">
                <td class="admin-no">{{ o.order_no || ('#' + o.id) }}</td>
                <td>{{ itemText(o) }}</td>
                <td class="fw-bold text-danger">¥{{ money(o.amount) }}</td>
                <td>{{ o.created_at || '' }}</td>
                <td>{{ o.contact || '—' }}</td>
                <td><span class="admin-status">{{ o.status || '待发货' }}</span></td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<script setup>
import '@/styles/pages/admin.css'
import { computed, onMounted, ref } from 'vue'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import { getOrders, getProducts, getStats } from '@/api'
import { money, num } from '@/utils/format'

const stats = ref({})
const orders = ref([])
const products = ref([])

const labels = { product: '农产品', adopt: '认养', presale: '预售' }

const helpOrders = computed(() => orders.value.filter(o => o.type === 'adopt' || o.type === 'presale'))
const productOrders = computed(() => orders.value.filter(o => o.type !== 'adopt' && o.type !== 'presale'))
const amountSum = computed(() => orders.value.reduce((a, o) => a + (Number(o.amount) || 0), 0))

const urgentList = computed(() =>
  products.value
    .filter(p => p.help === 'urgent' || p.help === 'presale')
    .sort((a, b) => (b.help_index || 0) - (a.help_index || 0))
)

function label (t) {
  return labels[t] || '助农'
}

function itemText (o) {
  return (o.items || []).map(it => (it.title || '') + ' × ' + (it.qty || 1)).join('、') || o.title || ''
}

onMounted(async () => {
  const [s, o, p] = await Promise.all([
    getStats().catch(() => ({})),
    getOrders().catch(() => []),
    getProducts({ limit: 100 }).catch(() => [])
  ])
  stats.value = s || {}
  orders.value = o || []
  products.value = p || []
})
</script>
