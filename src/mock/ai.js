const SCENE_RULES = {
  家庭日常: { cats: ['苹果', '时令水果', '杂粮', '蔬菜', '肉禽', '红枣'], kw: ['当季', '新米', '直发'] },
  节日送礼: { cats: ['果干', '茶叶', '坚果', '红枣', '蜂产品'], kw: ['礼盒', '年货', '地理标志'] },
  企业福利: { cats: ['杂粮', '苹果', '茶叶', '坚果'], kw: ['礼盒', '团购', '地理标志'] },
  健康轻食: { cats: ['杂粮', '茶叶', '饮品', '食用菌'], kw: ['低GI', '高蛋白', '无添加', '富硒'] },
  尝鲜打卡: { cats: ['时令水果', '零食', '果干', '饮品'], kw: ['当季', '冷链', '当日'] }
}

const TASTE_RULES = {
  偏甜: ['苹果', '红枣', '时令水果', '果干', '蜂产品'],
  清香: ['茶叶', '食用菌', '杂粮'],
  重口味: ['调味品', '肉禽'],
  养生: ['中药材', '杂粮', '茶叶', '蜂产品']
}

const CITY_CLUSTER = {
  延安市: ['陕北', '苹果 / 红枣 / 小杂粮'],
  榆林市: ['陕北', '小米 / 红枣 / 中药材'],
  西安市: ['关中', '猕猴桃 / 时令水果'],
  宝鸡市: ['关中', '猕猴桃 / 时令水果'],
  咸阳市: ['关中', '苹果 / 石榴 / 柿饼'],
  渭南市: ['关中', '冬枣 / 花椒 / 柿饼 / 酥梨'],
  汉中市: ['陕南', '茶叶 / 黑米'],
  安康市: ['陕南', '富硒茶'],
  商洛市: ['陕南', '木耳 / 板栗']
}

const round1 = n => Math.round(n * 10) / 10
const round2 = n => Math.round(n * 100) / 100

export function recommend (items, query) {
  const budget = Number(query.budget) || 200
  const scene = query.scene || '家庭日常'
  const taste = query.taste || ''
  const people = Math.max(1, Number(query.people) || 2)
  const preferHelp = String(query.help == null ? '1' : query.help) !== '0'

  const rule = SCENE_RULES[scene] || SCENE_RULES['家庭日常']
  const tasteCats = TASTE_RULES[taste] || []

  const scored = items.map(p => {
    let score = 0
    const reasons = []
    if (rule.cats.includes(p.cat)) {
      score += 26
      reasons.push('契合「' + scene + '」场景')
    }
    if (tasteCats.includes(p.cat)) {
      score += 14
      reasons.push('口味偏向' + taste)
    }
    if (preferHelp) {
      score += (p.help_index || 60) * 0.28
      if (p.help === 'urgent') {
        score += 16
        reasons.push('滞销急售，优先帮扶')
      } else if (p.help === 'sale' || p.help === 'presale') {
        score += 6
        reasons.push('产地直供让利')
      }
    }
    score += (p.rating || 4.5) * 5
    if (p.reviews && p.reviews > 100) score += 4
    for (const kw of rule.kw) {
      if (String(p.tags || '').includes(kw) || String(p.desc || '').includes(kw)) {
        score += 5
        reasons.push('含「' + kw + '」特征')
        break
      }
    }
    if (p.price > budget * 0.45) score -= 12
    return { score, p, reasons: reasons.slice(0, 3) }
  })

  scored.sort((a, b) => b.score - a.score)

  const picked = []
  let total = 0
  let farmers = 0
  const perCat = {}

  for (const item of scored) {
    const p = item.p
    if (total + p.price > budget) continue
    if ((perCat[p.cat] || 0) >= 2) continue
    picked.push({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      img: p.img,
      region: p.region_name,
      cat: p.cat,
      help: p.help,
      help_index: p.help_index,
      farmers: p.farmers,
      rating: p.rating,
      score: round1(item.score),
      reasons: item.reasons.length ? item.reasons : ['高评分助农产品'],
      save: p.save
    })
    perCat[p.cat] = (perCat[p.cat] || 0) + 1
    total += p.price
    farmers += p.farmers
    if (picked.length >= 6 || total >= budget * 0.9) break
  }

  if (!picked.length && scored.length) {
    const item = scored[0]
    const p = item.p
    picked.push({
      id: p.id,
      name: p.name,
      price: p.price,
      unit: p.unit,
      img: p.img,
      region: p.region_name,
      cat: p.cat,
      help: p.help,
      help_index: p.help_index,
      farmers: p.farmers,
      rating: p.rating,
      score: p.price ? 60 : 60,
      reasons: item.reasons.length ? item.reasons : ['预算内优选'],
      save: p.save
    })
    total = p.price
    farmers = p.farmers
  }

  return {
    budget,
    scene,
    taste,
    people,
    total: round2(total),
    remain: round2(budget - total),
    items: picked,
    summary: '为' + people + '人「' + scene + '」场景匹配到 ' + picked.length +
      ' 件产地直供农产品，合计 ¥' + total.toFixed(2) + '，预计带动 ' + farmers + ' 户农户增收'
  }
}

export function helpPlan (regions, urgentProducts, query) {
  const days = Math.max(1, Math.min(5, Number(query.days) || 3))
  const budget = Number(query.budget) || 3000
  const start = query.start || '西安市'

  const urgentRegions = {}
  urgentProducts.forEach(p => { urgentRegions[p.region_id] = true })

  const score = r => {
    let s = r.help_index * 1.0
    if (urgentRegions[r.id]) s += 22
    if (CITY_CLUSTER[r.city]) s += 8
    s += Math.min(r.households / 200.0, 6)
    return s
  }

  const ranked = regions.slice().sort((a, b) => score(b) - score(a))
  const byCity = {}
  ranked.forEach(r => {
    if (!byCity[r.city]) byCity[r.city] = []
    byCity[r.city].push(r)
  })

  let cityOrder = Object.keys(byCity).sort((a, b) => {
    const ma = Math.max.apply(null, byCity[a].map(score))
    const mb = Math.max.apply(null, byCity[b].map(score))
    return mb - ma
  })
  if (cityOrder.includes(start)) {
    cityOrder = cityOrder.filter(c => c !== start)
    cityOrder.unshift(start)
  }

  const plan = []
  const usedCities = []
  for (let d = 0; d < days; d++) {
    const city = cityOrder[d % cityOrder.length]
    usedCities.push(city)
    const nodes = byCity[city].slice(0, 2)
    const budgetDay = Math.round(budget / days)
    plan.push({
      day: d + 1,
      city,
      cluster: (CITY_CLUSTER[city] || ['协作产区', '特色农产品'])[0],
      regions: nodes.map(n => ({
        id: n.id,
        name: n.name,
        main: n.main,
        households: n.households,
        help_index: n.help_index,
        coop: n.coop,
        urgent: !!urgentRegions[n.id],
        lng: n.lng,
        lat: n.lat
      })),
      advice: '上午走访' + nodes[0].name + '，下午对接' + nodes[nodes.length - 1].name +
        '合作社看样议价，优先采购' + nodes.map(n => n.main).join('、'),
      budget: budgetDay
    })
  }

  const totalHouseholds = ranked.slice(0, Math.max(1, days * 2))
    .reduce((s, r) => s + r.households, 0)
  const uniqCities = usedCities.filter((c, i) => usedCities.indexOf(c) === i)

  return {
    days,
    budget,
    start,
    plan,
    summary: 'AI 依据助农指数、滞销预警与地域聚类，规划 ' + days + ' 天产地直采路线，覆盖 ' +
      uniqCities.join('、') + '，预计对接 ' + totalHouseholds + ' 户农户',
    rules: [
      '优先滞销急售产区（帮扶紧迫度最高）',
      '按地理邻近聚类，减少跨市折返',
      '同等条件下优先助农指数高的合作社'
    ]
  }
}
