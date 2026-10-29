import { http, HttpResponse } from 'msw'
import * as db from './db'
import { helpPlan, recommend } from './ai'

const ok = data => HttpResponse.json(data)
const fail = (message, status) => HttpResponse.json({ error: message }, { status })

const queryOf = request => {
  const url = new URL(request.url)
  const params = {}
  url.searchParams.forEach((v, k) => { params[k] = v })
  return params
}

const bodyOf = async request => {
  try {
    return (await request.json()) || {}
  } catch (e) {
    return {}
  }
}

const notFound = () => fail('接口不存在', 404)

export const handlers = [
  /* ---------------- 认证 ---------------- */
  // 密码登录与验证码登录共用此接口
  http.post('/api/auth/login', async ({ request }) => {
    const body = await bodyOf(request)
    const account = String(body.account || '').trim()
    const mode = body.mode === 'code' ? 'code' : 'password'
    if (!account) return fail('请输入账号', 400)
    if (account !== '18866669999') return fail('账号不存在', 401)
    if (mode === 'password') {
      if (String(body.password || '') !== '123456') return fail('账号或密码不正确', 401)
    } else if (String(body.code || '') !== '178562') {
      return fail('验证码不正确或已失效', 401)
    }
    const token = 'hx_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    return ok({
      ok: true,
      token,
      user: { account, nick: '红乡智推体验官', role: 'admin', loginMode: mode, phone: '18866669999' }
    })
  }),

  /* ---------------- 公共数据 ---------------- */
  http.get('/api/stats', () => ok(db.getStats())),
  http.get('/api/categories', () => ok(db.categories)),

  /* ---------------- 产区 ---------------- */
  http.get('/api/regions', ({ request }) => ok(db.getRegions(queryOf(request)))),
  http.get('/api/regions/:id', ({ params }) => {
    const region = db.getRegion(params.id)
    return region ? ok(region) : notFound()
  }),

  /* ---------------- 农产与合作社 ---------------- */
  http.get('/api/products', ({ request }) => ok(db.getProducts(queryOf(request)))),
  http.get('/api/products/:id', ({ params }) => {
    const product = db.getProduct(Number(params.id))
    return product ? ok(product) : notFound()
  }),
  http.get('/api/coops', () => ok(db.getCoops())),

  /* ---------------- 评价 ---------------- */
  http.get('/api/reviews', ({ request }) => ok(db.getReviews(queryOf(request).product_id))),
  http.post('/api/reviews', async ({ request }) => {
    const body = await bodyOf(request)
    if (!body.product_id || !String(body.content || '').trim()) {
      return fail('商品与评价内容不能为空', 400)
    }
    return ok(db.addReview(body))
  }),

  /* ---------------- 溯源 ---------------- */
  http.get('/api/trace', () => ok({ code: db.getTraceCode() })),
  http.get('/api/trace/:code', ({ params }) => {
    const trace = db.getTrace(params.code)
    return trace ? ok(trace) : fail('未查询到该溯源码，请核对包装上的编码', 404)
  }),

  /* ---------------- 认养 ---------------- */
  http.get('/api/adoptions', () => ok(db.getAdoptions())),
  http.post('/api/adoptions/:id/adopt', async ({ request, params }) => {
    const body = await bodyOf(request)
    const contact = String(body.contact || '').trim()
    if (!contact) return fail('请填写联系方式', 400)
    const adoption = db.adopt(params.id, contact.slice(0, 30), String(body.title || '').slice(0, 60))
    if (!adoption) return notFound()
    return ok({ ok: true, adoption, message: '认养成功，合作社将在 24 小时内与你联系' })
  }),

  /* ---------------- 预售 ---------------- */
  http.get('/api/presales', () => ok(db.getPresales())),
  http.post('/api/presales/:id/order', async ({ request, params }) => {
    const body = await bodyOf(request)
    const contact = String(body.contact || '').trim()
    if (!contact) return fail('请填写联系人电话', 400)
    const res = db.orderPresale(params.id, body.qty, contact.slice(0, 30), String(body.address || '').slice(0, 80))
    if (!res) return notFound()
    return ok({ ok: true, ...res })
  }),

  /* ---------------- 订单 ---------------- */
  http.get('/api/orders', () => ok(db.getOrders())),
  http.post('/api/orders', async ({ request }) => {
    const body = await bodyOf(request)
    const res = db.createOrder(body)
    if (!res) return fail('订单商品为空', 400)
    return ok({ ok: true, ...res })
  }),

  /* ---------------- 滞销上报 ---------------- */
  http.get('/api/demands', () => ok(db.getDemands())),
  http.post('/api/demands', async ({ request }) => {
    const body = await bodyOf(request)
    if (!String(body.region || '').trim() || !String(body.product || '').trim()) {
      return fail('请填写产区与产品名称', 400)
    }
    const demand = db.addDemand(body)
    return ok({ ok: true, demand, message: '已受理，平台将在 48 小时内对接采购商' })
  }),

  /* ---------------- AI ---------------- */
  http.get('/api/ai/recommend', ({ request }) => {
    const items = db.getProducts({ limit: 200 })
    return ok(recommend(items, queryOf(request)))
  }),
  http.get('/api/ai/help-plan', ({ request }) => {
    const regions = db.getRegions()
    const urgent = db.getProducts({ help: 'urgent', limit: 50 })
    return ok(helpPlan(regions, urgent, queryOf(request)))
  })
]
