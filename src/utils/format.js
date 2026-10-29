export function num (n) {
  n = Number(n) || 0
  if (n >= 100000000) return (n / 100000000).toFixed(1).replace(/\.0$/, '') + '亿'
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万'
  return n.toLocaleString('zh-CN')
}

export function money (n) {
  n = Number(n) || 0
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2
  })
}
