<template>
  <section id="ai" class="hf-section">
    <div class="container">
      <div class="hf-eyebrow">AI · 助农选品</div>
      <h2 class="hf-title">不知道买什么？<span class="accent">让模型替你配一单</span></h2>
      <p class="hf-sub">
        按预算、场景、口味与人数四个维度打分，再按"预算装得下、帮扶更紧迫"的原则贪心装箱。
        同等条件下优先滞销产区，让这一单买到更需要被买走的东西。
      </p>
      <div class="hf-ai mt-4">
        <div class="hf-ai__head">
          <div class="hf-ai__icon"><i class="bi bi-stars"></i></div>
          <div>
            <h4>助农选品助手</h4>
            <p>四个参数，30 秒给你一份能直接下单的组合</p>
          </div>
        </div>
        <form class="hf-ai__form" @submit.prevent="generate">
          <div class="hf-field">
            <label for="aiBudget">预算（元）</label>
            <input id="aiBudget" v-model="form.budget" type="number" min="50" step="50" />
          </div>
          <div class="hf-field">
            <label for="aiScene">场景</label>
            <select id="aiScene" v-model="form.scene">
              <option v-for="s in scenes" :key="s">{{ s }}</option>
            </select>
          </div>
          <div class="hf-field">
            <label for="aiTaste">口味</label>
            <select id="aiTaste" v-model="form.taste">
              <option value="">不限</option>
              <option v-for="t in tastes" :key="t">{{ t }}</option>
            </select>
          </div>
          <div class="hf-field">
            <label for="aiPeople">用餐人数</label>
            <select id="aiPeople" v-model="form.people">
              <option v-for="p in peopleOpts" :key="p.value" :value="p.value">{{ p.label }}</option>
            </select>
          </div>
          <button class="hf-btn hf-btn--primary" type="submit" :disabled="loading">
            <span v-if="loading" class="hf-spinner"></span>
            <i v-else class="bi bi-magic"></i>
            {{ loading ? '计算中…' : '生成组合' }}
          </button>
        </form>

        <div class="hf-ai__result">
          <div v-if="loading" class="hf-ai__loading">
            <span class="hf-spinner"></span>正在按场景与预算组合农产…
          </div>

          <div v-else-if="error" class="hf-empty">
            <i class="bi bi-cloud-slash"></i>{{ error }}
          </div>

          <div v-else-if="!result" class="hf-ai__hint">
            <i class="bi bi-lightbulb"></i>
            示例：预算 300 元、节日送礼、偏甜、4 人 —— 模型会优先挑选礼盒装的地理标志产品。
          </div>

          <template v-else-if="!result.items || !result.items.length">
            <div class="hf-empty">
              <i class="bi bi-inbox"></i>这个预算下暂时组不出合适的组合，试试提高预算或换个场景
            </div>
          </template>

          <template v-else>
            <div class="hf-ai__summary">{{ result.summary }}</div>
            <div class="hf-ai__meta">
              <span class="hf-badge hf-badge--red">合计 ¥{{ money(result.total) }}</span>
              <span class="hf-badge hf-badge--gold">预算 ¥{{ money(result.budget) }}</span>
              <span class="hf-badge hf-badge--green">结余 ¥{{ money(result.remain) }}</span>
              <span class="hf-badge hf-badge--ghost">{{ result.scene }}{{ result.taste ? ' · ' + result.taste : '' }}</span>
              <span class="hf-badge hf-badge--ghost">{{ result.people }} 人份</span>
            </div>
            <div class="hf-ai__items">
              <div v-for="it in result.items" :key="it.id" class="hf-ai__item">
                <div class="top">
                  <div style="flex:0 0 52px;width:52px;height:52px;border-radius:3px;overflow:hidden;background:#f3ede4;">
                    <ProductImage :src="it.img" :alt="it.name" :cat="it.cat" />
                  </div>
                  <div style="flex:1;min-width:0;">
                    <h6>{{ it.name }}</h6>
                    <div class="price">
                      ¥{{ money(it.price) }}<span style="font-size:11px;color:#8a8177;font-weight:400;"> /{{ it.unit }}</span>
                    </div>
                    <div class="why">
                      <template v-for="(r, i) in it.reasons || []" :key="i">
                        · {{ r }}<br>
                      </template>
                    </div>
                  </div>
                </div>
                <div class="hf-ai__item-acts">
                  <button class="primary" @click="cart.add(it, 1)">加购</button>
                  <button @click="trace.openByProduct(it.id)">溯源</button>
                </div>
              </div>
            </div>
            <div class="mt-3 d-flex gap-2 flex-wrap">
              <button class="hf-btn hf-btn--primary hf-btn--sm" @click="addAll">
                <i class="bi bi-cart-plus"></i>全部加入购物车
              </button>
              <router-link class="hf-btn hf-btn--ghost hf-btn--sm" to="/cart">去结算</router-link>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import ProductImage from '@/components/common/ProductImage.vue'
import { aiRecommend } from '@/api'
import { useCartStore } from '@/stores/cart'
import { useTrace } from '@/composables/useTrace'
import { useUiStore } from '@/stores/ui'
import { money } from '@/utils/format'

const cart = useCartStore()
const trace = useTrace()
const ui = useUiStore()

const scenes = ['家庭日常', '节日送礼', '企业福利', '健康轻食', '尝鲜打卡']
const tastes = ['偏甜', '清香', '重口味', '养生']
const peopleOpts = [
  { value: '1', label: '1 人' },
  { value: '2', label: '2 人' },
  { value: '3', label: '3 人' },
  { value: '4', label: '4 人' },
  { value: '6', label: '6 人' },
  { value: '10', label: '10 人以上' }
]

const form = reactive({
  budget: 200,
  scene: '家庭日常',
  taste: '',
  people: '4'
})

const loading = ref(false)
const error = ref('')
const result = ref(null)

async function generate () {
  loading.value = true
  error.value = ''
  result.value = null
  try {
    result.value = await aiRecommend({
      budget: form.budget || 200,
      scene: form.scene,
      taste: form.taste,
      people: form.people,
      help: 1
    })
  } catch (e) {
    error.value = (e.body && e.body.error) || '未获取到推荐结果，请稍后重试'
  } finally {
    loading.value = false
  }
}

function addAll () {
  if (!result.value || !result.value.items) return
  result.value.items.forEach(it => cart.add(it, 1))
  ui.show('已加入 ' + result.value.items.length + ' 件农产，合计 ¥' + money(result.value.total), 'bi-cart-check-fill')
}
</script>
