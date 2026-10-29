<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <AppBreadcrumb current="购物车" />
  <div class="container">
    <h2 class="section-title">
      我的购物车
      <div class="section-sub">勾选商品，提交订单</div>
    </h2>

    <div class="bg-white p-4 rounded shadow-sm">
      <CartTable
        :items="cart.items"
        :checked-ids="cart.checkedIds"
        @toggle="cart.toggle"
        @set-num="cart.setNum"
        @remove="cart.remove"
      />
      <CartBottomBar
        :all-checked="cart.allChecked"
        :total="cart.checkedTotal"
        @toggle-all="cart.toggleAll"
        @checkout="goCheckout"
      />
    </div>
  </div>

  <CheckoutModal ref="checkoutRef" @submit="onCheckoutSubmit" @closed="onCheckoutClosed" />
  <PayModal ref="payRef" @paid="onPaid" @closed="onPayClosed" />
  <QrPayModal ref="qrRef" @scanned="onQrScanned" @closed="onQrClosed" />
  <PaySuccessModal ref="successRef" />
</template>

<script setup>
import '@/styles/pages/cart.css'
import { ref } from 'vue'
import AppBreadcrumb from '@/components/layout/AppBreadcrumb.vue'
import CartTable from '@/components/cart/CartTable.vue'
import CartBottomBar from '@/components/cart/CartBottomBar.vue'
import CheckoutModal from '@/components/cart/CheckoutModal.vue'
import PayModal from '@/components/cart/PayModal.vue'
import QrPayModal from '@/components/cart/QrPayModal.vue'
import PaySuccessModal from '@/components/cart/PaySuccessModal.vue'
import { useCartStore } from '@/stores/cart'
import { useAddressStore } from '@/stores/address'
import { useUiStore } from '@/stores/ui'
import { createOrderSafe } from '@/api'

const cart = useCartStore()
const addressStore = useAddressStore()
const ui = useUiStore()

const checkoutRef = ref(null)
const payRef = ref(null)
const qrRef = ref(null)
const successRef = ref(null)

const pendingInfo = ref(null)
const pendingTotal = ref(0)
const stage = ref('idle')   // checkout → pay → qr → qrPaying → done
let payTypeNow = ''
let successData = null

function goCheckout () {
  if (!cart.checkedItems.length) {
    ui.show('请勾选需要结算的商品', 'bi-exclamation-circle')
    return
  }
  pendingTotal.value = cart.checkedTotal
  stage.value = 'checkout'
  checkoutRef.value.open(cart.checkedItems, cart.checkedTotal)
}

function onCheckoutSubmit (info) {
  pendingInfo.value = info
  checkoutRef.value.hide()
}

function onCheckoutClosed () {
  if (stage.value !== 'checkout') return
  stage.value = 'pay'
  payRef.value.open(pendingTotal.value)
}

async function onPaid (payType) {
  payTypeNow = payType
  if (payType === '账户余额') {
    // 余额支付：直接下单
    stage.value = 'paying'
    payRef.value.setSubmitting(true)
    await finishOrder(payType)
    payRef.value.setSubmitting(false)
    payRef.value.hide()
  } else {
    // 微信 / 支付宝：先关支付方式弹窗，关闭后再弹二维码
    stage.value = 'qr'
    payRef.value.hide()
  }
}

function onPayClosed () {
  if (stage.value === 'qr') {
    stage.value = 'qrOpen'
    qrRef.value.open(pendingTotal.value, payTypeNow)
  } else if (stage.value === 'paying') {
    stage.value = 'done'
    showSuccess()
  } else {
    resetPending()
  }
}

// 二维码弹窗模拟 5 秒后用户扫码完成
async function onQrScanned () {
  if (stage.value !== 'qrOpen') return
  stage.value = 'qrPaying'
  await finishOrder(payTypeNow)
  qrRef.value.hide()
}

function onQrClosed () {
  if (stage.value === 'qrPaying') {
    stage.value = 'done'
    showSuccess()
  } else {
    resetPending()
  }
}

function showSuccess () {
  if (successData) {
    successRef.value.open(successData)
    successData = null
  }
  pendingInfo.value = null
}

function resetPending () {
  pendingInfo.value = null
  successData = null
  stage.value = 'idle'
}

async function finishOrder (payType) {
  const info = pendingInfo.value
  if (!info) return
  const goods = cart.checkedItems.map(g => ({
    title: g.name,
    price: Number(g.price) || 0,
    num: Number(g.num) || 1,
    product_id: g.productId
  }))
  const total = pendingTotal.value
  const res = await createOrderSafe({
    items: goods,
    contact: (info.receiver + ' ' + info.phone).slice(0, 30),
    address: info.address.slice(0, 80),
    amount: Number(total.toFixed(2))
  })
  successData = {
    order_no: (res.data && res.data.order_no) || ('ORD' + Date.now()),
    receiver: info.receiver,
    phone: info.phone,
    address: info.address,
    payType,
    total
  }
  addressStore.save({ name: info.receiver, phone: info.phone, address: info.address })
  cart.clearChecked()
}
</script>
