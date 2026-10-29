import regionsRaw from './data/regions.json'
import productsRaw from './data/products.json'
import coopsRaw from './data/coops.json'
import adoptionsRaw from './data/adoptions.json'
import presalesRaw from './data/presales.json'
import categoriesRaw from './data/categories.json'
import platformStats from './data/platform_stats.json'
import reviewsRaw from './data/reviews.json'
import { traceEvents } from './trace-events'
import { loadPersisted, savePersisted, clearPersisted } from './persist'

const round2 = n => Math.round((Number(n) || 0) * 100) / 100
const pad = n => String(n).padStart(2, '0')

function fmtDate (d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

function nowStr () {
  const d = new Date()
  return fmtDate(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

function orderNo () {
  const d = new Date()
  const stamp = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds())
  seq = (seq + 1) % 1000
  return 'HX' + stamp + pad(seq)
}

/* ---------------- 基础数据派生（对应 db.py 的 JOIN / 统计口径） ---------------- */
const regionMap = {}
regionsRaw.forEach(r => { regionMap[r.id] = r })

export const categories = categoriesRaw.slice()

export const coops = coopsRaw.map(c => {
  const r = regionMap[c.region]
  return Object.assign({}, c, {
    region_id: c.region,
    region_name: r ? r.name : '',
    city: r ? r.city : ''
  })
})

export const products = productsRaw.map(p => {
  const r = regionMap[p.region] || {}
  return Object.assign({}, p, {
    region_id: p.region,
    region_name: r.name || '',
    city: r.city || '',
    county: r.county || '',
    province: r.province || '',
    lng: r.lng,
    lat: r.lat,
    help_index: r.help_index,
    coop_name: r.coop || '',
    img: '/' + String(p.img || '').replace(/^\/+/, ''),
    save: round2((p.origin_price || 0) - (p.price || 0))
  })
})

export const regions = regionsRaw.map(r => ({
  ...r,
  product_count: products.filter(p => p.region_id === r.id).length,
  sales: products.filter(p => p.region_id === r.id).reduce((s, p) => s + (p.sales || 0), 0)
})).sort((a, b) => b.help_index - a.help_index)

/* ---------------- 溯源批次：每商品 3 批，固定种子保证稳定 ---------------- */
let seed = 20261022
function rndInt (max) {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return Math.floor((seed / 4294967296) * (max + 1))
}

const traces = []
products.forEach(p => {
  for (let i = 0; i < 3; i++) {
    const delta = 30 + i * 95 + rndInt(12)
    const d = new Date(Date.now() - delta * 86400000)
    const base = fmtDate(d)
    traces.push({
      code: p.trace_prefix + '-' + base.replace(/-/g, '').slice(2) + '-' + String(101 + i).padStart(3, '0'),
      product_id: p.id,
      batch: '第' + '一二三'[i] + '批',
      base_date: base,
      events: traceEvents(p, base)
    })
  }
})
traces.sort((a, b) => (a.base_date < b.base_date ? 1 : -1))

/* ---------------- 可变状态（伪服务端） ---------------- */
const persisted = loadPersisted()
let seq = 0

function seedAdoptions () {
  return adoptionsRaw.map(a => {
    const r = regionMap[a.region] || {}
    const p = products.find(x => x.id === a.product)
    return Object.assign({}, a, {
      region_id: a.region,
      product_id: a.product,
      region_name: r.name || '',
      city: r.city || '',
      product_name: p ? p.name : '',
      img: '/' + String(a.img || '').replace(/^\/+/, ''),
      rights: Array.isArray(a.rights) ? a.rights.slice() : [],
      taken: Number(a.taken) || 0,
      total: Number(a.total) || 1,
      percent: round2((Number(a.taken) || 0) * 100 / (Number(a.total) || 1))
    })
  }).sort((a, b) => b.percent - a.percent)
}

function seedPresales () {
  return presalesRaw.map(s => {
    const r = regionMap[s.region] || {}
    const p = products.find(x => x.id === s.product)
    return Object.assign({}, s, {
      region_id: s.region,
      product_id: s.product,
      region_name: r.name || '',
      product_name: p ? p.name : '',
      img: '/' + String(s.img || '').replace(/^\/+/, ''),
      sold: Number(s.sold) || 0,
      target: Number(s.target) || 1,
      percent: round2((Number(s.sold) || 0) * 100 / (Number(s.target) || 1))
    })
  }).sort((a, b) => b.percent - a.percent)
}

const state = {
  orders: (persisted && persisted.orders) || [],
  demands: (persisted && persisted.demands) || [],
  reviews: (persisted && persisted.reviews) || reviewsRaw.map(r => Object.assign({}, r)),
  adoptions: (persisted && persisted.adoptions) || seedAdoptions(),
  presales: (persisted && persisted.presales) || seedPresales()
}

function save () {
  savePersisted(state)
}

function nextOrderId () {
  return state.orders.reduce((m, o) => Math.max(m, Number(o.id) || 0), 0) + 1
}

function pushOrder (order) {
  order.id = nextOrderId()
  state.orders.unshift(order)
  state.orders = state.orders.slice(0, 50)
  save()
  return order
}

/* ---------------- 查询 ---------------- */
export function getStats () {
  const stats = Object.assign({}, platformStats)
  stats.regions = regions.length
  stats.products = products.length
  stats.product_farmers = products.reduce((s, p) => s + (p.farmers || 0), 0)
  stats.product_sales = products.reduce((s, p) => s + (p.sales || 0), 0)
  stats.adoptions = state.adoptions.length
  stats.adopted_units = state.adoptions.reduce((s, a) => s + (a.taken || 0), 0)
  stats.presale_sold = state.presales.reduce((s, p) => s + (p.sold || 0), 0)
  stats.trace_batches = platformStats.trace_batches + traces.length
  stats.orders = state.orders.length
  return stats
}

export function getRegions (params) {
  const cat = params && params.cat
  const province = params && params.province
  return regions.filter(r => {
    if (province && r.province !== province) return false
    if (cat && !products.some(p => p.region_id === r.id && p.cat === cat)) return false
    return true
  }).map(r => Object.assign({}, r))
}

export function getRegion (rid) {
  const r = regions.find(x => x.id === rid)
  if (!r) return null
  const data = Object.assign({}, r)
  data.products = getProducts({ region: rid, limit: 200 })
  data.coop_detail = coops.find(c => c.region_id === rid) || null
  return data
}

export function getProducts (params) {
  const p = params || {}
  let list = products.slice()
  if (p.q) {
    const q = String(p.q).toLowerCase()
    list = list.filter(x =>
      [x.name, x.desc, x.tags, x.region_name, x.city, x.cat]
        .some(v => String(v || '').toLowerCase().includes(q))
    )
  }
  if (p.cat) list = list.filter(x => x.cat === p.cat)
  if (p.region) list = list.filter(x => x.region_id === p.region)
  if (p.help && p.help !== 'all') {
    if (p.help === 'urgent') list = list.filter(x => x.help === 'urgent')
    else if (p.help === 'sale') list = list.filter(x => x.help === 'sale' || x.help === 'urgent')
    else if (p.help === 'presale') list = list.filter(x => x.help === 'presale')
  }
  const sort = p.sort || 'default'
  const cmp = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    sales: (a, b) => b.sales - a.sales,
    rating: (a, b) => (b.rating - a.rating) || (b.reviews - a.reviews),
    help: (a, b) => (b.help_index - a.help_index) || (b.sales - a.sales),
    urgent: (a, b) => ((a.help === 'urgent' ? 0 : 1) - (b.help === 'urgent' ? 0 : 1)) || (b.stock - a.stock)
  }[sort] || ((a, b) => b.sales - a.sales)
  list.sort(cmp)
  const limit = Math.min(Number(p.limit) || 100, 200)
  return list.slice(0, limit).map(x => Object.assign({}, x))
}

export function getProduct (pid) {
  const p = products.find(x => x.id === Number(pid))
  if (!p) return null
  const r = regionMap[p.region_id] || {}
  const item = Object.assign({}, p, {
    region_intro: r.intro || '',
    region_tags: r.tags || ''
  })
  const t = traces.filter(x => x.product_id === p.id).sort((a, b) => (a.base_date < b.base_date ? 1 : -1))[0]
  item.trace_code = t ? t.code : null
  return item
}

export function getCoops () {
  return coops.slice().sort((a, b) => b.households - a.households).map(c => Object.assign({}, c))
}

export function getReviews (productId) {
  const list = productId
    ? state.reviews.filter(r => Number(r.product_id) === Number(productId))
    : state.reviews.slice()
  return list.sort((a, b) => b.id - a.id).slice(0, 50).map(r => Object.assign({}, r))
}

export function addReview (body) {
  const item = {
    id: state.reviews.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1,
    product_id: Number(body.product_id),
    name: String(body.name || '匿名用户').slice(0, 20),
    star: Math.max(1, Math.min(5, Number(body.star) || 5)),
    content: String(body.content || '').slice(0, 300),
    created_at: nowStr()
  }
  state.reviews.unshift(item)
  save()
  return Object.assign({}, item)
}

export function getTraceCode () {
  return traces.length ? traces[0].code : null
}

export function getTrace (code) {
  const t = traces.find(x => x.code === code)
  if (!t) return null
  const p = products.find(x => x.id === t.product_id)
  const r = p ? regionMap[p.region_id] || {} : {}
  return Object.assign({}, t, {
    events: t.events.slice(),
    product: p
      ? {
          name: p.name,
          cat: p.cat,
          unit: p.unit,
          farmers: p.farmers,
          region_name: r.name || '',
          city: r.city || '',
          province: r.province || '',
          coop: r.coop || ''
        }
      : null
  })
}

export function getAdoptions () {
  return state.adoptions.map(a => Object.assign({}, a, {
    percent: round2((a.taken * 100) / (a.total || 1))
  })).sort((a, b) => b.percent - a.percent)
}

export function adopt (aid, contact, title) {
  const a = state.adoptions.find(x => x.id === aid)
  if (!a) return null
  a.taken = Math.min(a.total, (a.taken || 0) + 1)
  a.percent = round2((a.taken * 100) / (a.total || 1))
  pushOrder({
    order_no: orderNo(),
    type: 'adopt',
    title: title || a.title,
    items: [{ title: title || a.title, qty: 1 }],
    amount: a.price,
    contact,
    address: '',
    status: '待发货',
    created_at: nowStr()
  })
  save()
  return Object.assign({}, a)
}

export function getPresales () {
  return state.presales.map(s => Object.assign({}, s, {
    percent: round2((s.sold * 100) / (s.target || 1))
  })).sort((a, b) => b.percent - a.percent)
}

export function orderPresale (sid, qty, contact, address) {
  const s = state.presales.find(x => x.id === sid)
  if (!s) return null
  const n = Math.max(1, Number(qty) || 1)
  s.sold = Math.min(s.target, (s.sold || 0) + n)
  s.percent = round2((s.sold * 100) / (s.target || 1))
  const amount = round2((s.price || 0) * n)
  const order = pushOrder({
    order_no: orderNo(),
    type: 'presale',
    title: s.title,
    items: [{ title: s.title, qty: n }],
    amount,
    contact,
    address,
    status: '待发货',
    created_at: nowStr()
  })
  return { order_no: order.order_no, amount, qty: n }
}

export function getOrders () {
  return state.orders.slice(0, 50).map(o => Object.assign({}, o, {
    items: Array.isArray(o.items) ? o.items.slice() : []
  }))
}

export function createOrder (body) {
  const items = Array.isArray(body.items) ? body.items : []
  if (!items.length) return null
  const total = body.amount != null
    ? Number(body.amount)
    : items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.num) || 1), 0)
  const order = pushOrder({
    order_no: orderNo(),
    type: 'product',
    title: '助农商城订单',
    items,
    amount: round2(total),
    contact: String(body.contact || '').slice(0, 30),
    address: String(body.address || '').slice(0, 80),
    status: '待发货',
    created_at: nowStr()
  })
  return { order_no: order.order_no, amount: order.amount }
}

export function getDemands () {
  return state.demands.slice(0, 30).map(d => Object.assign({}, d))
}

export function addDemand (body) {
  const item = {
    id: state.demands.reduce((m, d) => Math.max(m, d.id || 0), 0) + 1,
    region: String(body.region || '').slice(0, 30),
    product: String(body.product || '').slice(0, 40),
    qty: String(body.qty || '').slice(0, 20),
    contact: String(body.contact || '').slice(0, 30),
    note: String(body.note || '').slice(0, 200),
    status: '待对接',
    created_at: nowStr()
  }
  state.demands.unshift(item)
  state.demands = state.demands.slice(0, 30)
  save()
  return Object.assign({}, item)
}

export function resetMock () {
  clearPersisted()
  window.location.reload()
}
