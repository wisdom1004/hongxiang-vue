<template>
  <main class="uc-main">
    <div class="container">
      <UcHero :name="user.displayName" :meta="meta" @logout="logout" />
      <UcStats :orders="orders" :fav-count="fav.count" />
      <UcOrderList :orders="orders" />
      <div class="row g-3">
        <div class="col-lg-7">
          <UcFavList :products="catalog.products" :ids="fav.ids" />
        </div>
        <div class="col-lg-5">
          <UcAddressList :info="user.userInfo" :addresses="address.list" />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import '@/styles/pages/user-center.css'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import UcHero from '@/components/user/UcHero.vue'
import UcStats from '@/components/user/UcStats.vue'
import UcOrderList from '@/components/user/UcOrderList.vue'
import UcFavList from '@/components/user/UcFavList.vue'
import UcAddressList from '@/components/user/UcAddressList.vue'
import { useUserStore } from '@/stores/user'
import { useFavoritesStore } from '@/stores/favorites'
import { useAddressStore } from '@/stores/address'
import { useCatalogStore } from '@/stores/catalog'
import { useUiStore } from '@/stores/ui'
import { getOrders } from '@/api'

const router = useRouter()
const user = useUserStore()
const fav = useFavoritesStore()
const address = useAddressStore()
const catalog = useCatalogStore()
const ui = useUiStore()

const orders = ref([])

const meta = computed(() => {
  const phone = user.userInfo && user.userInfo.phone
  return (phone ? '手机号 ' + phone : '未填写手机号') + ' · 累计助农 ' + orders.value.length + ' 单'
})

onMounted(async () => {
  const [list] = await Promise.all([
    getOrders().catch(() => []),
    catalog.ensureProducts().catch(() => [])
  ])
  orders.value = (list || []).slice().sort((a, b) =>
    String(b.created_at || '').localeCompare(String(a.created_at || ''))
  )
})

function logout () {
  user.logout()
  ui.show('已退出登录')
  setTimeout(() => router.replace('/login'), 500)
}
</script>
