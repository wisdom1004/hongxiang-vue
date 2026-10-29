export const CAT_ICONS = {
  苹果: 'bi-apple',
  时令水果: 'bi-apple',
  果干: 'bi-sun',
  杂粮: 'bi-basket3',
  蔬菜: 'bi-flower2',
  茶叶: 'bi-cup-hot',
  饮品: 'bi-cup-straw',
  食用菌: 'bi-tree',
  中药材: 'bi-capsule',
  调味品: 'bi-fire',
  坚果: 'bi-circle',
  零食: 'bi-cookie',
  肉禽: 'bi-egg-fried',
  蜂产品: 'bi-droplet',
  红枣: 'bi-heart-fill'
}

export function catIcon (cat) {
  return CAT_ICONS[cat] || 'bi-basket'
}
