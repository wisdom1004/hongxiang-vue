<template>
  <section class="hf-section">
    <div class="container">
      <div class="hf-eyebrow">三种订单农业</div>
      <h2 class="hf-title">不止卖货，还<span class="accent">提前把钱付了</span></h2>
      <div class="row g-4 mt-1">
        <div class="col-md-4">
          <div class="hf-mode">
            <span class="hf-mode__no">01</span>
            <div class="hf-card__icon"><i class="bi bi-basket2"></i></div>
            <h4>产地直发</h4>
            <p>跳过中间商，从合作社直接发货。每件商品标注让利金额与带动农户数，卖一单结一单。</p>
            <router-link class="hf-mode__link" to="/agri#shop">去商城 <i class="bi bi-arrow-right"></i></router-link>
          </div>
        </div>
        <div class="col-md-4">
          <div class="hf-mode">
            <span class="hf-mode__no">02</span>
            <div class="hf-card__icon hf-card__icon--green"><i class="bi bi-tree"></i></div>
            <h4>果树认养</h4>
            <p>认养一株果树，提前结清农户一年管护成本，保底产量 + 4 次生长反馈 + 到园采摘。</p>
            <router-link class="hf-mode__link" to="/agri#adopt">看看认养 <i class="bi bi-arrow-right"></i></router-link>
          </div>
        </div>
        <div class="col-md-4">
          <div class="hf-mode">
            <span class="hf-mode__no">03</span>
            <div class="hf-card__icon hf-card__icon--red"><i class="bi bi-hourglass-split"></i></div>
            <h4>霜降预售</h4>
            <p>预售款先付采摘与晾晒人工，达成目标按序发货，未达成全额退款，农户不必借钱备货。</p>
            <router-link class="hf-mode__link" to="/agri#presale">参与预售 <i class="bi bi-arrow-right"></i></router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
