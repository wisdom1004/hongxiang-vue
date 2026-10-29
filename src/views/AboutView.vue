<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <AppBreadcrumb current="项目概况" />
  <main class="container">
    <h2 class="section-title">
      项目介绍
      <div class="section-sub">红乡智推 — 红色乡村助农 AI 智能推介平台</div>
    </h2>

    <div class="row g-4">
      <div class="col-lg-6">
        <div class="about-card">
          <h4><i class="bi bi-bookmark-star text-danger me-2"></i>项目背景</h4>
          <p>帮扶县的优质农产品普遍丰产却不丰收：产区分散、渠道单一、信息不对称，果贱伤农与滞销烂果同时存在；消费者想买真产地好货，却缺少可信的产地与过程信息。</p>
          <p>"红乡智推"以县域为单元建立助农数字底座：把帮扶产区的产业画像、滞销预警、合作社与农户信息结构化，用 AI 帮销把"买什么、去哪买、怎么帮"讲清楚，再以产地直发、果树认养、先卖后采的预售与一物一码溯源把交易闭环跑通，让助农从一次性购买变成可持续的产业协作。</p>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="about-card">
          <h4><i class="bi bi-lightbulb text-danger me-2"></i>项目目标</h4>
          <ul>
            <li>用助农一张图呈现帮扶产区画像，让滞销风险可被看见、可被调度</li>
            <li>以 AI 选品与帮销路线降低采购方、帮扶单位的决策与对接成本</li>
            <li>用认养与预售把收益前置到种植端，缓解丰产期资金与库存压力</li>
            <li>以溯源档案建立产地信任，让好货卖出好价，形成优质优价循环</li>
            <li>沉淀产区、合作社、订单数据，为县域产业帮扶提供可量化依据</li>
          </ul>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="about-card">
          <h4><i class="bi bi-cpu text-danger me-2"></i>技术方案</h4>
          <div class="tech-item">前端框架：Vue 3.5 + Composition API（<code>&lt;script setup&gt;</code>）单页应用，Vue Router 4 管理 7 个页面路由</div>
          <div class="tech-item">状态管理：Pinia 2 拆出 7 个 Store——购物车、用户、收藏、收货地址、全局提示、目录缓存、地图视图</div>
          <div class="tech-item">数据请求：Axios 实例统一封装，响应拦截器剥离响应壳并集中弹错；加载态、静默请求、异常兜底分级处理</div>
          <div class="tech-item">接口模拟：MSW（Mock Service Worker）在 Service Worker 层拦截请求，22 个 REST 接口全部前端模拟，可在浏览器 Network 面板查看完整请求与响应</div>
          <div class="tech-item">模拟服务端：伪服务端按表间关联规则派生字段（带动农户、让利金额、认养进度），写操作持久化到 localStorage，刷新后订单与需求不丢</div>
          <div class="tech-item">地图引擎：自研 SVG 等距圆柱投影（中纬余弦校正），29 个县域矢量绘制；圆点大小映射带动农户，红色脉冲标记急售产区</div>
          <div class="tech-item">AI 模块：选品按预算、场景、口味、人数加权打分后贪心装箱；帮销按城市聚类与"每天不超过 2 个产区"排线</div>
          <div class="tech-item">交易与支付：购物车、认养、预售三类订单统一生成单号；微信 / 支付宝扫码 5 秒模拟回调，余额支付直接成交</div>
          <div class="tech-item">工程构建：vue-cli 5（webpack 5）+ Babel，路由级代码分割，<code>npm run build</code> 输出纯静态 <code>dist/</code>，可部署于任意静态服务器</div>
        </div>
      </div>

      <div class="col-lg-6">
        <div class="about-card">
          <h4><i class="bi bi-people text-danger me-2"></i>团队介绍</h4>
          <p>项目参赛队：破界者</p>
          <p>学院：人工智能学院 · 西安汽车职业大学</p>
          <p>团队聚焦 Web 前端、AI 应用开发与数据可视化方向，走访帮扶产区梳理真实业务链路，完成平台的产品设计、前后端开发与交互打磨。</p>
        </div>
      </div>
    </div>

    <h2 class="section-title mt-5">系统技术架构</h2>
    <div class="about-card">
      <div class="arch-flow">
        <div class="arch-layer">
          <div class="arch-layer__tag">表现层</div>
          <div class="arch-layer__body">
            <code>src/views</code> 7 个路由页面 + <code>src/components</code> 拆分组件，Bootstrap 5.3 栅格与项目自有主题样式，PC 与移动端自适应；地图由 <code>MapCanvas</code> 用 SVG 指令式绘制，组件只负责状态与事件。
          </div>
        </div>
        <div class="arch-arrow"><i class="bi bi-arrow-down"></i></div>
        <div class="arch-layer">
          <div class="arch-layer__tag">状态层</div>
          <div class="arch-layer__body">
            <code>src/stores</code> 7 个 Pinia Store 承担跨页共享状态：购物车与收藏写 localStorage 持久化，目录与地图数据按需加载并缓存，用户态由 token 驱动路由守卫。
          </div>
        </div>
        <div class="arch-arrow"><i class="bi bi-arrow-down"></i></div>
        <div class="arch-layer">
          <div class="arch-layer__tag">接口层</div>
          <div class="arch-layer__body">
            <code>src/api</code> 统一 Axios 实例：请求自动过滤空参数，响应拦截器剥离数据壳、统一 toast 报错；<code>postSafe</code> 系列保留 <code>{ ok, data }</code> 结构以承载业务校验结果。
          </div>
        </div>
        <div class="arch-arrow"><i class="bi bi-arrow-down"></i></div>
        <div class="arch-layer">
          <div class="arch-layer__tag">模拟服务端</div>
          <div class="arch-layer__body">
            <code>src/mock/db.js</code> 按接口约定组织产区、农产、合作社数据并实现关联查询，<code>ai.js</code> 实现加权打分与贪心装箱算法，<code>handlers.js</code> 注册 22 个接口并按 REST 语义返回 200 / 400 / 404。
          </div>
        </div>
        <div class="arch-arrow"><i class="bi bi-arrow-down"></i></div>
        <div class="arch-layer">
          <div class="arch-layer__tag">数据持久层</div>
          <div class="arch-layer__body">
            种子数据为内置演示数据集（29 产区 / 28 农产 / 12 合作社 / 认养与预售记录），运行期新增的订单、需求、评价、认养写回 localStorage <code>hx_mock_v1</code>，控制台 <code>__resetMock()</code> 一键还原演示初始态。
          </div>
        </div>
      </div>
    </div>

    <h2 class="section-title mt-5">接口清单</h2>
    <div class="about-card">
      <table class="api-table">
        <thead>
          <tr><th style="width:88px;">模块</th><th style="width:250px;">接口</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td>认证</td><td><code>POST /api/auth/login</code></td><td>密码与短信验证码共用，成功后返回 token</td></tr>
          <tr><td>公共</td><td><code>GET /api/stats</code> · <code>GET /api/categories</code></td><td>平台看板指标、农产类目</td></tr>
          <tr><td>产区</td><td><code>GET /api/regions</code> · <code>GET /api/regions/:id</code></td><td>产区列表（可按省份、急售过滤）与产区档案</td></tr>
          <tr><td>农产</td><td><code>GET /api/products</code> · <code>GET /api/products/:id</code> · <code>GET /api/coops</code></td><td>商城筛选分页、单品详情、合作社名录</td></tr>
          <tr><td>AI</td><td><code>GET /api/ai/recommend</code> · <code>GET /api/ai/help-plan</code></td><td>预算选品组合、帮销路线规划</td></tr>
          <tr><td>交易</td><td><code>GET/POST /api/orders</code> · <code>POST /api/adoptions/:id/adopt</code> · <code>POST /api/presales/:id/order</code></td><td>商城订单、果树认养、霜降预售</td></tr>
          <tr><td>口碑</td><td><code>GET/POST /api/reviews</code> · <code>GET/POST /api/demands</code></td><td>农产评价、滞销上报</td></tr>
          <tr><td>溯源</td><td><code>GET /api/trace</code> · <code>GET /api/trace/:code</code></td><td>随机取一个可演示溯源码、按码查档案</td></tr>
        </tbody>
      </table>
      <p class="mb-0 mt-3 small text-muted">以上接口由 Mock Service Worker 在前端拦截并返回，浏览器 Network 面板可见完整请求（标记为 from service worker），无需启动后端服务。</p>
    </div>

    <h2 class="section-title mt-5">平台功能架构</h2>
    <div class="about-card">
      <div class="row g-4">
        <div class="col-md-4">
          <h5 class="text-danger"><i class="bi bi-person"></i> 消费者 / 帮扶单位</h5>
          <p>助农一张图浏览产区、AI 选品与帮销路线、产地直发下单、果树认养、预售预订、扫码溯源、我的订单与收藏。</p>
        </div>
        <div class="col-md-4">
          <h5 class="text-danger"><i class="bi bi-shop"></i> 合作社 / 农户端</h5>
          <p>维护产区与农产信息、发起滞销急售与预售、查看认养与订单、回传采摘与质检节点形成溯源档案。</p>
        </div>
        <div class="col-md-4">
          <h5 class="text-danger"><i class="bi bi-shield-check"></i> 运营管理端</h5>
          <p>产区与商品审核、滞销预警看板、认养与预售订单管理、平台数据统计。</p>
        </div>
      </div>
    </div>

    <h2 class="section-title mt-5">助农价值链路</h2>
    <div class="about-card">
      <div class="row g-3">
        <div class="col-md-3">
          <h6 class="fw-bold text-danger">① 看见</h6>
          <p class="mb-0 small text-muted">助农一张图把产区、品类、带动农户与滞销预警显性化</p>
        </div>
        <div class="col-md-3">
          <h6 class="fw-bold text-danger">② 决策</h6>
          <p class="mb-0 small text-muted">AI 按预算与场景给出选品清单，按天数排出帮销路线</p>
        </div>
        <div class="col-md-3">
          <h6 class="fw-bold text-danger">③ 成交</h6>
          <p class="mb-0 small text-muted">产地直发、认养锁收益、预售先卖后采，三种模式匹配不同品类</p>
        </div>
        <div class="col-md-3">
          <h6 class="fw-bold text-danger">④ 信任</h6>
          <p class="mb-0 small text-muted">一物一码溯源记录采摘、质检、分选、发货全过程</p>
        </div>
      </div>
    </div>

    <h2 class="section-title mt-5">演示与验证</h2>
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="about-card">
          <h4><i class="bi bi-play-circle text-danger me-2"></i>演示路径</h4>
          <div class="demo-step"><b>1</b><div>首页浏览助农一张图：切换全国 / 陕西视图，点选县域查看产区档案，红色脉冲点即急售产区。</div></div>
          <div class="demo-step"><b>2</b><div>用 AI 帮销路线填写天数、预算、出发城市，生成按天排布的帮扶采购路线，并可一键在地图上查看。</div></div>
          <div class="demo-step"><b>3</b><div>进入助农专区：AI 选品生成组合 → 商城按品类 / 产区 / 急售筛选 → 加入购物车 → 结算 → 微信扫码支付（5 秒模拟扫码）→ 支付成功。</div></div>
          <div class="demo-step"><b>4</b><div>查看果树认养与霜降预售，点溯源查询任意批次码，查看采摘、质检、分选、发货六节点档案。</div></div>
          <div class="demo-step"><b>5</b><div>登录后进入我的主页查看订单、收藏与收货地址；运营后台查看滞销预警、认养与商城订单。</div></div>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="about-card">
          <h4><i class="bi bi-terminal text-danger me-2"></i>运行与演示环境</h4>
          <div class="tech-item">环境要求：Node.js 18+（实测 Node 22）、npm 10，无需安装数据库或后端服务</div>
          <div class="tech-item">本地调试：<code>npm run serve</code> → <code>http://localhost:8080</code></div>
          <div class="tech-item">生产构建：<code>npm run build</code> → 静态产物 <code>dist/</code></div>
          <div class="tech-item">演示账号：<code>18866669999</code>，密码 <code>123456</code>，短信验证码 <code>178562</code></div>
          <div class="tech-item">数据复位：浏览器控制台执行 <code>__resetMock()</code>，清空本地订单与需求并恢复到初始种子数据</div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import '@/styles/pages/about.css'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
</script>
