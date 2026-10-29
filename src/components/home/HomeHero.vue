<template>
  <header class="home-hero">
    <div class="container">
      <div class="row g-4 align-items-center">
        <div class="col-lg-7">
          <div class="home-hero__eyebrow"><i class="bi bi-broadcast-pin"></i> 助农数字化解决方案</div>
          <h1>让山货<span class="hl">卖得出去</span><br>也<span class="hl">卖得上价</span></h1>
          <p class="home-hero__lead">
            我们不做又一个电商货架。红乡智推把「产区画像 — 帮销路线 — 认养预售 — 一物一码」串成一条链：
            采购方看地图找货，消费者看溯源码下单，农户先拿钱再种地。
          </p>
          <div class="home-hero__acts">
            <router-link class="hf-btn hf-btn--gold" to="/#map"><i class="bi bi-geo-alt-fill"></i>看助农地图</router-link>
            <router-link class="hf-btn hf-btn--ghost home-hero__ghost" to="/agri"><i class="bi bi-bag"></i>逛助农商城</router-link>
          </div>
          <div class="home-hero__stats">
            <div><b>{{ regionsCount || '--' }}</b><span>帮扶产区</span></div>
            <div><b>{{ provincesCount || '--' }}</b><span>覆盖省份</span></div>
            <div><b>{{ households || '--' }}</b><span>带动农户</span></div>
            <div><b>{{ urgentTons || '--' }}</b><span>滞销预警(吨)</span></div>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="home-hero__panel">
            <div class="home-hero__panel-title"><i class="bi bi-lightning-charge-fill"></i> 一条链怎么跑通</div>
            <div class="home-chain">
              <div class="home-chain__step">
                <b>1</b><span>采购方在地图上按助农指数、滞销预警筛选产区</span>
              </div>
              <div class="home-chain__step">
                <b>2</b><span>AI 按天数与预算规划不折返的直采路线</span>
              </div>
              <div class="home-chain__step">
                <b>3</b><span>消费者下单认养或预售，钱先到合作社</span>
              </div>
              <div class="home-chain__step">
                <b>4</b><span>一物一码把种、管、采、检、发全程留痕</span>
              </div>
            </div>
            <div class="home-hero__panel-foot">
              <span><i class="bi bi-cpu"></i> Vue3 + Mock 真实接口</span>
              <span><i class="bi bi-map"></i> 行政区划边界渲染</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  regionsCount: { type: Number, default: 0 },
  provincesCount: { type: Number, default: 0 },
  households: { type: String, default: '' },
  urgentTons: { type: [Number, String], default: '' }
})
</script>
