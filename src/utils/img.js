export function assetUrl (path) {
  if (!path) return ''
  const base = process.env.BASE_URL || '/'
  return base + String(path).replace(/^\/+/, '')
}
