import { markRaw } from 'vue'

let cache = null

export async function loadGeo () {
  if (!cache) {
    const mod = await import(/* webpackChunkName: "geo-data" */ '@/data/geo-data.js')
    cache = markRaw(mod.default)
  }
  return cache
}
