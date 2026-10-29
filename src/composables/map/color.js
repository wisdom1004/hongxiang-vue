const STOPS = [[246, 236, 224], [233, 205, 168], [214, 158, 108], [178, 84, 52], [122, 16, 6]]

export function lerpColor (t) {
  t = Math.max(0, Math.min(1, t))
  const i = Math.min(STOPS.length - 2, Math.floor(t * (STOPS.length - 1)))
  const f = t * (STOPS.length - 1) - i
  const a = STOPS[i]
  const b = STOPS[i + 1]
  return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * f) + ',' +
    Math.round(a[1] + (b[1] - a[1]) * f) + ',' +
    Math.round(a[2] + (b[2] - a[2]) * f) + ')'
}
