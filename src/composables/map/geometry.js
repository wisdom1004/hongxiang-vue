export function ringPoints (f) {
  let pts = []
  ;(f.polys || []).forEach(poly => {
    poly.forEach(ring => { pts = pts.concat(ring) })
  })
  return pts
}

export function boundsOf (features) {
  const b = { minLng: 1e9, maxLng: -1e9, minLat: 1e9, maxLat: -1e9 }
  features.forEach(f => {
    ringPoints(f).forEach(p => {
      if (p[0] < b.minLng) b.minLng = p[0]
      if (p[0] > b.maxLng) b.maxLng = p[0]
      if (p[1] < b.minLat) b.minLat = p[1]
      if (p[1] > b.maxLat) b.maxLat = p[1]
    })
  })
  return b
}

export function makeProj (features, box) {
  const b = boundsOf(features)
  const lat0 = (b.minLat + b.maxLat) / 2 * Math.PI / 180
  const kx = Math.cos(lat0)
  const wGeo = (b.maxLng - b.minLng) * kx
  const hGeo = (b.maxLat - b.minLat)
  const s = Math.min(box.w / wGeo, box.h / hGeo)
  const cx = (b.minLng + b.maxLng) / 2
  const cy = (b.minLat + b.maxLat) / 2
  const ox = box.x + box.w / 2
  const oy = box.y + box.h / 2
  return {
    s,
    x: lng => ox + (lng - cx) * kx * s,
    y: lat => oy - (lat - cy) * s
  }
}

export function pathOf (poly, proj) {
  return poly.map(ring => ring.map((p, i) =>
    (i ? 'L' : 'M') + proj.x(p[0]).toFixed(1) + ' ' + proj.y(p[1]).toFixed(1)
  ).join('') + 'Z').join('')
}
