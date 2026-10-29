export function navUrl (lat, lng, name) {
  return 'https://uri.amap.com/marker?position=' + lng + ',' + lat +
    '&name=' + encodeURIComponent(name || '产地') +
    '&src=hongxiangzhitui&coordinate=gaode&callnative=0'
}
