import { http, postSafe } from './http'

const clean = params => {
  const out = {}
  Object.keys(params || {}).forEach(k => {
    const v = params[k]
    if (v !== undefined && v !== null && v !== '') out[k] = v
  })
  return out
}

export const loginRequest = body => postSafe('/api/auth/login', body, { silent: true })

export const getStats = () => http.get('/api/stats')
export const getCategories = () => http.get('/api/categories')
export const getRegions = params => http.get('/api/regions', { params: clean(params) })
export const getRegion = rid => http.get('/api/regions/' + encodeURIComponent(rid))
export const getProducts = params => http.get('/api/products', { params: clean(params) })
export const getProduct = pid => http.get('/api/products/' + pid)
export const getCoops = () => http.get('/api/coops')

export const getReviews = params => http.get('/api/reviews', { params: clean(params) })
export const addReview = body => http.post('/api/reviews', body)

export const getTraceCode = () => http.get('/api/trace')
export const getTrace = (code, config) => http.get('/api/trace/' + encodeURIComponent(code), config)

export const getAdoptions = () => http.get('/api/adoptions')
export const adopt = (aid, body) => http.post('/api/adoptions/' + encodeURIComponent(aid) + '/adopt', body)
export const adoptSafe = (aid, body) => postSafe('/api/adoptions/' + encodeURIComponent(aid) + '/adopt', body)

export const getPresales = () => http.get('/api/presales')
export const orderPresale = (sid, body) => http.post('/api/presales/' + encodeURIComponent(sid) + '/order', body)
export const orderPresaleSafe = (sid, body) => postSafe('/api/presales/' + encodeURIComponent(sid) + '/order', body)

export const getOrders = () => http.get('/api/orders')
export const createOrder = body => http.post('/api/orders', body)
export const createOrderSafe = body => postSafe('/api/orders', body)

export const getDemands = () => http.get('/api/demands')
export const createDemand = body => http.post('/api/demands', body)
export const createDemandSafe = body => postSafe('/api/demands', body)

export const aiRecommend = params => http.get('/api/ai/recommend', { params: clean(params) })
export const aiHelpPlan = params => http.get('/api/ai/help-plan', { params: clean(params) })
