const KEY = 'hx_mock_v1'

export function loadPersisted () {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function savePersisted (state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) { /* 容量不足时忽略 */ }
}

export function clearPersisted () {
  localStorage.removeItem(KEY)
}
